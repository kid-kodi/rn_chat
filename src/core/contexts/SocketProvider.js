import io from 'socket.io-client';
import {createContext, useContext, useEffect, useState} from 'react';
import {BASE_API_URL} from '@env';
import socketService from '../networks/SocketService';

export const SocketContext = createContext();

export default function SocketProvider({children}) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    socketService.connect(BASE_API_URL);
    setSocket(socketService.getInstance());

    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
