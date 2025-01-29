import * as React from 'react';
import {Dimensions, StyleSheet} from 'react-native';

import {reaction} from 'mobx';
import {observer} from 'mobx-react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  gestureHandlerRootHOC,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import {KeyboardProvider} from 'react-native-keyboard-controller';

import {useTheme} from './src/hooks';
import {Theme} from './src/utils/types';
import {modelStore, chatSessionStore} from './src/store';
import {HeaderRight, SidebarContent, ModelsHeaderRight} from './src/components';
import {
  ChatScreen,
  ModelsScreen,
  SettingsScreen,
  BenchmarkScreen,
} from './src/screens';

const Drawer = createDrawerNavigator();

const screenWidth = Dimensions.get('window').width;

const App = observer(() => {
  const [chatTitle, setChatTitle] = React.useState('Default Chat Page');

  React.useEffect(() => {
    const dispose = reaction(
      () => modelStore.chatTitle,
      newTitle => setChatTitle(newTitle),
      {fireImmediately: true},
    );
    return () => dispose();
  }, []);

  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <BottomSheetModalProvider>
            <PaperProvider theme={theme}>
              <NavigationContainer>
                <Drawer.Navigator
                  useLegacyImplementation={false}
                  screenOptions={{
                    drawerStyle: {
                      width: screenWidth * 0.8,
                    },
                    headerStyle: {
                      backgroundColor: theme.colors.background,
                    },
                    headerTintColor: theme.colors.onBackground,
                    headerTitleStyle: styles.headerTitle,
                  }}
                  drawerContent={props => <SidebarContent {...props} />}>
                  <Drawer.Screen
                    name="Chat"
                    component={gestureHandlerRootHOC(ChatScreen)}
                    options={{
                      title: chatTitle,
                      headerRight: () => <HeaderRight />,
                      headerStyle: chatSessionStore.shouldShowHeaderDivider
                        ? styles.headerWithDivider
                        : styles.headerWithoutDivider,
                    }}
                  />
                  <Drawer.Screen
                    name="Models"
                    component={gestureHandlerRootHOC(ModelsScreen)}
                    options={{
                      headerRight: () => <ModelsHeaderRight />,
                      headerStyle: styles.headerWithoutDivider,
                    }}
                  />
                  <Drawer.Screen
                    name="Settings"
                    component={gestureHandlerRootHOC(SettingsScreen)}
                    options={{
                      headerStyle: styles.headerWithoutDivider,
                    }}
                  />
                  <Drawer.Screen
                    name="Benchmark"
                    component={gestureHandlerRootHOC(BenchmarkScreen)}
                    options={{
                      headerStyle: styles.headerWithoutDivider,
                    }}
                  />
                </Drawer.Navigator>
              </NavigationContainer>
            </PaperProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    headerWithoutDivider: {
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
      backgroundColor: theme.colors.background,
    },
    headerWithDivider: {
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      ...theme.fonts.titleSmall,
    },
  });

export default App;
