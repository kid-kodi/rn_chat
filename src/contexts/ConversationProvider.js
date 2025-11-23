// ConversationContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';
import { useApi } from './ApiProvider';
import { useSocket } from './SocketProvider';
import { useUser } from './UserProvider';

export const ConversationContext = createContext();

export const ConversationProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState();
  const [loading, setLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({}); // { chatId: count }
  const api = useApi();
  const socket = useSocket();
  const { user } = useUser();

  // Fetch unread counts from server
  const fetchUnreadCounts = useCallback(async () => {
    try {
      console.log('📊 Fetching unread counts from server...');
      const res = await api.get('/api/messages/unread/counts');
      if (res.success && res.unreadCounts) {
        setUnreadCounts(res.unreadCounts);
        console.log('✅ Unread counts loaded:', res.unreadCounts);
      }
    } catch (error) {
      console.error('❌ Error fetching unread counts:', error);
    }
  }, [api]);

  // Mark messages as read on server
  const markChatAsRead = useCallback(async (chatId) => {
    try {
      console.log('📖 Marking chat as read on server:', chatId);
      const res = await api.put(`/api/messages/read/${chatId}`);
      if (res.success) {
        console.log('✅ Marked', res.markedCount, 'messages as read');
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  }, [api]);

  // Read (fetch all)
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/chats');
      if (res.success) setChats(res.chats);

      // Fetch unread counts after loading chats
      await fetchUnreadCounts();

      setLoading(false);
    } catch (error) {
      console.log("fectchting chats")
      console.log(error)
    }

  }, [api, fetchUnreadCounts]);

  const updateConversation = (chatId, update) => {
    setChats(prev => {
      // Update the conversation
      const updated = prev.map(chat =>
        chat._id === chatId ? { ...chat, ...update } : chat
      );

      // Sort by lastMessage timestamp (most recent first)
      return updated.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt).getTime()
          : 0;
        const timeB = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt).getTime()
          : 0;
        return timeB - timeA; // Descending order
      });
    });
  }

  // Increment unread count for a chat
  const incrementUnreadCount = useCallback((chatId) => {
    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || 0) + 1
    }));
    console.log('📊 Incremented unread count for chat:', chatId);
  }, []);

  // Clear unread count for a chat
  const clearUnreadCount = useCallback((chatId) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[chatId];
      return newCounts;
    });
    console.log('🧹 Cleared unread count for chat:', chatId);

    // Also mark as read on server
    markChatAsRead(chatId);
  }, [markChatAsRead]);

  // Get unread count for a specific chat
  const getUnreadCount = useCallback((chatId) => {
    return unreadCounts[chatId] || 0;
  }, [unreadCounts]);

  useEffect(() => {
    if (!socket || !user) return;

    console.log('🔌 ConversationProvider: Setting up socket listeners for user:', user._id);
    socket.emit('join_chat', user._id);

    // Handler for new chats
    const handleNewChat = (chat) => {
      console.log('📥 Received new_chat event:', chat);
      addNewChat(chat);
    };

    // Handler for new messages (when in chat room)
    const handleNewMessage = (msg) => {
      console.log('📨 Received new_message event in conversation list:', {
        chatId: msg.chat?._id || msg.chat,
        content: msg.content?.substring(0, 30),
        sender: msg.sender?.fullName,
        senderId: msg.sender?._id
      });

      const chatId = msg.chat?._id || msg.chat;
      const senderId = msg.sender?._id || msg.sender;

      if (chatId) {
        updateConversation(chatId, { lastMessage: msg });

        // Increment unread count if message is not from current user
        if (senderId && senderId.toString() !== user._id.toString()) {
          incrementUnreadCount(chatId);
          console.log('📊 New message - incremented unread count for chat:', chatId);
        }

        console.log('✅ Updated lastMessage for chat:', chatId);
      }
    };

    // Handler for message updates (sent to all users in chat)
    const handleUpdateMessage = (msg) => {
      console.log('📨 Received update_message event in conversation list:', {
        chatId: msg.chat?._id || msg.chat,
        content: msg.content?.substring(0, 30),
        sender: msg.sender?.fullName,
        senderId: msg.sender?._id
      });

      const chatId = msg.chat?._id || msg.chat;
      const senderId = msg.sender?._id || msg.sender;

      if (chatId) {
        updateConversation(chatId, { lastMessage: msg });

        // Increment unread count if message is not from current user
        if (senderId && senderId.toString() !== user._id.toString()) {
          incrementUnreadCount(chatId);
          console.log('📊 Update message - incremented unread count for chat:', chatId);
        }

        console.log('✅ Updated lastMessage for chat:', chatId);
      }
    };

    // Handler for call notifications
    const handleCallNotification = ({ chatId, callerId, cameraStatus, microphoneStatus }) => {
      console.log('📞 Received call_notification event:', { chatId, callerId });
      updateConversation(chatId, {
        ongoingCall: { chatId, callerId, cameraStatus, microphoneStatus },
      });
    };

    // Handler for chat updates (e.g., when call ends and ongoingCall is cleared)
    const handleChatUpdated = ({ chatId, ongoingCall }) => {
      console.log('🔄 Received chat_updated event:', { chatId, ongoingCall });
      updateConversation(chatId, { ongoingCall });

      // Also update current chat if it matches
      // Using setChat with callback to avoid dependency on chat
      setChat(prev => {
        if (prev && prev._id === chatId) {
          console.log('✅ Updating current chat ongoingCall:', ongoingCall);
          return { ...prev, ongoingCall };
        }
        return prev;
      });
    };

    socket.on('new_chat', handleNewChat);
    socket.on('new_message', handleNewMessage);
    socket.on('update_message', handleUpdateMessage);
    socket.on('call_notification', handleCallNotification);
    socket.on('chat_updated', handleChatUpdated);

    console.log('✅ ConversationProvider: Socket listeners registered');

    return () => {
      console.log('🔇 ConversationProvider: Cleaning up socket listeners');
      socket.emit('leave_chat', user._id);
      socket.off('new_chat', handleNewChat);
      socket.off('new_message', handleNewMessage);
      socket.off('update_message', handleUpdateMessage);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('call_notification', handleCallNotification);
    };
  }, [socket, user?._id, addNewChat]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const joinCall = (chat, navigation, user) => {
    const callId = uuid.v4();
    navigation.navigate('CALL', {
      chatId: chat._id,
      cameraStatus: chat.ongoingCall?.cameraStatus,
      microphoneStatus: chat.ongoingCall?.microphoneStatus,
      callId,
      caller: user,
    });
  };

  const initiateCall = async (chat, callType, user, api, updateChat, navigation) => {
    try {
      // Generate a unique call ID
      const callId = uuid.v4();

      // Prepare call data
      const callData = {
        chatId: chat._id,
        callId,
        callType,
        caller: user,
      };

      // Call the backend API to initiate call
      const response = await api.post(`/api/call/initiate-call`, callData);
      if (response.chat) {
        updateChat(response.chat);
      }

      // Navigate to call screen
      navigation.navigate('CALL', {
        chatId: callData.chatId,
        cameraStatus: callData.callType === "video",
        microphoneStatus: false,
        callId,
        caller: user,
      });

      // Send notifications to other participants AFTER caller navigates
      // This ensures the caller joins the call room before others are notified
      setTimeout(async () => {
        try {
          console.log('📢 Notifying call participants...');
          await api.post(`/api/call/notify-participants`, { callId });
          console.log('✅ Participants notified successfully');
        } catch (notifyError) {
          console.error('❌ Failed to notify participants:', notifyError);
        }
      }, 500);

      return response;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  };

  const endCall = async (chatId, callId, leaveAndClose, api) => {
    try {
      console.log('📴 Ending call:', { chatId, callId, leaveAndClose });

      // Call backend API to end the call
      const endpoint = leaveAndClose ? '/api/call/end' : '/api/call/leave';
      const response = await api.post(endpoint, { callId });

      if (response.success) {
        console.log('✅ Call ended successfully on backend');

        // Update conversation list - remove ongoingCall
        updateConversation(chatId, { ongoingCall: null });

        // Update current chat if it matches
        setChat(prev => {
          if (prev && prev._id === chatId) {
            console.log('✅ Clearing ongoingCall from current chat');
            return { ...prev, ongoingCall: null };
          }
          return prev;
        });
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to end call on backend:', error);

      // Still update local state even if backend fails
      updateConversation(chatId, { ongoingCall: null });
      setChat(prev => {
        if (prev && prev._id === chatId) {
          return { ...prev, ongoingCall: null };
        }
        return prev;
      });

      throw error;
    }
  };


  const removeChats = useCallback(async (chatIdList) => {
    try {
      const res = await api.post('/api/chats/remove', chatIdList);
      if (res.success) {
        setChats(prev => prev.filter(obj => !chatIdList.includes(obj._id)));
      }
      return res;
    } catch (error) {
      console.log("error while deleting chats")
      console.log(error)
    }
  }, [api]);

  const createAChat = useCallback(async (chatteeId) => {
    try {
      const response = await api.post(`/api/chats/create-first-message/${chatteeId}`);
      if (response?.success && response?.data) {
        setChats(prev => {
          // Check if chat already exists to avoid duplicates
          const exists = prev.some(c => c._id === response.data._id);
          if (exists) return prev;
          return [response?.data, ...prev];
        });
        setChat(response.data);
      }
      return response;
    } catch (err) {
      console.error('createFirstMessage error', err);
    }
  }, [api]);

  const addNewChat = useCallback((newChat) => {
    setChats(prev => {
      // Avoid duplicates
      const exists = prev.some(c => c._id === newChat._id);
      if (exists) return prev;
      return [newChat, ...prev];
    });
  }, []);

  const checkIfChatExist = useCallback(
    async (user_id) => {
      try {
        if (!user_id) return;
        const response = await api.get(`/api/chats/is-chat-exist/${user_id}`);
        if (response?.isChatExist && response?.chat) {
          setChat(response.chat);
        } else {
          // Clear chat state if no chat exists with this user
          setChat(null);
        }
      } catch (err) {
        console.error('checkIfChatExist error', err);
      }
    },
    [api]
  );

  const getChatById = useCallback(
    async (chat_id) => {
      try {
        if (!chat_id) return;
        const response = await api.get(`/api/chats/${chat_id}`);
        console.log(response);
        if (response.success) {
          setChat(response.chat);
        }
      } catch (err) {
        console.error('getChatById error', err);
      }
    },
    [api]
  );

  const resetChat = useCallback(() => {
    setChat(null);
  }, []);

  return (
    <ConversationContext.Provider value={{
      chat,
      setChat,
      chats,
      loading,
      unreadMessages,
      unreadCounts,
      getUnreadCount,
      incrementUnreadCount,
      clearUnreadCount,
      fetchUnreadCounts,
      markChatAsRead,
      refresh: fetchChats,
      joinCall,
      initiateCall,
      endCall,
      removeChats,
      updateConversation,
      createAChat,
      getChatById,
      checkIfChatExist,
      resetChat,
      addNewChat
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export function useConversation() {
  return useContext(ConversationContext);
}
