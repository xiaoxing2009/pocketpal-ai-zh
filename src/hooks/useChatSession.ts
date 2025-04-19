import React, {useRef, useCallback} from 'react';

import {toJS} from 'mobx';
import throttle from 'lodash.throttle';

import {randId} from '../utils';
import {L10nContext} from '../utils';
import {chatSessionStore, modelStore, palStore} from '../store';

import {MessageType, User} from '../utils/types';
import {applyChatTemplate, convertToChatMessages} from '../utils/chat';
import {activateKeepAwake, deactivateKeepAwake} from '../utils/keepAwake';
import {CompletionParams} from '@pocketpalai/llama.rn';

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
      addSystemMessage(l10n.chat.modelNotLoaded);
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

    // Keep screen awake during completion
    try {
      activateKeepAwake();
    } catch (error) {
      console.error('Failed to activate keep awake during chat:', error);
      // Continue with chat even if keep awake fails
    }

    const id = randId();
    const createdAt = Date.now();
    currentMessageInfo.current = {createdAt, id};

    const activeSession = chatSessionStore.sessions.find(
      s => s.id === chatSessionStore.activeSessionId,
    );
    let systemPrompt = '';
    if (activeSession?.activePalId) {
      const pal = palStore.pals.find(p => p.id === activeSession.activePalId);
      if (pal?.systemPrompt) {
        systemPrompt = pal.systemPrompt;
      }
    }

    const getSystemMessage = () => {
      // If no system prompt is available at all, return empty array
      if (
        !systemPrompt &&
        !modelStore.activeModel?.chatTemplate?.systemPrompt?.trim()
      ) {
        return [];
      }

      // Prefer custom system prompt, fall back to template's system prompt
      const finalSystemPrompt =
        systemPrompt ||
        modelStore.activeModel?.chatTemplate?.systemPrompt ||
        '';

      if (finalSystemPrompt?.trim() === '') {
        return [];
      }
      return [
        {
          role: 'system' as 'system',
          content: finalSystemPrompt,
        },
      ];
    };

    const chatMessages = [
      ...getSystemMessage(),
      ...convertToChatMessages([
        textMessage,
        ...chatSessionStore.currentSessionMessages.filter(
          msg => msg.id !== textMessage.id,
        ),
      ]),
    ];

    let prompt = await applyChatTemplate(
      chatMessages,
      modelStore.activeModel ?? null,
      context,
    );

    const sessionCompletionSettings = toJS(activeSession?.completionSettings);
    const stopWords = toJS(modelStore.activeModel?.stopWords);
    const completionParams = {
      ...sessionCompletionSettings,
      prompt,
      stop: stopWords,
    };
    try {
      const result = await context.completion(
        completionParams as CompletionParams,
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
        addSystemMessage(l10n.common.networkError);
      } else {
        addSystemMessage(`${l10n.chat.completionFailed}${errorMessage}`);
      }
    } finally {
      // Always try to deactivate keep awake in finally block
      try {
        deactivateKeepAwake();
      } catch (error) {
        console.error('Failed to deactivate keep awake after chat:', error);
      }
    }
  };

  const handleResetConversation = () => {
    conversationIdRef.current = randId();
    addSystemMessage(l10n.chat.conversationReset);
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
    // Deactivate keep awake when stopping completion
    try {
      deactivateKeepAwake();
    } catch (error) {
      console.error(
        'Failed to deactivate keep awake after stopping chat:',
        error,
      );
    }
  };

  return {
    handleSendPress,
    handleResetConversation,
    handleStopPress,
  };
};
