import {makeAutoObservable} from 'mobx';
import {v4 as uuidv4} from 'uuid';
import {
  AssistantFormData,
  RoleplayFormData,
} from '../../src/components/PalsSheets/types';
import {Pal} from '../../src/store/PalStore';

class MockPalStore {
  pals: Pal[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addPal = jest.fn((data: AssistantFormData | RoleplayFormData) => {
    const newPal = {
      id: uuidv4(),
      ...data,
    } as Pal;
    this.pals.push(newPal);
  });

  updatePal = jest.fn(
    (id: string, data: Partial<AssistantFormData | RoleplayFormData>) => {
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
