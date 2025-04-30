import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../core/constants/Colors';

const Item = ({ icon, text, func }) => {
  return (
    <TouchableOpacity
      onPress={func}
      style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.extraLightGrey }}>
      <Ionicons name={icon} size={23} color={Colors.textColor} />
      <Text style={{ fontSize: 15, textAlign: 'left', marginLeft: 20, color: Colors.textColor }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const ProfileScreen = ({ route, navigation }) => {
  // Normally you'd get this from route.params or a data store
  // const { contactId } = route.params;

  // Sample contact data - replace with your actual data source
  const [contact, setContact] = useState({
    id: '1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    status: 'online',
    phoneNumber: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    username: '@johndoe',
    bio: 'Software developer, hiking enthusiast, and amateur chef.',
    lastSeen: 'Today at 2:30 PM',
    isMuted: false,
    isBlocked: false,
    isStarred: true,
    sharedMedia: 24,
    sharedFiles: 8,
    sharedLinks: 12,
  });

  const [isMuted, setIsMuted] = useState(contact.isMuted);
  const [isBlocked, setIsBlocked] = useState(contact.isBlocked);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleBlock = () => {
    if (!isBlocked) {
      Alert.alert(
        "Block Contact",
        `Are you sure you want to block ${contact.name}? They won't be able to send you messages.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            style: "destructive",
            onPress: () => setIsBlocked(true)
          }
        ]
      );
    } else {
      setIsBlocked(false);
    }
  };

  const handleStartChat = () => {
    // Navigate to chat screen with this contact
    console.log('Starting chat with:', contact.name);
    // navigation.navigate('ChatScreen', { contactId: contact.id });
  };

  const handleDeleteContact = () => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to delete ${contact.name} from your contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log('Contact deleted:', contact.name);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderStatusIndicator = (status) => {
    const statusColors = {
      online: '#4CAF50',
      offline: '#9E9E9E',
      away: '#FFC107',
    };

    return (
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: statusColors[status] || '#9E9E9E' }
          ]}
        />
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: contact.avatar }}
            style={styles.avatar}
          />
          <Text style={styles.contactName}>{contact.name}</Text>
          {renderStatusIndicator(contact.status)}
          <Text style={styles.lastSeen}>{contact.lastSeen}</Text>
        </View>

        <View style={styles.infoSection}>
          <Item
            icon={'chatbubble-outline'}
            text={'Envoyer un message'}
            func={() => {
              navigation.navigate('CHAT', { userId: 1 });
            }}
          />
          <Item
            icon="call-outline"
            text={'Lancer un appel'}
            func={() => {
              navigation.navigate('CALL', { userId: 1 });
            }}
          />
          <Item
            icon="videocam-outline"
            text={'Lancer un appel vidéo'}
            func={() => {
              navigation.navigate('CALL', { userId: 1 });
            }}
          />
          <Item
            icon={'search-outline'}
            text={'Rechercher dans la conversation'}
            func={() => {
              navigation.navigate('CALL', { userId: 1 });
            }}
          />
          <Item
            icon={'share-social-outline'}
            text={'Partager le conversation'}
            func={() => {
              navigation.navigate('CALL', { userId: 1 });
            }}
          />
        </View>


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  contactName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  lastSeen: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5F77F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333333',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
  },
  bioContainer: {
    marginTop: 16,
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  mediaSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mediaIcon: {
    marginRight: 16,
  },
  mediaText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  mediaCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginRight: 8,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  deleteButton: {
    margin: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});

export default ProfileScreen;