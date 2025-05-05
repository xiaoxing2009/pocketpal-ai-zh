import {Database} from '@nozbe/watermelondb';
import {Q} from '@nozbe/watermelondb/QueryDescription';

// Mock models
class ChatSession {
  static table = 'chat_sessions';
  static associations = {
    messages: {type: 'has_many', foreignKey: 'session_id'},
    completion_settings: {type: 'has_many', foreignKey: 'session_id'},
  };
}

class Message {
  static table = 'messages';
  static associations = {
    chat_sessions: {type: 'belongs_to', key: 'session_id'},
  };
}

class CompletionSetting {
  static table = 'completion_settings';
  static associations = {
    chat_sessions: {type: 'belongs_to', key: 'session_id'},
  };
}

class GlobalSetting {
  static table = 'global_settings';
}

// Mock schema
const schema = {
  version: 1,
  tables: [
    {
      name: 'chat_sessions',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'date', type: 'string'},
        {name: 'active_pal_id', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    },
    {
      name: 'messages',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'author', type: 'string'},
        {name: 'text', type: 'string', isOptional: true},
        {name: 'type', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'metadata', type: 'string'},
        {name: 'position', type: 'number'},
      ],
    },
    {
      name: 'completion_settings',
      columns: [
        {name: 'session_id', type: 'string', isIndexed: true},
        {name: 'settings', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    },
    {
      name: 'global_settings',
      columns: [
        {name: 'key', type: 'string', isIndexed: true},
        {name: 'value', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    },
  ],
};

// Mock migrations
const migrations = {
  migrations: [],
};

// Mock adapter
const adapter = {
  schema,
  migrations,
  dbName: 'pocketpalai_test',
  jsi: false,
};

// Mock database
export const database = new Database({
  adapter,
  modelClasses: [ChatSession, Message, CompletionSetting, GlobalSetting],
});

// Export models
export {ChatSession, Message, CompletionSetting, GlobalSetting, Q};
