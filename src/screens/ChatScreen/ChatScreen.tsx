import React, {useRef, ReactNode} from 'react';

import {observer} from 'mobx-react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Bubble, ChatView} from '../../components';

import {useChatSession} from '../../hooks';

import {ModelNotLoadedMessage} from './ModelNotLoadedMessage';

import {modelStore, chatSessionStore} from '../../store';

import {L10nContext} from '../../utils';
import {MessageType} from '../../utils/types';
import {user, assistant} from '../../utils/chat';

const renderBubble = ({
  child,
  message,
  nextMessageInGroup,
  scale,
}: {
  child: ReactNode;
  message: MessageType.Any;
  nextMessageInGroup: boolean;
  scale?: any;
}) => (
  <Bubble
    child={child}
    message={message}
    nextMessageInGroup={nextMessageInGroup}
    scale={scale}
  />
);

export const ChatScreen: React.FC = observer(() => {
  const currentMessageInfo = useRef<{createdAt: number; id: string} | null>(
    null,
  );
  const l10n = React.useContext(L10nContext);

  const {handleSendPress, handleStopPress} = useChatSession(
    currentMessageInfo,
    user,
    assistant,
  );

  // Show loading bubble only during the thinking phase (inferencing but not streaming)
  const isThinking = modelStore.inferencing && !modelStore.isStreaming;

  return (
    <SafeAreaProvider>
      <ChatView
        customBottomComponent={
          !modelStore.context && !modelStore.isContextLoading
            ? () => <ModelNotLoadedMessage />
            : undefined
        }
        renderBubble={renderBubble}
        messages={chatSessionStore.currentSessionMessages}
        onSendPress={handleSendPress}
        onStopPress={handleStopPress}
        user={user}
        isStopVisible={modelStore.inferencing}
        isThinking={isThinking}
        isStreaming={modelStore.isStreaming}
        sendButtonVisibilityMode="editing"
        textInputProps={{
          editable: !!modelStore.context,
          placeholder: !modelStore.context
            ? modelStore.isContextLoading
              ? l10n.loadingModel
              : l10n.modelNotLoaded
            : l10n.typeYourMessage,
        }}
      />
    </SafeAreaProvider>
  );
});
