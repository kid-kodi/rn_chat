import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import Screen from '../../components/Screen';
import { useConversation } from '../../contexts/ConversationProvider';
import { useChat } from '../../contexts/ChatProvider';
import { useUser } from '../../contexts/UserProvider';
import { useSocket } from '../../contexts/SocketProvider';
import ChatHeader from './ChatHeader';
import { styles } from './chatStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import CustomImageView from '../../components/CustomImage';
import { BASE_API_URL } from '@env';
import { TypingIndicator } from '../../components/TypingIndicator';
import { useApi } from '../../contexts/ApiProvider';

export default function Chat({ route, navigation }) {

  const userId = route?.params?.userId;
  const chatId = route?.params?.chatId;

  const {
    createAChat,
    chat,
    getChatById,
    checkIfChatExist,
    resetChat
  } = useConversation();

  const {
    sendTextMessage,
    messages,
    setMessages
  } = useChat();

  const { user } = useUser();
  const api = useApi();
  const socket = useSocket();

  const page_num = 1;
  const MESSAGES_PER_PAGE = 50;

  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Start with false
  const [sending, setSending] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Local typing state for current chat
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load messages when chat is available
  console.log(chat);
  useEffect(() => {
    if (chat?._id) {
      // Clear previous chat messages immediately
      setMessages([]);

      // Join the chat room
      socket?.emit('join_chat', chat._id);

      // Reset pagination state when chat changes
      setCurrentPage(1);
      setHasMore(true);
      setInitialLoad(true);
      setIsTyping(false); // Reset typing indicator
      loadMessages(1, true);
      extractContactInfo();

      // Leave chat room on cleanup
      return () => {
        socket?.emit('leave_chat', chat._id);
        setIsTyping(false);
      };
    } else {
      // ✅ Ensure loading is false when no chat
      setLoading(false);
    }
  }, [chat?._id, socket]);

  const loadMessages = async (page = 1, isInitial = false) => {
    if (!chat?._id) return;

    const currentChatId = chat._id; // Capture current chat ID

    try {
      if (isInitial) {
        setLoading(true);
      }

      // const response = await api.get(`${BASE_API_URL}/api/messages/${currentChatId}/group?page=${page}&limit=50`);
      const response = await api.get(
        `/api/messages/${currentChatId}?page=${page_num}&limit=${MESSAGES_PER_PAGE}`
      );

      // const data = await response.json();

      // Only update if we're still on the same chat
      if (response.success && chat._id === currentChatId) {
        setMessages(response.messages.reverse());
        setHasMore(response.hasMore);
        setCurrentPage(page);
        setInitialLoad(false);
      }
    } catch (error) {
      console.log("Error loading messages:", error);
    } finally {
      if (isInitial && chat._id === currentChatId) {
        setLoading(false);
      }
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore || initialLoad || !chat?._id) return;

    const currentChatId = chat._id; // Capture current chat ID

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await fetch(`${BASE_API_URL}/api/messages/${currentChatId}/group?page=${nextPage}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();

      // Only update if we're still on the same chat
      if (data.success && chat._id === currentChatId) {
        // Prepend older messages to the beginning of the array
        setMessages(prev => [...data.messages.reverse(), ...prev]);
        setHasMore(data.hasMore);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.log("Error loading more messages:", error);
    } finally {
      if (chat._id === currentChatId) {
        setLoadingMore(false);
      }
    }
  };

  const extractContactInfo = () => {
    if (chat?.isGroupChat) {
      setContactInfo({
        name: chat.chatName,
        avatar: chat.image,
        status: `${chat.users?.length} participants`,
        isGroupChat: true,
        chatId: chat._id
      });
    } else {
      const otherUser = chat.users?.find(u => u._id !== user._id);
      if (otherUser) {
        setContactInfo({
          name: otherUser.fullName,
          avatar: otherUser.profilePicture,
          status: otherUser.status === 'online' ? 'En ligne' : 'Hors ligne',
          isGroupChat: false,
          chatId: chat._id
        });
      }
    }
  };

  const handleCreateChat = useCallback(async () => {
    try {
      const response = await createAChat(userId);
      if (response?.success) {
        // Messages will load automatically via useEffect
      }
    } catch (error) {
      console.log("Error creating chat:", error);
    }
  }, [userId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    try {
      setSending(true);
      const response = await sendTextMessage(
        chat._id,
        user._id,
        messageText.trim(),
        null,
        null,
        'text'
      );

      if (response?.success) {
        // Add message to local state immediately
        setMessages(prev => [...prev, response.data]);
        setMessageText('');

        // Emit socket event
        socket?.emit('new_message', response.data);

        // Scroll to bottom (index 0 when inverted)
        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          } catch (error) {
            // Fallback if scrollToIndex fails
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }, 100);
      }
    } catch (error) {
      console.log("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (text) => {
    setMessageText(text);

    // Emit typing event
    if (socket && chat?._id) {
      socket.emit('typing', chat._id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to emit stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', chat._id);
      }, 1000);
    }
  };

  useEffect(() => {
    (async () => {
      if (chatId) {
        setLoading(true); // ✅ Set loading when fetching
        await getChatById(chatId);
        // extractContactInfo();
        // Loading will be handled by chat._id effect
      }
    })()
  }, [chatId]);

  useEffect(() => {
    (async () => {
      if (userId) {
        // Reset chat state and messages first to ensure clean slate
        resetChat();
        setMessages([]);
        setContactInfo(null);
        setLoading(false); // ✅ Set to false, will be true when chat loads
        await checkIfChatExist(userId);
      }
    })()
  }, [userId]);

  // Cleanup: Reset chat state when component unmounts
  useEffect(() => {
    return () => {
      // Only reset if we're on a new chat screen (userId present)
      if (userId) {
        resetChat();
        setMessages([]);
      }
    };
  }, []);

  // Listen for new messages and typing events via socket
  useEffect(() => {
    if (!socket || !chat?._id) return;

    const handleNewMessage = (message) => {
      if (message.chat._id === chat._id || message.chat === chat._id) {
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });

        setTimeout(() => {
          try {
            flatListRef.current?.scrollToIndex({ index: 0, animated: true });
          } catch (error) {
            // Fallback if scrollToIndex fails
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }, 100);
      }
    };

    const handleTyping = (data) => {
      // Only show typing indicator if it's for the current chat and not from current user
      if (data.chatId === chat._id && data.userId !== user._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      // Only hide typing indicator if it's for the current chat
      if (data.chatId === chat._id) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, chat?._id, user._id]);

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender?._id === user._id || item.sender === user._id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.userMessageContainer : styles.contactMessageContainer
      ]}>
        {!isMyMessage && !chat?.isGroupChat && (
          <CustomImageView
            source={`${BASE_API_URL}/image/${contactInfo?.avatar}`}
            firstName={contactInfo?.name}
            size={30}
            fontSize={15}
            style={styles.messageSenderAvatar}
          />
        )}

        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.userBubble : styles.contactBubble
        ]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={[
            styles.timestamp,
            isMyMessage ? styles.userTimestamp : styles.contactTimestamp
          ]}>
            {moment(item.createdAt).format('HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  // Show "Say Hi!" screen for new chats
  if (userId && !chat) {
    return (
      <Screen style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.contactName}>New Chat</Text>
        </View>

        <View style={styles.newChatContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ccc" />
          <Text style={styles.newChatTitle}>Start a Conversation</Text>
          <Text style={styles.newChatSubtitle}>Send your first message to begin chatting</Text>

          <TouchableOpacity
            style={styles.sendFirstMessageButton}
            onPress={handleCreateChat}
          >
            <Text style={styles.sendFirstMessageButtonText}>Say Hi!</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // Main chat interface
  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {contactInfo && (
          <ChatHeader
            chatInfo={contactInfo}
            chat={chat}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
          />
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            ListHeaderComponent={() => (
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.loadingMoreText}>Loading more messages...</Text>
                </View>
              ) : null
            )}
            ListFooterComponent={() => (
              isTyping ? <TypingIndicator isVisible={isTyping} /> : null
            )}
          />
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={handleTyping}
              multiline
              maxLength={1000}
            />
          </View>

          {messageText.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons name="send" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}