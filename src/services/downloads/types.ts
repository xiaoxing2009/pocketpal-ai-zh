import {DownloadTask} from '@kesha-antonov/react-native-background-downloader';
import {Model} from '../../utils/types';

export interface DownloadProgress {
  bytesDownloaded: number;
  bytesTotal: number;
  progress: number;
  speed: string;
  eta: string;
}

export interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: Error | null;
}

export interface DownloadJob {
  task: DownloadTask;
  model: Model;
  state: DownloadState;
  lastBytesWritten: number;
  lastUpdateTime: number;
}

export type DownloadMap = Map<string, DownloadJob>;

export interface DownloadEventCallbacks {
  onProgress?: (modelId: string, progress: DownloadProgress) => void;
  onComplete?: (modelId: string) => void;
  onError?: (modelId: string, error: Error) => void;
  onStart?: (modelId: string) => void;
}
