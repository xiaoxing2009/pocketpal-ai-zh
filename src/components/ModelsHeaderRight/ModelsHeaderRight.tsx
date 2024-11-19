import {Image, View} from 'react-native';
import React, {useContext, useState} from 'react';

import {observer} from 'mobx-react';
import {Menu, IconButton, Divider} from 'react-native-paper';

import iconHF from '../../assets/icon-hf.png';
import iconHFLight from '../../assets/icon-hf-light.png';

import {useTheme} from '../../hooks';

import {createStyles} from './styles';
import {ModelsResetDialog} from '../ModelsResetDialog';

import {modelStore, uiStore} from '../../store';

import {L10nContext} from '../../utils';

export const ModelsHeaderRight = observer(() => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [_, setTrigger] = useState<boolean>(false);

  const l10n = useContext(L10nContext);

  const theme = useTheme();
  const styles = createStyles(theme);

  const filters = uiStore.pageStates.modelsScreen.filters;
  const setFilters = (value: string[]) => {
    uiStore.setValue('modelsScreen', 'filters', value);
  };

  const showResetDialog = () => setResetDialogVisible(true);
  const hideResetDialog = () => setResetDialogVisible(false);

  const handleReset = async () => {
    try {
      modelStore.resetModels();
      setTrigger(prev => !prev); // Trigger UI refresh
    } catch (error) {
      console.error('Error resetting models:', error);
    } finally {
      hideResetDialog();
    }
  };

  const toggleFilter = (filterName: string) => {
    const newFilters = filters.includes(filterName)
      ? filters.filter(f => f !== filterName)
      : [...filters, filterName];
    setFilters(newFilters);
  };

  return (
    <View style={styles.container}>
      <ModelsResetDialog
        visible={resetDialogVisible}
        onDismiss={hideResetDialog}
        onReset={handleReset}
        testID="reset-dialog"
      />
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        contentStyle={styles.menuContent}
        anchor={
          <IconButton
            icon="tune-vertical"
            size={24}
            style={styles.iconButton}
            onPress={() => setMenuVisible(true)}
            testID="models-menu-button"
          />
        }>
        {/* Filter section */}
        <Menu.Item title="Filters" disabled titleStyle={styles.menuSection} />
        <Menu.Item
          leadingIcon={({size}) => (
            <Image
              source={filters.includes('hf') ? iconHF : iconHFLight}
              style={{width: size, height: size}}
            />
          )}
          onPress={() => toggleFilter('hf')}
          title={l10n.menuTitleHf}
          titleStyle={styles.menuItem}
          trailingIcon={filters.includes('hf') ? 'check' : undefined}
        />
        <Menu.Item
          leadingIcon={
            filters.includes('downloaded') ? 'download-circle' : 'download'
          }
          onPress={() => toggleFilter('downloaded')}
          title={l10n.menuTitleDownloaded}
          titleStyle={styles.menuItem}
          trailingIcon={filters.includes('downloaded') ? 'check' : undefined}
        />

        {/* View section */}
        <Menu.Item title="View" disabled titleStyle={styles.menuSection} />
        <Menu.Item
          leadingIcon={
            filters.includes('grouped') ? 'layers' : 'layers-outline'
          }
          onPress={() => toggleFilter('grouped')}
          title={l10n.menuTitleGrouped}
          titleStyle={styles.menuItem}
          trailingIcon={filters.includes('grouped') ? 'check' : undefined}
        />

        {/* Actions section */}
        <Divider style={styles.divider} />
        <Menu.Item
          leadingIcon="refresh"
          onPress={() => {
            setMenuVisible(false);
            showResetDialog();
          }}
          title={l10n.menuTitleReset}
          titleStyle={styles.menuItem}
        />
      </Menu>
    </View>
  );
});
