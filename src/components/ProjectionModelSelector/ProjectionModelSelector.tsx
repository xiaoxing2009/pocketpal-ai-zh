import {View, TouchableOpacity, Alert} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';

import {observer} from 'mobx-react';
import {Text, ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {useTheme} from '../../hooks';

import {createStyles} from './styles';

import {modelStore} from '../../store';

import {Model} from '../../utils/types';
import {L10nContext, formatBytes} from '../../utils';

interface ProjectionModelSelectorProps {
  model: Model;
  onProjectionModelSelect?: (projectionModelId: string) => void;
}

/**
 * Component for displaying and managing projection models for a vision LLM
 */
export const ProjectionModelSelector = observer(
  ({model, onProjectionModelSelect}: ProjectionModelSelectorProps) => {
    const theme = useTheme();
    const l10n = useContext(L10nContext);
    const styles = createStyles(theme);

    const [expanded, setExpanded] = useState(false);
    const [compatibleModels, setCompatibleModels] = useState<Model[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string | undefined>(
      model.defaultProjectionModel,
    );

    // Get compatible projection models
    useEffect(() => {
      // Use the ModelStore method to get compatible projection models
      const projectionModels = modelStore.getCompatibleProjectionModels(
        model.id,
      );
      setCompatibleModels(projectionModels);

      // Auto-expand if there are models to show - better UX!
      if (projectionModels.length > 0) {
        setExpanded(true);
      }
    }, [model.id]);

    const handleSelectModel = (projectionModelId: string) => {
      setSelectedModelId(projectionModelId);
      if (onProjectionModelSelect) {
        onProjectionModelSelect(projectionModelId);
      }

      // If this is the active model, we need to reload the context with the new projection model
      if (modelStore.activeModelId === model.id) {
        const projectionModel = modelStore.models.find(
          m => m.id === projectionModelId,
        );
        if (projectionModel && projectionModel.isDownloaded) {
          // Show notification that the model will be reloaded
          Alert.alert(
            l10n.models.multimodal.reloadModelTitle,
            l10n.models.multimodal.reloadModelMessage,
            [
              {
                text: l10n.common.cancel,
                style: 'cancel',
              },
              {
                text: l10n.models.multimodal.reload,
                onPress: async () => {
                  // Get the projection model path
                  const projModelPath = await modelStore.getModelFullPath(
                    projectionModel,
                  );
                  if (projModelPath) {
                    // Reload the model with the new projection model
                    modelStore.initContext(model, projModelPath);
                  }
                },
              },
            ],
          );
        }
      }
    };

    const handleDownloadModel = (projectionModel: Model) => {
      modelStore.checkSpaceAndDownload(projectionModel.id);
    };

    const handleDeleteModel = (projectionModel: Model) => {
      // First check if we can delete the model
      const canDeleteResult = modelStore.canDeleteProjectionModel(
        projectionModel.id,
      );

      if (!canDeleteResult.canDelete) {
        // Show error dialog with specific reason
        let message =
          canDeleteResult.reason || l10n.models.multimodal.cannotDeleteTitle;

        if (canDeleteResult.reason === 'Projection model is currently active') {
          message = l10n.models.multimodal.cannotDeleteActive;
        } else if (
          canDeleteResult.dependentModels &&
          canDeleteResult.dependentModels.length > 0
        ) {
          const modelNames = canDeleteResult.dependentModels
            .map(m => m.name)
            .join(', ');
          message = `${l10n.models.multimodal.cannotDeleteInUse}\n\n${l10n.models.multimodal.dependentModels} ${modelNames}`;
        }

        Alert.alert(l10n.models.multimodal.cannotDeleteTitle, message, [
          {text: l10n.common.ok, style: 'default'},
        ]);
        return;
      }

      // Show confirmation dialog
      Alert.alert(
        l10n.models.multimodal.deleteProjectionTitle,
        l10n.models.multimodal.deleteProjectionMessage,
        [
          {text: l10n.common.cancel, style: 'cancel'},
          {
            text: l10n.common.delete,
            style: 'destructive',
            onPress: async () => {
              try {
                await modelStore.deleteModel(projectionModel);
              } catch (error) {
                console.error('Failed to delete projection model:', error);
                Alert.alert(
                  l10n.models.multimodal.cannotDeleteTitle,
                  error instanceof Error
                    ? error.message
                    : 'Unknown error occurred',
                  [{text: l10n.common.ok, style: 'default'}],
                );
              }
            },
          },
        ],
      );
    };

    const toggleExpanded = () => {
      setExpanded(!expanded);
    };

    if (!model.supportsMultimodal) {
      return null;
    }

    return (
      <View testID="projection-model-selector" style={styles.container}>
        {/* Optional Header - only show if there are multiple models or user needs to collapse */}
        {compatibleModels.length > 1 && (
          <TouchableOpacity
            style={styles.header}
            onPress={toggleExpanded}
            activeOpacity={0.7}>
            <Text style={styles.headerTitle}>
              {l10n.models.multimodal.projectionModels}
            </Text>
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.onSurfaceVariant}
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        )}

        {/* Clean Content - auto-expanded for better UX */}
        {expanded && (
          <View style={styles.content}>
            {compatibleModels.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="image-off-outline"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text style={styles.emptyText}>
                  {l10n.models.multimodal.noCompatibleModels}
                </Text>
              </View>
            ) : (
              <View style={styles.modelsList}>
                {/* Show title for context when there's only one model */}
                {compatibleModels.length === 1 && (
                  <Text style={styles.singleModelTitle}>
                    {l10n.models.multimodal.projectionModels}
                  </Text>
                )}

                {compatibleModels.map(projModel => {
                  const isSelected = selectedModelId === projModel.id;

                  return (
                    <View
                      testID="projection-model-item"
                      key={projModel.id}
                      style={[
                        styles.modelItem,
                        isSelected && styles.selectedModelItem,
                      ]}>
                      <View style={styles.modelInfo}>
                        <View style={styles.modelHeader}>
                          <Icon
                            name="cube-outline"
                            size={12}
                            color={
                              isSelected
                                ? theme.colors.tertiary
                                : theme.colors.onSurfaceVariant
                            }
                            style={styles.modelIcon}
                          />
                          <Text
                            style={[
                              styles.modelName,
                              isSelected && styles.selectedModelName,
                            ]}
                            numberOfLines={1}>
                            {projModel.name}
                          </Text>
                        </View>
                        <Text style={styles.modelSize}>
                          {formatBytes(projModel.size)}
                        </Text>
                      </View>

                      <View style={styles.modelActions}>
                        {projModel.isDownloaded ? (
                          <View style={styles.downloadedActions}>
                            <TouchableOpacity
                              testID="select-projection-model-button"
                              onPress={() => handleSelectModel(projModel.id)}
                              style={[
                                styles.selectArea,
                                isSelected && styles.selectedArea,
                              ]}
                              activeOpacity={0.7}>
                              <Icon
                                name={
                                  isSelected ? 'check-circle' : 'circle-outline'
                                }
                                size={20}
                                color={
                                  isSelected
                                    ? theme.colors.tertiary
                                    : theme.colors.onSurfaceVariant
                                }
                              />
                              {!isSelected && (
                                <Text style={styles.selectText}>
                                  {l10n.models.multimodal.select}
                                </Text>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteModel(projModel)}
                              style={styles.deleteArea}
                              activeOpacity={0.7}>
                              <Icon
                                name="delete-outline"
                                size={16}
                                color={theme.colors.error}
                              />
                            </TouchableOpacity>
                          </View>
                        ) : projModel.progress > 0 ? (
                          <View style={styles.downloadProgress}>
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primary}
                            />
                            <Text style={styles.progressText}>
                              {Math.round(projModel.progress)}%
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleDownloadModel(projModel)}
                            style={styles.downloadArea}
                            activeOpacity={0.7}>
                            <Icon
                              name="download"
                              size={16}
                              color={theme.colors.primary}
                            />
                            <Text style={styles.downloadText}>
                              {l10n.models.multimodal.download}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    );
  },
);
