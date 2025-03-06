import React, {useContext, useEffect, useState} from 'react';
import {Sheet} from '../Sheet/Sheet';
import {CompletionSettings} from '../../screens/ModelsScreen/CompletionSettings';
import {CompletionParams} from '@pocketpalai/llama.rn';
import {chatSessionStore, defaultCompletionSettings} from '../../store';
import {styles} from './styles';
import {
  COMPLETION_PARAMS_METADATA,
  validateCompletionSettings,
} from '../../utils/modelSettings';
import {Alert, View} from 'react-native';
import {Button} from 'react-native-paper';
import {L10nContext} from '../../utils';

export const ChatGenerationSettingsSheet = ({
  isVisible,
  onClose,
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const session = chatSessionStore.sessions.find(
    item => item.id === chatSessionStore.activeSessionId,
  );

  const [settings, setSettings] = useState<CompletionParams>(
    session?.completionSettings ?? chatSessionStore.newChatCompletionSettings,
  );

  useEffect(() => {
    setSettings(
      session?.completionSettings ?? chatSessionStore.newChatCompletionSettings,
    );
  }, [session]);

  const updateSettings = (name: string, value: any) => {
    setSettings(prev => ({...prev, [name]: value}));
  };

  const onCloseSheet = () => {
    setSettings(
      session?.completionSettings ?? chatSessionStore.newChatCompletionSettings,
    );
    onClose();
  };

  const handleSaveSettings = () => {
    // Convert string values to numbers where needed
    const processedSettings = Object.entries(settings).reduce(
      (acc, [key, value]) => {
        const metadata = COMPLETION_PARAMS_METADATA[key];
        if (metadata?.validation.type === 'numeric') {
          // Handle numeric conversion
          let numValue: number;
          if (typeof value === 'string') {
            numValue = Number(value);
          } else if (typeof value === 'number') {
            numValue = value;
          } else {
            // If it's neither string nor number, treat as invalid. Most probably won't happen.
            acc.errors[key] = 'Must be a valid number';
            return acc;
          }

          if (Number.isNaN(numValue)) {
            acc.errors[key] = 'Must be a valid number';
          } else {
            acc.settings[key] = numValue;
          }
        } else {
          // For non-numeric values, keep as is
          acc.settings[key] = value;
        }
        return acc;
      },
      {settings: {}, errors: {}} as {
        settings: typeof settings;
        errors: Record<string, string>;
      },
    );

    // Validate the converted values
    const validationResult = validateCompletionSettings(
      processedSettings.settings,
    );
    const allErrors = {
      ...processedSettings.errors,
      ...validationResult.errors,
    };

    if (Object.keys(allErrors).length > 0) {
      Alert.alert(
        'Invalid Values',
        'Please correct the following:\n' +
          Object.entries(allErrors)
            .map(([key, msg]) => `• ${key}: ${msg}`)
            .join('\n'),
        [{text: 'OK'}],
      );
      return;
    }

    if (session) {
      chatSessionStore.updateSessionCompletionSettings(
        processedSettings.settings,
      );
    } else {
      chatSessionStore.setNewChatCompletionSettings(processedSettings.settings);
    }
    onCloseSheet();
  };

  const handleResetSettings = () => {
    setSettings(defaultCompletionSettings);
  };

  const handleCancelSettings = () => {
    onCloseSheet();
  };

  const i10n = useContext(L10nContext);

  return (
    <Sheet
      title={i10n.chatGenerationSettings}
      isVisible={isVisible}
      onClose={onCloseSheet}>
      <Sheet.ScrollView
        bottomOffset={16}
        contentContainerStyle={styles.scrollviewContainer}>
        <CompletionSettings settings={settings} onChange={updateSettings} />
      </Sheet.ScrollView>
      <Sheet.Actions>
        <View style={styles.secondaryButtons}>
          <Button mode="text" onPress={handleResetSettings}>
            {i10n.reset}
          </Button>
          <Button mode="text" onPress={handleCancelSettings}>
            {i10n.cancel}
          </Button>
        </View>
        <Button mode="contained" onPress={handleSaveSettings}>
          {i10n.saveChanges}
        </Button>
      </Sheet.Actions>
    </Sheet>
  );
};
