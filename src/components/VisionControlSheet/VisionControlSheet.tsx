import React, {useContext} from 'react';
import {View} from 'react-native';
import {Text, Switch, Divider} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Sheet} from '../Sheet';
import {ProjectionModelSelector} from '..';
import {useTheme} from '../../hooks';
import {L10nContext} from '../../utils';
import {Model} from '../../utils/types';
import {modelStore} from '../../store';

import {createStyles} from './styles';

interface VisionControlSheetProps {
  isVisible: boolean;
  onClose: () => void;
  model: Model;
}

export const VisionControlSheet: React.FC<VisionControlSheetProps> = ({
  isVisible,
  onClose,
  model,
}) => {
  const theme = useTheme();
  const l10n = useContext(L10nContext);
  const styles = createStyles(theme);

  const visionEnabled = modelStore.getModelVisionPreference(model);
  const projectionStatus = modelStore.getProjectionModelStatus(model);

  const handleVisionToggle = async (enabled: boolean) => {
    try {
      await modelStore.setModelVisionEnabled(model.id, enabled);
    } catch (error) {
      console.error('Failed to toggle vision setting:', error);
      // The error is already handled in setModelVisionEnabled (vision state is reverted)
      // We could show a toast/snackbar here if needed
    }
  };

  const handleProjectionModelSelect = (projectionModelId: string) => {
    modelStore.setDefaultProjectionModel(model.id, projectionModelId);
  };

  const renderVisionToggle = () => {
    const isDisabled =
      !projectionStatus.isAvailable && !visionEnabled && model.isDownloaded;

    return (
      <View style={styles.toggleContainer}>
        <View style={styles.toggleHeader}>
          <Icon
            name={visionEnabled ? 'eye' : 'eye-off'}
            size={24}
            disabled={!projectionStatus.isAvailable && !visionEnabled}
            color={
              visionEnabled ? theme.colors.text : theme.colors.textSecondary
            }
          />
          <View style={styles.toggleTextContainer}>
            <Text
              style={[
                styles.toggleTitle,
                !visionEnabled && {color: theme.colors.textSecondary},
              ]}>
              {l10n.models.multimodal.visionControls.visionEnabled}
            </Text>
          </View>
          <Switch
            value={visionEnabled}
            onValueChange={handleVisionToggle}
            disabled={isDisabled}
          />
        </View>
        {isDisabled && (
          <Text variant="bodySmall" style={styles.helpText}>
            {l10n.models.multimodal.visionControls.requiresProjectionModel}
          </Text>
        )}
      </View>
    );
  };

  const renderProjectionModelSelector = () => {
    return (
      <ProjectionModelSelector
        model={model}
        onProjectionModelSelect={handleProjectionModelSelect}
        showDownloadActions={model.isDownloaded}
      />
    );
  };

  const getSheetTitle = () => {
    const maxLength = 40;
    if (model.name.length > maxLength) {
      return model.name.substring(0, maxLength) + '...';
    }
    return model.name;
  };

  return (
    <Sheet
      isVisible={isVisible}
      onClose={onClose}
      title={getSheetTitle()}
      snapPoints={['60%']}>
      <Sheet.ScrollView contentContainerStyle={styles.container}>
        {renderVisionToggle()}

        <Divider style={styles.divider} />

        {renderProjectionModelSelector()}
      </Sheet.ScrollView>
    </Sheet>
  );
};
