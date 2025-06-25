// components/ForwardModal.js
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import axiosInstance from '../../utils/AxiosInstance';
import CustomImageView from '../../components/CustomImage';

import { BASE_API_URL } from '@env';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { moderateScale } from '../../assets/styles/responsiveSize';

const ForwardModal = ({ visible, onClose, message, contacts, onForward }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState();

  const toggleContact = (contact) => {
    setSelectedContacts(prev =>
      prev.includes(contact.id)
        ? prev.filter(id => id !== contact.id)
        : [...prev, contact.id]
    );
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axiosInstance.get(`/api/users/search?search=${search}&limit=20`);
      if (response.success) {
        setFilteredUsers(response.data);
      }
    };
    fetchUsers();
  }, [search]);

  const renderUser = ({ item }) => (
    <TouchableOpacity
      key={item._id}
      style={[styles.userItem, selectedContacts.includes(item._id) && styles.selectedContact]}
      onPress={() => toggleContact(item)}
    >
      <CustomImageView
        source={`${BASE_API_URL}/image/${item.profilePicture}`}
        firstName={item?.fullName}
        size={40}
        fontSize={20}
      />
      <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
      {selectedContacts.includes(item.id) && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Forward to:</Text>

            {/* Search Input */}
            <TextInput
              placeholder="Rechercher un utilisateur"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            <FlatList
              data={filteredUsers}
              keyExtractor={item => item._id}
              renderItem={renderUser}
            />

            {/* <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.forwardButton,
                  selectedContacts.length === 0 && styles.disabledButton
                ]}
                onPress={() => {
                  onForward(message, selectedContacts);
                  onClose();
                }}
                disabled={selectedContacts.length === 0}
              >
                <Text style={styles.buttonText}>Forward</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: moderateScale(20),
    paddingTop: moderateScale(12),
    minHeight: moderateScale(100),
    shadowColor: Colors.text,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // modalContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   backgroundColor: 'rgba(0,0,0,0.5)',
  // },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textSecondary,
    opacity: 0.3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  // modalOverlay: {
  //   flex: 1,
  //   justifyContent: 'flex-end',
  //   backgroundColor: 'rgba(0,0,0,0.1)',
  // },
  // modalView: {
  //   backgroundColor: 'white',
  //   borderTopLeftRadius: 20,
  //   borderTopRightRadius: 20,
  //   padding: 20,
  //   // paddingBottom: 30,
  //   shadowColor: '#000',
  //   shadowOffset: {
  //     width: 0,
  //     height: 2,
  //   },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 4,
  //   elevation: 5,
  // },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedContact: {
    backgroundColor: '#f0f8ff',
  },
  contactName: {
    fontSize: 16,
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  forwardButton: {
    flex: 1,
    padding: 12,
    margin: 5,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ForwardModal;