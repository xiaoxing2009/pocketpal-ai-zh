import {StyleSheet} from 'react-native';
import {MD3Theme} from 'react-native-paper';
import {EdgeInsets} from 'react-native-safe-area-context';

export const createStyles = (theme: MD3Theme, insets: EdgeInsets) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      padding: 8,
      paddingBottom: insets.bottom + 16,
      flexGrow: 1,
    },
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginBottom: 16,
    },
    description: {
      marginBottom: 32,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 24,
    },
    field: {
      marginBottom: 32,
    },
    label: {
      ...theme.fonts.titleSmall,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    feedbackTypeContainer: {
      marginBottom: 24,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    feedbackInput: {
      marginBottom: 24,
      backgroundColor: theme.colors.surfaceVariant,
    },
    emailInput: {
      marginBottom: 24,
      backgroundColor: theme.colors.surfaceVariant,
    },
    input: {
      marginBottom: 16,
      backgroundColor: theme.colors.surfaceVariant,
    },
    segmentedContainer: {
      marginTop: 8,
    },
    segmentedButtons: {
      marginTop: 8,
    },
    rating: {
      marginBottom: 24,
    },
    submitButton: {
      marginTop: 16,
    },
  });
