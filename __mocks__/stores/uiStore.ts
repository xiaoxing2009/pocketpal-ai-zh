export const mockUiStore = {
  colorScheme: 'light',
  autoNavigatetoChat: false,
  pageStates: {
    modelsScreen: {
      filters: [],
      expandedGroups: {},
    },
  },
  setValue: jest.fn(),
  displayMemUsage: false,
  setAutoNavigateToChat: jest.fn(),
  setColorScheme: jest.fn(),
  setDisplayMemUsage: jest.fn(),
};
