import React from 'react';
import {View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {observer} from 'mobx-react-lite';
import {Controller, useFormContext} from 'react-hook-form';

import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {FormField} from './FormField';
import {SectionDivider} from './SectionDivider';
import {PalType, RoleplayFormData, type PalFormData} from './types';
import {Checkbox} from '../Checkbox';
import {ModelSelector} from './ModelSelector';
import {useStructuredOutput} from '../../hooks/useStructuredOutput';
import {modelStore} from '../../store';
import {getPromptForModelGeneration} from './utils';
import {ModelNotAvailable} from './ModelNotAvailable';

interface SystemPromptSectionProps {
  hideGeneratingPrompt?: boolean;
  validateFields?: () => Promise<boolean>;
  closeSheet: () => void;
}

export const SystemPromptSection = observer(
  ({
    hideGeneratingPrompt,
    validateFields,
    closeSheet,
  }: SystemPromptSectionProps) => {
    const theme = useTheme();
    const styles = createStyles(theme);

    const {watch, control, getValues, setValue, clearErrors} =
      useFormContext<PalFormData>();
    const useAIPrompt = watch('useAIPrompt');
    const promptGenerationModel = watch('promptGenerationModel');
    const isLoadingModel = modelStore.isContextLoading;

    const {generate, isGenerating, stop} = useStructuredOutput();

    const handleGeneratePrompt = async () => {
      // Validate form fields if validateFields is provided
      if (validateFields) {
        const isValid = await validateFields();
        if (!isValid) {
          return;
        }
      }

      clearErrors('systemPrompt');

      try {
        const selectedModel = getValues().promptGenerationModel;
        if (!selectedModel) {
          console.error('Active model not found');
          return;
        }

        if (modelStore.activeModelId !== selectedModel.id) {
          const context = await modelStore.initContext(selectedModel);
          if (!context) {
            console.error('Failed to initialize context');
            return;
          }
        }

        if (getValues().palType === PalType.ROLEPLAY) {
          const pal = getValues();
          const prompt = getPromptForModelGeneration(pal as RoleplayFormData);

          const schema = {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The system prompt for the roleplay scenario',
              },
            },
            required: ['prompt'],
          };

          const result = await generate(prompt, schema);

          setValue('systemPrompt', result?.prompt);
          setValue('originalSystemPrompt', result?.prompt);
          setValue('isSystemPromptChanged', false);
        } else if (getValues().palType === PalType.ASSISTANT) {
          const schema = {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The system prompt for the assistant scenario',
              },
            },
            required: ['prompt'],
          };

          const generatingPrompt = [
            'Generate a concise and professional system prompt for an AI assistant with the following role:',
            `Topic: "${getValues().generatingPrompt}"\n`,
            'The system prompt should:',
            "- Be clear and direct but concise about the assistant's primary function",
            '- Be written in second person ("You are...")',
            'Output the system prompt in JSON format with the key "prompt".',
          ].join('\n');
          const result = await generate(generatingPrompt, schema);
          setValue('systemPrompt', result?.prompt);
          setValue('originalSystemPrompt', result?.prompt);
          setValue('isSystemPromptChanged', false);
        }
      } catch (err) {
        console.error('Generation error:', err);
      } finally {
      }
    };

    const handleStopGeneration = () => {
      stop();
    };

    const handleReset = () => {
      const originalPrompt = getValues('originalSystemPrompt');
      if (originalPrompt) {
        setValue('systemPrompt', originalPrompt);
        setValue('isSystemPromptChanged', false);
      }
    };

    const isSystemPromptEdited = watch('isSystemPromptChanged');

    return (
      <>
        <SectionDivider label="System Prompt" />
        <View style={styles.field}>
          <Controller
            control={control}
            name="useAIPrompt"
            render={({field: {onChange, value}}) => (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  checked={value}
                  onPress={() => {
                    onChange(!value);
                    clearErrors('systemPrompt');
                  }}
                  disabled={isSystemPromptEdited}>
                  <Text>Use AI to generate system prompt</Text>
                </Checkbox>
              </View>
            )}
          />
        </View>

        {useAIPrompt && (
          <>
            <Controller
              name="promptGenerationModel"
              control={control}
              render={({field: {onChange, value}, fieldState: {error}}) => (
                <ModelSelector
                  value={value}
                  onChange={selected => {
                    onChange(selected);
                    clearErrors('promptGenerationModel');
                  }}
                  label="Select Model for Generation*"
                  sublabel="Recommended: Llama 3.2 3B or Qwen2.5 3B."
                  placeholder="Select model"
                  error={!!error}
                  helperText={error?.message}
                  disabled={isSystemPromptEdited}
                />
              )}
            />
            <ModelNotAvailable
              model={promptGenerationModel}
              closeSheet={closeSheet}
            />
            {!hideGeneratingPrompt && (
              <FormField
                name="generatingPrompt"
                label="Generating Prompt"
                placeholder="Enter prompt for generation"
                multiline
                required
                disabled={isSystemPromptEdited}
              />
            )}
            <Button
              mode="contained"
              onPress={
                isGenerating ? handleStopGeneration : handleGeneratePrompt
              }
              loading={isGenerating || isLoadingModel}
              disabled={isLoadingModel || isSystemPromptEdited}
              testID="generate-button">
              {isLoadingModel
                ? 'Loading model...'
                : isGenerating
                ? 'Stop Generating'
                : 'Generate System Prompt'}
            </Button>
          </>
        )}

        <>
          <FormField
            name="systemPrompt"
            label="System Prompt"
            sublabel="Feel free to edit and experiment to find the optimal prompt for your scenario"
            placeholder="You are a helpful assistant"
            multiline
            required
            disabled={useAIPrompt && isGenerating}
            onSubmitEditing={() => {
              setValue('isSystemPromptChanged', true);
            }}
          />
          {isSystemPromptEdited && (
            <View style={styles.warningContainer}>
              <Text style={[theme.fonts.bodyMedium, styles.warningText]}>
                System prompt has been manually changed
              </Text>
              <Button
                mode="text"
                onPress={handleReset}
                style={styles.resetButton}>
                Reset
              </Button>
            </View>
          )}
        </>
      </>
    );
  },
);
