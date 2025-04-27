import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../core/networks/AxiosInstance';
import CustomImageView from '../core/components/CustomImage';
import { BASE_API_URL } from '@env';
import { useUser } from '../core/contexts/UserProvider';
import { useChat } from '../core/contexts/ChatProvider';



export default function NewGroup({ navigation }) {

  const { create, updateChatData, sendTextMessage } = useChat();
  const { searchUsers, user } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUsers, setSelectedUsers] = useState([]);

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

  const onNext = () => {
    navigation.navigate("NEW_GROUP_INFOS", { users: selectedUsers })
  };

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
        showsVerticalScrollIndicator={false}
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
        <TouchableOpacity style={styles.stickyButton} onPress={onNext}>
          <Text style={styles.stickyButtonText}>Suivant</Text>
        </TouchableOpacity>
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