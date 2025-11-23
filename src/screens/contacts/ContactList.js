import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../core/networks/AxiosInstance';
import Loading from '../../components/Loading';

import ContactItem from './ContactItem';
import Navbar from '../../components/Navbar';
import SearchModal from '../conversations/components/SearchModal';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/Colors';
import { styles } from '../conversations/styles';

export default function ContactList({ navigation }) {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosInstance.get(`/api/users?page=${page}`);
        if (response.success) {
          setUsers(response.data);
          setPage(response.page);
        }
      } catch (error) {
        console.log(error);
      }
    })()
  }, []);

  if (!users) {
    return (
      <Loading />
    );
  }
  if (!users && users.length === 0) {
    return (
      <View><Text>ContactList</Text></View>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <ContactItem
        item={item}
        onPress={() => { }}
        navigation={navigation}
      />
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Navbar navigation={navigation} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={Colors.grey} style={{ marginRight: 8 }} />
          <Text style={styles.searchText}>Rechercher...</Text>
        </TouchableOpacity>
      </View>

      {/* New reusable Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        query={searchText}
        onChangeQuery={setSearchText}
        currentSection={`conversations`}
        loading={false} // you can wire real loading later
        onPressFilter={section => console.log(section)}
      />

      <FlatList
        style={{ paddingVertical: 0, paddingHorizontal: 20 }}
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
    </SafeAreaView>
  )
}

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     flex: 1
//   }
// })