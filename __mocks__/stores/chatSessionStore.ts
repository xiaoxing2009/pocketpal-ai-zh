import {sessionFixtures} from '../../jest/fixtures/chatSessions';
import {defaultCompletionSettings} from '../../src/store/ChatSessionStore';

export const mockChatSessionStore = {
  sessions: sessionFixtures,
  //currentSessionMessages: [],
  activeSessionId: 'session-1',
  newChatCompletionSettings: defaultCompletionSettings,
  isMigrating: false,
  migrationComplete: true,
  loadSessionList: jest.fn().mockResolvedValue(undefined),
  loadGlobalSettings: jest.fn().mockResolvedValue(undefined),
  deleteSession: jest.fn().mockResolvedValue(undefined),
  setActiveSession: jest.fn(),
  addMessageToCurrentSession: jest.fn().mockResolvedValue(undefined),
  resetActiveSession: jest.fn(),
  updateSessionTitle: jest.fn().mockResolvedValue(undefined),
  updateSessionTitleBySessionId: jest.fn().mockResolvedValue(undefined),
  groupedSessions: {
    Today: [sessionFixtures[0]],
    Yesterday: [sessionFixtures[1]],
  },
  createNewSession: jest.fn().mockResolvedValue(undefined),
  updateMessage: jest.fn().mockResolvedValue(undefined),
  updateMessageToken: jest.fn().mockResolvedValue(undefined),
  updateSessionCompletionSettings: jest.fn().mockResolvedValue(undefined),
  applySessionSettingsToGlobal: jest.fn().mockResolvedValue(undefined),
  resetSessionSettingsToGlobal: jest.fn().mockResolvedValue(undefined),
  exitEditMode: jest.fn(),
  enterEditMode: jest.fn(),
  removeMessagesFromId: jest.fn(),
  setIsGenerating: jest.fn(),
  duplicateSession: jest.fn().mockResolvedValue(undefined),
  setNewChatCompletionSettings: jest.fn().mockResolvedValue(undefined),
  resetNewChatCompletionSettings: jest.fn().mockResolvedValue(undefined),
  setActivePal: jest.fn().mockResolvedValue(undefined),
  dateGroupNames: {
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    twoWeeksAgo: '2 weeks ago',
    threeWeeksAgo: '3 weeks ago',
    fourWeeksAgo: '4 weeks ago',
    lastMonth: 'Last month',
    older: 'Older',
  },
  setDateGroupNames: jest.fn(),
  initialize: jest.fn().mockResolvedValue(undefined),
};

Object.defineProperty(mockChatSessionStore, 'currentSessionMessages', {
  get: jest.fn(() => []),
  configurable: true,
});

Object.defineProperty(mockChatSessionStore, 'activePalId', {
  get: jest.fn(() => null),
  configurable: true,
});

Object.defineProperty(mockChatSessionStore, 'shouldShowHeaderDivider', {
  get: jest.fn(() => true),
  configurable: true,
});
