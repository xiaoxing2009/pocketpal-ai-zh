import {v4 as uuidv4} from 'uuid';
import {makeAutoObservable} from 'mobx';
import 'react-native-get-random-values';
import {makePersistable} from 'mobx-persist-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AssistantFormData,
  PalType,
  RoleplayFormData,
  VideoPalFormData,
} from '../components/PalsSheets/types';
import {defaultModels} from './defaultModels';

export type Pal = {id: string} & (
  | AssistantFormData
  | RoleplayFormData
  | VideoPalFormData
);
export type AssistantPal = Pal & {palType: PalType.ASSISTANT};
export type RoleplayPal = Pal & {palType: PalType.ROLEPLAY};
export type VideoPal = Pal & {palType: PalType.VIDEO};

class PalStore {
  pals: Pal[] = [];

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'PalStore',
      properties: ['pals'],
      storage: AsyncStorage,
    });
  }

  addPal = (data: AssistantFormData | RoleplayFormData | VideoPalFormData) => {
    const newPal = {
      id: uuidv4(),
      ...data,
    } as Pal;
    this.pals.push(newPal);
  };

  updatePal = (
    id: string,
    data: Partial<AssistantFormData | RoleplayFormData | VideoPalFormData>,
  ) => {
    const palIndex = this.pals.findIndex(p => p.id === id);
    if (palIndex !== -1) {
      const currentPal = this.pals[palIndex];
      this.pals[palIndex] = {
        ...currentPal,
        ...data,
        palType: currentPal.palType,
      } as Pal;
    }
  };

  deletePal = (id: string) => {
    const palIndex = this.pals.findIndex(p => p.id === id);
    if (palIndex !== -1) {
      this.pals.splice(palIndex, 1);
    }
  };

  getPals = () => {
    return this.pals;
  };
}

export const palStore = new PalStore();

// Create the default "Lookie" VideoPal if it doesn't exist
export const initializeLookiePal = () => {
  // Check if Lookie already exists
  const lookiePal = palStore.pals.find(
    p => p.palType === PalType.VIDEO && p.name === 'Lookie',
  );

  if (!lookiePal) {
    // Find the default SmolVLM model directly from defaultModels
    // This avoids timing issues with ModelStore initialization
    const defaultModelId =
      'ggml-org/SmolVLM-500M-Instruct-GGUF/SmolVLM-500M-Instruct-Q8_0.gguf';
    const defaultModel = defaultModels.find(
      model => model.id === defaultModelId,
    );

    // Create the Lookie pal
    const lookieData: VideoPalFormData = {
      name: 'Lookie',
      palType: PalType.VIDEO,
      defaultModel: defaultModel, // Set the default model so users know what to download
      systemPrompt:
        'You are Lookie, an AI assistant giving real-time, concise descriptions of a video feed. Use few words. If unsure, say so clearly.',
      useAIPrompt: false,
      isSystemPromptChanged: false,
      color: ['#9E204F', '#F6E1EA'],
      captureInterval: 3000, // Default to 1 second
    };

    palStore.addPal(lookieData);
  }
};
