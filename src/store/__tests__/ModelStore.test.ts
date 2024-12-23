jest.unmock('../ModelStore'); // This is not really needed, as only importing from store is mocked.
jest.unmock('../../store');
import {runInAction} from 'mobx';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {LlamaContext} from '@pocketpalai/llama.rn';

import {modelStore} from '../ModelStore';
import {defaultModels} from '../defaultModels';

import {ModelOrigin} from '../../utils/types';

describe('ModelStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    modelStore.models = []; // Clear models before each test
    modelStore.context = undefined;
    modelStore.activeModelId = undefined;
  });

  describe('mergeModelLists', () => {
    it('should add missing default models to the existing model list', () => {
      modelStore.models = []; // Start with no existing models

      runInAction(() => {
        modelStore.mergeModelLists();
      });

      expect(modelStore.models.length).toBeGreaterThan(0);
      expect(modelStore.models).toEqual(expect.arrayContaining(defaultModels));
    });

    it('should merge existing models with default models, adding any that are missing', () => {
      const notExistedModel = defaultModels[0];
      modelStore.models = defaultModels.slice(1); // Start with all but the first model, so we can test if it's added back
      expect(modelStore.models.length).toBe(defaultModels.length - 1);
      expect(modelStore.models).not.toContainEqual(notExistedModel);

      runInAction(() => {
        modelStore.mergeModelLists();
      });

      expect(modelStore.models.length).toBeGreaterThan(0);
      expect(modelStore.models).toContainEqual(notExistedModel);
    });

    it('should retain value of existing variables while merging new variables', () => {
      const newDefaultModel = defaultModels[0];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {temperature, ...completionSettingsWithoutTemperature} =
        newDefaultModel.completionSettings; // Exclude temperature

      // Apply changes to the existing model:
      //  - chatTemplate.template: existing variable with a value different from the default
      //  - completionSettings.n_predict: existing variable with a value different from the default
      //  - temperature: new variable in the default model - not present in the existing model
      const existingModel = {
        ...newDefaultModel,
        chatTemplate: {
          ...newDefaultModel.chatTemplate,
          template: 'existing',
        },
        completionSettings: {
          ...completionSettingsWithoutTemperature, // Use the completionSettings without temperature - simulates new parameters
          n_predict: 101010,
        },
        isDownloaded: true, // if not downloaded, it will be removed
      };

      modelStore.models[0] = existingModel;

      runInAction(() => {
        modelStore.mergeModelLists();
      });

      expect(modelStore.models[0].chatTemplate).toEqual(
        expect.objectContaining({
          template: 'existing', // Existing value should remain
        }),
      );

      expect(modelStore.models[0].completionSettings).toEqual(
        expect.objectContaining({
          n_predict: 101010, // Existing value should remain
          temperature: newDefaultModel.completionSettings.temperature, // Non-existing value should be merged
        }),
      );
    });

    it('should merge value of default to exisiting for top level variables', () => {
      const newDefaultModel = defaultModels[0];

      const existingModel = {
        ...newDefaultModel,
        params: 101010,
      };

      modelStore.models[0] = existingModel;

      runInAction(() => {
        modelStore.mergeModelLists();
      });

      expect(modelStore.models[0].params).toEqual(newDefaultModel.params);
    });
  });

  describe('model management', () => {
    it('should add local model correctly', async () => {
      const localPath = '/path/to/model.bin';
      await modelStore.addLocalModel(localPath);

      expect(modelStore.models).toHaveLength(1);
      expect(modelStore.models[0]).toEqual(
        expect.objectContaining({
          isLocal: true,
          origin: ModelOrigin.LOCAL,
          fullPath: localPath,
          isDownloaded: true,
        }),
      );
    });

    it('should delete model and release context if active', async () => {
      const model = defaultModels[0];
      modelStore.models = [model];
      modelStore.activeModelId = model.id;

      await modelStore.deleteModel(model);
      // await when(() => modelStore.activeModelId === undefined); // wait for mobx to propagate changes

      expect(modelStore.activeModelId).toBeUndefined();
      expect(modelStore.context).toBeUndefined();
    });
  });

  describe('context management', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset store state
      modelStore.models = [];
      modelStore.context = undefined;
      modelStore.activeModelId = undefined;
    });

    it('should handle app state changes correctly', async () => {
      // Setup
      modelStore.useAutoRelease = true;
      const mockRelease = jest.fn();
      modelStore.context = {
        release: mockRelease, // Create the mock function first
      } as any;
      modelStore.activeModelId = 'test-id';
      modelStore.appState = 'active'; // Set initial app state to 'active'

      // Simulate going to background
      await modelStore.handleAppStateChange('background');

      // Check if context was released
      expect(mockRelease).toHaveBeenCalled(); // Check the mock function directly
      expect(modelStore.context).toBeUndefined();
    });

    it('should not release context when auto-release is disabled', async () => {
      // Setup
      modelStore.useAutoRelease = false;
      const mockRelease = jest.fn();
      modelStore.context = {
        release: mockRelease, // Create the mock function first
      } as any;
      modelStore.activeModelId = 'test-id';

      // Simulate going to background
      await modelStore.handleAppStateChange('background');

      // Check that context was not released
      expect(mockRelease).not.toHaveBeenCalled(); // Check the mock function directly
      expect(modelStore.context).toBeDefined();
    });

    it('should reinitialize context when coming back to foreground', async () => {
      // Setup
      modelStore.useAutoRelease = true;
      const model = defaultModels[0];
      modelStore.models = [model];
      modelStore.activeModelId = model.id;

      const mockInitContext = jest.fn().mockResolvedValue(
        new LlamaContext({
          contextId: 1,
          gpu: false,
          reasonNoGPU: '',
          model: {},
        }),
      );
      modelStore.initContext = mockInitContext;

      // Simulate coming to foreground
      modelStore.appState = 'background';
      await modelStore.handleAppStateChange('active');

      expect(mockInitContext).toHaveBeenCalledWith(model);
    });
  });

  describe('settings management', () => {
    it('should update completion settings', () => {
      const model = {...defaultModels[0]};
      modelStore.models = [model];

      const newSettings = {
        temperature: 0.8,
        top_p: 0.9,
      };

      modelStore.updateCompletionSettings(model.id, newSettings);

      expect(modelStore.models[0].completionSettings).toEqual(
        expect.objectContaining(newSettings),
      );
    });

    it('should reset model settings to defaults', () => {
      const model = {...defaultModels[0]};
      const originalSettings = {...model.defaultCompletionSettings};
      model.completionSettings = {
        ...model.completionSettings,
        temperature: 0.9,
      };
      modelStore.models = [model];

      modelStore.resetCompletionSettings(model.id);

      expect(modelStore.models[0].completionSettings).toEqual(originalSettings);
    });
  });

  describe('download management', () => {
    it('should handle download cancellation', async () => {
      const model = defaultModels[0];
      modelStore.models = [model];
      // Mock download job
      modelStore.downloadJobs.set(model.id, {jobId: '123'});

      await modelStore.cancelDownload(model.id);

      expect(modelStore.downloadJobs.has(model.id)).toBeFalsy();
      expect(RNFS.unlink).toHaveBeenCalled();
    });

    it('should check for sufficient space before download', async () => {
      const model = defaultModels[0];
      modelStore.models = [model];

      // Mock hasEnoughSpace to return false
      jest.mock('../../utils', () => ({
        hasEnoughSpace: jest.fn().mockResolvedValue(false),
      }));

      await modelStore.checkSpaceAndDownload(model.id);

      expect(modelStore.downloadJobs.has(model.id)).toBeFalsy();
    });
  });

  describe('computed properties', () => {
    it('should return correct active model', () => {
      const model = defaultModels[0];
      modelStore.models = [model];
      modelStore.activeModelId = model.id;

      expect(modelStore.activeModel).toEqual(model);
    });

    it('should return correct last used model', () => {
      const model = {...defaultModels[0], isDownloaded: true};
      modelStore.models = [model];
      modelStore.lastUsedModelId = model.id;

      expect(modelStore.lastUsedModel).toEqual(model);
    });
  });
});
