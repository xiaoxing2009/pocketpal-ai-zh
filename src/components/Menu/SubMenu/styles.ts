import {StyleSheet} from 'react-native';

import {Theme} from '../../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    menu: {
      //minWidth: 220,
      marginTop: 0,
      marginLeft: 0,
    },
    content: {
      paddingVertical: 6,
      backgroundColor: theme.colors.menuBackground,
      borderRadius: 15,
    },
  });
