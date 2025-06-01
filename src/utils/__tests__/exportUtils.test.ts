import Share from 'react-native-share';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {Alert, Platform} from 'react-native';
import {
  exportLegacyChatSessions,
  exportChatSession,
  exportAllChatSessions,
} from '../exportUtils';

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock react-native-share
jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue({success: true}),
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('{"legacy":"data"}'),
  exists: jest.fn().mockResolvedValue(true),
  copyFile: jest.fn().mockResolvedValue(undefined),
  DocumentDirectoryPath: '/mock/document/path',
  CachesDirectoryPath: '/mock/cache/path',
  DownloadDirectoryPath: '/mock/download/path',
}));

jest.mock('date-fns', () => ({
  format: jest.fn().mockReturnValue('2024-01-01_12-00-00'),
}));

// Import the actual repository to spy on it
import {chatSessionRepository} from '../../repositories/ChatSessionRepository';

jest.mock('../androidPermission', () => ({
  ensureLegacyStoragePermission: jest.fn().mockResolvedValue(true),
}));

describe('exportUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Don't restore all mocks here as it interferes with console.error mocking in error handling tests
  });

  describe('exportLegacyChatSessions', () => {
    it('should export legacy sessions if file exists', async () => {
      // Setup
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);

      // Execute
      await exportLegacyChatSessions();

      // Verify
      expect(RNFS.exists).toHaveBeenCalled();
      expect(RNFS.readFile).toHaveBeenCalled();
      expect(RNFS.writeFile).toHaveBeenCalled();
      expect(Share.open).toHaveBeenCalled();
    });

    it('should throw error if legacy file does not exist', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(false);

      await expect(exportLegacyChatSessions()).rejects.toThrow(
        'Legacy chat sessions file not found',
      );
    });

    it('should handle file read errors', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValueOnce(true);
      (RNFS.readFile as jest.Mock).mockRejectedValueOnce(
        new Error('File read failed'),
      );

      await expect(exportLegacyChatSessions()).rejects.toThrow(
        'File read failed',
      );
    });
  });

  describe('exportChatSession', () => {
    const mockSessionData = {
      session: {
        id: 'session-1',
        title: 'Test Session',
        date: '2024-01-01T00:00:00Z',
        activePalId: 'pal-1',
      },
      messages: [
        {
          id: 'msg-1',
          author: 'user',
          text: 'Hello',
          type: 'text',
          metadata: '{"test": true}',
          createdAt: 1704067200000,
        },
      ],
      completionSettings: {
        settings: '{"temperature": 0.7}',
      },
    };

    beforeEach(() => {
      jest
        .spyOn(chatSessionRepository, 'getSessionById')
        .mockResolvedValue(mockSessionData as any);
    });

    it('should export single chat session successfully', async () => {
      await exportChatSession('session-1');

      expect(chatSessionRepository.getSessionById).toHaveBeenCalledWith(
        'session-1',
      );
      expect(RNFS.writeFile).toHaveBeenCalled();
      expect(Share.open).toHaveBeenCalled();
    });

    it('should throw error if session not found', async () => {
      jest
        .spyOn(chatSessionRepository, 'getSessionById')
        .mockResolvedValue(null);

      await expect(exportChatSession('nonexistent')).rejects.toThrow(
        'Session not found',
      );
    });

    it('should handle export errors', async () => {
      (RNFS.writeFile as jest.Mock).mockRejectedValueOnce(
        new Error('Write failed'),
      );

      await expect(exportChatSession('session-1')).rejects.toThrow(
        'Write failed',
      );
    });
  });

  describe('exportAllChatSessions', () => {
    const mockSessions = [
      {id: 'session-1', title: 'Session 1', date: '2024-01-01T00:00:00Z'},
      {id: 'session-2', title: 'Session 2', date: '2024-01-02T00:00:00Z'},
    ];

    const mockSessionData = {
      session: mockSessions[0],
      messages: [],
      completionSettings: null,
    };

    beforeEach(() => {
      jest
        .spyOn(chatSessionRepository, 'getAllSessions')
        .mockResolvedValue(mockSessions as any);
      jest
        .spyOn(chatSessionRepository, 'getSessionById')
        .mockResolvedValue(mockSessionData as any);
    });

    it('should export all chat sessions successfully', async () => {
      await exportAllChatSessions();

      expect(chatSessionRepository.getAllSessions).toHaveBeenCalled();
      expect(chatSessionRepository.getSessionById).toHaveBeenCalledTimes(2);
      expect(RNFS.writeFile).toHaveBeenCalled();
      expect(Share.open).toHaveBeenCalled();
    });

    it('should handle empty sessions list', async () => {
      jest.spyOn(chatSessionRepository, 'getAllSessions').mockResolvedValue([]);

      await exportAllChatSessions();

      expect(RNFS.writeFile).toHaveBeenCalled();
      expect(Share.open).toHaveBeenCalled();
    });
  });

  describe('Platform-specific behavior', () => {
    it('should handle iOS file sharing', async () => {
      // iOS is already mocked as default
      await exportChatSession('session-1');

      expect(Share.open).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining('file://'),
          type: 'application/json',
        }),
      );
    });

    it('should handle Android file sharing with permissions', async () => {
      // Mock Android
      (Platform as any).OS = 'android';
      const {ensureLegacyStoragePermission} = require('../androidPermission');
      (ensureLegacyStoragePermission as jest.Mock).mockResolvedValue(true);

      await exportChatSession('session-1');

      expect(ensureLegacyStoragePermission).toHaveBeenCalled();
      expect(RNFS.copyFile).toHaveBeenCalled();
    });

    it('should handle Android permission denial gracefully', async () => {
      (Platform as any).OS = 'android';
      const {ensureLegacyStoragePermission} = require('../androidPermission');
      (ensureLegacyStoragePermission as jest.Mock).mockResolvedValue(false);

      await exportChatSession('session-1');

      // Should fall back to direct sharing
      expect(Share.open).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('should handle share errors gracefully', async () => {
      (Share.open as jest.Mock).mockRejectedValue(new Error('Share failed'));

      await expect(exportChatSession('session-1')).rejects.toThrow();
      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('Export Error'),
        expect.stringContaining('export'),
        expect.any(Array),
      );
    });

    it('should handle file write errors', async () => {
      (RNFS.writeFile as jest.Mock).mockRejectedValue(new Error('Disk full'));

      await expect(exportChatSession('session-1')).rejects.toThrow('Disk full');
      expect(console.error).toHaveBeenCalledWith(
        'Error sharing JSON data:',
        expect.any(Error),
      );
    });

    it('should handle copy file errors on Android', async () => {
      (Platform as any).OS = 'android';
      (RNFS.copyFile as jest.Mock).mockRejectedValue(new Error('Copy failed'));

      await expect(exportChatSession('session-1')).rejects.toThrow();
    });
  });
});
