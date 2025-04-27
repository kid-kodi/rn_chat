import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../core/networks/AxiosInstance';
import CustomImageView from '../core/components/CustomImage';
import { BASE_API_URL } from '@env';
import { useUser } from '../core/contexts/UserProvider';
import { useSocket } from '../core/contexts/SocketProvider';
import { useChat } from '../core/contexts/ChatProvider';

export default function NewChat() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState();

  const socket = useSocket();
  const { create } = useChat();
  const { user } = useUser();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axiosInstance.get(`/api/users/search?search=${search}`);
      if (response.success) {
        setFilteredUsers(response.data);
      }
    };
    fetchUsers();
  }, [search]);


  const userPressed = async _user => {
    navigation.navigate('CHAT', {
      userId: _user._id,
    });
  };
  // const userPressed = async _user => {
  //   const chatUsers = [_user._id, user._id];
  //   const response = await create(chatUsers, '', false);
  //   if (response.success) {
  //     socket.emit('new_chat', { room: response.data, userId: _user._id });
  //     navigation.navigate('CHAT', {
  //       chatId: response.data._id,
  //     });
  //   }
  // };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => userPressed(item)}
    >
      <CustomImageView
        source={`${BASE_API_URL}/image/${item.profilePicture}`}
        firstName={item?.fullName}
        size={40}
        fontSize={20}
      />
      <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Conversation</Text>
      </View>

      {/* Search Input */}
      <TextInput
        placeholder="Rechercher un utilisateur"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {/* New Group Conversation */}
      <TouchableOpacity
        style={styles.groupButton}
        onPress={() => navigation.navigate('NEW_GROUP_PARTICIPANTS')}
      >
        <Icon name="people-outline" size={20} color="#000" style={{ marginRight: 10 }} />
        <Text style={styles.groupText}>Nouvelle conversation de groupe</Text>
      </TouchableOpacity>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item._id}
        renderItem={renderUser}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
        }
        showsVerticalScrollIndicator={false}
      />
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  groupText: {
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
})