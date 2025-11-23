import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserProvider';
import { useSocket } from './SocketProvider';

const ChatContext = createContext();

export default function ChatProvider({ children }) {
  const { user } = useUser();
  const socket = useSocket();
  const [currentChat, setCurrentChat] = useState();
  const [chattees, setChattees] = useState([]);
  const [messages, setMessages] = useState([]);

  const checkIfChatExist = () => { }
  const initializeChat = () => { }


  return (
    <ChatContext.Provider
      value={{
        currentChat,
        initializeChat
      }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
