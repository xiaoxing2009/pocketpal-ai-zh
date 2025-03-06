import React from 'react';
import {Image, View} from 'react-native';
import {Button, Text} from 'react-native-paper';
import {observer} from 'mobx-react';

import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {modelStore} from '../../store';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';

interface ChatEmptyPlaceholderProps {
  onSelectModel: () => void;
  bottomComponentHeight: number;
}

export const ChatEmptyPlaceholder = observer(
  ({onSelectModel, bottomComponentHeight}: ChatEmptyPlaceholderProps) => {
    const theme = useTheme();
    const navigation = useNavigation<NavigationProp<any>>();
    const styles = createStyles({theme});

    const hasAvailableModels = modelStore.availableModels.length > 0;
    const hasActiveModel = modelStore.activeModelId !== undefined;

    const getContent = () => {
      if (!hasAvailableModels) {
        return {
          title: 'No Models Available',
          description: 'Download a model to start chatting with PocketPal',
          buttonText: 'Download Model',
          onPress: () => {
            navigation.navigate('Models');
          },
        };
      }

      return {
        title: 'Activate Model To Get Started',
        description:
          'Select the model and download it. After downloading, tap Load next to the model and start chatting.',
        buttonText: 'Select Model',
        onPress: onSelectModel,
      };
    };

    const {title, description, buttonText, onPress} = getContent();

    if (hasActiveModel) {
      return null;
    }
    return (
      <View
        style={[styles.container, {marginBottom: bottomComponentHeight + 100}]}>
        <Image
          source={require('../../assets/pocketpal-dark-v2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Button
          mode="contained"
          onPress={onPress}
          style={styles.button}
          loading={modelStore.isContextLoading}
          disabled={hasActiveModel}>
          {modelStore.isContextLoading ? 'Loading...' : buttonText}
        </Button>
      </View>
    );
  },
);
