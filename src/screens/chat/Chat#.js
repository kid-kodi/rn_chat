import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Screen from '../../components/Screen';
import { useConversation } from '../../contexts/ConversationProvider';
import { useChat } from '../../contexts/ChatProvider';
import { useUser } from '../../contexts/UserProvider';
import { useSocket, useSocketStatus } from '../../contexts/SocketProvider';
import { useApi } from '../../contexts/ApiProvider';
import ChatHeader from './ChatHeader';
import { styles } from './chatStyles';

// Custom hooks
import { useChatMessages } from './hooks/useChatMessages';
import { useChatSocket } from './hooks/useChatSocket';
import { useChatInit } from './hooks/useChatInit';
import { useFileUpload } from './hooks/useFileUpload';
import { useAudioRecorder } from './hooks/useAudioRecorder';

// Components
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import EmptyChatScreen from './components/EmptyChatScreen';
import AttachmentPicker from './components/AttachmentPicker';
import FilePreview from './components/FilePreview';
import ImageGalleryViewer from './components/ImageGalleryViewer';
import SocketStatusIndicator from './components/SocketStatusIndicator';

/**
 * Main Chat Screen Component
 * Refactored following React Native best practices:
 * - Separation of concerns with custom hooks
 * - Memoized components for performance
 * - Proper cleanup and race condition handling
 * - Clear component structure
 */
