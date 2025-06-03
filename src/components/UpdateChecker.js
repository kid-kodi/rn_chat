import React, { useEffect, useState } from 'react';
import { View, Text, Platform, Linking, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axiosInstance from '../utils/AxiosInstance';

const UpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Appel à votre API
      const response = await axiosInstance.get('/api/app/info');

      console.log(response)
      
      // Déterminez la plateforme actuelle
      let platform;
      if (Platform.OS === 'ios') {
        platform = response.ios;
      } else if (Platform.OS === 'android') {
        platform = response.android;
      } else {
        platform = response.web;
      }
      
      // Obtenez la version actuelle de l'app
      const currentVersion = DeviceInfo.getVersion();
      
      // Comparez les versions (vous pourriez utiliser semver pour une comparaison plus robuste)
      if (currentVersion < platform.version) {
        setUpdateAvailable(true);
        setStoreUrl(platform.url);
        setForceUpdate(platform.forceUpdate);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = () => {
    Linking.openURL(storeUrl);
  };

  const closeModal = () => {
    if (!forceUpdate) {
      setUpdateAvailable(false);
    }
  };

  return (
    <Modal
      visible={updateAvailable}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Nouvelle version disponible!</Text>
          <Text style={styles.message}>
            Une nouvelle version de l'application est disponible. Veuillez mettre à jour pour bénéficier des dernières fonctionnalités et améliorations.
          </Text>
          
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Mettre à jour maintenant</Text>
          </TouchableOpacity>
          
          {!forceUpdate && (
            <TouchableOpacity style={styles.laterButton} onPress={closeModal}>
              <Text>Plus tard</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  laterButton: {
    paddingVertical: 8,
  },
});

export default UpdateChecker;