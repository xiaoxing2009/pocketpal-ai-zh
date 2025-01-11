import React, {useState, useEffect} from 'react';
import {Keyboard, Platform, TouchableOpacity, View} from 'react-native';

import {observer} from 'mobx-react';
import {Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {BottomSheetFlatList, BottomSheetView} from '@gorhom/bottom-sheet';

import {Divider, Searchbar} from '../../../../components';

import {useTheme} from '../../../../hooks';

import {createStyles} from './styles';

import {hfStore} from '../../../../store';

import {HuggingFaceModel} from '../../../../utils/types';
import {extractHFModelTitle, formatNumber, timeAgo} from '../../../../utils';

interface SearchViewProps {
  testID?: string;
  onModelSelect: (model: HuggingFaceModel) => void;
  onChangeSearchQuery: (query: string) => void;
}

export const SearchView = observer(
  ({testID, onModelSelect, onChangeSearchQuery}: SearchViewProps) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
      const keyboardWillShow = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        () => setKeyboardVisible(true),
      );
      const keyboardWillHide = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => setKeyboardVisible(false),
      );

      return () => {
        keyboardWillShow.remove();
        keyboardWillHide.remove();
      };
    }, []);

    const styles = createStyles(theme, keyboardVisible ? 0 : insets.bottom);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (query: string) => {
      setSearchQuery(query);
      onChangeSearchQuery(query);
    };

    const renderItem = ({item}: {item: HuggingFaceModel}) => (
      <TouchableOpacity key={item.id} onPress={() => onModelSelect(item)}>
        <Text variant="labelMedium" style={styles.modelAuthor}>
          {item.author}
        </Text>
        <Text style={styles.modelName}>{extractHFModelTitle(item.id)}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon
              name="clock-outline"
              size={12}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="labelSmall" style={styles.statText}>
              {timeAgo(item.lastModified, '', ' ago')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon
              name="download-outline"
              size={12}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="labelSmall" style={styles.statText}>
              {formatNumber(item.downloads)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon
              name="heart-outline"
              size={12}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="labelSmall" style={styles.statText}>
              {formatNumber(item.likes)}
            </Text>
          </View>
        </View>
        <Divider style={styles.divider} />
      </TouchableOpacity>
    );

    return (
      <BottomSheetView style={styles.contentContainer} testID={testID}>
        <BottomSheetFlatList
          data={hfStore.models}
          keyExtractor={(item: HuggingFaceModel) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          renderScrollComponent={props => (
            <KeyboardAwareScrollView bottomOffset={100} {...props} />
          )}
          onEndReached={() => {
            hfStore.fetchMoreModels();
          }}
          onEndReachedThreshold={0.3}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          ListEmptyComponent={
            !hfStore.isLoading && searchQuery.length > 0 ? (
              <Text style={styles.noResultsText}>No models found</Text>
            ) : null
          }
          ListFooterComponent={() =>
            hfStore.isLoading ? (
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            ) : null
          }
        />
        <Searchbar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search Hugging Face models"
          containerStyle={styles.searchbarContainer}
        />
      </BottomSheetView>
    );
  },
);
