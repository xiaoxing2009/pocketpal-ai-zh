jest.unmock('../ModelStore'); // This is not really needed, as only importing from store is mocked.
import {modelStore} from '../ModelStore';
import {runInAction} from 'mobx';
import {defaultModels} from '../defaultModels';

describe('ModelStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    modelStore.models = []; // Clear models before each test
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
  });
});
