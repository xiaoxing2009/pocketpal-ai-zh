import {CompletionParams, LlamaContext} from '@pocketpalai/llama.rn';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {makeAutoObservable, runInAction} from 'mobx';
import {format, isToday, isYesterday} from 'date-fns';

import {assistant, defaultCompletionParams} from '../utils/chat';
import {MessageType} from '../utils/types';

const NEW_SESSION_TITLE = 'New Session';
const TITLE_LIMIT = 40;
const GLOBAL_SETTINGS_FILE = 'global-completion-settings.json';

export interface SessionMetaData {
  id: string;
  title: string;
  date: string;
  messages: MessageType.Any[];
  completionSettings: CompletionParams;
  activePalId?: string;
}

interface SessionGroup {
  [key: string]: SessionMetaData[];
}

// Default group names in English as fallback
const DEFAULT_GROUP_NAMES = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This week',
  lastWeek: 'Last week',
  twoWeeksAgo: '2 weeks ago',
  threeWeeksAgo: '3 weeks ago',
  fourWeeksAgo: '4 weeks ago',
  lastMonth: 'Last month',
  older: 'Older',
};

export const defaultCompletionSettings = {...defaultCompletionParams};
delete defaultCompletionSettings.prompt;
delete defaultCompletionSettings.stop;

class ChatSessionStore {
  sessions: SessionMetaData[] = [];
  activeSessionId: string | null = null;
  isEditMode: boolean = false;
  editingMessageId: string | null = null;
  isGenerating: boolean = false;
  newChatCompletionSettings: CompletionParams = defaultCompletionSettings;
  newChatPalId: string | undefined = undefined;
  // Store localized date group names
  dateGroupNames: typeof DEFAULT_GROUP_NAMES = DEFAULT_GROUP_NAMES;

  constructor() {
    makeAutoObservable(this);
    this.loadSessionList();
    this.loadGlobalSettings();
  }

  // Method to set localized date group names from React components
  setDateGroupNames(l10nDateGroups: typeof DEFAULT_GROUP_NAMES) {
    this.dateGroupNames = l10nDateGroups;
  }

  get shouldShowHeaderDivider(): boolean {
    return (
      !this.activeSessionId ||
      (this.currentSessionMessages.length === 0 &&
        !this.isGenerating &&
        !this.isEditMode)
    );
  }

  setIsGenerating(value: boolean) {
    this.isGenerating = value;
  }

  async loadSessionList(): Promise<void> {
    const path = `${RNFS.DocumentDirectoryPath}/session-metadata.json`;
    try {
      const data = await RNFS.readFile(path);
      runInAction(() => {
        this.sessions = JSON.parse(data);
      });
    } catch (error) {
      console.error('Failed to load session list:', error);
    }
  }

  async loadGlobalSettings(): Promise<void> {
    const path = `${RNFS.DocumentDirectoryPath}/${GLOBAL_SETTINGS_FILE}`;
    try {
      const exists = await RNFS.exists(path);
      if (exists) {
        const data = await RNFS.readFile(path);
        runInAction(() => {
          this.newChatCompletionSettings = JSON.parse(data);
        });
      } else {
        // If file doesn't exist, persist default settings
        await this.saveGlobalSettings();
      }
    } catch (error) {
      console.error('Failed to load global settings:', error);
    }
  }

  async saveGlobalSettings(): Promise<void> {
    try {
      await RNFS.writeFile(
        `${RNFS.DocumentDirectoryPath}/${GLOBAL_SETTINGS_FILE}`,
        JSON.stringify(this.newChatCompletionSettings),
      );
    } catch (error) {
      console.error('Failed to save global settings:', error);
    }
  }

  async deleteSession(id: string): Promise<void> {
    try {
      const sessionFile = `${RNFS.DocumentDirectoryPath}/${id}.llama-session.bin`;
      const fileExists = await RNFS.exists(sessionFile);
      if (fileExists) {
        await RNFS.unlink(sessionFile);
      }

      if (id === this.activeSessionId) {
        this.resetActiveSession();
      }

      runInAction(() => {
        this.sessions = this.sessions.filter(session => session.id !== id);
      });

      await RNFS.writeFile(
        `${RNFS.DocumentDirectoryPath}/session-metadata.json`,
        JSON.stringify(this.sessions),
      );
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  async duplicateSession(id: string) {
    const session = this.sessions.find(s => s.id === id);
    if (session) {
      await this.createNewSession(
        `${session.title} - Copy`,
        session.messages,
        session.completionSettings,
      );
    }
  }

  resetActiveSession() {
    runInAction(() => {
      this.newChatPalId = this.activePalId;
      // Do not copy completion settings from session to global settings
      // Instead, preserve global settings as they are
      this.exitEditMode();
      this.activeSessionId = null;
    });
  }

  setActiveSession(sessionId: string) {
    runInAction(() => {
      this.exitEditMode();
      this.activeSessionId = sessionId;
      // Don't modify global settings when changing sessions
      this.newChatPalId = undefined;
    });
  }

  // Update session title by session ID
  updateSessionTitleBySessionId(sessionId: string, newTitle: string): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      runInAction(() => {
        session.title = newTitle;
      });
      this.saveSessionsMetadata();
    }
  }

