import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../core/networks/AxiosInstance';
import Loading from '../core/components/Loading';
import Icon from 'react-native-vector-icons/Feather';

import ContactItem from './ContactItem';
import { TouchableOpacity } from 'react-native';
import Colors from '../core/constants/Colors';



export default function ContactList({ navigation }) {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState();



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
      />
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          navigation.navigate("NEWCONTACT");
        }}>
        <Icon name="user-plus" color={'#fff'} size={25} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#fff'
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 50,
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
})