import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../core/networks/AxiosInstance';
import Loading from '../core/components/Loading';

import ContactItem from './ContactItem';



export default function ContactList() {
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
        onPress={() => {}}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#fff'
  }
})