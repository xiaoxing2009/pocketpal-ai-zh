import {StyleSheet} from 'react-native';

import {MD3Theme} from 'react-native-paper';

export const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    sidebarContainer: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    divider: {
      marginHorizontal: 16,
      backgroundColor: theme.colors.onSurfaceVariant,
      height: 1,
      opacity: 0.1,
    },
    contentWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    versionContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      //gap: 10,
    },
    versionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      //gap: 4,
      justifyContent: 'center',
    },
    versionLabel: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.4,
      fontSize: 12,
    },
    sessionDrawerItem: {
      height: 40,
    },
    menuDrawerItem: {
      height: 44,
    },
    versionText: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.7,
      fontSize: 12,
      fontWeight: '500',
    },
    buildText: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.5,
      fontSize: 12,
    },
    copyHint: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.4,
      marginTop: 2,
      textAlign: 'center',
    },
    drawerSection: {
      marginTop: 10,
    },
    dateLabel: {
      paddingLeft: 16,
      paddingVertical: 10,
    },
    scrollViewContent: {
      flexGrow: 1,
      minHeight: '100%',
    },
    mainContent: {
      flex: 1,
    },
    versionSafeArea: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      flexShrink: 1,
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexWrap: 'wrap',
      //gap: 10,
    },
    sponsorButtonLabel: {
      marginHorizontal: 16,
    },
    sponsorButton: {
      height: 40,
    },
    menu: {
      width: 170,
    },
    sessionItem: {
      position: 'relative',
    },
    sessionTouchable: {
      flex: 1,
    },
  });
