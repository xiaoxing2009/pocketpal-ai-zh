/**
 * Tests for thinking capability detection utilities
 */

import {
  supportsThinking,
  templateSupportsThinking,
} from '../thinkingCapabilityDetection';
import {Model} from '../types';

// Mock model for testing
const createMockModel = (name: string, chatTemplate?: string): Model => ({
  id: `test-${name}`,
  name,
  size: 1000000,
  isDownloaded: true,
  origin: 'HF' as any,
  chatTemplate: chatTemplate
    ? {
        chatTemplate,
        addGenerationPrompt: true,
        name: 'test',
        bosToken: '<s>',
        eosToken: '</s>',
      }
    : {
        chatTemplate: '',
        addGenerationPrompt: true,
        name: 'test',
        bosToken: '<s>',
        eosToken: '</s>',
      },
  // Add other required Model properties with default values
  hfModel: {} as any,
  modelType: 'LLM' as any,
  stopWords: [],
  defaultStopWords: [],
  defaultChatTemplate: {
    chatTemplate: '',
    addGenerationPrompt: true,
    name: 'test',
    bosToken: '<s>',
    eosToken: '</s>',
  },
  isLocal: false,
  downloadSpeed: '0 MB/s',
  // Add minimal required properties
  author: 'test',
  params: 1000000,
  downloadUrl: 'test://url',
  hfUrl: 'test://hf',
  progress: 0,
  filename: 'test.gguf',
  defaultCompletionSettings: {} as any,
  completionSettings: {} as any,
});

describe('templateSupportsThinking', () => {
  it('should return false for empty or null template', () => {
    expect(templateSupportsThinking('')).toBe(false);
    expect(templateSupportsThinking(null as any)).toBe(false);
    expect(templateSupportsThinking(undefined as any)).toBe(false);
  });

  it('should detect thinking tokens in templates', () => {
    expect(templateSupportsThinking('Some template with <think> token')).toBe(
      true,
    );
    expect(templateSupportsThinking('Template with </think> closing tag')).toBe(
      true,
    );
    expect(templateSupportsThinking('Has assistant_thoughts capability')).toBe(
      true,
    );
    expect(templateSupportsThinking('Supports reasoning_format')).toBe(true);
    expect(templateSupportsThinking('Uses <|start_thinking|> format')).toBe(
      true,
    );
    expect(templateSupportsThinking('Uses <|end_thinking|> format')).toBe(true);
  });

  it('should detect DeepSeek-R1 patterns', () => {
    expect(
      templateSupportsThinking('deepseek model with <think> support'),
    ).toBe(true);
    expect(templateSupportsThinking('DeepSeek-R1 thinking capabilities')).toBe(
      true,
    );
    expect(templateSupportsThinking('DEEPSEEK with thinking mode')).toBe(true);
  });

  it('should detect Cohere Command-R patterns', () => {
    expect(templateSupportsThinking('cohere model with thinking support')).toBe(
      true,
    );
    expect(
      templateSupportsThinking('Cohere Command-R reasoning capabilities'),
    ).toBe(true);
    expect(templateSupportsThinking('COHERE with reasoning mode')).toBe(true);
  });

  it('should detect Qwen-3 patterns', () => {
    expect(templateSupportsThinking('qwen model with thinking support')).toBe(
      true,
    );
    expect(templateSupportsThinking('Qwen-3 thinking capabilities')).toBe(true);
  });

  it('should return false for templates without thinking support', () => {
    expect(templateSupportsThinking('Regular chat template')).toBe(false);
    expect(templateSupportsThinking('Standard model template')).toBe(false);
    expect(templateSupportsThinking('No special capabilities')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(templateSupportsThinking('TEMPLATE WITH <THINK> TOKEN')).toBe(true);
    expect(templateSupportsThinking('template with ASSISTANT_THOUGHTS')).toBe(
      true,
    );
    expect(templateSupportsThinking('DEEPSEEK WITH THINKING')).toBe(true);
  });
});

describe('supportsThinking', () => {
  it('should detect thinking support based on model architecture', async () => {
    const mockModel = createMockModel('Test-Model');
    mockModel.hfModel = {
      specs: {
        gguf: {
          architecture: 'qwen3',
        },
      },
    } as any;

    expect(await supportsThinking(mockModel)).toBe(true);
  });

  it('should detect thinking support based on chat template', async () => {
    const modelWithThinkingTemplate = createMockModel(
      'Regular-Model',
      'Template with <think> support',
    );
    expect(await supportsThinking(modelWithThinkingTemplate)).toBe(true);

    const modelWithoutThinkingTemplate = createMockModel(
      'Regular-Model',
      'Standard template',
    );
    expect(await supportsThinking(modelWithoutThinkingTemplate)).toBe(false);
  });

  it('should return false for models without thinking support', async () => {
    const regularModel = createMockModel('Llama-3.1-8B-Instruct');
    expect(await supportsThinking(regularModel)).toBe(false);

    const gemmaModel = createMockModel('Gemma-2-9B-IT');
    expect(await supportsThinking(gemmaModel)).toBe(false);
  });

  it('should handle models without chat templates', async () => {
    const modelWithoutTemplate = createMockModel('SmolLM3-1.7B');
    modelWithoutTemplate.hfModel = {
      specs: {
        gguf: {
          architecture: 'qwen3',
        },
      },
    } as any;
    expect(await supportsThinking(modelWithoutTemplate)).toBe(true);

    const regularModelWithoutTemplate = createMockModel('Llama-3.1-8B');
    expect(await supportsThinking(regularModelWithoutTemplate)).toBe(false);
  });
});
