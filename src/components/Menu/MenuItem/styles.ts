import {StyleSheet} from 'react-native';
import {Theme} from '../../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: 30,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    containerWithLeading: {
      paddingLeft: 8,
    },
    leadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginLeft: 0,
    },
    label: {
      ...theme.fonts.bodySmall,
      textAlign: 'left',
      paddingLeft: 0,
    },
    labelDisabled: {
      opacity: 0.5,
    },
    itemDisabled: {
      opacity: 0.5,
    },
    trailingContainer: {
      alignItems: 'flex-end',
    },
    groupLabel: {
      paddingTop: 12,
      opacity: 0.5,
    },
    activeParent: {
      backgroundColor: theme.colors.menuBackgroundActive,
    },
  });
