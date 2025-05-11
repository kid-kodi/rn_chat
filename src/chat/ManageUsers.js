import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import axiosInstance from '../core/networks/AxiosInstance';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomImageView from '../core/components/CustomImage';
import { BASE_API_URL } from '@env';
import { useUser } from '../core/contexts/UserProvider';

export default function ManageUsers({ route, navigation }) {

  const chat = route.params.chat;
  const [users, setUsers] = useState();
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUsers, setSelectedUsers] = useState(chat.users);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useUser();
  const selectedUsersFlatList = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axiosInstance.get(`/api/users/search?search=${searchTerm}&exclude=${selectedUsers.map((p) => p._id)}`);
      if (response.success) {
        setUsers(response.data);
      }
    };
    fetchUsers();
  }, [searchTerm, selectedUsers]);

  const userPressed = async _user => {
    if (selectedUsers.filter(e => e._id === _user._id).length > 0) {
      setSelectedUsers(current =>
        current.filter(obj => {
          return obj._id !== _user._id;
        }),
      );
    } else {
      setSelectedUsers(oldArray => [...oldArray, _user]);
    }
  };

  const onSave = async () => {
    try {

      setIsLoading(true);
      let usersId = selectedUsers.map(user => user._id);
      usersId.push(user._id);

      const response = await axiosInstance.put(`/api/chats/${chat?._id}`, { users: usersId });
      if(response.success){
        navigation.navigate('CHAT_SETTINGS', { chat : response.chat })
      }
    } catch (error) {
      console.log(error)
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Conversation de groupe</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder="Rechercher..."
        style={styles.searchBar}
        value={searchTerm}
        onChangeText={text => setSearchTerm(text)}
      />

      {/* Selected Participants */}
      <FlatList
        horizontal
        data={selectedUsers}
        keyExtractor={(item) => item._id}
        ref={ref => (selectedUsersFlatList.current = ref)}
        style={styles.participantsList}
        renderItem={({ item }) => (
          <View style={styles.participantItem}>
            <CustomImageView
              source={`${BASE_API_URL}/image/${item.profilePicture}`}
              firstName={item?.fullName}
              size={40}
              fontSize={20}
            />
            <Text style={styles.participantName} numberOfLines={1}>{item.fullName}</Text>
            <TouchableOpacity onPress={() => userPressed(item)} style={styles.removeBtn}>
              <Icon name="close-circle" size={18} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Available Users */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <>
            <TouchableOpacity style={styles.userItem} onPress={() => userPressed(item)}>
              <CustomImageView
                source={`${BASE_API_URL}/image/${item.profilePicture}`}
                firstName={item?.fullName}
                size={40}
                fontSize={20}
              />
              <Text style={styles.fullName}>{item.fullName}</Text>
              <Icon name="person-add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </>
        )}
      />

      <View style={styles.stickyButtonContainer}>
        {!isLoading && <TouchableOpacity style={styles.stickyButton} onPress={onSave}>
          <Text style={styles.stickyButtonText}>Ajouter</Text>
        </TouchableOpacity>}

        {isLoading && <ActivityIndicator />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  participantsList: {
    maxHeight: 100,
    marginBottom: 10,
  },
  participantItem: {
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    width: 70,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  participantName: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  removeBtn: {
    position: 'absolute',
    top: 0,
    right: -6,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fullName: {
    flex: 1,
    fontSize: 16,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  stickyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});