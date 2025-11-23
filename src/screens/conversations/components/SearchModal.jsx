// components/SearchModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { debounce } from 'lodash';
import Colors from '../../../constants/Colors';
import CommonStyles from '../../../constants/CommonStyles';
import SearchInput from './SearchInput';
import SearchResultSection from './SearchResultSection';
import { useApi } from '../../../contexts/ApiProvider';
import { useUser } from '../../../contexts/UserProvider';
import { navigate } from '../../../utils/RootNavigation';

export default function SearchModal({
  visible,
  onClose,
  query,
  onChangeQuery,
  loading = false,
}) {
  const api = useApi();
  const { user } = useUser();
  const [results, setResults] = useState([]);

  const performSearch = useCallback(
    debounce(async text => {
      if (!text.trim()) return setResults([]);
      const res = await api.get(`/api/search?q=${encodeURIComponent(text)}`);
      if (res.success) setResults(res.data);
    }, 400),
    [api]
  );

  const onPressFilter = useCallback(({ key, data }) => {

    switch (data.type) {
      case "conversations":
        // open chat
        onClose();
        onChangeQuery("");
        navigate("CHAT", { chatId: data.id });
        break;

      case "messages":
        // open chat and scroll to message (if supported)
        onClose();
        onChangeQuery("");
        navigate("CHAT", {
          chatId: data.chatId,
          highlightMessageId: data.id,
        });
        break;

      case "contacts":
        // open user profile or start new chat
        onClose();
        onChangeQuery("");
        navigate("CHAT", {
          newChat: { participants: [data.id, user._id] },
        });
        break;

      default:
        onClose();
        onChangeQuery("");
        console.warn("Unknown section:", key);
        break;
    }

  }, [])

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Icon name="arrow-left" size={22} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rechercher</Text>
          </View>

          {/* Search input */}
          <SearchInput
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Tapez un nom, message, ou groupe..."
          />

          {/* Loading state */}
          {loading ? (
            <View style={CommonStyles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : results?.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <SearchResultSection
                  key={item.key}
                  title={item.title}
                  data={item.data}
                  onPressFilter={onPressFilter}
                />
              )}
            />
          ) : (
            <View style={CommonStyles.center}>
              <Icon name="search" size={45} color={Colors.lightGrey} />
              <Text style={styles.noResultsText}>
                Aucun résultat trouvé pour "{query}"
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    height: '95%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    height: 50
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  noResultsText: {
    marginTop: 10,
    color: Colors.grey,
  },
};
