import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axiosInstance from '../../utils/AxiosInstance';
import DataItem from '../../components/DataItem';
import Colors from '../../assets/styles/Colors';
import { navigate } from '../../utils/RootNavigation';

export default function NewChat() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState();

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

    navigate('CHAT', {
      userId: _user._id
    });

  };

  const renderUser = ({ item }) => (
    <DataItem
      title={item?.fullName ? item?.fullName : item?.email}
      subTitle={item?.about || ''}
      image={item.profilePicture}
      onPress={() => userPressed(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle Conversation</Text>
      </View>

      <View style={styles.main}>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color={Colors.grey} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Rechercher un utilisateur"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor={Colors.grey}
            />
          </View>
        </View>

        {/* New Group Conversation */}
        <DataItem
          customStyles={{ paddingHorizontal: 20 }}
          icon="people-outline"
          title="Nouvelle conversation de groupe"
          onPress={() => navigation.navigate('NEW_GROUP_PARTICIPANTS')}
          hideImage={true}
        />

        {/* User List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item._id}
          renderItem={renderUser}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
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
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
})