import React, {useState, useMemo, useContext} from 'react';
import {View, FlatList, RefreshControl, Platform, Alert} from 'react-native';

import {toJS} from 'mobx';
import {v4 as uuidv4} from 'uuid';
import RNFS from 'react-native-fs';
import 'react-native-get-random-values';
import {observer} from 'mobx-react-lite';
import DocumentPicker from 'react-native-document-picker';

import {useTheme} from '../../hooks';

import {styles} from './styles';
import {FABGroup} from './FABGroup';
import {ModelCard} from './ModelCard';
import {HFModelSearch} from './HFModelSearch';
import {ModelAccordion} from './ModelAccordion';

import {uiStore, modelStore} from '../../store';

import {L10nContext} from '../../utils';
import {Model, ModelOrigin} from '../../utils/types';

export const ModelsScreen: React.FC = observer(() => {
  const l10n = useContext(L10nContext);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hfSearchVisible, setHFSearchVisible] = useState(false);
  const [_, setTrigger] = useState<boolean>(false);
  const {colors} = useTheme();

  const filters = uiStore.pageStates.modelsScreen.filters;
  const expandedGroups = uiStore.pageStates.modelsScreen.expandedGroups;

  const onRefresh = async () => {
    setRefreshing(true);
    await modelStore.refreshDownloadStatuses();
    setTrigger(prev => !prev);
    setRefreshing(false);
  };

  const handleAddLocalModel = async () => {
    DocumentPicker.pick({
      type:
        Platform.OS === 'ios' ? 'public.data' : DocumentPicker.types.allFiles,
    })
      .then(async res => {
        let [file] = res;
        if (file) {
          // Assign a default name if file.name is null or undefined
          // Not sure if this can ever happen, though.
          let fileName =
            file.name || file.uri.split('/').pop() || `file_${uuidv4()}`;

          const permanentDir = `${RNFS.DocumentDirectoryPath}/models/local`;
          let permanentPath = `${permanentDir}/${fileName}`;
          if (!(await RNFS.exists(permanentDir))) {
            await RNFS.mkdir(permanentDir);
          }

          if (await RNFS.exists(permanentPath)) {
            const choice = await new Promise<'replace' | 'keep' | 'cancel'>(
              resolve => {
                Alert.alert(
                  l10n.fileAlreadyExists,
                  l10n.fileAlreadyExistsMessage,
                  [
                    {
                      text: l10n.replace,
                      onPress: () => resolve('replace'),
                    },
                    {
                      text: l10n.keepBoth,
                      onPress: () => resolve('keep'),
                    },
                    {
                      text: l10n.cancel,
                      onPress: () => resolve('cancel'),
                      style: 'cancel',
                    },
                  ],
                );
              },
            );

            switch (choice) {
              case 'replace':
                await RNFS.unlink(permanentPath);
                break;
              case 'keep':
                let counter = 1;
                const nameParts = fileName.split('.');
                const ext = nameParts.length > 1 ? nameParts.pop() : '';
                const name = nameParts.join('.');
                do {
                  permanentPath = `${permanentDir}/${name}_${counter}.${ext}`;
                  counter++;
                } while (await RNFS.exists(permanentPath));
                break;
              case 'cancel':
                console.log('File copy cancelled by user');
                return;
            }
          }

          await RNFS.copyFile(file.uri, permanentPath);
          await modelStore.addLocalModel(permanentPath);
          setTrigger(prev => !prev);
        }
      })
      .catch(e => console.log('No file picked, error: ', e.message));
  };

  const activeModelId = toJS(modelStore.activeModel?.id);
  const models = toJS(modelStore.models);

  const filteredAndSortedModels = useMemo(() => {
    let result = models;
    if (filters.includes('downloaded')) {
      result = result.filter(model => model.isDownloaded);
    }
    if (!filters.includes('grouped')) {
      result = result.sort((a, b) => {
        if (a.isDownloaded && !b.isDownloaded) {
          return -1;
        }
        if (!a.isDownloaded && b.isDownloaded) {
          return 1;
        }
        return 0;
      });
    }
    if (filters.includes('hf')) {
      result = result.filter(model => model.origin === ModelOrigin.HF);
    }
    return result;
  }, [models, filters]);

  const groupedModels = useMemo(() => {
    if (!filters.includes('grouped')) {
      return {ungrouped: filteredAndSortedModels};
    }

    return filteredAndSortedModels.reduce((acc, item) => {
      const groupKey =
        item.origin === ModelOrigin.LOCAL || item.isLocal
          ? l10n.localModel
          : item.type || l10n.unknownGroup;

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, Model[]>);
  }, [filteredAndSortedModels, filters, l10n.localModel, l10n.unknownGroup]);

  const toggleGroup = (type: string) => {
    const currentExpandedGroups =
      uiStore.pageStates.modelsScreen.expandedGroups;
    const updatedExpandedGroups = {
      ...currentExpandedGroups,
      [type]: !currentExpandedGroups[type],
    };
    uiStore.setValue('modelsScreen', 'expandedGroups', updatedExpandedGroups);
  };

  const renderGroupHeader = ({item: group}) => {
    const isExpanded = expandedGroups[group.type];
    return (
      <ModelAccordion
        group={group}
        expanded={isExpanded}
        onPress={() => toggleGroup(group.type)}>
        <FlatList
          data={group.items}
          keyExtractor={subItem => subItem.id}
          renderItem={({item: subItem}) => (
            <ModelCard model={subItem} activeModelId={activeModelId} />
          )}
        />
      </ModelAccordion>
    );
  };

  const renderItem = ({item}) => (
    <ModelCard model={item} activeModelId={activeModelId} />
  );

  const flatListModels = Object.keys(groupedModels)
    .map(type => ({
      type,
      items: groupedModels[type],
    }))
    .filter(group => group.items.length > 0);

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <FlatList
        testID="flat-list"
        contentContainerStyle={styles.listContainer} // Ensure padding for last card
        data={
          filters.includes('grouped') ? flatListModels : filteredAndSortedModels
        }
        keyExtractor={item =>
          filters.includes('grouped') ? item.type : item.id
        }
        extraData={activeModelId}
        renderItem={
          filters.includes('grouped') ? renderGroupHeader : renderItem
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />

      <HFModelSearch
        visible={hfSearchVisible}
        onDismiss={() => setHFSearchVisible(false)}
      />
      <FABGroup
        onAddHFModel={() => setHFSearchVisible(true)}
        onAddLocalModel={handleAddLocalModel}
      />
    </View>
  );
});
