// SignalingContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { SignalingService } from '../core/service/SignalingService';
import { serviceConfig, socketConnectionOptions } from '../ServiceConfig';

const SignalingContext = createContext(null);

export const SignalingProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const signalingRef = useRef(null);

  useEffect(() => {
    initSignaling();
    
    return () => {
      if (signalingRef.current) {
        signalingRef.current.removeAllListeners();
        signalingRef.current.disconnect();
      }
    };
  }, []);

  const initSignaling = async () => {
    try {

      signalingRef.current = new SignalingService(
        serviceConfig.serverURL,
        socketConnectionOptions,
        handleDisconnect
      );
    } catch (error) {
      console.error('Erreur d\'initialisation du service de signalisation:', error);
      Alert.alert('Erreur de connexion', 'Impossible de se connecter au serveur');
    }
  };

  const handleConnect = async (user) => {
    try {
      await signalingRef.current.waitForConnection(user);
      setIsConnected(true);
    } catch (error) {
      console.error('Erreur d\'initialisation du service de signalisation:', error);
      Alert.alert('Erreur de connexion', 'Impossible de se connecter au serveur');
    }
  };

  const handleDisconnect = (reason) => {
    console.log('Déconnecté:', reason);
    setIsConnected(false);
    
    // Tenter de se reconnecter automatiquement
    if (signalingRef.current) {
      signalingRef.current.waitForReconnection()
        .then(() => setIsConnected(true))
        .catch(err => console.error('Échec de la reconnexion:', err));
    }
  };

  // Méthodes exposées via le contexte
  const registerListener = (type, method, callback) => {
    if (signalingRef.current) {
      signalingRef.current.registerListener(type, method, callback);
    }
  };

  const sendRequest = async (method, data) => {
    if (!signalingRef.current || !isConnected) {
      throw new Error('Non connecté au serveur');
    }
    return signalingRef.current.sendRequest(method, data);
  };

  const sendNotify = (method, data) => {
    if (signalingRef.current && isConnected) {
      signalingRef.current.sendNotify(method, data);
    }
  };

  const value = {
    isConnected,
    handleConnect,
    handleDisconnect,
    registerListener,
    sendRequest,
    sendNotify,
    reconnect: initSignaling
  };

  return (
    <SignalingContext.Provider value={value}>
      {children}
    </SignalingContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useSignaling = () => {
  const context = useContext(SignalingContext);
  if (!context) {
    throw new Error('useSignaling doit être utilisé à l\'intérieur d\'un SignalingProvider');
  }
  return context;
};