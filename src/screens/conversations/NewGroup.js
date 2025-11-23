import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../../utils/AxiosInstance';
import CustomImageView from '../../components/CustomImage';
import DataItem from '../../components/DataItem';
import Colors from '../../assets/styles/Colors';
import { BASE_API_URL } from '@env';
import { useUser } from '../../contexts/UserProvider';
import { useChat } from '../../contexts/ChatProvider';
import { SafeAreaView } from 'react-native';



export default function NewGroup({ navigation }) {

  // const { create, updateChatData, sendTextMessage } = useChat();
  // const { searchUsers, user } = useUser();

  // const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  // const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUsers, setSelectedUsers] = useState([]);

  const selectedUsersFlatList = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axiosInstance.get(
        `/api/users/search?search=${searchTerm}&exclude=${selectedUsers.map((p) => p._id)}`);
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Conversation de groupe</Text>
      </View>

      <View style={styles.main}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={Colors.grey} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Rechercher..."
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={text => setSearchTerm(text)}
              placeholderTextColor={Colors.grey}
            />
          </View>
        </View>

        {/* Selected Participants */}
        {selectedUsers.length > 0 ? (
          <View style={[styles.participantsList, selectedUsers.length === 0 && styles.participantsListEmpty]}>
            <FlatList
              horizontal
              data={selectedUsers}
              keyExtractor={(item) => item._id}
              ref={ref => (selectedUsersFlatList.current = ref)}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  <CustomImageView
                    source={`${BASE_API_URL}/image/${item.profilePicture}`}
                    firstName={item?.fullName}
                    size={32}
                    fontSize={20}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>{item.fullName}</Text>
                  <TouchableOpacity onPress={() => userPressed(item)} style={styles.removeBtn}>
                    <Icon name="close-circle" size={18} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ) : (
          <Text style={styles.placeholderText}>Sélectionnez des participants</Text>
        )}

        {/* Available Users */}
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedUsers.some(u => u._id === item._id);
            return (
              <DataItem
                title={item.fullName}
                subTitle={item.about || ''}
                image={item.profilePicture}
                type="checkbox"
                isChecked={isSelected}
                checkboxRight={true}
                onPress={() => userPressed(item)}
              />
            );
          }}
        />
      </View>



      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity style={styles.stickyButton} onPress={onNext}>
          <Text style={styles.stickyButtonText}>Suivant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  main: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 5
  },
  searchInputContainer: {
    backgroundColor: "#eee",
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 35,
    flex: 1
  },
  searchInput: {
    flex: 1,
    color: Colors.textColor,
    fontSize: 16,
  },
  participantsList: {
    paddingLeft: 20,
    paddingTop: 15,
    marginBottom: 15,
    height: 70,
    justifyContent: 'center',
  },
  participantsListEmpty: {
    paddingLeft: 20,
  },
  placeholderText: {
    color: Colors.grey,
    fontSize: 14,
    paddingHorizontal: 20
  },
  participantItem: {
    alignItems: 'center',
    position: 'relative',
    width: 65,

  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  participantName: {
    fontSize: 12,
    color: "#000",
    textAlign: 'center',
    marginVertical: 4,
  },
  removeBtn: {
    position: 'absolute',
    top: 0,
    right: 6,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 10,
    alignItems: 'center',
  },
  stickyButton: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom:10
  },
  stickyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});