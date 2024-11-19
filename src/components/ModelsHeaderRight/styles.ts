import {StyleSheet} from 'react-native';
import {Theme} from '../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },
    iconButton: {
      margin: 0,
      marginHorizontal: 4,
    },
    menuContent: {
      borderRadius: 8,
      elevation: 8,
      marginTop: 8,
      minWidth: 220,
      backgroundColor: theme.colors.surface,
    },
    menuSection: {
      fontSize: 11,
      opacity: 0.7,
      fontWeight: 'bold',
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    menuItem: {
      fontSize: 13,
    },
    divider: {
      marginVertical: 4,
      opacity: 0.2,
    },
  });
