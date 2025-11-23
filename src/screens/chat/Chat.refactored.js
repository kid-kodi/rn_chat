import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Screen from '../../components/Screen';
import { useConversation } from '../../contexts/ConversationProvider';
import { useChat } from '../../contexts/ChatProvider';
import { useUser } from '../../contexts/UserProvider';
import { useSocket } from '../../contexts/SocketProvider';
import { useApi } from '../../contexts/ApiProvider';
import ChatHeader from './ChatHeader';
import { styles } from './chatStyles';

// Custom hooks
import { useChatMessages } from './hooks/useChatMessages';
import { useChatSocket } from './hooks/useChatSocket';
import { useChatInit } from './hooks/useChatInit';

// Components
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import EmptyChatScreen from './components/EmptyChatScreen';

/**
 * Main Chat Screen Component
 * Refactored following React Native best practices
 */
export default function Chat({ route, navigation }) {
  // ==================== Route Params ====================
  const userId = route?.params?.userId;
  const chatId = route?.params?.chatId;

  // ==================== Context ====================
  const { createAChat, chat, getChatById, checkIfChatExist, resetChat } = useConversation();
  const { sendTextMessage, messages, setMessages } = useChat();
  const { user } = useUser();
  const api = useApi();
  const socket = useSocket();

  // ==================== State ====================
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ==================== Refs ====================
  const flatListRef = useRef(null);

  // ==================== Custom Hooks ====================
  const {
    loadingMore,
    hasMore,
    initialLoad,
    loadMessages,
    loadMoreMessages,
    resetPagination,
  } = useChatMessages({ chat, user, api, setMessages });

  /**
   * Scroll to bottom helper
   */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      try {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      } catch (error) {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    }, 100);
  }, []);

  const { emitTyping } = useChatSocket({
    socket,
    chat,
    user,
    setMessages,
    setIsTyping,
    scrollToBottom,
  });

  useChatInit({
    userId,
    chatId,
    getChatById,
    checkIfChatExist,
    resetChat,
    setMessages,
    setContactInfo,
    setLoading,
  });

  // ==================== Effects ====================
  /**
   * Extract contact info when chat changes
   */
  const extractContactInfo = useCallback(() => {
    if (!chat) return;

    if (chat.isGroupChat) {
      setContactInfo({
        name: chat.chatName,
        avatar: chat.image,
        status: `${chat.users?.length} participants`,
        isGroupChat: true,
        chatId: chat._id,
      });
    } else {
      const otherUser = chat.users?.find((u) => u._id !== user._id);
      if (otherUser) {
        setContactInfo({
          name: otherUser.fullName,
          avatar: otherUser.profilePicture,
          status: otherUser.status === 'online' ? 'En ligne' : 'Hors ligne',
          isGroupChat: false,
          chatId: chat._id,
        });
      }
    }
  }, [chat, user?._id]);

  /**
   * Load messages and setup chat when chat changes
   */
  useEffect(() => {
    if (!chat?._id) {
      setLoading(false);
      return;
    }

    // Clear previous messages
    setMessages([]);
    setIsTyping(false);

    // Reset pagination
    resetPagination();

    // Load messages and contact info
    loadMessages(1, true);
    extractContactInfo();
  }, [chat?._id, setMessages, resetPagination, loadMessages, extractContactInfo]);

  // ==================== Handlers ====================
  /**
   * Handle creating a new chat
   */
  const handleCreateChat = useCallback(async () => {
    try {
      const response = await createAChat(userId);
      if (response?.success) {
        // Messages will load automatically via useEffect
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  }, [userId, createAChat]);

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || sending || !chat?._id) return;

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
        // Add message to local state
        setMessages((prev) => [...prev, response.data]);
        setMessageText('');

        // Emit socket event
        socket?.emit('new_message', response.data);

        // Scroll to bottom
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }, [messageText, sending, chat?._id, sendTextMessage, user?._id, setMessages, socket, scrollToBottom]);

  /**
   * Handle typing
   */
  const handleTyping = useCallback((text) => {
    setMessageText(text);
    emitTyping();
  }, [emitTyping]);

  /**
   * Handle navigation back
   */
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ==================== Memoized Values ====================
  const keyExtractor = useCallback((item) => item._id, []);

  // ==================== Render ====================
  // Show empty chat screen for new chats
  if (userId && !chat) {
    return (
      <EmptyChatScreen
        onCreateChat={handleCreateChat}
        onBack={handleBack}
      />
    );
  }

  // Main chat interface
  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        {contactInfo && (
          <ChatHeader
            chatInfo={contactInfo}
            chat={chat}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
          />
        )}

        {/* Loading state */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          /* Message list */
          <MessageList
            ref={flatListRef}
            messages={messages}
            userId={user?._id}
            contactInfo={contactInfo}
            isGroupChat={chat?.isGroupChat}
            isTyping={isTyping}
            loadingMore={loadingMore}
            onEndReached={loadMoreMessages}
            keyExtractor={keyExtractor}
          />
        )}

        {/* Input */}
        <ChatInput
          messageText={messageText}
          onChangeText={handleTyping}
          onSend={handleSendMessage}
          sending={sending}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
