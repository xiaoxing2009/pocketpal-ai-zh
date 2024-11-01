import {applyTemplate, Templates} from 'chat-formatter';
import {ChatMessage, ChatTemplateConfig, MessageType} from './types';
//import {assistant} from '../store/ChatSessionStore';
import {CompletionParams} from '@pocketpalai/llama.rn';

export const userId = 'y9d7f8pgn';
export const assistantId = 'h3o3lc5xj';
export const user = {id: userId};
export const assistant = {id: assistantId};

export function convertToChatMessages(
  messages: MessageType.Any[],
): ChatMessage[] {
  return messages
    .filter(message => message.type === 'text' && message.text !== undefined)
    .map(message => {
      return {
        content: (message as MessageType.Text).text!,
        role: message.author.id === assistant.id ? 'assistant' : 'user',
      } as ChatMessage;
    })
    .reverse();
}

export function applyChatTemplate(
  template: ChatTemplateConfig,
  chat: ChatMessage[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  length: number, //TODO: inforce length of formattedChat to fit the context.
): string {
  const formattedChat: string = applyTemplate(chat, {
    customTemplate: template,
    addGenerationPrompt: template.addGenerationPrompt,
  }) as string;

  return formattedChat;
}

export const chatTemplates = {
  danube3: {
    ...Templates.templates.danube2,
    name: 'danube3',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful assistant named H2O Danube3. You are precise, concise, and casual.',
  },
  danube2: {
    ...Templates.templates.danube2,
    name: 'danube2',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful assistant named H2O Danube2. You are precise, concise, and casual.',
  },
  phi3: {
    ...Templates.templates.phi3,
    name: 'phi3',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful conversational chat assistant. You are precise, concise, and casual.',
  },
  gemmaIt: {
    ...Templates.templates.gemmaIt,
    name: 'gemmaIt',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful conversational chat assistant. You are precise, concise, and casual.',
  },
  chatML: {
    ...Templates.templates.chatML,
    name: 'chatML',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful conversational chat assistant. You are precise, concise, and casual.',
  },
  default: {
    ...Templates.templates.default,
    name: 'default',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful conversational chat assistant. You are precise, concise, and casual.',
  },
  llama3: {
    ...Templates.templates.llama3,
    name: 'llama3',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful conversational chat assistant. You are precise, concise, and casual.',
  },
  llama32: {
    ...Templates.templates.llama32,
    name: 'llama32',
    addGenerationPrompt: true,
    systemPrompt: '',
  },
  gemmasutra: {
    ...Templates.templates.gemmasutra,
    name: 'gemmasutra',
    addGenerationPrompt: true,
    systemPrompt:
      'You are a helpful conversational chat assistant. You are precise, concise, and casual.',
  },
  qwen2: {
    ...Templates.templates.qwen2,
    name: 'qwen2',
    addGenerationPrompt: true,
    systemPrompt: 'You are a helpful assistant.',
  },
  qwen25: {
    ...Templates.templates.qwen25,
    name: 'qwen25',
    addGenerationPrompt: true,
    systemPrompt:
      'You are Qwen, created by Alibaba Cloud. You are a helpful assistant.',
  },
};

export const defaultCompletionParams: CompletionParams = {
  prompt: '',
  n_predict: 400, // The maximum number of tokens to predict when generating text.
  temperature: 0.7, // The randomness of the generated text.
  top_k: 40, // Limit the next token selection to the K most probable tokens.
  top_p: 0.95, // Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
  tfs_z: 1.0, //Enable tail free sampling with parameter z. Default: `1.0`, which is disabled.
  min_p: 0.05, //The minimum probability for a token to be considered, relative to the probability of the most likely token.
  xtc_threshold: 0.1, // Sets a minimum probability threshold for tokens to be removed.
  xtc_probability: 0.0, // Sets the chance for token removal (checked once on sampler start)
  typical_p: 1.0, // Enable locally typical sampling with parameter p. Default: `1.0`, which is disabled.
  penalty_last_n: 64, // Last n tokens to consider for penalizing repetition. Default: `64`, where `0` is disabled and `-1` is ctx-size.
  penalty_repeat: 1.0, // Control the repetition of token sequences in the generated text.
  penalty_freq: 0.0, // Repeat alpha frequency penalty. Default: `0.0`, which is disabled.
  penalty_present: 0.0, // Repeat alpha presence penalty. Default: `0.0`, which is disabled.
  mirostat: 0, //Enable Mirostat sampling, controlling perplexity during text generation. Default: `0`, where `0` is disabled, `1` is Mirostat, and `2` is Mirostat 2.0.
  mirostat_tau: 5, // Set the Mirostat target entropy, parameter tau. Default: `5.0`
  mirostat_eta: 0.1, // Set the Mirostat learning rate, parameter eta.  Default: `0.1`
  penalize_nl: false, //Penalize newline tokens when applying the repeat penalty.
  seed: 0,
  n_probs: 0, // If greater than 0, the response also contains the probabilities of top N tokens for each generated token given the sampling settings.
  stop: ['</s>'],
  // emit_partial_completion: true, // This is not used in the current version of llama.rn
};
