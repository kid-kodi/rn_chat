import { useRef, useState, useEffect, useCallback } from 'react';
import { SafeAreaView, FlatList, View, KeyboardAvoidingView, Platform, Keyboard, Modal, Alert, Animated, Pressable } from 'react-native'
import { useUser } from '../../contexts/UserProvider';
import { Image } from 'react-native';
import { Text } from 'react-native';
import { useApi } from '../../contexts/ApiProvider';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './chatStyles';
import { formatChatDate } from '../../utils/Utility';
import { navigate } from '../../utils/RootNavigation';
import CustomImageView from '../../components/CustomImage';
import { BASE_API_URL } from '@env';
import { TextInput } from 'react-native';
import { debounce, getFileTypeFromMimeType } from '../../utils/Utils';
import { useSocket } from '../../contexts/SocketProvider';
import { hasAndroidPermission } from '../../utils/ImagePickerUtil';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { MeetingVariable } from '../../MeetingVariable';
import { useChat } from '../../contexts/ChatProvider';
import uuid from 'react-native-uuid';
import FileViewer from 'react-native-file-viewer';
import { FileJobStatus, FileJobType } from '../../utils/Types';
import MessageBubble from './MessageItem';
import RNCallKeep from 'react-native-callkeep';

import ChatHeader from './ChatHeader';
import { TypingIndicator } from '../../components/TypingIndicator';

const MESSAGES_PER_PAGE = 50;

