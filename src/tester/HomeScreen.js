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
  ScrollView,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../core/constants/Colors';
import { notifications, onlineFriends, recentChats } from './mock/Data';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  

  // Render item for recent chats
  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('CHAT', { chatId: item.id, name: item.name })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.unread > 0 && (
          <View style={styles.onlineIndicator}>
            <Text style={styles.unreadCount}>{item.unread}</Text>
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text
          style={[styles.chatMessage, item.unread > 0 && styles.unreadMessage]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render item for online friends
  const renderOnlineFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.onlineFriendContainer}
      onPress={() => navigation.navigate('PROFILE', { chatId: item.id, name: item.name })}
    >
      <View style={styles.onlineFriendAvatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.onlineFriendAvatar} />
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.onlineFriendName} numberOfLines={1}>{item.name}</Text>
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

      {/* Search Bar */}
      <View style={styles.searchContainer} onPress={() => navigation.navigate('SEARCH')}>
        <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
        <Text style={styles.searchInput}>Rechercher</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>En ligne</Text>
        <FlatList
          horizontal
          data={onlineFriends}
          renderItem={renderOnlineFriend}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.onlineFriendsListContainer}
        />

        <View style={styles.recentChatsContainer}>
          <Text style={styles.sectionTitle}>Conversations récentes</Text>
          <FlatList
            data={recentChats}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

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
    gap:20
  },
  customHeaderInfoPrimary: {
    fontSize: 14,
    color: Colors.textColor,
    fontWeight : "bold"
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
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 44,
    marginHorizontal: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  onlineFriendsListContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  onlineFriendContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 65,
  },
  onlineFriendAvatarContainer: {
    position: 'relative',
  },
  onlineFriendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#5b37b7',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  onlineFriendName: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  recentChatsContainer: {
    marginTop: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 1,
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
    top: -5,
    right: -5,
    backgroundColor: '#5b37b7',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadCount: {
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
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.primary,
  },
  notificationItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

export default HomeScreen;
