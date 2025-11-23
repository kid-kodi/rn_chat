import {createContext, useContext, useEffect, useState} from 'react';
import {BASE_API_URL} from '@env';
import socketService from '../utils/SocketService';

export const SocketContext = createContext();

export default function SocketProvider({children}) {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState({
    isConnected: false,
    socketId: null,
    connected: false,
  });

  useEffect(() => {
    socketService.connect(BASE_API_URL);
    const socketInstance = socketService.getInstance();
    setSocket(socketInstance);

    // Monitor connection status
    const statusInterval = setInterval(() => {
      const status = socketService.getConnectionStatus();
      setSocketStatus(status);
    }, 1000);

    // Listen to connection events
    if (socketInstance) {
      socketInstance.on('connect', () => {
        setSocketStatus(socketService.getConnectionStatus());
      });

      socketInstance.on('disconnect', () => {
        setSocketStatus(socketService.getConnectionStatus());
      });
    }

    return () => {
      clearInterval(statusInterval);
      socketService.disconnect();
    };
  }, []);

  const value = {
    socket,
    socketStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  // Return the socket instance
  if (!context) {
    console.warn('useSocket must be used within SocketProvider');
    return null;
  }
  return context.socket;
}

export function useSocketStatus() {
  const context = useContext(SocketContext);
  if (!context) {
    console.warn('useSocketStatus must be used within SocketProvider');
    return { isConnected: false, socketId: null, connected: false };
  }
  return context.socketStatus || { isConnected: false, socketId: null, connected: false };
}
