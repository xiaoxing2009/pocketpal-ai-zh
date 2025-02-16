import * as RNFS from '@dr.pogodin/react-native-fs';
import {makeAutoObservable, observable} from 'mobx';
import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

import {
  DownloadEventCallbacks,
  DownloadJob,
  DownloadMap,
  DownloadProgress,
} from './types';

import {Model} from '../../utils/types';
import {formatBytes, hasEnoughSpace} from '../../utils';

const {DownloadModule} = NativeModules;

export class DownloadManager {
  private downloadJobs: DownloadMap;
  private callbacks: DownloadEventCallbacks = {};
  private eventEmitter: NativeEventEmitter | null = null;

  constructor() {
    this.downloadJobs = observable.map(new Map());
    makeAutoObservable(this);

    if (Platform.OS === 'android') {
      this.setupAndroidEventListener();
    }
  }

  private setupAndroidEventListener() {
    if (DownloadModule) {
      this.eventEmitter = new NativeEventEmitter(DownloadModule);
      
      this.eventEmitter.addListener('onDownloadProgress', event => {
        const job = this.downloadJobs.get(event.downloadId);
        if (!job) return;

        const progress: DownloadProgress = {
          bytesDownloaded: event.bytesWritten,
          bytesTotal: event.totalBytes,
          progress: event.progress,
          speed: formatBytes(event.bytesWritten),
          eta: this.calculateEta(event.bytesWritten, event.totalBytes, event.speed),
          rawSpeed: event.speed,
          rawEta: event.eta,
        };

        job.state.progress = progress;
        this.callbacks.onProgress?.(event.downloadId, progress);
      });

      this.eventEmitter.addListener('onDownloadComplete', event => {
        this.downloadJobs.delete(event.downloadId);
        this.callbacks.onComplete?.(event.downloadId);
      });

      this.eventEmitter.addListener('onDownloadFailed', event => {
        const job = this.downloadJobs.get(event.downloadId);
        if (job) {
          job.state.error = new Error(event.error);
          job.state.isDownloading = false;
        }
        this.downloadJobs.delete(event.downloadId);
        this.callbacks.onError?.(event.downloadId, new Error(event.error));
      });
    }else{
      console.log('DownloadModule is not available');
    }

  }

  private calculateEta(bytesDownloaded: number, totalBytes: number, speedBps: number): string {
    if (speedBps <= 0) return 'calculating...';
    
    const remainingBytes = totalBytes - bytesDownloaded;
    const etaSeconds = remainingBytes / speedBps;
    const etaMinutes = Math.ceil(etaSeconds / 60);
    
    return etaSeconds >= 60 ? `${etaMinutes} min` : `${Math.ceil(etaSeconds)} sec`;
  }

  setCallbacks(callbacks: DownloadEventCallbacks) {
    this.callbacks = callbacks;
  }

  isDownloading(modelId: string): boolean {
    return this.downloadJobs.has(modelId);
  }

  getDownloadProgress(modelId: string): number {
    const job = this.downloadJobs.get(modelId);
    return job?.state.progress?.progress || 0;
  }

  async startDownload(model: Model, destinationPath: string): Promise<void> {
    if (this.isDownloading(model.id)) {
      console.log('Download already in progress for model:', model.id);
      return;
    }

    if (!model.downloadUrl) {
      throw new Error('Model has no download URL');
    }

    const isEnoughSpace = await hasEnoughSpace(model);
    if (!isEnoughSpace) {
      throw new Error('Not enough storage space to download the model');
    }

    // Ensure directory exists
    const dirPath = destinationPath.substring(
      0,
      destinationPath.lastIndexOf('/'),
    );
    try {
      await RNFS.mkdir(dirPath);
    } catch (err) {
      console.error('Failed to create directory:', err);
      throw err;
    }

    if (Platform.OS === 'ios') {
      await this.startIOSDownload(model, destinationPath);
    } else {
      await this.startAndroidDownload(model, destinationPath);
    }
  }

