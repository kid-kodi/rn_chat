import { View, Text, Modal, Alert, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { styles } from './chatStyles';
import Clipboard from '@react-native-clipboard/clipboard';
import { useMessage } from '../../contexts/MessageProvider';

const options = [
  'Répondre',
  'Transférer',
  'Copier',
  'Supprimer',
  'Info',
  'Annuler'
];

export default function ChatMessageOptions({
  modalVisible,
  setModalVisible,
  selectedMessage,
  setReplyingTo,
  handleForward }) {

  const msg = useMessage();

  const handleOptionPress = (option) => {
    setModalVisible(false);

    switch (option) {
      case 'Répondre':
        setReplyingTo(selectedMessage);
        break;
      case 'Transférer':
        handleForward(selectedMessage);
        break;
      case 'Copier':
        Clipboard.setString(selectedMessage);
        Alert.alert('Message copié', 'Message copié dans le presse-papiers');
        break;
      case 'Supprimer':
        Alert.alert('Supprimer', `Êtes-vous sûr de vouloir supprimer ce message ?`, [
          { text: 'Annuler', style: 'Annuler' },
          { text: 'Supprimer', style: 'destructive', onPress: () => msg.removeMessage(selectedMessage._id) }
        ]);

        break;
      case 'Info':
        Alert.alert('Info', `Message info: ${selectedMessage}`);
        break;
      case 'Annuler':
        // Just close the modal
        break;
      default:
        break;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => handleOptionPress(option)}
            >
              <Text style={[
                styles.optionText,
                option === 'Annuler' && styles.cancelText,
                option === 'Supprimer' && styles.deleteText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  )
}