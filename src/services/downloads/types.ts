import {Model} from '../../utils/types';

export interface DownloadProgress {
  bytesDownloaded: number;
  bytesTotal: number;
  progress: number; // percentage (0-100)
  speed: string; // formatted string like "1.5 MB/s"
  eta: string; // formatted string like "2 min" or "30 sec"
  rawSpeed?: number; // raw speed in bytes per second
  rawEta?: number; // raw eta in seconds
}

export interface DownloadState {
  isDownloading: boolean;
  progress: DownloadProgress | null;
  error: Error | null;
}

export interface DownloadJob {
  task: any;
  model: Model;
  state: DownloadState;
  lastBytesWritten: number;
  lastUpdateTime: number;
}

export type DownloadMap = Map<string, DownloadJob>;

export interface DownloadEventCallbacks {
  onStart?: (modelId: string) => void;
  onProgress?: (modelId: string, progress: DownloadProgress) => void;
  onComplete?: (modelId: string) => void;
  onError?: (modelId: string, error: Error) => void;
}
