import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { allContacts, notifications } from './mock/Data';
import Colors from '../core/constants/Colors';

const ContactListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle contact actions
  const handleContactPress = (contact) => {
    if (contact.isGroup) {
      navigation.navigate('GroupInfo', { groupId: contact.id });
    } else {
      navigation.navigate('ContactProfile', { contactId: contact.id });
    }
  };

  const handleMessagePress = (contact) => {
    navigation.navigate('ChatDetail', { chatId: contact.id, name: contact.name });
  };

  const handleCallPress = (contact) => {
    Alert.alert(
      'Choose Call Type',
      `Call ${contact.name}`,
      [
        { text: 'Audio Call', onPress: () => console.log('Audio call to', contact.name) },
        { text: 'Video Call', onPress: () => console.log('Video call to', contact.name) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Filter and section contacts based on search query
  const getFilteredAndSectionedContacts = () => {
    // Filter contacts based on search query
    const filteredContacts = allContacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (searchQuery) {
      // If there's a search query, just return the filtered contacts without sections
      return [{ title: 'Search Results', data: filteredContacts }];
    }

    // Get favorites
    const favorites = filteredContacts.filter(contact => contact.favorite);

    // Group the rest alphabetically
    const contactsByLetter = {};

    filteredContacts.forEach(contact => {
      if (!contact.favorite) { // Skip favorites as they're in their own section
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!contactsByLetter[firstLetter]) {
          contactsByLetter[firstLetter] = [];
        }
        contactsByLetter[firstLetter].push(contact);
      }
    });

    // Create sections
    const sections = [];

    // Add favorites section if there are any favorites
    if (favorites.length > 0) {
      sections.push({ title: 'Favorites', data: favorites });
    }

    // Add alphabetical sections
    Object.keys(contactsByLetter).sort().forEach(letter => {
      sections.push({ title: letter, data: contactsByLetter[letter] });
    });

    return sections;
  };

  // Render contact item
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && !item.isGroup && <View style={styles.onlineIndicator} />}
        {item.isGroup && (
          <View style={styles.groupIndicator}>
            <Text style={styles.groupCount}>{item.members}</Text>
          </View>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {!item.isGroup && (
          <Text style={styles.contactPhone}>{item.phone}</Text>
        )}
        {item.isGroup && (
          <Text style={styles.contactPhone}>{item.members} members</Text>
        )}
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleMessagePress(item)}
        >
          <Ionicons name="chatbubble" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCallPress(item)}
        >
          <Ionicons name="call" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
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

      {/* Contact List */}
      <SectionList
        sections={getFilteredAndSectionedContacts()}
        renderItem={renderContactItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contactList}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No contacts found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Add contacts to get started'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewContact')}
      >
        <Ionicons name="person-add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Alphabetical Index (simplified) */}
      {!searchQuery && (
        <View style={styles.alphabetIndex}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.indexItem}
            >
              <Text style={styles.indexText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  contactList: {
    paddingBottom: 80,
  },
  sectionHeader: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  contactItem: {
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
    backgroundColor: Colors.primary,
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
  contactInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 90,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
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
  alphabetIndex: {
    position: 'absolute',
    right: 5,
    top: 140,
    bottom: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexItem: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default ContactListScreen;