import {StyleSheet} from 'react-native';

import {Theme} from '../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      padding: 10,
    },
    scrollViewContent: {
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    card: {
      marginVertical: 10,
      borderRadius: 15,
      backgroundColor: theme.colors.surface,
    },
    settingItemContainer: {
      marginVertical: 15,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    textContainer: {
      flex: 1,
    },
    textLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    textDescription: {
      fontSize: 14,
      marginRight: 2,
      color: theme.colors.textSecondary,
    },
    textInput: {
      marginVertical: 5,
    },
    nGPUSlider: {
      marginTop: 1,
    },
    invalidInput: {
      borderColor: 'red',
      borderWidth: 1,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
    },
  });
