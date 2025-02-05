import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react';
import {Text} from 'react-native-paper';

import {styles} from './styles';
import {chatSessionStore, modelStore} from '../../store';

export const ChatHeaderTitle: React.FC = observer(() => {
  const activeSessionId = chatSessionStore.activeSessionId;
  const activeSession = chatSessionStore.sessions.find(
    session => session.id === activeSessionId,
  );
  const activeModel = modelStore.activeModel;

  return (
    <View style={styles.container}>
      <Text numberOfLines={1} variant="titleSmall">
        {activeSession?.title || 'Chat'}
      </Text>
      {activeModel?.name && (
        <Text numberOfLines={1} variant="bodySmall">
          {activeModel?.name}
        </Text>
      )}
    </View>
  );
});
