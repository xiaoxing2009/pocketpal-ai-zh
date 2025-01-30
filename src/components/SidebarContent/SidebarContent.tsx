import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View, TextInput, Modal} from 'react-native';

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

import {chatSessionStore} from '../../store';

import {Menu} from '..';

export const SidebarContent: React.FC<DrawerContentComponentProps> = observer(
  props => {
    const [appInfo, setAppInfo] = useState({
      version: '',
      build: '',
    });

    const [menuVisible, setMenuVisible] = useState<string | null>(null); // Track which menu is visible
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0}); // Track menu position
    const [renameModalVisible, setRenameModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [sessionToRename, setSessionToRename] = useState<string | null>(null);

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

    const handleRename = () => {
      if (sessionToRename && newTitle.trim()) {
        chatSessionStore.updateSessionTitleBySessionId(
          sessionToRename,
          newTitle,
        );
        setRenameModalVisible(false);
        setNewTitle('');
        setSessionToRename(null);
      }
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
                          anchor={menuPosition}>
                          <Menu.Item
                            style={styles.menu}
                            onPress={() => {
                              setSessionToRename(session.id);
                              setNewTitle(session.title);
                              setRenameModalVisible(true);
                              closeMenu();
                            }}
                            leadingIcon="pencil"
                            label="Rename"
                          />
                          <Menu.Item
                            style={styles.menu}
                            onPress={() => {
                              chatSessionStore.deleteSession(session.id);
                              closeMenu();
                            }}
                            leadingIcon="trash-can-outline"
                            label="Delete"
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

        {/* Rename Modal */}
        <Modal
          transparent={true}
          visible={renameModalVisible}
          onRequestClose={() => {
            setRenameModalVisible(false);
            setNewTitle('');
            setSessionToRename(null);
          }}
          animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename Chat</Text>
              <TextInput
                style={styles.textInput}
                placeholder="New Title"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newTitle}
                maxLength={40}
                onChangeText={setNewTitle}
                autoFocus={true}
                onSubmitEditing={handleRename}
                returnKeyType="done"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setRenameModalVisible(false);
                    setNewTitle('');
                    setSessionToRename(null);
                  }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !newTitle.trim() && styles.disabledButton,
                  ]}
                  onPress={handleRename}
                  disabled={!newTitle.trim()}>
                  <Text style={styles.confirmText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    );
  },
);