export default function Chat({ route }) {

  const userId = route?.params?.userId;
  const chatId = route?.params?.chatId;


  const { user } = useUser();
  const api = useApi();
  const socket = useSocket();

  const [chatInfo, setChatInfo] = useState();
  const [chat, setChat] = useState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [replyingTo, setReplyingTo] = useState();
  const [isTyping, setIsTyping] = useState(false); // To track if the current user is typing
  // const [image, setImage] = useState();
  const [tempImageUri, setTempImageUri] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  // const [messages, setMessages] = useState([]);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedMediaView, setSelectedMediaView] = useState(null);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [isCallLoading, setIsCallLoading] = useState(false);

  const recordingRef = useRef(null);
  const durationTimerRef = useRef(null);

  const flatListRef = useRef()

  const getChatById = async (chat_id) => {
    try {
      const response = await api.get(
        `/api/chats/${chat_id}`
      );

      setChat(response.chat);
      setChatInfo({
        isGroupChat: response?.chat?.isGroupChat,
        avatar: response?.chat?.isGroupChat ? response?.chat?.image : response?.chat?.users[0]?.profilPicture,
        name: response?.chat?.isGroupChat ? response?.chat?.name : response?.chat?.users[0]?.fullName,
        participants: response?.chat?.isGroupChat ? response?.chat?.users : response?.chat?.users[0],
        status: response?.chat?.isGroupChat ? `participants ${response?.chat?.users?.length}` : response?.chat?.users[0]?.status === "online" ? 'En ligne' : "Hors ligne"
      })
    } catch (error) {

    }
  }

  const checkIfChatExist = async (user_id) => {
    try {

      const response = await api.get(
        `/api/chats/is-chat-exist/${user_id}`
      );
      response.isChatExist && setChat(response.chat);
      setChatInfo({
        isGroupChat: response?.chat?.isGroupChat,
        avatar: response?.chat?.isGroupChat ? response?.chat?.image : response?.user?.profilPicture,
        name: response?.chat?.isGroupChat ? response?.chat?.name : response?.user?.fullName,
        participants: response?.chat?.isGroupChat ? response?.chat?.users : response?.user,
        status: response?.chat?.isGroupChat ? `participants ${response?.chat?.users?.length}` : response?.users?.status === "online" ? 'En ligne' : "Hors ligne",
      })
    } catch (error) {
      console.log(error);
    }
  }

  const loadMessages = async (chat_id, pageNum, isInitial = false) => {
    if (!isInitial && !hasMore) return;

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.get(
        `/api/messages/${chat_id}?page=${pageNum}&limit=${MESSAGES_PER_PAGE}`
      );

      if (!response.success) throw new Error('Failed to load messages');

      const data = await response.messages;

      if (isInitial) {
        setMessages(data);
      } else {
        setMessages(prev => [...prev, ...data]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);

    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && chat) {
      loadMessages(chat._id, page + 1);
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    // if newChat get chat by selected users id
    if (chatId) {
      getChatById(chatId);
      loadMessages(chatId, 1, true);
    }

    // else get chat by selected chat id
    if (userId) {
      checkIfChatExist(userId);
    }

  }, [route.params]);

  const createFirstMessage = async () => {
    const response = await api.post(
      `/api/chats/create-first-message/${userId}`,
      { users: [user._id, userId] }
    );
    console.log(response)
    if (response.success) {
      setChat(response.data);
      setChatInfo({
        isGroupChat: response?.data?.isGroupChat,
        avatar: response?.data?.isGroupChat ? response?.data?.image : response?.data?.users[0]?.profilPicture,
        name: response?.data?.isGroupChat ? response?.data?.name : response?.data?.users[0]?.fullName,
        participants: response?.data?.isGroupChat ? response?.data?.users : response?.data?.users[0],
        status: response?.data?.isGroupChat ? `participants ${response?.data?.users?.length}` : response?.data?.users[0]?.status === "online" ? 'En ligne' : "Hors ligne"
      })
    }
    // notify user that a new converation created
  };


  const openFile = async (item) => {
    try {
      console.log(item.name);
      const filePath = `${MeetingVariable.fileService.getBundlePath()}/${item.name}`;

      console.log("####filePath")
      console.log(filePath)

      // First check if file exists
      const exists = await MeetingVariable.fileService.fileExists(filePath);

      console.log(exists)

      if (!exists) {
        // File doesn't exist, download it first
        await downloadFile(item); // Pass the item/message to download
      }

      // Now open the file
      FileViewer.open(filePath)
        .then(() => {
          console.log('File opened successfully');
        })
        .catch((error) => {
          console.error('Error opening file:', error);
        });

    } catch (error) {
      console.error('Error in openFile process:', error);
    }
  };

  // Modified downloadFile to work with both messages and items
  const downloadFile = async (item) => {
    try {
      // Handle both message objects and direct file items
      const fileName = item.name;
      const filePath = `${MeetingVariable.fileService.getBundlePath()}/${fileName}`;
      const downloadUrl = `${BASE_API_URL}/image/${fileName}`;

      // If it's a message object, update its status
      if (item._id) {
        item.fileJobStatus = FileJobStatus.progressing;
        setMessages(prev =>
          prev.map(msg =>
            msg._id === item._id ? { ...item } : msg
          )
        );
      }

      await MeetingVariable.fileService.download(
        downloadUrl,
        filePath,
        (bytesSent, totalBytes) => {
          if (item._id) {
            setMessages(prev =>
              prev.map(msg =>
                msg._id === item._id
                  ? { ...msg, bytesSent, totalBytes }
                  : msg
              )
            );
          }
        },
        (status) => {
          if (item._id) {
            setMessages(prev =>
              prev.map(msg =>
                msg._id === item._id
                  ? { ...msg, fileJobStatus: status }
                  : msg
              )
            );
          }
        }
      );

      if (item._id) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === item._id
              ? { ...msg, filePath, fileJobStatus: FileJobStatus.completed }
              : msg
          )
        );
      }

      return filePath; // Return the path for the openFile function to use

    } catch (err) {
      if (item._id) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === item._id
              ? { ...msg, fileJobStatus: FileJobStatus.failed }
              : msg
          )
        );
      }
      console.error('[Error] Failed to download file:', err);
      throw err; // Re-throw the error so openFile can handle it
    }
  };

  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef?.current && messages?.length > 0) {
      setTimeout(() => {
        flatListRef?.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, []);

  // Clean up recording resources when component unmounts
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        stopRecording(true);
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);


  const [incomingCall, setIncomingCall] = useState(null);
  // const navigation = useNavigation();

  useEffect(() => {

    // Initialize CallKeep
    MeetingVariable.callService.setup();

    // Listen for incoming calls
    const incomingCallListener = MeetingVariable.callService.addEventListener('callStarted', (call) => {
      // If the call is for this chat, show the incoming call UI
      if (call.participantId === userId) {
        setIncomingCall(call);
      }
    });

    // Listen for call acceptance
    const callAcceptedListener = MeetingVariable.callService.addEventListener('callAccepted', (call) => {
      // Navigate to the meeting screen
      navigate('CALL', {
        callUUID,
        chatId: call.chatId,
        cameraStatus: call.callType === "video",
        microphoneStatus: false,
      });
      setIncomingCall(null);
    });

    // Listen for call rejections
    const callRejectedListener = MeetingVariable.callService.addEventListener('callRejected', () => {
      setIncomingCall(null);
    });

    return () => {
      // Clean up listeners
      incomingCallListener();
      callAcceptedListener();
      callRejectedListener();
    };
  }, [userId]);

  // At the top of your component, memoize the handler
  const handleIncomingMessage = useCallback((data) => {
    setMessages(prev => [data, ...prev]);
  }, []);

  // Socket effects
  useEffect(() => {
    if (!chat) return;
    socket.emit('join_room', chat?._id);

    const messageHandler = (data) => {
      handleIncomingMessage(data);
    };

    socket.on('new_message', messageHandler);

    return () => {
      socket.off('new_message', messageHandler); // Use off() with exact handler
      socket.emit('leave_room', chat?._id);
    };
  }, [chat?._id, handleIncomingMessage]); // Add dependencies

  useEffect(() => {
    socket.on('user_typing', ({ userId }) => {
      setIsTyping(user._id !== userId);
    });
    socket.on('user_stopped', ({ userId }) => {
      setIsTyping(false);
    });
    return () => {
      socket.removeListener('user_typing');
      socket.removeListener('user_stopped');
    };
  }, [user?._id, isTyping]);

  useEffect(() => {
    (async () => {
      if (chat && chat._id) {
        const response = await api.get(`/api/chats/${chat._id}/medias`);
        if (response.success) {
          setMediaItems(response.mediaItems);
        }
      }
    })()
  }, [chat?._id])

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  const renderMessage = ({ item }) => {
    const isUserMessage = item.sender._id === user._id; // Current user ID

    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.contactMessageContainer
      ]}>
        {!isUserMessage && (
          <CustomImageView
            source={`${BASE_API_URL}/image/${item.sender?.profilePicture}`}
            firstName={item.sender?.fullName}
            size={40}
            fontSize={20}
          />
        )}
        <View style={{ maxWidth: "80%" }}>
          <MessageBubble
            message={item}
            user={user}
            openFile={openFile}
            handleMessageLongPress={handleMessageLongPress}
            actionMenuVisible={actionMenuVisible}
            closeActionMenu={closeActionMenu}
            fadeAnim={fadeAnim}
            handleAction={handleAction}
            formatChatDate={formatChatDate}
          />
        </View>
      </View>
    );
  }


  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setActionMenuVisible(true);
  };

  const closeActionMenu = () => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActionMenuVisible(false);
      setSelectedMessage(null);
    });
  };

  const handleAction = async (action) => {

    // Perform the action here
    switch (action) {
      case 'delete':
        const response = await api.delete(`/api/messages/${selectedMessage._id}`);
        console.log("######response")
        console.log(response)

        if (response.success) {
          setMessages(messages.filter(msg => msg._id !== selectedMessage._id));
        }
        break;
      case 'reply':
        // Implement reply logic
        setReplyingTo(selectedMessage)
        break;
      case 'react':
        // Implement reaction logic
        break;
      case 'copy':
        // Implement copy to clipboard
        try {
          Clipboard.setString(selectedMessage.content);
        } catch (error) {
          console.log(error);
        }
        break;
      default:
        break;
    }

    closeActionMenu();
  };

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;

    let preview;

    switch (mediaPreview.type) {
      case 'image':
        preview = (
          <Image
            source={{ uri: mediaPreview.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        );
        break;

      case 'video':
        preview = (
          <>
            <View style={styles.previewVideoContainer}>
              <Image
                source={{ uri: mediaPreview.thumbnail || 'https://via.placeholder.com/300x200' }}
                style={styles.previewVideo}
                resizeMode="cover"
              />
              <View style={styles.previewPlayButton}>
                <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
            <Text style={styles.previewFileName} numberOfLines={1}>
              {mediaPreview.name}
            </Text>
          </>
        );
        break;

      case 'audio':
        preview = (
          <View style={styles.previewAudioContainer}>
            <Ionicons name="mic" size={24} color="#5F77F6" />
            <Text style={styles.previewAudioText}>
              Audio Recording - {mediaPreview.duration}
            </Text>
          </View>
        );
        break;

      case 'file':
        preview = (
          <View style={styles.previewFileContainer}>
            <Ionicons name="document-outline" size={24} color="#5F77F6" />
            <Text style={styles.previewFileName} numberOfLines={1}>
              {mediaPreview.name}
            </Text>
          </View>
        );
        break;

      default:
        preview = (
          <Text style={styles.previewText}>Unsupported media type</Text>
        );
    }

    return (
      <View style={styles.mediaPreviewContainer}>
        {preview}
        <TouchableOpacity
          style={styles.cancelPreviewButton}
          onPress={cancelMediaPreview}
        >
          <Ionicons name="close-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    );
  }

  const handleAttachmentPress = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
    Keyboard.dismiss();
  };

  const startRecording = () => { }
  const stopRecording = () => { }

  const handleOnMessageChange = text => {
    if (text.length > 0 && !isTyping) {
      startTyping();
      handleTextInput();
    }
    setMessageText(text);
  };

  const handleTextInput = debounce(() => {
    stopTyping();
  }, 6000);

  const stopTyping = () => {
    socket.emit('stop_typing', {
      roomId: chat?._id,
      userId: user?._id,
    });
  };

  const startTyping = () => {
    socket.emit('is_typing', {
      roomId: chat?._id,
      userId: user?._id
    });
  };

  const handleSendMessage = async () => {
    if ((messageText.trim() === '' && !mediaPreview) || !chat || !socket) return;

    try {
      let uploadedFile = null;

      if (mediaPreview) {
        uploadedFile = await uploadImage(); // ✅ Wait for upload to finish
      }

      const messageData = {
        chat: chat._id,
        sender: user,
        content: messageText.trim(),
        type: messageType,
        createdAt: new Date().toISOString(),
        file: uploadedFile,
        fileJobType: FileJobType.upload,
        fileURL: null,
        filename: uploadedFile?.name,
        fileType: uploadedFile?.type,
        fileJobStatus: FileJobStatus.progressing,
        totalBytes: uploadedFile?.size,
        bytesSent: 0,
        filePath: uploadedFile?.path,
        replyTo: replyingTo && {
          message: replyingTo._id,
          user: replyingTo.sender._id,
        },
      };

      // Optimistically add message to UI
      const tempMessage = {
        ...messageData,
        _id: `temp-${Date.now()}`,
        sending: true,
      };

      setMessages(prev => [tempMessage, ...prev]);
      setMessageText('');
      setReplyingTo(null);
      // setImage(null);
      setFile(null);
      setMessageType("text");


      // send to server
      const response = await api.post(`/api/messages`, messageData);

      // Replace temp message with saved message
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempMessage._id ? response.data : msg
        )
      );

      socket.emit('send_message', {
        chatId: chat._id,
        senderId: user._id,
        message: response.data,
      });
    } catch (error) {
      console.error('Message failed to send', error);
    }
  };

  const renderAttachmentOptions = () => (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickDocument}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#FF8C00' }]}>
          <Ionicons name="document-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Documents</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickVideo}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="film-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Videos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickImage}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="images-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Photos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={takePhoto}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#5F77F6' }]}>
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Camera</Text>
      </TouchableOpacity>
    </View>
  );


  const pickDocument = async () => {
    try {
      setShowAttachmentOptions(false);

      const result = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      })

      if (result) {
        setMediaPreview({
          type: 'file',
          uri: result.uri,
          name: result.name,
          size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
          mimeType: result.type,
          fileType: getFileTypeFromMimeType(result.type)
        });
        setMessageType("file")
      }
    } catch (error) {
      console.error('Error picking document:', error);
    } finally {
      // setIsUploading(false);
    }
  }

  const pickVideo = async () => {
    if (Platform.OS === "android") {
      await hasAndroidPermission();
    }

    try {

      const video = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
      });

      console.log(video)
      if (video) {
        setShowAttachmentOptions(false);
        setMediaPreview({
          type: 'video',
          uri: video[0].uri,
          name: video[0].name,
          size: `${(video[0].size / (1024 * 1024)).toFixed(1)} MB`,
          mimeType: video[0].type,
          fileType: getFileTypeFromMimeType(video[0].type)
        });
        setMessageType("video")
      }

    } catch (error) {

    }

  }

  const pickImage = async () => {
    try {
      if (Platform.OS === "android") {
        await hasAndroidPermission();
      }

      ImagePicker.openPicker({
        width: 1200,
        height: 1500,
        cropping: true,
        includeBase64: false,
        compressImageQuality: 1
      })
        .then(async image => {
          setShowAttachmentOptions(false);
          if (image) {
            setMediaPreview({
              type: 'image',
              uri: image.path,
              name: image.filename,
              mimeType: image.mime,
              fileType: getFileTypeFromMimeType(image.mime)
            });
            setMessageType("image")
          }
        })
        .catch(error => {
          console.log('error riased', error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const takePhoto = async () => {
    try {
      if (Platform.OS === "android") {
        await hasAndroidPermission();
      }

      ImagePicker.openCamera({
        width: 1200,
        height: 1500,
        cropping: true,
        includeBase64: false,
        compressImageQuality: 1
      })
        .then(async image => {
          setShowAttachmentOptions(false);
          if (image) {
            console.log(image)
            setMediaPreview({
              type: 'image',
              uri: image.path,
              name: "image.png",
              mimeType: image.mime,
              fileType: getFileTypeFromMimeType(image.mime)
            });
            setMessageType("image")
          }
        })
        .catch(error => {
          console.log('error riased', error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = async () => {
    if (!mediaPreview) return null;

    const data = new FormData();
    data.append('image', {
      fileName: mediaPreview.name,
      name: mediaPreview.name,
      type: mediaPreview.mimeType,
      size: mediaPreview.size,
      uri:
        Platform.OS === 'android'
          ? mediaPreview.uri
          : mediaPreview.uri.replace('file://', ''),
    });

    const token = await AsyncStorage.getItem('user');

    const response = await api.post('/api/files/upload-image', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.success) {
      const uploadedFile = response.data;
      setFile(uploadedFile);
      // setImage({ uri: `${BASE_API_URL}/image/${uploadedFile.name}` });
      setMediaPreview(null);
      return uploadedFile; // ✅ return the file
    }

    return null;
  };


  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader chat={chat} chatInfo={chatInfo} />
      {
        !chat &&
        <View style={styles.newChatContainer}>
          <View style={styles.firstMessageContainer}>
            <View style={styles.firstMessage}>
              <Text style={styles.firstMessageEmote}>Dit Salut! 👋</Text>
              <TouchableOpacity style={styles.firstMessageButton} onPress={createFirstMessage}>
                <Text style={styles.firstMessageText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }

      {
        chat &&
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            inverted
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            contentContainerStyle={styles.messagesList}
          />


          {
            isTyping && <TypingIndicator isVisible={isTyping}/>
          }


          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >

            {mediaPreview && renderMediaPreview()}

            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={handleAttachmentPress}
              >
                <Ionicons name="add-circle-outline" size={24} color="#333" />
              </TouchableOpacity>

              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.input}
                  value={messageText}
                  onChangeText={handleOnMessageChange}
                  placeholder="Taper un message..."
                  multiline
                  maxHeight={100}
                  editable={!isRecording}
                />
              </View>

              {isRecording ? (
                <View style={styles.recordingContainer}>
                  <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => stopRecording()}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelRecordingButton}
                    onPress={() => stopRecording(true)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {messageText.trim() !== '' || mediaPreview ? (
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={handleSendMessage}
                    >
                      <Ionicons name="send" size={24} color="#333" />
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.micButton}
                        onPress={startRecording}
                        onLongPress={startRecording}
                      >
                        <Ionicons name="mic-outline" size={24} color="#333" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.micButton}
                        onPress={takePhoto}
                      >
                        <Ionicons name="camera-outline" size={24} color="#333" />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
            {showAttachmentOptions && renderAttachmentOptions()}
          </KeyboardAvoidingView>

        </>
      }
    </SafeAreaView>
  )
}