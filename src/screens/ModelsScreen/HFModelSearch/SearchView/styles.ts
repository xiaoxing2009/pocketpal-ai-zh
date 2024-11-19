import {StyleSheet} from 'react-native';
import {Theme} from '../../../../utils/types';

export const createStyles = (theme: Theme, bottomInset: number) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    list: {
      padding: 16,
    },
    modelItem: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
    },
    modelName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    loadingText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    noResultsText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
    },
    searchbarContainer: {
      position: 'absolute',
      bottom: bottomInset,
      left: 0,
      right: 0,
    },
  });