  private async startIOSDownload(
    model: Model,
    destinationPath: string,
  ): Promise<void> {
    try {
      const downloadJob: DownloadJob = {
        task: null,
        model,
        state: {
          isDownloading: true,
          progress: null,
          error: null,
        },
        lastBytesWritten: 0,
        lastUpdateTime: Date.now(),
      };

      this.downloadJobs.set(model.id, downloadJob);
      this.callbacks.onStart?.(model.id);

      const result = await RNFS.downloadFile({
        fromUrl: model.downloadUrl!,
        toFile: destinationPath,
        progress: res => {
          if (!this.downloadJobs.has(model.id)) {
            return;
          }

          const job = this.downloadJobs.get(model.id)!;
          const currentTime = Date.now();
          const timeDiff = (currentTime - job.lastUpdateTime) / 1000 || 1;
          const bytesDiff = res.bytesWritten - job.lastBytesWritten;
          const speedBps = bytesDiff / timeDiff;
          const speedMBps = (speedBps / (1024 * 1024)).toFixed(2);

          const remainingBytes = res.contentLength - res.bytesWritten;
          const etaSeconds = speedBps > 0 ? remainingBytes / speedBps : 0;
          const etaMinutes = Math.ceil(etaSeconds / 60);
          const etaText =
            etaSeconds >= 60
              ? `${etaMinutes} min`
              : `${Math.ceil(etaSeconds)} sec`;

          const progress: DownloadProgress = {
            bytesDownloaded: res.bytesWritten,
            bytesTotal: res.contentLength,
            progress: (res.bytesWritten / res.contentLength) * 100,
            speed: `${formatBytes(res.bytesWritten)} (${speedMBps} MB/s)`,
            eta: etaText,
            rawSpeed: speedBps,
            rawEta: etaSeconds,
          };

          job.state.progress = progress;
          job.lastBytesWritten = res.bytesWritten;
          job.lastUpdateTime = currentTime;

          this.callbacks.onProgress?.(model.id, progress);
        },
      }).promise;

      if (result.statusCode === 200) {
        this.downloadJobs.delete(model.id);
        this.callbacks.onComplete?.(model.id);
      } else {
        throw new Error(`Download failed with status: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      const job = this.downloadJobs.get(model.id);
      if (job) {
        job.state.error =
          error instanceof Error ? error : new Error(String(error));
        job.state.isDownloading = false;
      }
      this.downloadJobs.delete(model.id);
      this.callbacks.onError?.(
        model.id,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  private async startAndroidDownload(
    model: Model,
    destinationPath: string,
  ): Promise<void> {
    try {
      const downloadJob: DownloadJob = {
        task: null,
        model,
        state: {
          isDownloading: true,
          progress: null,
          error: null,
        },
        lastBytesWritten: 0,
        lastUpdateTime: Date.now(),
      };
      console.log('Starting Android download for model:', model.id);

      this.downloadJobs.set(model.id, downloadJob);
      this.callbacks.onStart?.(model.id);

      await DownloadModule.startDownload(model.downloadUrl!, {
        destination: destinationPath,
        networkType: 'ANY',
        priority: 1,
      });
    } catch (error) {
      console.error('Failed to start Android download:', error);
      const job = this.downloadJobs.get(model.id);
      if (job) {
        job.state.error =
          error instanceof Error ? error : new Error(String(error));
        job.state.isDownloading = false;
      }
      this.downloadJobs.delete(model.id);
      this.callbacks.onError?.(
        model.id,
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  async cancelDownload(modelId: string): Promise<void> {
    const job = this.downloadJobs.get(modelId);
    if (job) {
      try {
        if (Platform.OS === 'ios') {
          // For iOS, we don't need to do anything special as the download
          // will be automatically cancelled when we remove the job
        } else if (Platform.OS === 'android' && DownloadModule) {
          await DownloadModule.pauseDownload(modelId);
        }
      } catch (err) {
        console.error('Error stopping download:', err);
      } finally {
        this.downloadJobs.delete(modelId);
      }
    }
  }

  cleanup() {
    if (Platform.OS === 'android' && this.eventEmitter) {
      this.eventEmitter.removeAllListeners('onDownloadProgress');
      this.eventEmitter.removeAllListeners('onDownloadComplete');
      this.eventEmitter.removeAllListeners('onDownloadFailed');
    }
    this.downloadJobs.clear();
  }
}
