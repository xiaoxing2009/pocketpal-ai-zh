import * as RNFS from '@dr.pogodin/react-native-fs';
import {makeAutoObservable, observable} from 'mobx';
import RNBackgroundDownloader, {
  download,
  completeHandler,
} from '@kesha-antonov/react-native-background-downloader';

import {
  DownloadEventCallbacks,
  DownloadJob,
  DownloadMap,
  DownloadProgress,
} from './types';

import {Model} from '../../utils/types';
import {formatBytes, hasEnoughSpace} from '../../utils';

export class DownloadManager {
  private downloadJobs: DownloadMap;
  private callbacks: DownloadEventCallbacks = {};

  constructor() {
    this.downloadJobs = observable.map(new Map());
    makeAutoObservable(this);
    this.reattachBackgroundDownloads();
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
    const time = Date.now();
    console.log('startDownload: ', time);
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

    try {
      const task = download({
        id: model.id,
        url: model.downloadUrl,
        destination: destinationPath,
        metadata: {modelId: model.id},
      });

      const downloadJob: DownloadJob = {
        task,
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

      task
        .begin(() => {
          this.callbacks.onStart?.(model.id);
        })
        .progress(({bytesDownloaded, bytesTotal}) => {
          if (!this.downloadJobs.has(model.id)) {
            return;
          }

          const job = this.downloadJobs.get(model.id)!;
          const currentTime = Date.now();
          const timeDiff = (currentTime - job.lastUpdateTime) / 1000 || 1;
          const bytesDiff = bytesDownloaded - job.lastBytesWritten;
          const speedBps = bytesDiff / timeDiff;
          const speedMBps = (speedBps / (1024 * 1024)).toFixed(2);

          const remainingBytes = bytesTotal - bytesDownloaded;
          const etaSeconds = speedBps > 0 ? remainingBytes / speedBps : 0;
          const etaMinutes = Math.ceil(etaSeconds / 60);
          const etaText =
            etaSeconds >= 60
              ? `${etaMinutes} min`
              : `${Math.ceil(etaSeconds)} sec`;

          const progress: DownloadProgress = {
            bytesDownloaded,
            bytesTotal,
            progress: (bytesDownloaded / bytesTotal) * 100,
            speed: `${formatBytes(bytesDownloaded, 0)} (${speedMBps} MB/s)`,
            eta: etaText,
          };
          console.log('progress: ', progress.progress);

          job.state.progress = progress;
          job.lastBytesWritten = bytesDownloaded;
          job.lastUpdateTime = currentTime;

          this.callbacks.onProgress?.(model.id, progress);
        })
        .done(() => {
          completeHandler(model.id);
          this.downloadJobs.delete(model.id);
          this.callbacks.onComplete?.(model.id);
        })
        .error(({error}) => {
          console.error('Download failed:', error);
          const job = this.downloadJobs.get(model.id);
          if (job) {
            job.state.error = new Error(error);
            job.state.isDownloading = false;
          }
          this.downloadJobs.delete(model.id);
          this.callbacks.onError?.(model.id, new Error(error));
        });
    } catch (err) {
      console.error('Failed to start download:', err);
      this.downloadJobs.delete(model.id);
      throw err;
    }
  }

  async cancelDownload(modelId: string): Promise<void> {
    const job = this.downloadJobs.get(modelId);
    if (job) {
      try {
        await job.task.stop();
      } catch (err) {
        console.error('Error stopping download:', err);
      } finally {
        this.downloadJobs.delete(modelId);
      }
    }
  }

  private async reattachBackgroundDownloads() {
    try {
      const lostTasks =
        await RNBackgroundDownloader.checkForExistingDownloads();

      for (const task of lostTasks) {
        const downloadJob: DownloadJob = {
          task,
          model: task.metadata?.model,
          state: {
            isDownloading: true,
            progress: null,
            error: null,
          },
          lastBytesWritten: 0,
          lastUpdateTime: Date.now(),
        };

        task
          .progress(({bytesDownloaded, bytesTotal}) => {
            const progress: DownloadProgress = {
              bytesDownloaded,
              bytesTotal,
              progress: (bytesDownloaded / bytesTotal) * 100,
              speed: '', // We don't have previous data for speed calculation
              eta: '',
            };
            this.callbacks.onProgress?.(task.id, progress);
          })
          .done(() => {
            completeHandler(task.id);
            this.downloadJobs.delete(task.id);
            this.callbacks.onComplete?.(task.id);
          })
          .error(({error}) => {
            this.downloadJobs.delete(task.id);
            this.callbacks.onError?.(task.id, new Error(error));
          });

        this.downloadJobs.set(task.id, downloadJob);
      }
    } catch (err) {
      console.error('Error reattaching background downloads:', err);
    }
  }
}
