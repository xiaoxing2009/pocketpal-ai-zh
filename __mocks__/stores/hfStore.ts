import {mockHFModel1, mockHFModel2} from '../../jest/fixtures/models';

export const mockHFStore = {
  models: [mockHFModel1, mockHFModel2],
  isLoading: false,
  error: '',
  nextPageLink: null,
  searchQuery: '',
  queryFilter: 'gguf',
  queryFull: true,
  queryConfig: true,

  // Methods
  setSearchQuery: jest.fn(),
  fetchAndSetGGUFSpecs: jest.fn().mockResolvedValue(undefined),
  fetchModelFileDetails: jest.fn().mockResolvedValue(undefined),
  getModelById: jest.fn(id =>
    mockHFStore.models.find(model => model.id === id),
  ),
  fetchModelData: jest.fn().mockResolvedValue(undefined),
  fetchModels: jest.fn().mockResolvedValue(undefined),
  fetchMoreModels: jest.fn().mockResolvedValue(undefined),
};

// Mock the store instance
export const hfStore = mockHFStore;
