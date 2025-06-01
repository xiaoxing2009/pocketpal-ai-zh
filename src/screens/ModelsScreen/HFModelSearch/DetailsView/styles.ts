import {StyleSheet} from 'react-native';

import {Theme} from '../../../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: 16,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      padding: 16,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    modelAuthor: {
      marginBottom: 0,
    },
    titleContainer: {
      marginBottom: 16,
    },
    modelTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    modelTitle: {
      fontWeight: 'bold',
    },
    modelStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginBottom: 24,
    },
    stat: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    sectionSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
      color: theme.colors.onSurfaceVariant,
    },
  });
