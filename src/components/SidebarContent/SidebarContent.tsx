import React, {useContext, useEffect, useState} from 'react';
import {TouchableOpacity, View, Alert} from 'react-native';

import {observer} from 'mobx-react';
import {Drawer, Text} from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import Clipboard from '@react-native-clipboard/clipboard';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';

import {useTheme} from '../../hooks';

import {createStyles} from './styles';

import {chatSessionStore, SessionMetaData} from '../../store';

import {Menu, RenameModal} from '..';
import {EditIcon, TrashIcon} from '../../assets/icons';
import {L10nContext} from '../../utils';

export const SidebarContent: React.FC<DrawerContentComponentProps> = observer(
  props => {
    const [appInfo, setAppInfo] = useState({
      version: '',
      build: '',
    });

    const [menuVisible, setMenuVisible] = useState<string | null>(null); // Track which menu is visible
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0}); // Track menu position
    const [sessionToRename, setSessionToRename] =
      useState<SessionMetaData | null>(null);

    useEffect(() => {
      chatSessionStore.loadSessionList();

      // Get app version and build number
      const version = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();
      setAppInfo({
        version,
        build: buildNumber,
      });
    }, []);

    const theme = useTheme();
    const styles = createStyles(theme);
    const i10n = useContext(L10nContext);

    const copyVersionToClipboard = () => {
      const versionString = `Version ${appInfo.version} (${appInfo.build})`;
      Clipboard.setString(versionString);
    };

    const openMenu = (sessionId: string, event: any) => {
      const {nativeEvent} = event;
      setMenuPosition({x: nativeEvent.pageX, y: nativeEvent.pageY});
      setMenuVisible(sessionId);
    };

    const closeMenu = () => setMenuVisible(null);

    const onPressDelete = (sessionId: string) => {
      if (sessionId) {
        Alert.alert(i10n.deleteChatTitle, i10n.deleteChatMessage, [
          {
            text: i10n.cancel,
            style: 'cancel',
          },
          {
            text: i10n.delete,
            style: 'destructive',
            onPress: () => {
              chatSessionStore.resetActiveSession();
              chatSessionStore.deleteSession(sessionId);
              closeMenu();
            },
          },
        ]);
      }
      closeMenu();
    };

    return (
      <GestureHandlerRootView style={styles.sidebarContainer}>
        <View style={styles.contentWrapper}>
          <DrawerContentScrollView {...props}>
            <Drawer.Section>
              <Drawer.Item
                label={'Chat'}
                icon={'comment-text'}
                onPress={() => props.navigation.navigate('Chat')}
              />
              <Drawer.Item
                label={'Models'}
                icon={'view-grid'}
                onPress={() => props.navigation.navigate('Models')}
              />
              <Drawer.Item
                label={'Benchmark'}
                icon={'speedometer'}
                onPress={() => props.navigation.navigate('Benchmark')}
              />
              <Drawer.Item
                label={'Settings'}
                icon={'cog'}
                onPress={() => props.navigation.navigate('Settings')}
              />
            </Drawer.Section>

            {/* Loop over the session groups and render them */}
            {Object.entries(chatSessionStore.groupedSessions).map(
              ([dateLabel, sessions]) => (
                <Drawer.Section key={dateLabel} style={styles.drawerSection}>
                  <Text variant="bodySmall" style={styles.dateLabel}>
                    {dateLabel}
                  </Text>
                  {sessions.map(session => {
                    const isActive =
                      chatSessionStore.activeSessionId === session.id;
                    return (
                      <View key={session.id} style={styles.sessionItem}>
                        <TouchableOpacity
                          onPress={() => {
                            chatSessionStore.setActiveSession(session.id);
                            props.navigation.navigate('Chat');
                          }}
                          onLongPress={event => openMenu(session.id, event)} // Open menu on long press
                          style={styles.sessionTouchable}>
                          <Drawer.Item
                            active={isActive}
                            label={session.title}
                          />
                        </TouchableOpacity>

                        {/* Menu for the session item */}
                        <Menu
                          visible={menuVisible === session.id}
                          onDismiss={closeMenu}
                          anchor={menuPosition}
                          style={styles.menu}
                          contentStyle={{}}
                          anchorPosition="bottom">
                          <Menu.Item
                            onPress={() => {
                              setSessionToRename(session);
                              closeMenu();
                            }}
                            label={i10n.rename}
                            leadingIcon={() => (
                              <EditIcon stroke={theme.colors.primary} />
                            )}
                          />
                          <Menu.Item
                            onPress={() => onPressDelete(session.id)}
                            label={i10n.delete}
                            labelStyle={{color: theme.colors.error}}
                            leadingIcon={() => (
                              <TrashIcon stroke={theme.colors.error} />
                            )}
                          />
                        </Menu>
                      </View>
                    );
                  })}
                </Drawer.Section>
              ),
            )}
          </DrawerContentScrollView>

          <SafeAreaView edges={['bottom']} style={styles.versionSafeArea}>
            <TouchableOpacity
              onPress={copyVersionToClipboard}
              style={styles.versionContainer}>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Version</Text>
                <Text style={styles.versionText}>{appInfo.version}</Text>
                <Text style={styles.buildText}>({appInfo.build})</Text>
              </View>
              <Text style={styles.copyHint}>Tap to copy</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
        <RenameModal
          visible={sessionToRename !== null}
          onClose={() => setSessionToRename(null)}
          session={sessionToRename}
        />
      </GestureHandlerRootView>
    );
  },
);
