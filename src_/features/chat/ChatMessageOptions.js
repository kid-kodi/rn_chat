import { View, Text, Modal, Alert, TouchableOpacity } from 'react-native'
import { styles } from './chatStyles';
import Clipboard from '@react-native-clipboard/clipboard';
import { useMessage } from '../../contexts/MessageProvider';
import { useUser } from '../../contexts/UserProvider';

export default function ChatMessageOptions({
  modalVisible,
  setModalVisible,
  selectedMessage,
  setReplyingTo,
  handleForward }) {

  const msg = useMessage();
  const userActions = useUser()

  // 🪄 Helper: get options based on message type + ownership
  const getOptionsForMessageType = (message) => {
    if (!message) return ['Annuler'];

    let options = [];

    switch (message.type) {
      case 'text':
        options = ['Répondre', 'Transférer', 'Copier', 'Supprimer', 'Info'];
        break;
      case 'image':
        options = ['Répondre', 'Transférer', 'Supprimer', 'Info'];
        break;
      case 'video':
        options = ['Répondre', 'Transférer', 'Supprimer', 'Info'];
        break;
      case 'system':
        options = ['Info'];
        break;
      case 'file':
        options = ['Répondre', 'Transférer', 'Supprimer', 'Info'];
        break;
      default:
        options = [];
        break;
    }

    // 🚨 Only allow delete if message sent by current user
    if (message?.sender?._id !== userActions?.user?._id) {
      options = options.filter((opt) => opt !== 'Supprimer');
    }

    // Always add cancel as last option
    options.push('Annuler');

    return options;
  };

  const dynamicOptions = getOptionsForMessageType(selectedMessage);


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
        Clipboard.setString(selectedMessage.content);
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
          {dynamicOptions.map((option) => (
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