  updateSessionTitle(session: SessionMetaData) {
    if (session.messages.length > 0) {
      const message = session.messages[session.messages.length - 1];
      if (session.title === NEW_SESSION_TITLE && message.type === 'text') {
        runInAction(() => {
          session.title =
            message.text.length > TITLE_LIMIT
              ? `${message.text.substring(0, TITLE_LIMIT)}...`
              : message.text;
        });
      }
    }
  }

  addMessageToCurrentSession(message: MessageType.Any): void {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        session.messages.unshift(message);
        this.updateSessionTitle(session);
        this.saveSessionsMetadata();
      }
    } else {
      // Always use the global settings for new sessions
      const settings = {...this.newChatCompletionSettings};
      this.createNewSession(NEW_SESSION_TITLE, [message], settings);
    }
  }

  get currentSessionMessages(): MessageType.Any[] {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        if (this.isEditMode && this.editingMessageId) {
          const messageIndex = session.messages.findIndex(
            msg => msg.id === this.editingMessageId,
          );
          if (messageIndex >= 0) {
            return session.messages.slice(messageIndex + 1);
          }
        }
        return session.messages;
      }
    }
    return [];
  }

  async saveSessionsMetadata(): Promise<void> {
    try {
      await RNFS.writeFile(
        `${RNFS.DocumentDirectoryPath}/session-metadata.json`,
        JSON.stringify(this.sessions),
      );
    } catch (error) {
      console.error('Failed to save sessions metadata:', error);
    }
  }

  setNewChatCompletionSettings(settings: CompletionParams) {
    this.newChatCompletionSettings = settings;
    this.saveGlobalSettings();
  }

  resetNewChatCompletionSettings() {
    this.newChatCompletionSettings = {...defaultCompletionSettings};
    this.saveGlobalSettings();
  }

  async createNewSession(
    title: string,
    initialMessages: MessageType.Any[] = [],
    completionSettings: CompletionParams = defaultCompletionSettings,
  ): Promise<void> {
    const id = new Date().toISOString();
    const metaData: SessionMetaData = {
      id,
      title,
      date: id,
      messages: initialMessages,
      completionSettings: {...completionSettings}, // Make a copy of the settings
    };

    if (this.newChatPalId) {
      metaData.activePalId = this.newChatPalId;
      this.newChatPalId = undefined;
    }

    this.updateSessionTitle(metaData);
    this.sessions.push(metaData);
    console.log('this.sessions', this.sessions);
    this.activeSessionId = id;
    await RNFS.writeFile(
      `${RNFS.DocumentDirectoryPath}/session-metadata.json`,
      JSON.stringify(this.sessions),
    );
  }

  updateMessage(id: string, update: Partial<MessageType.Text>): void {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        const index = session.messages.findIndex(msg => msg.id === id);
        if (index >= 0 && session.messages[index].type === 'text') {
          session.messages[index] = {
            ...session.messages[index],
            ...update,
          } as MessageType.Text;
          this.saveSessionsMetadata();
        }
      }
    }
  }

  updateSessionCompletionSettings(settings: CompletionParams) {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        session.completionSettings = settings;
        this.saveSessionsMetadata();
      }
    }
  }

  // Apply current session settings to global settings
  applySessionSettingsToGlobal() {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        this.newChatCompletionSettings = {...session.completionSettings};
        this.saveGlobalSettings();
      }
    }
  }

  // Reset current session settings to match global settings
  resetSessionSettingsToGlobal() {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        session.completionSettings = {...this.newChatCompletionSettings};
        this.saveSessionsMetadata();
      }
    }
  }

  updateMessageToken(
    data: any,
    createdAt: number,
    id: string,
    context: LlamaContext,
  ): void {
    const {token} = data;
    runInAction(() => {
      if (this.activeSessionId) {
        const session = this.sessions.find(s => s.id === this.activeSessionId);
        if (session) {
          const index = session.messages.findIndex(msg => msg.id === id);
          if (index >= 0) {
            session.messages = session.messages.map((msg, i) => {
              if (msg.type === 'text' && i === index) {
                return {
                  ...msg,
                  text: (msg.text + token).replace(/^\s+/, ''),
                };
              }
              return msg;
            });
          } else {
            session.messages.unshift({
              author: assistant,
              createdAt,
              id,
              text: token,
              type: 'text',
              metadata: {contextId: context?.id, copyable: true},
            });
          }
          this.saveSessionsMetadata();
        }
      }
    });
  }

  get groupedSessions(): SessionGroup {
    const groups: SessionGroup = this.sessions.reduce(
      (acc: SessionGroup, session) => {
        const date = new Date(session.date);
        let dateKey: string = format(date, 'MMMM dd, yyyy');
        const today = new Date();
        const daysAgo = Math.ceil(
          (today.getTime() - date.getTime()) / (1000 * 3600 * 24),
        );

        if (isToday(date)) {
          dateKey = this.dateGroupNames.today;
        } else if (isYesterday(date)) {
          dateKey = this.dateGroupNames.yesterday;
        } else if (daysAgo <= 6) {
          dateKey = this.dateGroupNames.thisWeek;
        } else if (daysAgo <= 13) {
          dateKey = this.dateGroupNames.lastWeek;
        } else if (daysAgo <= 20) {
          dateKey = this.dateGroupNames.twoWeeksAgo;
        } else if (daysAgo <= 27) {
          dateKey = this.dateGroupNames.threeWeeksAgo;
        } else if (daysAgo <= 34) {
          dateKey = this.dateGroupNames.fourWeeksAgo;
        } else if (daysAgo <= 60) {
          dateKey = this.dateGroupNames.lastMonth;
        } else {
          dateKey = this.dateGroupNames.older;
        }

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(session);
        return acc;
      },
      {},
    );

    // Define the order of keys using the localized group names
    const orderedKeys = [
      this.dateGroupNames.today,
      this.dateGroupNames.yesterday,
      this.dateGroupNames.thisWeek,
      this.dateGroupNames.lastWeek,
      this.dateGroupNames.twoWeeksAgo,
      this.dateGroupNames.threeWeeksAgo,
      this.dateGroupNames.fourWeeksAgo,
      this.dateGroupNames.lastMonth,
      this.dateGroupNames.older,
    ];

    // Create a new object with keys in the desired order
    const orderedGroups: SessionGroup = {};
    orderedKeys.forEach(key => {
      if (groups[key]) {
        orderedGroups[key] = groups[key].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      }
    });

    // Add any remaining keys that weren't in our predefined list
    Object.keys(groups).forEach(key => {
      if (!orderedGroups[key]) {
        orderedGroups[key] = groups[key].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      }
    });

    return orderedGroups;
  }

  /**
   * Enters edit mode for a specific message
   */
  enterEditMode(messageId: string): void {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        const messageIndex = session.messages.findIndex(
          msg => msg.id === messageId,
        );
        if (messageIndex >= 0) {
          runInAction(() => {
            this.isEditMode = true;
            this.editingMessageId = messageId;
          });
        }
      }
    }
  }

  /**
   * Exits edit mode without making changes
   */
  exitEditMode(): void {
    runInAction(() => {
      this.isEditMode = false;
      this.editingMessageId = null;
    });
  }

  /**
   * Commits the edit by actually removing messages after the edited message
   */
  commitEdit(): void {
    if (this.activeSessionId && this.editingMessageId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        const messageIndex = session.messages.findIndex(
          msg => msg.id === this.editingMessageId,
        );
        if (messageIndex >= 0) {
          runInAction(() => {
            session.messages = session.messages.slice(messageIndex + 1);
            this.isEditMode = false;
            this.editingMessageId = null;
            this.saveSessionsMetadata();
          });
        }
      }
    }
  }

  /**
   * Removes messages from the current active session starting from a specific message ID.
   * If includeMessage is true, the message with the given ID is also removed.
   *
   * @param messageId - The ID of the message to start removal from.
   * @param includeMessage - Whether to include the message with the given ID in the removal.
   */
  removeMessagesFromId(
    messageId: string,
    includeMessage: boolean = true,
  ): void {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        const messageIndex = session.messages.findIndex(
          msg => msg.id === messageId,
        );
        if (messageIndex >= 0) {
          runInAction(() => {
            session.messages = session.messages.slice(
              includeMessage ? messageIndex + 1 : messageIndex,
            );
            this.saveSessionsMetadata();
          });
        }
      }
    }
  }

  get activePalId(): string | undefined {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      return session?.activePalId;
    }
    return this.newChatPalId;
  }

  setActivePal(palId: string | undefined): void {
    if (this.activeSessionId) {
      const session = this.sessions.find(s => s.id === this.activeSessionId);
      if (session) {
        runInAction(() => {
          session.activePalId = palId;
          this.saveSessionsMetadata();
        });
      }
    } else {
      this.newChatPalId = palId;
    }
  }
}

export const chatSessionStore = new ChatSessionStore();
