import {Dimensions, StyleSheet} from 'react-native';

import {Theme} from '../../utils/types';

const dialogHeight = Dimensions.get('window').height * 0.65;

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    dialog: {
      //maxHeight: '90%',
      backgroundColor: theme.colors.surface,
      borderRadius: 15,
      margin: 0,
      padding: 0,
    },
    dialogTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    dialogContent: {
      maxHeight: dialogHeight,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
    },
    dialogScrollArea: {},
    dialogActionButton: {
      minWidth: 70,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  });
