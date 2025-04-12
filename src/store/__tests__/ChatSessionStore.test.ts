jest.unmock('../ChatSessionStore'); // this is not really needed, as only importing from store is mocked.
import {runInAction} from 'mobx';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {LlamaContext} from '@pocketpalai/llama.rn';

import {chatSessionStore, defaultCompletionSettings} from '../ChatSessionStore';

import {MessageType} from '../../utils/types';
import {mockContextModel} from '../../../jest/fixtures/models';

describe('chatSessionStore', () => {
  const mockMessage = {
    id: 'message1',
    text: 'Hello, world!',
    type: 'text',
    author: {id: 'user1', name: 'User'},
    createdAt: Date.now(),
  } as MessageType.Text;

  beforeEach(() => {
    jest.clearAllMocks();
    chatSessionStore.sessions = [];
    chatSessionStore.activeSessionId = null;
  });

  describe('loadSessionList', () => {
    it('loads session list from file successfully', async () => {
      const mockData = JSON.stringify([
        {
          id: '1',
          title: 'Session 1',
          date: new Date().toISOString(),
          messages: [],
        },
      ]);
      (RNFS.readFile as jest.Mock).mockResolvedValue(mockData);

      await chatSessionStore.loadSessionList();

      expect(chatSessionStore.sessions.length).toBe(1);
      expect(chatSessionStore.sessions[0].title).toBe('Session 1');
      expect(RNFS.readFile).toHaveBeenCalledWith(
        '/path/to/documents/session-metadata.json',
      );
    });

    it('handles file read error gracefully', async () => {
      (RNFS.readFile as jest.Mock).mockRejectedValue(
        new Error('File not found'),
      );

      await chatSessionStore.loadSessionList();

      expect(chatSessionStore.sessions).toEqual([]);
      expect(RNFS.readFile).toHaveBeenCalledWith(
        '/path/to/documents/session-metadata.json',
      );
    });
  });

  describe('deleteSession', () => {
    it('deletes the session file and updates store', async () => {
      const mockSessionId = 'session1';
      chatSessionStore.sessions = [
        {
          id: mockSessionId,
          title: 'Session 1',
          date: new Date().toISOString(),
          messages: [],
          completionSettings: defaultCompletionSettings,
        },
      ];
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      await chatSessionStore.deleteSession(mockSessionId);

      expect(RNFS.unlink).toHaveBeenCalledWith(
        `/path/to/documents/${mockSessionId}.llama-session.bin`,
      );
      expect(chatSessionStore.sessions.length).toBe(0);
    });

    it('handles file not existing during session deletion', async () => {
      const mockSessionId = 'session1';
      chatSessionStore.sessions = [
        {
          id: mockSessionId,
          title: 'Session 1',
          date: new Date().toISOString(),
          messages: [],
          completionSettings: defaultCompletionSettings,
        },
      ];
      (RNFS.exists as jest.Mock).mockResolvedValue(false);

      await chatSessionStore.deleteSession(mockSessionId);

      expect(RNFS.unlink).not.toHaveBeenCalled();
      expect(chatSessionStore.sessions.length).toBe(0);
    });
  });

  describe('addMessageToCurrentSession', () => {
    it('creates a new session if no active session', async () => {
      await runInAction(async () => {
        chatSessionStore.addMessageToCurrentSession(mockMessage);
      });

      expect(chatSessionStore.sessions.length).toBe(1);
      expect(
        (chatSessionStore.sessions[0].messages[0] as MessageType.Text).text,
      ).toBe(mockMessage.text);
    });

    it('adds a message to the active session', async () => {
      const mockSession = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [mockSession];
      chatSessionStore.activeSessionId = mockSession.id;

      runInAction(() => {
        chatSessionStore.addMessageToCurrentSession(mockMessage);
      });

      expect(chatSessionStore.sessions[0].messages.length).toBe(1);
      expect(
        (chatSessionStore.sessions[0].messages[0] as MessageType.Text).text,
      ).toBe('Hello, world!');
    });
  });

  describe('updateMessage', () => {
    it('updates a message in the active session', () => {
      const mockSession = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [mockMessage],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [mockSession];
      chatSessionStore.activeSessionId = mockSession.id;

      const updatedMessage = {text: 'Updated message text'};
      chatSessionStore.updateMessage(mockMessage.id, updatedMessage);

      expect(
        (chatSessionStore.sessions[0].messages[0] as MessageType.Text).text,
      ).toBe(updatedMessage.text);
    });
  });

  describe('updateSessionTitle', () => {
    it('updates the session title based on the latest message', () => {
      const mockSession = {
        id: 'session1',
        title: 'New Session',
        date: new Date().toISOString(),
        messages: [mockMessage],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.updateSessionTitle(mockSession);

      expect(mockSession.title).toBe('Hello, world!');
    });

    it('limits the session title to 40 characters', () => {
      const longMessage = 'a'.repeat(100);
      const mockSession = {
        id: 'session1',
        title: 'New Session',
        date: new Date().toISOString(),
        messages: [{...mockMessage, text: longMessage}],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.updateSessionTitle(mockSession);

      expect(mockSession.title.length).toBe(43); // 40 chars + '...'
      expect(mockSession.title.endsWith('...')).toBe(true);
    });
  });

  describe('createNewSession', () => {
    it('creates a new session and sets it as active', async () => {
      await chatSessionStore.createNewSession('My New Session', [mockMessage]);

      expect(chatSessionStore.sessions.length).toBe(1);
      expect(chatSessionStore.sessions[0].title).toBe('My New Session');
      expect(chatSessionStore.activeSessionId).toBe(
        chatSessionStore.sessions[0].id,
      );
    });

    it('inherits settings from active session when creating a new session', async () => {
      // Create and set active session with custom settings
      const originalSession = {
        id: 'session1',
        title: 'Original Session',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: {
          ...defaultCompletionSettings,
          temperature: 0.9,
        },
      };
      chatSessionStore.sessions = [originalSession];
      chatSessionStore.activeSessionId = originalSession.id;

      // When active session exists and user creates a new session
      chatSessionStore.resetActiveSession();
      // This simulates that settings from active session are copied to newChatCompletionSettings
      chatSessionStore.newChatCompletionSettings =
        originalSession.completionSettings;

      //await chatSessionStore.createNewSession('New Session');
      chatSessionStore.addMessageToCurrentSession(mockMessage);

      // The new session should have the same settings
      expect(chatSessionStore.sessions.length).toBe(2);
      expect(chatSessionStore.sessions[1].completionSettings.temperature).toBe(
        0.9,
      );
    });
  });

  describe('resetActiveSession', () => {
    it('resets the active session to null', () => {
      chatSessionStore.activeSessionId = 'session1';
      chatSessionStore.resetActiveSession();

      expect(chatSessionStore.activeSessionId).toBeNull();
    });
  });

  describe('saveSessionsMetadata', () => {
    it('saves the session metadata to file', async () => {
      const session = {
        id: '1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];

      await chatSessionStore.saveSessionsMetadata();

      expect(RNFS.writeFile).toHaveBeenCalledWith(
        '/path/to/documents/session-metadata.json',
        JSON.stringify([session]),
      );
    });

    it('handles write error gracefully', async () => {
      const session = {
        id: '1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      (RNFS.writeFile as jest.Mock).mockRejectedValue(
        new Error('Write failed'),
      );

      await chatSessionStore.saveSessionsMetadata();

      expect(RNFS.writeFile).toHaveBeenCalled();
    });
  });

  describe('setActiveSession', () => {
    it('sets the active session id', () => {
      const sessionId = 'session1';
      chatSessionStore.setActiveSession(sessionId);
      expect(chatSessionStore.activeSessionId).toBe(sessionId);
    });
  });

  describe('currentSessionMessages', () => {
    it('returns messages for active session', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [mockMessage],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = session.id;

      expect(chatSessionStore.currentSessionMessages).toEqual([mockMessage]);
    });

    it('returns empty array when no active session', () => {
      expect(chatSessionStore.currentSessionMessages).toEqual([]);
    });
  });

  describe('updateMessageToken', () => {
    it('updates existing message with new token', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [mockMessage],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = session.id;

      const mockContext = new LlamaContext({
        contextId: 1,
        gpu: false,
        reasonNoGPU: 'Test environment',
        model: mockContextModel,
      });

      chatSessionStore.updateMessageToken(
        {token: ' world'},
        Date.now(),
        mockMessage.id,
        mockContext,
      );

      expect(
        (chatSessionStore.currentSessionMessages[0] as MessageType.Text).text,
      ).toBe('Hello, world! world');
    });

    it('creates new message if id not found', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = session.id;

      const mockContext = new LlamaContext({
        contextId: 1,
        gpu: false,
        reasonNoGPU: 'Test environment',
        model: mockContextModel,
      });
      const newMessageId = 'new-message';
      const createdAt = Date.now();

      chatSessionStore.updateMessageToken(
        {token: 'New message'},
        createdAt,
        newMessageId,
        mockContext,
      );

      const newMessage = chatSessionStore.currentSessionMessages[0];
      expect(newMessage.id).toBe(newMessageId);
      expect((newMessage as MessageType.Text).text).toBe('New message');
      expect(newMessage.metadata).toEqual({contextId: 1, copyable: true});
    });
  });

  describe('groupedSessions', () => {
    it('groups sessions by date categories', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      chatSessionStore.sessions = [
        {
          id: '1',
          title: 'Today Session',
          date: today.toISOString(),
          messages: [],
          completionSettings: defaultCompletionSettings,
        },
        {
          id: '2',
          title: 'Yesterday Session',
          date: yesterday.toISOString(),
          messages: [],
          completionSettings: defaultCompletionSettings,
        },
        {
          id: '3',
          title: 'Last Week Session',
          date: lastWeek.toISOString(),
          messages: [],
          completionSettings: defaultCompletionSettings,
        },
      ];

      const grouped = chatSessionStore.groupedSessions;
      expect(grouped.Today).toBeDefined();
      expect(grouped.Yesterday).toBeDefined();
      expect(grouped['Last week']).toBeDefined();
    });
  });

  describe('duplicateSession', () => {
    it('duplicates a session with its messages and settings', async () => {
      // Make sure write file works for this test
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);

      const originalSession = {
        id: 'session1',
        title: 'Original Session',
        date: new Date().toISOString(),
        messages: [mockMessage],
        completionSettings: {
          ...defaultCompletionSettings,
          temperature: 0.7,
        },
      };

      chatSessionStore.sessions = [originalSession];

      await chatSessionStore.duplicateSession('session1');

      expect(chatSessionStore.sessions.length).toBe(2);
      expect(chatSessionStore.sessions[1].title).toBe(
        'Original Session - Copy',
      );
      expect(chatSessionStore.sessions[1].messages).toEqual([mockMessage]);
      expect(chatSessionStore.sessions[1].completionSettings.temperature).toBe(
        0.7,
      );
    });
  });

  // Tests from ChatSessionStoreExtended.test.ts
  describe('isGenerating flag', () => {
    it('sets and gets the isGenerating flag', () => {
      expect(chatSessionStore.isGenerating).toBe(false);

      chatSessionStore.setIsGenerating(true);
      expect(chatSessionStore.isGenerating).toBe(true);

      chatSessionStore.setIsGenerating(false);
      expect(chatSessionStore.isGenerating).toBe(false);
    });

    it('shouldShowHeaderDivider returns true when conditions met', () => {
      // No active session
      expect(chatSessionStore.shouldShowHeaderDivider).toBe(true);

      // Active session with no messages
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [] as MessageType.Any[],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = session.id;
      expect(chatSessionStore.shouldShowHeaderDivider).toBe(true);

      // Active session with messages
      session.messages = [mockMessage] as MessageType.Any[];
      expect(chatSessionStore.shouldShowHeaderDivider).toBe(true);

      // With isGenerating true
      chatSessionStore.setIsGenerating(true);
      expect(chatSessionStore.shouldShowHeaderDivider).toBe(false);

      // With isEditMode true
      chatSessionStore.setIsGenerating(false);
      chatSessionStore.isEditMode = true;
      expect(chatSessionStore.shouldShowHeaderDivider).toBe(false);
    });
  });

  describe('updateSessionTitleBySessionId', () => {
    it('updates session title by ID', () => {
      const session = {
        id: 'session1',
        title: 'Original Title',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];

      chatSessionStore.updateSessionTitleBySessionId('session1', 'New Title');

      expect(chatSessionStore.sessions[0].title).toBe('New Title');
      expect(RNFS.writeFile).toHaveBeenCalled();
    });

    it('does nothing for non-existent session ID', () => {
      const session = {
        id: 'session1',
        title: 'Original Title',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];

      chatSessionStore.updateSessionTitleBySessionId(
        'non-existent',
        'New Title',
      );

      expect(chatSessionStore.sessions[0].title).toBe('Original Title');
    });
  });

  describe('completion settings', () => {
    it('updates completion settings for active session', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = session.id;

      const newSettings = {
        ...defaultCompletionSettings,
        temperature: 0.9,
        top_p: 0.95,
      };

      chatSessionStore.updateSessionCompletionSettings(newSettings);

      expect(chatSessionStore.sessions[0].completionSettings).toEqual(
        newSettings,
      );
    });

    it('sets new chat completion settings', () => {
      const newSettings = {
        ...defaultCompletionSettings,
        temperature: 0.9,
      };

      chatSessionStore.setNewChatCompletionSettings(newSettings);

      expect(chatSessionStore.newChatCompletionSettings).toEqual(newSettings);
    });

    it('resets new chat completion settings', () => {
      chatSessionStore.newChatCompletionSettings = {
        ...defaultCompletionSettings,
        temperature: 0.9,
      };

      chatSessionStore.resetNewChatCompletionSettings();

      expect(chatSessionStore.newChatCompletionSettings).toEqual(
        defaultCompletionSettings,
      );
    });

    it('applies new chat completion settings when creating a new session', async () => {
      const customSettings = {
        ...defaultCompletionSettings,
        temperature: 0.7,
        top_p: 0.95,
      };

      chatSessionStore.newChatCompletionSettings = customSettings;

      await chatSessionStore.createNewSession('New Session');

      expect(chatSessionStore.sessions[0].completionSettings).toEqual(
        customSettings,
      );
      expect(chatSessionStore.newChatCompletionSettings).toEqual(
        defaultCompletionSettings,
      );
    });
  });

  describe('edit mode', () => {
    const mockMessage2 = {
      id: 'message2',
      text: 'Second message',
      type: 'text',
      author: {id: 'assistant', name: 'Assistant'},
      createdAt: Date.now() - 1000,
    } as MessageType.Text;

    const mockMessage3 = {
      id: 'message3',
      text: 'Third message',
      type: 'text',
      author: {id: 'user1', name: 'User'},
      createdAt: Date.now(),
    } as MessageType.Text;

    beforeEach(() => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [
          mockMessage3, // newest - user (message3)
          mockMessage2, // middle - assistant (message2)
          mockMessage, // oldest - user (message1)
        ],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = 'session1';
    });

    it('enters edit mode for a specific message', () => {
      chatSessionStore.enterEditMode(mockMessage2.id);

      expect(chatSessionStore.isEditMode).toBe(true);
      expect(chatSessionStore.editingMessageId).toBe(mockMessage2.id);
    });

    it('exits edit mode', () => {
      chatSessionStore.enterEditMode(mockMessage2.id);
      chatSessionStore.exitEditMode();

      expect(chatSessionStore.isEditMode).toBe(false);
      expect(chatSessionStore.editingMessageId).toBeNull();
    });

    it('commits edit by removing messages after the edited message', () => {
      chatSessionStore.enterEditMode(mockMessage3.id);
      chatSessionStore.commitEdit();

      expect(chatSessionStore.isEditMode).toBe(false);
      expect(chatSessionStore.editingMessageId).toBeNull();
      expect(chatSessionStore.sessions[0].messages.length).toBe(2);
      expect(chatSessionStore.sessions[0].messages[0].id).toBe(mockMessage2.id);
      expect(chatSessionStore.sessions[0].messages[1].id).toBe(mockMessage.id);
    });

    it('returns correct messages when in edit mode', () => {
      // editing the first message will remove all messages after it
      chatSessionStore.enterEditMode(mockMessage.id);

      const messages = chatSessionStore.currentSessionMessages;
      expect(messages.length).toBe(0);
    });
  });

  describe('removeMessagesFromId', () => {
    const mockMessage2 = {
      id: 'message2',
      text: 'Second message',
      type: 'text',
      author: {id: 'assistant', name: 'Assistant'},
      createdAt: Date.now() - 1000,
    } as MessageType.Text;

    const mockMessage3 = {
      id: 'message3',
      text: 'Third message',
      type: 'text',
      author: {id: 'user1', name: 'User'},
      createdAt: Date.now(),
    } as MessageType.Text;

    beforeEach(() => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [
          mockMessage3, // newest - user (message3)
          mockMessage2, // middle - assistant (message2)
          mockMessage, // oldest - user (message1)
        ],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = 'session1';
    });

    it('removes messages starting from a specific ID (including the message)', () => {
      chatSessionStore.removeMessagesFromId(mockMessage2.id, true);

      expect(chatSessionStore.sessions[0].messages.length).toBe(1);
      expect(chatSessionStore.sessions[0].messages[0].id).toBe(mockMessage.id);
    });

    it('removes messages starting from a specific ID (excluding the message)', () => {
      chatSessionStore.removeMessagesFromId(mockMessage2.id, false);

      expect(chatSessionStore.sessions[0].messages.length).toBe(2);
      expect(chatSessionStore.sessions[0].messages[0].id).toBe(mockMessage2.id);
      expect(chatSessionStore.sessions[0].messages[1].id).toBe(mockMessage.id);
    });

    it('does nothing for non-existent message ID', () => {
      chatSessionStore.removeMessagesFromId('non-existent');

      expect(chatSessionStore.sessions[0].messages.length).toBe(3);
    });
  });

  describe('pal management', () => {
    it('gets active pal ID from active session', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
        activePalId: 'pal1',
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = 'session1';

      expect(chatSessionStore.activePalId).toBe('pal1');
    });

    it('gets active pal ID from newChatPalId when no active session', () => {
      chatSessionStore.newChatPalId = 'pal2';

      expect(chatSessionStore.activePalId).toBe('pal2');
    });

    it('sets active pal ID for active session', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = 'session1';

      chatSessionStore.setActivePal('pal1');

      expect(chatSessionStore.sessions[0].activePalId).toBe('pal1');
    });

    it('sets newChatPalId when no active session', () => {
      chatSessionStore.setActivePal('pal2');

      expect(chatSessionStore.newChatPalId).toBe('pal2');
    });

    it('preserves active pal ID when resetting active session', () => {
      const session = {
        id: 'session1',
        title: 'Session 1',
        date: new Date().toISOString(),
        messages: [],
        completionSettings: defaultCompletionSettings,
        activePalId: 'pal1',
      };
      chatSessionStore.sessions = [session];
      chatSessionStore.activeSessionId = 'session1';

      chatSessionStore.resetActiveSession();

      expect(chatSessionStore.newChatPalId).toBe('pal1');
      expect(chatSessionStore.activeSessionId).toBeNull();
    });

    it('applies newChatPalId when creating a new session', async () => {
      chatSessionStore.newChatPalId = 'pal1';

      await chatSessionStore.createNewSession('New Session');

      expect(chatSessionStore.sessions[0].activePalId).toBe('pal1');
      expect(chatSessionStore.newChatPalId).toBeUndefined();
    });
  });
});
