import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Animated,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { activeChats, archivedChats, notifications } from './mock/Data';
import Colors from '../core/constants/Colors';

const ChatListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [filterVisible, setFilterVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    unreadOnly: false,
    groupsOnly: false,
    sortBy: 'recent', // 'recent' or 'unread'
  });

  // Apply filters to chat list
  const getFilteredChats = () => {
    let filteredList = activeTab === 'chats' ? activeChats : archivedChats;

    if (filters.unreadOnly) {
      filteredList = filteredList.filter(chat => chat.unread > 0);
    }

    if (filters.groupsOnly) {
      filteredList = filteredList.filter(chat => chat.isGroup);
    }

    if (searchQuery) {
      filteredList = filteredList.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.sortBy === 'unread') {
      filteredList = [...filteredList].sort((a, b) => b.unread - a.unread);
    }

    return filteredList;
  };

  // Toggle filter
  const toggleFilter = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };

  // Set sort method
  const setSortMethod = (method) => {
    setFilters({
      ...filters,
      sortBy: method
    });
  };

  // Render chat item
  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, name: item.name })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.isGroup && (
          <View style={styles.groupIndicator}>
            <Text style={styles.groupCount}>{item.participants}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[styles.chatMessage, item.unread > 0 && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.customHeaderInfo} onPress={() => setShowProfile(true)}>
          <View style={styles.avatarStatusContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }} // Replace with your user avatar
              style={styles.headerAvatar}
            />
            <View style={styles.statusDot} />
          </View>
          <View>
            <Text style={styles.customHeaderInfoPrimary}>Kone Dangui Ismael</Text>
            <Text style={styles.customHeaderInfoSecondary}>partagez votre activité</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowNotifications(true)}>
          <Ionicons name="notifications-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Profile</Text>
            {/* Replace with your real profile info */}
            <Text>Name: John Doe</Text>
            <Text>Email: john.doe@example.com</Text>
            <TouchableOpacity onPress={() => setShowProfile(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications</Text>
            {notifications.map(notif => (
              <Text key={notif.id} style={styles.notificationItem}>{notif.title}</Text>
            ))}
            <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <Text style={styles.searchInput}>Rechercher</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFilterVisible(!filterVisible)}
          >
            <Ionicons name="filter" size={20} color={Colors.textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Panel */}
      {filterVisible && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filters</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, filters.unreadOnly && styles.filterOptionActive]}
              onPress={() => toggleFilter('unreadOnly')}
            >
              <Text style={[styles.filterText, filters.unreadOnly && styles.filterTextActive]}>
                Unread Only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, filters.groupsOnly && styles.filterOptionActive]}
              onPress={() => toggleFilter('groupsOnly')}
            >
              <Text style={[styles.filterText, filters.groupsOnly && styles.filterTextActive]}>
                Groups Only
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.filterTitle}>Sort By</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, filters.sortBy === 'recent' && styles.filterOptionActive]}
              onPress={() => setSortMethod('recent')}
            >
              <Text style={[styles.filterText, filters.sortBy === 'recent' && styles.filterTextActive]}>
                Most Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterOption, filters.sortBy === 'unread' && styles.filterOptionActive]}
              onPress={() => setSortMethod('unread')}
            >
              <Text style={[styles.filterText, filters.sortBy === 'unread' && styles.filterTextActive]}>
                Unread First
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Chat List */}
      <FlatList
        data={getFilteredChats()}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No chats found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewChat')}
      >
        <Ionicons name="chatbubble" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  customHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  },
  customHeaderInfoPrimary: {
    fontSize: 14,
    color: Colors.textColor,
    fontWeight: "bold"
  },
  customHeaderInfoSecondary: {
    fontSize: 14,
    color: Colors.secondaryTextColor
  },
  avatarStatusContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 5
  },
  searchInputContainer: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
    flex: 1
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.extraLightGrey,
    height: 44,
    width: 44,
    borderRadius: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textColor,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.grey,
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  filterPanel: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  filterOptions: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterOptionActive: {
    backgroundColor: '#5b37b7',
  },
  filterText: {
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  chatList: {
    paddingBottom: 80,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5b37b7',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '500',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#5b37b7',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default ChatListScreen;