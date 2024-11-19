import {StyleSheet} from 'react-native';

import {Theme} from '../../../../../utils/types';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    fileCardContainer: {
      marginBottom: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      //padding: 8,
      overflow: 'hidden', // Important for gradient containment
      position: 'relative', // For absolute positioning of gradient
    },
    gradientBackground: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      height: '100%', // Ensures full height
      borderRadius: 8,
    },
    fileContent: {
      padding: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    fileInfo: {
      flex: 1,
      marginRight: 4,
    },
    fileName: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    fileSize: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      //marginTop: 2,
    },
    fileActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -8, // Bring icons closer together
    },
    fileMetaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    downloadSpeed: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    downloadProgress: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500', // slightly bolder to emphasize progress
    },
    fileSizeSeparator: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginHorizontal: 4,
    },
  });
