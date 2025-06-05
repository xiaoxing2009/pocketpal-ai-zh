import {StyleSheet} from 'react-native';
import {Theme} from '../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 32,
    },
    toggleContainer: {
      marginBottom: 16,
    },
    toggleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    toggleTextContainer: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    helpText: {
      color: theme.colors.error,
      marginLeft: 36, // Align with toggle title
    },

    divider: {
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    projectionModelsContainer: {
      marginBottom: 16,
    },
    disabledProjectionSelector: {
      opacity: 0.5,
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.errorContainer + '30',
      borderWidth: 1,
      borderColor: theme.colors.error + '50',
      marginBottom: 16,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.error,
      lineHeight: 18,
    },
  });
