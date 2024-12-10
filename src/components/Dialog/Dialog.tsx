import React, {ReactNode} from 'react';
import {
  ViewStyle,
  ScrollView,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
  TextInput,
  Dimensions,
  View,
} from 'react-native';

import {Button, Portal, Dialog as PaperDialog} from 'react-native-paper';

import {useTheme} from '../../hooks';

import {createStyles} from './styles';

export interface DialogAction {
  label: string;
  onPress: () => void;
  mode?: 'text' | 'contained' | 'outlined';
}

interface CustomDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: ReactNode;
  actions?: DialogAction[];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollAreaStyle?: ViewStyle;
  scrollable?: boolean;
  dismissableBackButton?: boolean;
  dismissable?: boolean;
  avoidKeyboard?: boolean;
}

export const Dialog: React.FC<CustomDialogProps> = ({
  visible,
  onDismiss,
  title,
  children,
  actions = [],
  style,
  contentStyle,
  scrollAreaStyle,
  scrollable = false,
  dismissableBackButton = true,
  dismissable = true,
  avoidKeyboard = false,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [bottom, setBottom] = React.useState(0);

  React.useEffect(() => {
    if (!avoidKeyboard || !visible) {
      return;
    }

    function onKeyboardChange(e) {
      if (Platform.OS === 'ios') {
        const keyboardHeight = e.endCoordinates.height;
        const keyboardY = e.endCoordinates.screenY;

        // Get the currently focused input
        const currentlyFocusedInput = TextInput.State.currentlyFocusedInput();
        if (currentlyFocusedInput) {
          currentlyFocusedInput.measure((x, y, width, height, pageX, pageY) => {
            const inputBottom = pageY + height;
            // Only adjust if the input is actually covered by keyboard
            if (inputBottom > keyboardY) {
              setBottom(keyboardHeight / 2);
            } else {
              setBottom(0);
            }
          });
        } else {
          setBottom(0);
        }
      } else {
        // Android
        if (e.eventType === 'keyboardDidShow') {
          const keyboardHeight = e.endCoordinates.height;
          const currentlyFocusedInput = TextInput.State.currentlyFocusedInput();
          if (currentlyFocusedInput) {
            currentlyFocusedInput.measure(
              (x, y, width, height, pageX, pageY) => {
                const windowHeight = Dimensions.get('window').height;
                const inputBottom = pageY + height;
                const keyboardY = windowHeight - keyboardHeight;

                if (inputBottom > keyboardY) {
                  setBottom(keyboardHeight / 2);
                } else {
                  setBottom(0);
                }
              },
            );
          } else {
            setBottom(0);
          }
        } else {
          setBottom(0);
        }
      }
    }

    if (Platform.OS === 'ios') {
      const subscription = Keyboard.addListener(
        'keyboardWillChangeFrame',
        onKeyboardChange,
      );
      return () => subscription.remove();
    }

    const subscriptions = [
      Keyboard.addListener('keyboardDidHide', onKeyboardChange),
      Keyboard.addListener('keyboardDidShow', onKeyboardChange),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }, [avoidKeyboard, visible]);

  const content = scrollable ? (
    <PaperDialog.ScrollArea style={[styles.dialogContent, contentStyle]}>
      <ScrollView
        style={[styles.dialogScrollArea, scrollAreaStyle]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        {children}
      </ScrollView>
    </PaperDialog.ScrollArea>
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <PaperDialog.Content style={[styles.dialogContent, contentStyle]}>
        {children}
      </PaperDialog.Content>
    </TouchableWithoutFeedback>
  );

  return (
    <Portal>
      <PaperDialog
        dismissableBackButton={dismissableBackButton}
        dismissable={dismissable}
        visible={visible}
        onDismiss={onDismiss}
        style={[styles.dialog, style]}>
        <PaperDialog.Title style={styles.dialogTitle}>
          {title}
        </PaperDialog.Title>
        <View style={[avoidKeyboard && {bottom}]}>
          {content}
          {actions.length > 0 && (
            <PaperDialog.Actions style={styles.actionsContainer}>
              {actions.map(action => (
                <Button
                  key={action.label}
                  mode={action.mode || 'text'}
                  onPress={action.onPress}
                  style={styles.dialogActionButton}>
                  {action.label}
                </Button>
              ))}
            </PaperDialog.Actions>
          )}
        </View>
      </PaperDialog>
    </Portal>
  );
};
