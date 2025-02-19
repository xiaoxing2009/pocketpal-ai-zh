import React, {useRef, useEffect} from 'react';
import {Alert, Dimensions, View, FlatList, Pressable} from 'react-native';
import {observer} from 'mobx-react';
import {Text} from 'react-native-paper';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

import {useTheme} from '../../hooks';
import {createStyles} from './styles';
import {modelStore} from '../../store/ModelStore';
import {palStore} from '../../store/PalStore';
import {chatSessionStore} from '../../store/ChatSessionStore';
import {CustomBackdrop} from '../Sheet/CustomBackdrop';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CloseIcon} from '../../assets/icons';

type Tab = 'models' | 'pals';

interface ChatPalModelPickerSheetProps {
  isVisible: boolean;
  chatInputHeight: number;
  onClose: () => void;
  onModelSelect?: (modelId: string) => void;
  onPalSelect?: (palId: string | undefined) => void;
}

const TABS: {id: Tab; label: string}[] = [
  {id: 'models', label: 'Models'},
  {id: 'pals', label: 'Pals'},
];

export const ChatPalModelPickerSheet = observer(
  ({
    isVisible,
    onClose,
    onModelSelect,
    onPalSelect,
    chatInputHeight,
  }: ChatPalModelPickerSheetProps) => {
    const [activeTab, setActiveTab] = React.useState<Tab>('models');
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const styles = createStyles({theme});
    const bottomSheetRef = useRef<BottomSheet>(null);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
      if (isVisible) {
        bottomSheetRef.current?.expand();
      } else {
        bottomSheetRef.current?.close();
      }
    }, [isVisible]);

    const handleTabPress = (tab: Tab, index: number) => {
      setActiveTab(tab);
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    };

    const renderTab = (tab: Tab, label: string, index: number) => (
      <Pressable
        key={tab}
        style={[styles.tab, activeTab === tab && styles.activeTab]}
        onPress={() => handleTabPress(tab, index)}>
        <Text
          style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
          {label}
        </Text>
      </Pressable>
    );

    const handleModelSelect = async (
      model: (typeof modelStore.availableModels)[0],
    ) => {
      try {
        onModelSelect?.(model.id);
        onClose();
        modelStore.initContext(model);
      } catch (e) {
        console.log(`Error: ${e}`);
      }
    };

    const handlePalSelect = (pal: (typeof palStore.pals)[0] | undefined) => {
      chatSessionStore.setActivePal(pal?.id);
      if (
        pal?.defaultModel &&
        modelStore.activeModel &&
        pal.defaultModel?.id !== modelStore.activeModelId
      ) {
        const palDefaultModel = modelStore.availableModels.find(
          m => m.id === pal.defaultModel?.id,
        );
        if (palDefaultModel) {
          Alert.alert(
            'Confirmation',
            `This pal has a different default model (${palDefaultModel.name}). Would you like to switch to the pal's default model?`,
            [
              {
                text: 'Keep',
                style: 'cancel',
              },
              {
                text: 'Switch',
                onPress: () => {
                  modelStore.initContext(palDefaultModel);
                },
              },
            ],
          );
        }
      }
      onPalSelect?.(pal?.id);
      onClose();
    };

    const renderDisablePalItem = () => {
      const noActivePal = !chatSessionStore.activePalId;
      if (noActivePal) {
        return null;
      }
      return (
        <Pressable
          key="disable-pal"
          style={styles.listItem}
          onPress={() => handlePalSelect(undefined)}>
          <CloseIcon stroke={theme.colors.onSurface} />
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>No Pal</Text>
            <Text style={styles.itemSubtitle}>Disable active pal</Text>
          </View>
        </Pressable>
      );
    };

    const renderModelItem = (model: (typeof modelStore.availableModels)[0]) => {
      const isActiveModel = model.id === modelStore.activeModelId;
      return (
        <Pressable
          key={model.id}
          style={[styles.listItem, isActiveModel && styles.activeListItem]}
          onPress={() => handleModelSelect(model)}>
          <View style={styles.itemContent}>
            <Text
              style={[
                styles.itemTitle,
                isActiveModel && styles.activeItemTitle,
              ]}>
              {model.name}
            </Text>
            <Text
              style={[
                styles.itemSubtitle,
                isActiveModel && styles.activeItemSubtitle,
              ]}>
              {model.description || 'No description'}
            </Text>
          </View>
        </Pressable>
      );
    };

    const renderPalItem = (pal: (typeof palStore.pals)[0]) => {
      const isActivePal = pal.id === chatSessionStore.activePalId;
      return (
        <Pressable
          key={pal.id}
          style={[styles.listItem, isActivePal && styles.activeListItem]}
          onPress={() => handlePalSelect(pal)}>
          <View style={styles.itemContent}>
            <Text
              style={[styles.itemTitle, isActivePal && styles.activeItemTitle]}>
              {pal.name}
            </Text>
            <Text
              style={[
                styles.itemSubtitle,
                isActivePal && styles.activeItemSubtitle,
              ]}>
              {pal.palType === 'assistant' ? 'Assistant' : 'Roleplay'}
            </Text>
          </View>
        </Pressable>
      );
    };

    const renderContent = ({item}: {item: (typeof TABS)[0]}) => (
      <View style={{width: Dimensions.get('window').width}}>
        <ScrollView
          contentContainerStyle={{paddingBottom: chatInputHeight + 66}}>
          {item.id === 'models'
            ? modelStore.availableModels.map(renderModelItem)
            : [renderDisablePalItem(), ...palStore.pals.map(renderPalItem)]}
        </ScrollView>
      </View>
    );

    const onViewableItemsChanged = React.useCallback(
      ({viewableItems}: {viewableItems: any[]}) => {
        if (viewableItems[0]) {
          setActiveTab(viewableItems[0].item.id);
        }
      },
      [],
    );

    const viewabilityConfig = React.useRef({
      itemVisiblePercentThreshold: 50,
    }).current;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        onClose={onClose}
        enablePanDownToClose
        enableDynamicSizing
        backdropComponent={CustomBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.background,
        }}
        maxDynamicContentSize={
          Dimensions.get('screen').height - insets.top - 16
        }
        handleIndicatorStyle={{
          backgroundColor: theme.colors.primary,
        }}>
        <BottomSheetView>
          <View style={styles.tabs}>
            {TABS.map((tab, index) => renderTab(tab.id, tab.label, index))}
          </View>
          <FlatList
            ref={flatListRef}
            data={TABS}
            renderItem={renderContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