export default function Chat({ route, navigation }) {
  // ==================== Route Params ====================
  const userId = route?.params?.userId;
  const chatId = route?.params?.chatId;

  // ==================== Context ====================
  const { 
    createAChat, 
    chat, 
    getChatById, 
    checkIfChatExist, 
    resetChat, 
    clearUnreadCount, 
    initiateCall: initiateCallContext, 
    setChat: updateChat 
  } = useConversation();
  
  const { sendTextMessage, messages, setMessages } = useChat();
  const { user } = useUser();
  const api = useApi();
  const socket = useSocket();
  const socketStatus = useSocketStatus();

  // ==================== State ====================
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ==================== Refs ====================
  const flatListRef = useRef(null);

  // ==================== Custom Hooks ====================
  const {
    loading,
    loadingMore,
    loadMessages,
    loadMoreMessages,
    resetPagination,
  } = useChatMessages({ chat, user, api, setMessages });

  const {
    selectedFile,
    uploading,
    pickImageOrVideo,
    takePhoto,
    pickDocument,
    pickAudio,
    uploadFile,
    clearFile,
  } = useFileUpload();

  const {
    isRecording,
    recordingDuration,
    audioFile,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
    formatDuration,
  } = useAudioRecorder();

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

    // Clear unread count when entering this chat
    clearUnreadCount(chat._id);
    console.log('🧹 Cleared unread count when entering chat:', chat._id);
  }, [chat?._id, setMessages, resetPagination, loadMessages, extractContactInfo, clearUnreadCount]);

  /**
   * Monitor socket connection status
   */
  // useEffect(() => {
  //   console.log('🔌 Socket Status:', {
  //     isConnected: socketStatus.isConnected,
  //     socketId: socketStatus.socketId,
  //     connected: socketStatus.connected,
  //   });
  // }, [socketStatus]);

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
   * Handle attachment type selection
   */
  const handleAttachmentSelect = useCallback(async (type) => {
    let file = null;

    switch (type) {
      case 'image':
        file = await pickImageOrVideo();
        break;
      case 'camera':
        file = await takePhoto();
        break;
      case 'document':
        file = await pickDocument();
        break;
      case 'audio':
        file = await pickAudio();
        break;
      default:
        break;
    }

    // File is automatically set in the hook
  }, [pickImageOrVideo, takePhoto, pickDocument, pickAudio]);

  /**
   * Handle sending a message (with or without file)
   */
  const handleSendMessage = useCallback(async () => {
    if ((!messageText.trim() && !selectedFile && !audioFile) || sending || !chat?._id) return;

    try {
      setSending(true);

      let fileData = null;
      let messageType = 'text';

      // Upload file first if selected
      if (selectedFile || audioFile) {
        const token = await api.authToken();
        const fileToUpload = audioFile || selectedFile;
        const uploadResult = await uploadFile(
          fileToUpload,
          `${api.BaseURL()}/api/files/upload-image`,
          token
        );

        if (uploadResult?.success) {
          fileData = uploadResult.data;
          messageType = audioFile ? 'audio' : (selectedFile.type?.split('/')[0] || 'file');
        } else {
          throw new Error('File upload failed');
        }
      }

      // Send message with or without file
      const response = await sendTextMessage(
        chat._id,
        user._id,
        messageText.trim() || '',
        null,
        fileData,
        messageType
      );

      if (response?.success) {
        // Add message to local state
        setMessages((prev) => [...prev, response.data]);
        setMessageText('');
        clearFile();
        clearAudio();

        // Emit socket event with correct format
        socket?.emit('send_message', {
          message: response.data,
          chatId: chat._id,
          senderId: user._id
        });

        // Scroll to bottom
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }, [messageText, selectedFile, audioFile, sending, chat?._id, sendTextMessage, user?._id, uploadFile, setMessages, clearFile, clearAudio, socket, scrollToBottom, api]);

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

  /**
   * Handle opening attachment picker
   */
  const handleAttachPress = useCallback(() => {
    setShowAttachmentPicker(true);
  }, []);

  /**
   * Handle closing attachment picker
   */
  const handleCloseAttachmentPicker = useCallback(() => {
    setShowAttachmentPicker(false);
  }, []);

  /**
   * Handle image press to open gallery
   */
  const handleImagePress = useCallback((selectedMessage) => {
    // Filter only image messages from the chat
    const imageMessages = messages.filter(msg => {
      const hasFile = msg.file && msg.file.data;
      const isImage = msg.type === 'image' || msg.file?.data?.mimetype?.startsWith('image/');
      return hasFile && isImage;
    });

    // Find the index of the selected image
    const selectedIndex = imageMessages.findIndex(msg => msg._id === selectedMessage._id);

    if (selectedIndex !== -1) {
      setGalleryImages(imageMessages);
      setSelectedImageIndex(selectedIndex);
      setShowImageGallery(true);
    }
  }, [messages]);

  /**
   * Handle call back button in call log message
   */
  const handleCallBack = useCallback(async (callType) => {
    if (!chat) return;

    try {
      await initiateCallContext(chat, callType, user, api, updateChat, navigation);
    } catch (error) {
      console.error('Failed to initiate callback:', error);
    }
  }, [chat, user, api, navigation, initiateCallContext, updateChat]);

  /**
   * Handle closing image gallery
   */
  const handleCloseGallery = useCallback(() => {
    setShowImageGallery(false);
  }, []);

  /**
   * Handle audio recording start
   */
  const handleAudioRecordStart = useCallback(async () => {
    const started = await startRecording();
    if (!started) {
      console.log('Failed to start recording');
    }
  }, [startRecording]);

  /**
   * Handle audio recording end (release button)
   */
  const handleAudioRecordEnd = useCallback(async () => {
    if (!isRecording) return;

    const recordedFile = await stopRecording();
    if (recordedFile) {
      // Auto-send the audio message
      setSending(true);
      try {
        console.log('Uploading audio file:', recordedFile);
        const token = await api.authToken();
        const uploadResult = await uploadFile(
          recordedFile,
          `${api.BaseURL()}/api/files/upload-image`,
          token
        );

        if (uploadResult?.success) {
          const response = await sendTextMessage(
            chat._id,
            user._id,
            '',
            null,
            uploadResult.data,
            'voice'
          );

          if (response?.success) {
            setMessages((prev) => [...prev, response.data]);
            clearAudio();
            socket?.emit('send_message', {
              message: response.data,
              chatId: chat._id,
              senderId: user._id
            });
            scrollToBottom();
          } else {
            console.error('Failed to send message:', response);
            Alert.alert('Error', 'Failed to send audio message');
          }
        } else {
          console.error('Upload failed:', uploadResult);
          Alert.alert('Upload Failed', 'Could not upload audio file');
        }
      } catch (error) {
        console.error("Error sending audio message:", error);
        Alert.alert('Error', `Failed to send audio: ${error.message}`);
      } finally {
        setSending(false);
        clearAudio();
      }
    } else {
      console.log('No audio file to send');
    }
  }, [isRecording, stopRecording, uploadFile, sendTextMessage, chat?._id, user?._id, setMessages, clearAudio, socket, scrollToBottom, api]);

  /**
   * Handle audio recording cancel
   */
  const handleAudioRecordCancel = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  /**
   * Toggle message selection
   */
  const handleMessageLongPress = useCallback((messageId) => {
    if (!isSelectMode) {
      setIsSelectMode(true);
      setSelectedMessages([messageId]);
    }
  }, [isSelectMode]);

  /**
   * Handle message selection in select mode
   */
  const handleMessageSelect = useCallback((messageId) => {
    setSelectedMessages((prev) => {
      if (prev.includes(messageId)) {
        // Deselect
        const newSelection = prev.filter(id => id !== messageId);
        if (newSelection.length === 0) {
          setIsSelectMode(false);
        }
        return newSelection;
      } else {
        // Select
        return [...prev, messageId];
      }
    });
  }, []);

  /**
   * Cancel selection mode
   */
  const handleCancelSelect = useCallback(() => {
    setIsSelectMode(false);
    setSelectedMessages([]);
  }, []);

  /**
   * Delete selected messages
   */
  const handleDeleteSelected = useCallback(async () => {
    if (selectedMessages.length === 0) return;

    Alert.alert(
      'Supprimer les messages',
      `Etes-vous sûr de vouloir supprimer les ${selectedMessages.length} message(s)?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call API to delete messages
              const response = await api.post('/api/messages/bulk-delete', {
                messageIds: selectedMessages,
              });

              if (response.success) {
                // Remove deleted messages from state
                setMessages((prev) =>
                  prev.filter(msg => !selectedMessages.includes(msg._id))
                );
                setIsSelectMode(false);
                setSelectedMessages([]);
                Alert.alert('Success', 'Messages supprimés avec succès');
              } else {
                Alert.alert('Error', 'Impossible de supprimer les messages');
              }
            } catch (error) {
              console.error('Error deleting messages:', error);
              Alert.alert('Error', 'Impossible de supprimer les messages');
            }
          },
        },
      ]
    );
  }, [selectedMessages, api, setMessages]);

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
      {/* Header - Outside KeyboardAvoidingView to stay fixed */}
      {contactInfo && (
        <ChatHeader
          chatInfo={contactInfo}
          chat={chat}
          isSelectMode={isSelectMode}
          setIsSelectMode={setIsSelectMode}
          selectedCount={selectedMessages.length}
          onCancelSelect={handleCancelSelect}
          onDeleteSelected={handleDeleteSelected}
        />
      )}

      {/* Socket Status Indicator */}
      <SocketStatusIndicator />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Loading state */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
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
            onImagePress={handleImagePress}
            isSelectMode={isSelectMode}
            selectedMessages={selectedMessages}
            onMessageLongPress={handleMessageLongPress}
            onMessageSelect={handleMessageSelect}
            onCallBack={handleCallBack}
          />
        )}

        {/* File Preview */}
        {selectedFile && (
          <FilePreview
            file={selectedFile}
            onRemove={clearFile}
          />
        )}

        {/* Input */}
        <ChatInput
          messageText={messageText}
          onChangeText={handleTyping}
          onSend={handleSendMessage}
          onAttachPress={handleAttachPress}
          onAudioRecordStart={handleAudioRecordStart}
          onAudioRecordEnd={handleAudioRecordEnd}
          onAudioRecordCancel={handleAudioRecordCancel}
          sending={sending || uploading}
          hasAttachment={!!selectedFile}
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          formatDuration={formatDuration}
        />
      </KeyboardAvoidingView>

      {/* Attachment Picker Modal */}
      <AttachmentPicker
        visible={showAttachmentPicker}
        onClose={handleCloseAttachmentPicker}
        onSelectType={handleAttachmentSelect}
      />

      {/* Image Gallery Viewer */}
      <ImageGalleryViewer
        visible={showImageGallery}
        images={galleryImages}
        initialIndex={selectedImageIndex}
        onClose={handleCloseGallery}
      />
    </Screen>
  );
}
