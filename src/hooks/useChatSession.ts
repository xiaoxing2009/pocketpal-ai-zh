import React, {useRef, useCallback} from 'react';

import {toJS} from 'mobx';
import throttle from 'lodash.throttle';

import {chatSessionRepository} from '../repositories/ChatSessionRepository';

import {randId} from '../utils';
import {L10nContext} from '../utils';
import {chatSessionStore, modelStore, palStore} from '../store';

import {MessageType, User} from '../utils/types';
import {activateKeepAwake, deactivateKeepAwake} from '../utils/keepAwake';
import {
  CompletionParams,
  toApiCompletionParams,
} from '../utils/completionTypes';
import {
  applyChatTemplate,
  convertToChatMessages,
  removeThinkingParts,
} from '../utils/chat';

export const useChatSession = (
  currentMessageInfo: React.MutableRefObject<{
    createdAt: number;
    id: string;
    sessionId: string;
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
  const flushTokenBuffer = useCallback(
    async (createdAt: number, id: string, sessionId: string) => {
      const context = modelStore.context;
      if (tokenBufferRef.current.length > 0 && context) {
        try {
          await chatSessionStore.updateMessageToken(
            {token: tokenBufferRef.current},
            createdAt,
            id,
            sessionId,
            context,
          );
          tokenBufferRef.current = ''; // Reset the token buffer
        } catch (error) {
          console.error('Error updating message token:', error);
          // Still reset the buffer to avoid getting stuck
          tokenBufferRef.current = '';
        }
      }
    },
    [],
  );

  // Throttled version of flushTokenBuffer to prevent excessive updates
  const throttledFlushTokenBuffer = throttle(
    (createdAt: number, id: string, sessionId: string) => {
      // We don't await this call because throttle doesn't support async functions
      // The function will still execute asynchronously
      flushTokenBuffer(createdAt, id, sessionId).catch(error => {
        console.error('Error in throttled flush token buffer:', error);
      });
    },
    updateInterval,
  );

  const addMessage = async (message: MessageType.Any) => {
    await chatSessionStore.addMessageToCurrentSession(message);
  };

  const addSystemMessage = async (text: string, metadata = {}) => {
    const textMessage: MessageType.Text = {
      author: assistant,
      createdAt: Date.now(),
      id: randId(),
      text,
      type: 'text',
      metadata: {system: true, ...metadata},
    };
    await addMessage(textMessage);
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    const context = modelStore.context;
    if (!context) {
      await addSystemMessage(l10n.chat.modelNotLoaded);
      return;
    }

    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: '', // Will be set by the database
      text: message.text,
      type: 'text',
      metadata: {
        contextId: context.id,
        conversationId: conversationIdRef.current,
        copyable: true,
      },
    };
    await addMessage(textMessage);
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

    // Get the completion settings from the session
    const sessionCompletionSettings = toJS(activeSession?.completionSettings);

    // If the user has disabled including thinking parts in the context, remove them
    // Default to true if not specified
    const includeThinkingInContext =
      (sessionCompletionSettings as CompletionParams)
        ?.include_thinking_in_context !== false;
    if (!includeThinkingInContext) {
      prompt =
        typeof prompt === 'string' ? removeThinkingParts(prompt) : prompt;
    }

    const stopWords = toJS(modelStore.activeModel?.stopWords);

    // Create completion params with app-specific properties
    const completionParamsWithAppProps = {
      ...sessionCompletionSettings,
      prompt,
      stop: stopWords,
    } as CompletionParams;

    // Strip app-specific properties before passing to llama.rn
    const cleanCompletionParams = toApiCompletionParams(
      completionParamsWithAppProps,
    );

    const createdAt = Date.now();
    const newMessage = await chatSessionRepository.addMessageToSession(
      chatSessionStore.activeSessionId!,
      {
        author: assistant,
        createdAt: createdAt,
        id: '',
        text: '',
        type: 'text',
        metadata: {
          contextId: context.id,
          conversationId: conversationIdRef.current,
          copyable: true,
        },
      },
    );
    currentMessageInfo.current = {
      createdAt,
      id: newMessage.id,
      sessionId: chatSessionStore.activeSessionId!,
    };

    try {
      const result = await context.completion(cleanCompletionParams, data => {
        if (data.token && currentMessageInfo.current) {
          if (!modelStore.isStreaming) {
            modelStore.setIsStreaming(true);
          }
          tokenBufferRef.current += data.token;
          throttledFlushTokenBuffer(
            currentMessageInfo.current.createdAt,
            currentMessageInfo.current.id,
            currentMessageInfo.current.sessionId,
          );
        }
      });

      // Flush any remaining tokens after completion
      if (
        currentMessageInfo.current?.createdAt &&
        currentMessageInfo.current?.id
      ) {
        try {
          await flushTokenBuffer(
            currentMessageInfo.current.createdAt,
            currentMessageInfo.current.id,
            currentMessageInfo.current.sessionId,
          );
        } catch (error) {
          console.error('Error flushing token buffer after completion:', error);
        }
      }

      // Update only the metadata in the database
      // The text is already being updated with each token
      await chatSessionStore.updateMessage(
        currentMessageInfo.current.id,
        currentMessageInfo.current.sessionId,
        {
          metadata: {timings: result.timings, copyable: true},
        },
      );
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
        await addSystemMessage(l10n.common.networkError);
      } else {
        await addSystemMessage(`${l10n.chat.completionFailed}${errorMessage}`);
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

  const handleResetConversation = async () => {
    conversationIdRef.current = randId();
    await addSystemMessage(l10n.chat.conversationReset);
  };

  const handleStopPress = async () => {
    const context = modelStore.context;
    if (modelStore.inferencing && context) {
      context.stopCompletion();
    }
    if (
      currentMessageInfo.current?.createdAt &&
      currentMessageInfo.current?.id
    ) {
      try {
        // Flush any remaining tokens
        await flushTokenBuffer(
          currentMessageInfo.current.createdAt,
          currentMessageInfo.current.id,
          currentMessageInfo.current.sessionId,
        );
      } catch (error) {
        console.error('Error when stopping completion:', error);
      }
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
