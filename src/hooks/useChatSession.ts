import React, {useRef, useCallback} from 'react';
import {toJS} from 'mobx';
import throttle from 'lodash.throttle';

import {randId} from '../utils';
import {L10nContext} from '../utils';
import {chatSessionStore, modelStore} from '../store';

import {MessageType, User} from '../utils/types';
import {applyChatTemplate, convertToChatMessages} from '../utils/chat';

export const useChatSession = (
  currentMessageInfo: React.MutableRefObject<{
    createdAt: number;
    id: string;
  } | null>,
  user: User,
  assistant: User,
) => {
  const l10n = React.useContext(L10nContext);
  const conversationIdRef = useRef<string>(randId());

  // We needed this to avoid excessive ui updates. Unsure if this is the best way to do it.
  const tokenBufferRef = useRef<string>(''); // Token buffer to accumulate tokens
  const updateInterval = 150; // Interval for flushing token buffer (in ms)

  // Function to flush the token buffer and update the chat message
  const flushTokenBuffer = useCallback((createdAt: number, id: string) => {
    const context = modelStore.context;
    if (tokenBufferRef.current.length > 0 && context) {
      chatSessionStore.updateMessageToken(
        {token: tokenBufferRef.current},
        createdAt,
        id,
        context,
      );
      tokenBufferRef.current = ''; // Reset the token buffer
    }
  }, []);

  // Throttled version of flushTokenBuffer to prevent excessive updates
  const throttledFlushTokenBuffer = throttle(
    (createdAt: number, id: string) => {
      flushTokenBuffer(createdAt, id);
    },
    updateInterval,
  );

  const addMessage = (message: MessageType.Any) => {
    chatSessionStore.addMessageToCurrentSession(message);
  };

  const addSystemMessage = (text: string, metadata = {}) => {
    const textMessage: MessageType.Text = {
      author: assistant,
      createdAt: Date.now(),
      id: randId(),
      text,
      type: 'text',
      metadata: {system: true, ...metadata},
    };
    addMessage(textMessage);
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    const context = modelStore.context;
    if (!context) {
      addSystemMessage(l10n.modelNotLoaded);
      return;
    }

    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: randId(),
      text: message.text,
      type: 'text',
      metadata: {
        contextId: context.id,
        conversationId: conversationIdRef.current,
        copyable: true,
      },
    };
    addMessage(textMessage);
    modelStore.setInferencing(true);
    modelStore.setIsStreaming(false);
    chatSessionStore.setIsGenerating(true);

    const id = randId();
    const createdAt = Date.now();
    currentMessageInfo.current = {createdAt, id};

    const chatMessages = [
      ...(modelStore.activeModel?.chatTemplate?.systemPrompt?.trim()
        ? [
            {
              role: 'system' as 'system',
              content: modelStore.activeModel.chatTemplate.systemPrompt,
            },
          ]
        : []),
      ...convertToChatMessages([
        textMessage,
        ...chatSessionStore.currentSessionMessages.filter(
          msg => msg.id !== textMessage.id,
        ),
      ]),
    ];

    const prompt = await applyChatTemplate(
      chatMessages,
      modelStore.activeModel ?? null,
      context,
    );

    const completionParams = toJS(modelStore.activeModel?.completionSettings);

    try {
      const result = await context.completion(
        {...completionParams, prompt},
        data => {
          if (data.token && currentMessageInfo.current) {
            if (!modelStore.isStreaming) {
              modelStore.setIsStreaming(true);
            }
            tokenBufferRef.current += data.token;
            throttledFlushTokenBuffer(
              currentMessageInfo.current.createdAt,
              currentMessageInfo.current.id,
            );
          }
        },
      );

      // Flush any remaining tokens after completion
      if (
        currentMessageInfo.current?.createdAt &&
        currentMessageInfo.current?.id
      ) {
        flushTokenBuffer(
          currentMessageInfo.current.createdAt,
          currentMessageInfo.current.id,
        );
      }

      chatSessionStore.updateMessage(id, {
        metadata: {timings: result.timings, copyable: true},
      });
      modelStore.setInferencing(false);
      modelStore.setIsStreaming(false);
      chatSessionStore.setIsGenerating(false);
    } catch (error) {
      modelStore.setInferencing(false);
      modelStore.setIsStreaming(false);
      chatSessionStore.setIsGenerating(false);
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('network')) {
        // TODO: This can be removed. We don't use network for chat.
        addSystemMessage(l10n.networkError);
      } else {
        addSystemMessage(`Completion failed: ${errorMessage}`);
      }
    }
  };

  const handleResetConversation = () => {
    conversationIdRef.current = randId();
    addSystemMessage(l10n.conversationReset);
  };

  const handleStopPress = () => {
    const context = modelStore.context;
    if (modelStore.inferencing && context) {
      context.stopCompletion();
    }
    if (
      currentMessageInfo.current?.createdAt &&
      currentMessageInfo.current?.id
    ) {
      flushTokenBuffer(
        currentMessageInfo.current.createdAt,
        currentMessageInfo.current.id,
      );
    }
    modelStore.setInferencing(false);
    modelStore.setIsStreaming(false);
  };

  return {
    handleSendPress,
    handleResetConversation,
    handleStopPress,
  };
};
