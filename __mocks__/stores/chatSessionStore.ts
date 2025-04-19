import {sessionFixtures} from '../../jest/fixtures/chatSessions';
import {defaultCompletionSettings} from '../../src/store/ChatSessionStore';

export const mockChatSessionStore = {
  sessions: sessionFixtures,
  //currentSessionMessages: [],
  activeSessionId: 'session-1',
  newChatCompletionSettings: defaultCompletionSettings,
  loadSessionList: jest.fn().mockResolvedValue(undefined),
  deleteSession: jest.fn().mockResolvedValue(undefined),
  setActiveSession: jest.fn(),
  addMessageToCurrentSession: jest.fn(),
  resetActiveSession: jest.fn(),
  updateSessionTitle: jest.fn(),
  saveSessionsMetadata: jest.fn(),
  groupedSessions: {
    Today: [sessionFixtures[0]],
    Yesterday: [sessionFixtures[1]],
  },
  createNewSession: jest.fn(),
  updateMessage: jest.fn(),
  updateMessageToken: jest.fn(),
  exitEditMode: jest.fn(),
  enterEditMode: jest.fn(),
  removeMessagesFromId: jest.fn(),
  setIsGenerating: jest.fn(),
  duplicateSession: jest.fn().mockResolvedValue(undefined),
  setNewChatCompletionSettings: jest.fn(),
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
};

Object.defineProperty(mockChatSessionStore, 'currentSessionMessages', {
  get: jest.fn(() => []),
  configurable: true,
});
