import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';

const CustomModal = ({ visible, onClose, children }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Optional drag handle */}
          {children}
        </View>
      </View>
    </Modal>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Align content to bottom
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    height: height * 0.98, // 90% of screen height
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 8,
  },
});

export default CustomModal;

// usage

// import React, { useState } from 'react';
// import { View, Button, Text } from 'react-native';
// import CustomModal from './CustomModal';

// const App = () => {
//   const [isModalVisible, setModalVisible] = useState(false);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Open Bottom Modal" onPress={() => setModalVisible(true)} />
      
//       <CustomModal visible={isModalVisible} onClose={() => setModalVisible(false)}>
//         <Text style={{ fontSize: 18, marginBottom: 20 }}>This is a 90% Bottom Modal 🚀</Text>
//         <Button title="Close" onPress={() => setModalVisible(false)} />
//       </CustomModal>
//     </View>
//   );
// };

// export default App;
