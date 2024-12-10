import * as React from 'react';
import {TextInput, TextInputProps, View, Animated} from 'react-native';

import {observer} from 'mobx-react';
import {IconButton, Text} from 'react-native-paper';

import {useTheme} from '../../hooks';

import {createStyles} from './styles';

import {chatSessionStore} from '../../store';

import {MessageType} from '../../utils/types';
import {L10nContext, unwrap, UserContext} from '../../utils';

import {
  AttachmentButton,
  AttachmentButtonAdditionalProps,
  CircularActivityIndicator,
  CircularActivityIndicatorProps,
  SendButton,
  StopButton,
} from '..';

export interface ChatInputTopLevelProps {
  /** Whether attachment is uploading. Will replace attachment button with a
   * {@link CircularActivityIndicator}. Since we don't have libraries for
   * managing media in dependencies we have no way of knowing if
   * something is uploading so you need to set this manually. */
  isAttachmentUploading?: boolean;
  /** Whether the AI is currently streaming tokens */
  isStreaming?: boolean;
  /** @see {@link AttachmentButtonProps.onPress} */
  onAttachmentPress?: () => void;
  /** Will be called on {@link SendButton} tap. Has {@link MessageType.PartialText} which can
   * be transformed to {@link MessageType.Text} and added to the messages list. */
  onSendPress: (message: MessageType.PartialText) => void;
  onStopPress?: () => void;
  onCancelEdit?: () => void;
  isStopVisible?: boolean;
  /** Controls the visibility behavior of the {@link SendButton} based on the
   * `TextInput` state. Defaults to `editing`. */
  sendButtonVisibilityMode?: 'always' | 'editing';
  textInputProps?: TextInputProps;
}

export interface ChatInputAdditionalProps {
  attachmentButtonProps?: AttachmentButtonAdditionalProps;
  attachmentCircularActivityIndicatorProps?: CircularActivityIndicatorProps;
}

export type ChatInputProps = ChatInputTopLevelProps & ChatInputAdditionalProps;

/** Bottom bar input component with a text input, attachment and
 * send buttons inside. By default hides send button when text input is empty. */
export const ChatInput = observer(
  ({
    attachmentButtonProps,
    attachmentCircularActivityIndicatorProps,
    isAttachmentUploading,
    isStreaming = false,
    onAttachmentPress,
    onSendPress,
    onStopPress,
    onCancelEdit,
    isStopVisible,
    sendButtonVisibilityMode,
    textInputProps,
  }: ChatInputProps) => {
    const l10n = React.useContext(L10nContext);
    const theme = useTheme();
    const user = React.useContext(UserContext);
    const inputRef = React.useRef<TextInput>(null);
    const editBarHeight = React.useRef(new Animated.Value(0)).current;

    // Use `defaultValue` if provided
    const [text, setText] = React.useState(textInputProps?.defaultValue ?? '');
    const isEditMode = chatSessionStore.isEditMode;

    const styles = createStyles({theme, isEditMode});

    const value = textInputProps?.value ?? text;

    React.useEffect(() => {
      if (isEditMode) {
        // Animate edit bar height
        Animated.spring(editBarHeight, {
          toValue: 28,
          useNativeDriver: false,
          friction: 8,
        }).start();
        // Focus input
        inputRef.current?.focus();
      } else {
        Animated.spring(editBarHeight, {
          toValue: 0,
          useNativeDriver: false,
          friction: 8,
        }).start();
        onCancelEdit?.();
      }
    }, [isEditMode, editBarHeight, onCancelEdit]);

    const handleChangeText = (newText: string) => {
      setText(newText);
      textInputProps?.onChangeText?.(newText);
    };

    const handleSend = () => {
      const trimmedValue = value.trim();
      if (trimmedValue) {
        onSendPress({text: trimmedValue, type: 'text'});
        setText('');
      }
    };

    const handleCancel = () => {
      setText('');
      onCancelEdit?.();
    };

    const isSendButtonVisible =
      !isStreaming &&
      !isStopVisible &&
      user &&
      (sendButtonVisibilityMode === 'always' || value.trim());

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          {isEditMode && (
            <Animated.View
              style={[
                styles.editBar,
                {
                  height: editBarHeight,
                },
              ]}>
              <Text variant="labelSmall" style={styles.editBarText}>
                Editing message
              </Text>
              <IconButton
                icon="close"
                size={16}
                onPress={handleCancel}
                style={styles.editBarButton}
                iconColor={theme.colors.onSurfaceVariant}
              />
            </Animated.View>
          )}
          <View style={styles.inputRow}>
            {user &&
              (isAttachmentUploading ? (
                <CircularActivityIndicator
                  {...{
                    ...attachmentCircularActivityIndicatorProps,
                    color: theme.colors.onSurface,
                    style: styles.marginRight,
                  }}
                />
              ) : (
                !!onAttachmentPress && (
                  <AttachmentButton
                    {...unwrap(attachmentButtonProps)}
                    onPress={onAttachmentPress}
                  />
                )
              ))}
            <TextInput
              ref={inputRef}
              multiline
              placeholder={l10n.inputPlaceholder}
              placeholderTextColor={theme.colors.inverseTextSecondary}
              underlineColorAndroid="transparent"
              {...textInputProps}
              style={[styles.input, textInputProps?.style]}
              onChangeText={handleChangeText}
              value={value}
            />
            {isSendButtonVisible ? <SendButton onPress={handleSend} /> : null}
            {isStopVisible && <StopButton onPress={onStopPress} />}
          </View>
        </View>
      </View>
    );
  },
);
