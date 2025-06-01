import {makeAutoObservable} from 'mobx';
import {
  AssistantFormData,
  RoleplayFormData,
  VideoPalFormData,
} from '../../src/components/PalsSheets/types';
import {Pal} from '../../src/store/PalStore';

class MockPalStore {
  pals: Pal[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addPal = jest.fn(
    (data: AssistantFormData | RoleplayFormData | VideoPalFormData) => {
      const newPal = {
        id: 'mock-uuid-12345' + Math.random(),
        ...data,
      } as Pal;
      this.pals.push(newPal);
    },
  );

  updatePal = jest.fn(
    (
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
    },
  );

  deletePal = jest.fn((id: string) => {
    const palIndex = this.pals.findIndex(p => p.id === id);
    if (palIndex !== -1) {
      this.pals.splice(palIndex, 1);
    }
  });

  getPals = jest.fn(() => {
    return this.pals;
  });
}

export const mockPalStore = new MockPalStore();
