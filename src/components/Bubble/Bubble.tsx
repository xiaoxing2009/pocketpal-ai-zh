import type {ReactNode} from 'react';
import React, {useContext} from 'react';
import {View, TouchableOpacity, Animated} from 'react-native';

import {Text} from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {useTheme} from '../../hooks';

import {styles} from './styles';

import {UserContext} from '../../utils';
import {MessageType} from '../../utils/types';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const Bubble = ({
  child,
  message,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nextMessageInGroup,
  scale = new Animated.Value(1),
}: {
  child: ReactNode;
  message: MessageType.Any;
  nextMessageInGroup: boolean;
  scale?: Animated.Value;
}) => {
  const theme = useTheme();
  const user = useContext(UserContext);
  const currentUserIsAuthor = user?.id === message.author.id;
  const {copyable, timings} = message.metadata || {};
  const timingsString = `${timings?.predicted_per_token_ms?.toFixed()}ms per token, ${timings?.predicted_per_second?.toFixed(
    2,
  )} tokens per second`;

  const {contentContainer, dateHeaderContainer, dateHeader, iconContainer} =
    styles({
      currentUserIsAuthor,
      message,
      roundBorder: true,
      theme,
    });

  const copyToClipboard = () => {
    if (message.type === 'text') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      Clipboard.setString(message.text.trim());
    }
  };

  return (
    <Animated.View
      style={[
        contentContainer,
        {
          transform: [{scale}],
        },
      ]}>
      {child}
      {timings && (
        <View style={dateHeaderContainer}>
          {copyable && (
            <TouchableOpacity onPress={copyToClipboard}>
              <Icon name="content-copy" style={iconContainer} />
            </TouchableOpacity>
          )}
          {timings && <Text style={dateHeader}>{timingsString}</Text>}
        </View>
      )}
    </Animated.View>
  );
};
