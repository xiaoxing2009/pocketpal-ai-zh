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
import {ChevronDownIcon} from '../../assets/icons';
import {Menu} from '../Menu';

interface ResetButtonProps {
  session: any;
  resetMenuVisible: boolean;
  setResetMenuVisible: (visible: boolean) => void;
  handleResetToDefault: () => void;
  handleResetToPreset: () => void;
}

const ChevronDownButtonIcon = ({color}: {color: string}) => (
  <ChevronDownIcon width={16} height={16} stroke={color} />
);

// Reset button component - conditionally renders based on session
const ResetButton = ({
  session,
  resetMenuVisible,
  setResetMenuVisible,
  handleResetToDefault,
  handleResetToPreset,
}: ResetButtonProps) => {
  if (!session) {
    // Simple button for preset settings
    return (
      <Button
        mode="text"
        onPress={handleResetToDefault}
        style={styles.resetButton}>
        Reset to System Defaults
      </Button>
    );
  }

  // Menu button for session settings
  return (
    <Menu
      visible={resetMenuVisible}
      onDismiss={() => setResetMenuVisible(false)}
      anchor={
        <View style={styles.resetWrapper}>
          <Button
            mode="text"
            onPress={() => setResetMenuVisible(true)}
            style={styles.resetButton}
            contentStyle={styles.resetButtonContent}
            icon={ChevronDownButtonIcon}>
            Reset
          </Button>
        </View>
      }>
      <Menu.Item onPress={handleResetToPreset} label="Reset to Preset" />
      <Menu.Item
        onPress={handleResetToDefault}
        label="Reset to System Defaults"
      />
    </Menu>
  );
};

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

  const [resetMenuVisible, setResetMenuVisible] = useState(false);

  const isEditingPresetSettings = !session;

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

  const handleApplyToPreset = () => {
    if (session) {
      // Apply current session settings to preset settings
      handleSaveSettings(); // First save the current UI settings to the session
      chatSessionStore.applySessionSettingsToGlobal();
      Alert.alert(
        'Success',
        'These settings will be applied to all future sessions',
        [{text: 'OK'}],
      );
    }
  };

  const handleResetToPreset = () => {
    if (session) {
      // For session-specific settings, reset to match Preset settings
      setSettings({...chatSessionStore.newChatCompletionSettings});
    }
    setResetMenuVisible(false);
  };

  const handleResetToDefault = () => {
    // Reset to system defaults
    setSettings({...defaultCompletionSettings});
    setResetMenuVisible(false);
  };

  const i10n = useContext(L10nContext);

  return (
    <Sheet
      title={
        i10n.chatGenerationSettings + (session ? ' (Session)' : ' (Preset)')
      }
      isVisible={isVisible}
      onClose={onCloseSheet}>
      <Sheet.ScrollView
        bottomOffset={16}
        contentContainerStyle={styles.scrollviewContainer}>
        <CompletionSettings settings={settings} onChange={updateSettings} />
      </Sheet.ScrollView>
      <Sheet.Actions>
        <View style={styles.actionsContainer}>
          <ResetButton
            session={session}
            resetMenuVisible={resetMenuVisible}
            setResetMenuVisible={setResetMenuVisible}
            handleResetToDefault={handleResetToDefault}
            handleResetToPreset={handleResetToPreset}
          />
          <View style={styles.rightButtons}>
            {!isEditingPresetSettings && (
              <Button mode="contained-tonal" onPress={handleApplyToPreset}>
                Save as Preset
              </Button>
            )}
            <Button mode="contained" onPress={handleSaveSettings}>
              {session ? 'Save' : i10n.saveChanges}
            </Button>
          </View>
        </View>
      </Sheet.Actions>
    </Sheet>
  );
};
