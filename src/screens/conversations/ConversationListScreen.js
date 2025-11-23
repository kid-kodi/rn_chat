// ConversationList.jsx
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUser } from '../../contexts/UserProvider';
import { navigate } from '../../utils/RootNavigation';
import Navbar from '../../components/Navbar';
import { styles } from './styles';
import Colors from '../../constants/Colors';
import CommonStyles from '../../constants/CommonStyles';
import SearchModal from './components/SearchModal';
import ConversationItem from './components/ConversationItem';
import { EmptyState } from './components/EmptyState';
import { useConversation } from '../../contexts/ConversationProvider';
import { useFocusEffect } from '@react-navigation/native';

export default function ConversationListScreen({ navigation }) {
  const { user } = useUser();
  const { 
    chats, 
    loading, 
    unreadMessages, 
    joinCall, 
    removeChats, 
    refresh 
  } = useConversation();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // ✅ Refresh conversation list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('ConversationListScreen focused, refreshing chats...');
      refresh();
    }, [refresh])
  );

  const footerActions = [
    {
      label: 'Supprimer',
      color: 'red',
      icon: 'trash-outline',
      onPress: async (selectedIds) => {
        await removeChats(selectedIds);
        setSelectedItems([]);
        setSelectionMode(false);
      },
    }
  ]

  // hide bottom tab when selection mode is active
  useLayoutEffect(() => {
    const parent = navigation.getParent?.("myTabs");
    if (parent) {
      parent.setOptions({ 
        tabBarStyle: selectionMode ? { display: 'none' } : undefined 
      });
    }
  }, [navigation, selectionMode]);

  const toggleSelection = useCallback((id) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        const updated = prev.filter((item) => item !== id);
        if (updated.length === 0) setSelectionMode(false);
        return updated;
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handleChatPress = chat => {
    if (selectionMode) {
      toggleSelection(chat._id);
    }
    else {
      navigate('CHAT', { chatId: chat._id })
    }
  };

  const handleLongPress = (id) => {
    setSelectionMode(true);
    setSelectedItems([id]);
  };


  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedItems([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Navbar navigation={navigation} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={Colors.grey} style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>Rechercher...</Text>
        </TouchableOpacity>
      </View>

      {/* New reusable Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        query={searchText}
        onChangeQuery={setSearchText}
        currentSection={`conversations`}
        loading={false} // you can wire real loading later
        onPressFilter={section => console.log(section)}
      />

      {/* Content */}
      {loading ? (
        <View style={CommonStyles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : chats?.length > 0 ? (
        <>
          <FlatList
            data={chats}
            keyExtractor={item => item._id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: selectionMode ? 70 : 0
            }}
            renderItem={({ item }) => (
              <ConversationItem
                chat={item}
                unreadMessages={unreadMessages}
                onPress={handleChatPress}
                onJoinCall={chat => joinCall(chat, navigation, user)}
                unreadCount={item.unreadCount}
                onLongPress={() => handleLongPress(item._id)}
                type={selectionMode ? 'checkbox' : 'default'}
                isChecked={selectedItems.includes(item._id)}
                currentUserId={user._id}
              />
            )}
          />
          {selectionMode && (
            <FooterAction
              selectedCount={selectedItems.length}
              onCancel={handleCancelSelection}
              actions={footerActions.map((action) => ({
                ...action,
                onPress: () => action.onPress(selectedItems),
              }))}
            />
          )}
        </>
      ) : (
        <EmptyState message="Aucune conversation !" />
      )}

      {/* Floating button */}
      {!selectionMode && <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NEWCHAT')}>
        <Icon name="chatbubble-outline" color="#fff" size={25} />
      </TouchableOpacity>}
    </SafeAreaView>
  );
}

function FooterAction({ selectedCount, onCancel, actions }) {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            style={[styles.actionButton]}
          >
            <Icon name={action.icon} color={action.color || Colors.primary } size={25} />
            <Text style={[styles.actionText, {color : action.color || Colors.primary}]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectedCount}>{selectedCount} sélectionné(s)</Text>
    </View>
  );
}
