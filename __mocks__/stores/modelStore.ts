import {computed, makeAutoObservable, ObservableMap} from 'mobx';

import {modelsList} from '../../jest/fixtures/models';

import {Model} from '../../src/utils/types';

class MockModelStore {
  models = modelsList;
  n_context = 1024;
  MIN_CONTEXT_SIZE = 200;
  useAutoRelease = true;
  useMetal = false;
  n_gpu_layers = 50;
  activeModelId: string | undefined;
  inferencing = false;
  isStreaming = false;
  downloadJobs = new ObservableMap();

  refreshDownloadStatuses: jest.Mock;
  addLocalModel: jest.Mock;
  setNContext: jest.Mock;
  updateUseAutoRelease: jest.Mock;
  updateUseMetal: jest.Mock;
  setNGPULayers: jest.Mock;
  resetModels: jest.Mock;
  initContext: jest.Mock;
  lastUsedModelId: any;
  checkSpaceAndDownload: jest.Mock;
  getDownloadProgress: jest.Mock;
  manualReleaseContext: jest.Mock;
  addHFModel: jest.Mock;
  downloadHFModel: jest.Mock;
  cancelDownload: jest.Mock;

  constructor() {
    makeAutoObservable(this, {
      refreshDownloadStatuses: false,
      addLocalModel: false,
      setNContext: false,
      updateUseAutoRelease: false,
      updateUseMetal: false,
      setNGPULayers: false,
      resetModels: false,
      initContext: false,
      checkSpaceAndDownload: false,
      getDownloadProgress: false,
      manualReleaseContext: false,
      addHFModel: false,
      downloadHFModel: false,
      cancelDownload: false,
      lastUsedModel: computed,
      activeModel: computed,
      isDownloading: computed,
    });
    this.refreshDownloadStatuses = jest.fn();
    this.addLocalModel = jest.fn();
    this.setNContext = jest.fn();
    this.updateUseAutoRelease = jest.fn();
    this.updateUseMetal = jest.fn();
    this.setNGPULayers = jest.fn();
    this.resetModels = jest.fn();
    this.initContext = jest.fn().mockResolvedValue(Promise.resolve());
    this.checkSpaceAndDownload = jest.fn();
    this.getDownloadProgress = jest.fn();
    this.manualReleaseContext = jest.fn();
    this.addHFModel = jest.fn();
    this.downloadHFModel = jest.fn();
    this.cancelDownload = jest.fn();
  }

  setActiveModel = (modelId: string) => {
    this.activeModelId = modelId;
  };

  setInferencing = (value: boolean) => {
    this.inferencing = value;
  };

  setIsStreaming = (value: boolean) => {
    this.isStreaming = value;
  };

  get lastUsedModel(): Model | undefined {
    return this.lastUsedModelId
      ? this.models.find(m => m.id === this.lastUsedModelId)
      : undefined;
  }

  get isDownloading() {
    return (modelId: string) => {
      return this.downloadJobs.has(modelId);
    };
  }

  get activeModel() {
    return this.models.find(model => model.id === this.activeModelId);
  }

  get availableModels() {
    return this.models.filter(model => model.isDownloaded);
  }
}

export const mockModelStore = new MockModelStore();
