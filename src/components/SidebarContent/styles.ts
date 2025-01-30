import {StyleSheet} from 'react-native';

import {MD3Theme} from 'react-native-paper';

export const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    sidebarContainer: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    contentWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    versionContainer: {
      paddingTop: 12,
      paddingBottom: 0,
      paddingHorizontal: 26,
      width: '100%',
      alignItems: 'center',
    },
    versionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      justifyContent: 'center',
    },
    versionLabel: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.4,
      fontSize: 12,
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
      marginVertical: 10,
    },
    dateLabel: {
      color: theme.colors.onSurfaceVariant,
      paddingLeft: 26,
      paddingBottom: 15,
    },
    scrollViewContent: {
      flexGrow: 1,
      minHeight: '100%',
    },
    mainContent: {
      flex: 1,
    },
    versionSafeArea: {
      backgroundColor: theme.colors.surface,
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
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.dark
        ? theme.colors.outline + '50'
        : theme.colors.outline + '30',
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.onSurface,
      textAlign: 'center',
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.dark
        ? theme.colors.outline + '50'
        : theme.colors.outline + '30',
    },
    textInput: {
      margin: 16,
      padding: 12,
      backgroundColor: theme.dark
        ? theme.colors.surfaceVariant + '80'
        : theme.colors.surface + '90',
      color: theme.colors.onSurface,
      fontSize: 17,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: theme.dark
        ? theme.colors.outline + '50'
        : theme.colors.outline + '30',
      borderRadius: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.dark
        ? theme.colors.outline + '50'
        : theme.colors.outline + '30',
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: theme.dark
        ? theme.colors.outline + '50'
        : theme.colors.outline + '30',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 17,
      fontWeight: '400',
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmText: {
      color: theme.colors.primary,
      fontSize: 17,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.4,
    },
  });
