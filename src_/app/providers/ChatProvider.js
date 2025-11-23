import { createContext, useContext, useEffect, useState } from 'react';
import { useApi } from './ApiProvider';
import { useUser } from './UserProvider';
import { useSocket } from './SocketProvider';
import { compareDates } from '../helpers/Utility';
import { useNavigation } from '@react-navigation/native';

const ChatContext = createContext();

export default function ChatProvider({ children }) {
  const { user } = useUser();
  const socket = useSocket();
  const api = useApi();
  const [currentChat, setCurrentChat] = useState();
  const [chat, setChat] = useState();
  const [chats, setChats] = useState();
  const [messages, setMessages] = useState();
  const [unReadMessages, setUnreadMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // console.log("is Cocket ++++ ++++",socket && socket.connected)

  // End vibrate

  // console.log("##chat");
  // console.log(chat);

  /**
   * Handles the "typing" event on the socket.
   */
  const handleOnSocketTyping = chatId => {
    // Check if the typing event is for the currently active chat.
    if (chatId !== chat?._id) return;
    // Set the typing state to true for the current chat.
    setIsTyping(true);
  };

  /**
   * Handles the "stop typing" event on the socket.
   */
  const handleOnSocketStopTyping = chatId => {
    // Check if the stop typing event is for the currently active chat.
    if (chatId !== chat?._id) return;

    // Set the typing state to false for the current chat.
    setIsTyping(false);
  };

  const handleOnMessageReceived = ({ message }) => {
    console.log('#########chat');
    console.log(chat);
    if (chat?._id === message.chat._id) {
      updateMessageList(message);
      updateChat(chat._id, { lastMessage: message });
    } else if (chat?._id !== message.chat._id) {
      setUnreadMessages(prev => [message, ...prev]);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await api.get(`/api/chats`);
      if (response.success) {
        setChats(response.chats);
        setIsLoading(false);
      }
    })();
  }, []);

  const create = async (users, chatName, isGroupChat) => {
    const response = await api.post(`/api/chats`, {
      users,
      chatName,
      isGroupChat,
    });
    if (response.success) {
      socket.emit('new-chat', response.data);
    }
    return response;
  };

  const getChat = async chatId => {
    const response = await api.get(`/api/chats/${chatId}`);
    if (response.success) {
      setChat(response.chat);
    }
    return response;
  };

  const sendTextMessage = async (
    chatId,
    senderId,
    messageText,
    replyingTo,
    file,
    type = 'text',
  ) => {
    const response = await api.post(`/api/messages`, {
      chat: chatId,
      sender: senderId,
      content: messageText,
      replyTo: replyingTo && {
        message: replyingTo._id,
        user: replyingTo.sender._id,
      },
      file,
      type,
    });

    if (response.success) {
      updateChat(chatId, { lastMessage: response.data });
    }
    return response;
  };

  const removeMessage = message => {
    setMessages(current =>
      current.filter(obj => {
        return obj._id !== message._id;
      }),
    );
  };

  const updateMessage = (messageId, messageMap) => {
    // 👇️ passing function to setData method
    setMessages(prevState => {
      const newState = prevState.map(obj => {
        // 👇️ if id equals 2, update the country property
        if (obj._id === messageId) {
          return { ...obj, ...messageMap };
        }

        // 👇️ otherwise return the object as is
        return obj;
      });

      return newState;
    });
  };

  const updateChat = (chatId, messageMap) => {

    // 👇️ passing function to setData method
    setChats(prevState => {
      const newState = prevState.map(obj => {
        // 👇️ if id equals 2, update the country property
        if (obj._id === chatId) {
          return { ...obj, ...messageMap };
        }

        // 👇️ otherwise return the object as is
        return obj;
      });

      return newState;
    });
  };

  const handleLike = async messageId => {
    const response = await api.put(`/api/messages/${messageId}/like`, {
      userId: user._id,
      type: 'like',
    });
    if (response.success) {
      updateMessage(messageId, { likes: response.result.likes });
    }
  };

  const handleUnLike = async messageId => {
    const response = await api.put(`/api/messages/${messageId}/unlike`, {
      userId: user._id,
      type: 'unlike',
    });
    if (response.success) {
      updateMessage(messageId, { likes: response.result.likes });
    }
  };

  const updateChatData = async (chatId, data) => {
    const response = await api.put(`/api/chats/${chatId}`, data);
    if (response.success) {
      setChat(response.data);
    }
    return response;
  };

  const removeUserFromChat = async (chatId, sender, removeUser) => {
    console.log(chatId)
    console.log(sender)
    console.log(removeUser)
    const response = await api.put(`/api/chats/${chatId}/remove`, {
      userId: removeUser._id,
    });
    if (response.success) {
      const messageText =
        sender._id === removeUser._id
          ? `${sender.fullName} left the chat`
          : `${sender.fullName} remove ${removeUser.fullName} from chat`;
      await sendTextMessage(
        chatId,
        sender._id,
        messageText,
        null,
        null,
        'info',
      );
    }
    return response;
  };

  // const removeMessage = async (chatId, sender, removeUser) => {
  //   const response = await api.put(`/api/chats/${chatId}/remove`, { userId: removeUser._id });
  //   if (response.success) {
  //     const messageText = sender._id === removeUser._id ?
  //       `${sender.fullName} left the chat` :
  //       `${sender.fullName} remove ${removeUser.fullName} from chat`;
  //     await sendTextMessage(chatId, sender._id, messageText, null, null, "info");
  //   }
  //   return response;
  // };

  useEffect(() => {
    socket?.on('call', data => {
      console.log('+++', data);
    });
  }, []);

  // Toggle showing the bubble when minimizing
  const minimizeCall = () => {
    setShowBubble(true);
  };

  // Hide bubble when returning to call screen
  const maximizeCall = () => {
    setShowBubble(false);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        chat,
        currentChat,
        setCurrentChat,
        getChat,
        setChat,
        setChats,
        isLoading,
        create,
        updateChat,
        isTyping,
        setIsTyping,
        sendTextMessage,
        handleLike,
        handleUnLike,
        unReadMessages,
        messages,
        setMessages,
        updateChatData,
        removeUserFromChat,
        removeMessage,
        showBubble,
        minimizeCall,
        maximizeCall
      }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
