import {StyleSheet} from 'react-native';

import {Theme} from '../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    menu: {
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowRadius: 70,
      shadowOffset: {width: 0, height: 0},
      elevation: 5,
    },
    menuWithSubmenu: {
      elevation: 0,
      shadowOpacity: 0,
    },
    content: {
      paddingVertical: 4,
      backgroundColor: theme.colors.menuBackground,
      borderRadius: 15,
    },
    contentWithSubmenu: {
      backgroundColor: theme.colors.menuBackgroundDimmed,
    },
    groupSeparator: {
      height: 6,
      flexShrink: 0,
      backgroundColor: 'transparent',
    },
    separator: {
      //height: 1,
      backgroundColor: theme.colors.menuSeparator,
    },
  });
