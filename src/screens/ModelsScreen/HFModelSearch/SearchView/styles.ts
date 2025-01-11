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
      paddingBottom: 100,
    },
    divider: {
      marginVertical: 12,
    },
    modelAuthor: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    modelName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
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
    loadingMoreText: {
      textAlign: 'center',
      padding: 16,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
  });
