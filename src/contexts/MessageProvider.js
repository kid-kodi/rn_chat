import { createContext, useContext, useState } from 'react';
import { useApi } from './ApiProvider';
import { useUser } from './UserProvider';
import { useSocket } from './SocketProvider';
import { useToast } from "react-native-toast-notifications";

const MessageContext = createContext();

const MESSAGES_PER_PAGE = 50;

export default function MessageProvider({ children }) {
  const socket = useSocket();
  const api = useApi();
  const toast = useToast();

  const { user } = useUser();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);



  const getMessages = async (chat_id, page_num, is_initial = false) => {
    if (!is_initial && !hasMore) return;

    try {
      if (is_initial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get(
        `/api/messages/${chat_id}?page=${page_num}&limit=${MESSAGES_PER_PAGE}`
      );

      if (!response.success) throw new Error('Failed to load messages');

      const data = await response.messages;

      if (is_initial) {
        setMessages(data);
      } else {
        setMessages(prev => [...prev, ...data]);
      }

      setHasMore(response.hasMore);
      setPage(page_num);

    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  const createMessage = async (msg_map) => {

  };

  const getMessageById = async message_id => {

  };



  const removeMessage = async (message_id) => {
    try {
      await api.delete(`/api/messages/${message_id}`)
      setMessages(prevMsgs => prevMsgs.filter(item => item._id !== message_id))
      toast.show("Message supprimé");
    } catch (error) {
      console.log(error);
      toast.show(error);
    }

  };

  const updateMessage = (messageId, messageMap) => {

  };



  const handleLikeMessage = async messageId => {

  };

  const handleUnLikeMessage = async messageId => {

  };


  return (
    <MessageContext.Provider
      value={{
        messages,
        setMessages,
        getMessages,
        loading,
        loadingMore,
        getMessageById,
        createMessage,
        removeMessage,
        updateMessage,
        handleLikeMessage,
        handleUnLikeMessage
      }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(MessageContext);
}
