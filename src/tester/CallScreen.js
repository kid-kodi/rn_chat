import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../core/constants/Colors';
import { callsData, notifications } from './mock/Data';

const CallsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filterVisible, setFilterVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get filtered calls based on active tab and search query
  const getFilteredCalls = () => {
    let filteredList = callsData;

    if (activeTab === 'missed') {
      filteredList = filteredList.filter(call => call.missed);
    }

    if (searchQuery) {
      filteredList = filteredList.filter(call =>
        call.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredList;
  };

  // Handle call action
  const handleCall = (contact, callType) => {
    Alert.alert(
      `Initiating ${callType} call`,
      `Calling ${contact.name}...`,
      [{ text: 'OK' }]
    );
    // In a real app, you would integrate with a calling API here
  };

  // Handle call item press
  const handleCallPress = (call) => {
    // Show call details or call back
    if (call.isGroup) {
      navigation.navigate('GroupCallDetails', { callId: call.id });
    } else {
      navigation.navigate('ContactProfile', { contactId: call.id });
    }
  };

  // Render call item
  const renderCallItem = ({ item }) => (
    <TouchableOpacity
      style={styles.callItem}
      onPress={() => handleCallPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isGroup && (
          <View style={styles.groupIndicator}>
            <Text style={styles.groupCount}>{item.participants}</Text>
          </View>
        )}
      </View>
      <View style={styles.callContent}>
        <View style={styles.callHeader}>
          <Text style={styles.callName}>{item.name}</Text>
          <View style={styles.callActions}>
            <TouchableOpacity
              style={styles.callActionButton}
              onPress={() => handleCall(item, 'audio')}
            >
              <Ionicons name="call" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.callActionButton}
              onPress={() => handleCall(item, 'video')}
            >
              <Ionicons name="videocam" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.callDetails}>
          <View style={styles.callTypeContainer}>
            <Ionicons
              name={item.type === 'incoming' ? 'call-received' :
                item.type === 'outgoing' ? 'call-made' : 'call-missed'}
              size={14}
              color={item.missed ? '#e74c3c' : '#777'}
              style={styles.callTypeIcon}
            />
            <Ionicons
              name={item.callType === 'audio' ? 'call' : 'videocam'}
              size={14}
              color="#777"
              style={styles.callTypeIcon}
            />
          </View>
          <Text style={styles.callTime}>
            {item.date} • {item.time}
            {!item.missed && ` • ${item.duration}`}
          </Text>
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

      {/* Call History List */}
      <FlatList
        data={getFilteredCalls()}
        renderItem={renderCallItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.callList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="call-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No calls found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : activeTab === 'missed' ? 'No missed calls' : 'Your call history will appear here'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewCall')}
      >
        <Ionicons name="call" size={24} color="#fff" />
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
  callList: {
    paddingBottom: 80,
  },
  callItem: {
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
  callContent: {
    flex: 1,
    marginLeft: 15,
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  callName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  callActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  callTypeIcon: {
    marginRight: 4,
  },
  callTime: {
    fontSize: 12,
    color: '#777',
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

export default CallsScreen;