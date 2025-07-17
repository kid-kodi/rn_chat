import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
// import useSelectedObjects from '../../hooks/useSelectedObjects';
import axiosInstance from '../../utils/AxiosInstance';
import Header from '../../components/Header';
import SearchInput from '../../components/SearchInput';
import SelectableList from '../../components/SelectableList';
import { moderateScale } from '../../assets/styles/responsiveSize';

export default function ForwardModal({ visible, onClose, message, contacts, onForward }) {
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState();

  const [selectedChats, setSelectedChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState();

  const [show] = useState(false);


  // const selectedObjects = useSelectedObjects(filteredUsers, selectedContacts);


  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axiosInstance.get(`/api/users/search?search=${search}&limit=20`);
      if (response.success) {
        setFilteredUsers(response.data);
      }
    };
    fetchUsers();
  }, [search]);

  useEffect(() => {
    const fetchChats = async () => {
      const response = await axiosInstance.get(`/api/chats/search?search=${search}&limit=20`);
      if (response.success) {
        setFilteredChats(response.data);
      }
    };
    fetchChats();
  }, [search]);

  const handleForward = () => {
    onForward(selectedContacts, selectedChats);
    setSelectedContacts([]);
    onClose();
  };

  return (
    <>
      {
        visible &&
        <SafeAreaView style={styles.container}>
          <Header onPressLeft={onClose} leftText='Envoyer à' />
          <SearchInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            onClear={() => setSearch("")}
            style={styles.searchInput}
          />
          <View>
            {show && <SelectableList
              title={"Contacts recents"}
              data={filteredUsers}
              label={"fullName"}
              imageLabel={"profilePicture"}
              multiple={true}
              onSelectionChange={(newSelected) => setSelectedContacts(newSelected)}
            />}
            <SelectableList
              title={"Conversations recentes"}
              data={filteredChats}
              label={"chatName"}
              imageLabel={"chatImage"}
              multiple={true}
              onSelectionChange={(newSelected) => setSelectedChats(newSelected)}
            />
          </View>
          {(selectedContacts.length > 0 || selectedChats.length > 0) && (
            <View style={styles.footer}>
              <TouchableOpacity onPress={handleForward} style={styles.button}>
                <Text style={styles.buttonText}>
                  Envoyer à {selectedChats.length} chat(s) {selectedContacts.length} contact(s)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      }
    </>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  searchInput: {
    margin: moderateScale(16)
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    backgroundColor: '#0071ff',
    paddingHorizontal: moderateScale(16),
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
