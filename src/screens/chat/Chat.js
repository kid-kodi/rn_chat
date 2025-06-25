import { useRef, useState, useEffect, useCallback } from 'react';
import { SafeAreaView, FlatList, View, KeyboardAvoidingView, Platform, Keyboard, Modal, Alert, Animated, Linking, PermissionsAndroid } from 'react-native'
import { useUser } from '../../contexts/UserProvider';
import { Image } from 'react-native';
import { Text } from 'react-native';
import { useApi } from '../../contexts/ApiProvider';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './chatStyles';
import { navigate } from '../../utils/RootNavigation';
import { TextInput } from 'react-native';
import { debounce, getFileNameFromUri, getFileTypeFromMimeType } from '../../utils/Utils';
import { useSocket } from '../../contexts/SocketProvider';
import { hasAndroidPermission } from '../../utils/ImagePickerUtil';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { MeetingVariable } from '../../MeetingVariable';
import { FileJobStatus, FileJobType } from '../../utils/Types';
import MessageBubble from './MessageItem';

import ChatHeader from './ChatHeader';
import { TypingIndicator } from '../../components/TypingIndicator';

import AudioRecorderPlayer from 'react-native-audio-recorder-player';

import RNFS from 'react-native-fs';
import ReplyTo from './ReplyTo';
import ForwardModal from './ForwardModal';

const MESSAGES_PER_PAGE = 50;
const maxDuration = 300; // 5 minutes in seconds
const minDuration = 1; // minimum 1 second

const audioRecorderPlayer = new AudioRecorderPlayer();

const options = [
  'Reply',
  'Forward',
  'Copy',
  'Delete',
  'Share',
  'Info',
  'Cancel'
];

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

  const [file, setFile] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  // const [messages, setMessages] = useState([]);
  const [mediaPreview, setMediaPreview] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  // const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [recordingPath, setRecordingPath] = useState(null);
  const [duration, setDuration] = useState('00:00');
  const [hasPermission, setHasPermission] = useState(false);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [forwardModalVisible, setForwardModalVisible] = useState(false);

  // Sample contacts data - replace with your actual contacts
  const [contacts, setContacts] = useState([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    // Add more contacts as needed
  ]);

  const recordingRef = useRef(null);
  const durationTimerRef = useRef(null);

  const recordingTimer = useRef(null);

  const flatListRef = useRef()

  const getChatById = async (chat_id) => {
    try {
      const response = await api.get(
        `/api/chats/${chat_id}`
      );

      setChat(response.chat);
      setChatInfo({
        chatId: response?.chat?.isGroupChat ? response?.chat?._id : response?.chat?.users[0]._id,
        isGroupChat: response?.chat?.isGroupChat,
        avatar: response?.chat?.isGroupChat ? response?.chat?.chatImage : response?.chat?.users[0]?.profilPicture,
        name: response?.chat?.isGroupChat ? response?.chat?.chatName : response?.chat?.users[0]?.fullName,
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


  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setHasPermission(true);
        } else {
          Alert.alert('Permission denied', 'Cannot record audio without permissions');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      setHasPermission(true); // iOS permissions handled in Info.plist
    }
  };

  useEffect(() => {
    checkPermissions();

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

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


  // Handle message press (tap)
  const handleMessagePress = (message) => {
    switch (message.type) {
      case 'text':
        console.log('Text message pressed:', message.content);
        break;

      case 'image':
        // Open image in full screen or image viewer
        Alert.alert(
          'Image Message',
          'Open image in full screen viewer?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'View',
              onPress: () => {
                // Here you would typically navigate to an image viewer
                console.log('Opening image:', message.uri);
                // Example: navigation.navigate('ImageViewer', { uri: message.uri });
              }
            },
          ]
        );
        break;

      case 'video':
        // Open video player
        Alert.alert(
          'Video Message',
          'Open video player?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Play',
              onPress: () => {
                console.log('Playing video:', message.uri);
                // Example: navigation.navigate('VideoPlayer', { uri: message.uri });
              }
            },
          ]
        );
        break;

      case 'audio':
        // Audio play/pause is handled within the MessageItem component
        console.log('Audio message pressed - handled by component');
        break;

      case 'document':
        // Open document
        Alert.alert(
          'Document',
          `Open ${message.fileName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open',
              onPress: () => {
                if (message.uri) {
                  Linking.openURL(message.uri).catch(err => {
                    Alert.alert('Error', 'Cannot open document');
                    console.error('Cannot open URL:', err);
                  });
                }
              }
            },
          ]
        );
        break;

      default:
        console.log('Unknown message type pressed');
    }
  };

  // Handle message long press
  const handleMessageLongPress = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const handleForward = (message) => {
    setSelectedMessage(null);
    setModalVisible(false);

    toggleSelectMode(true);
    toggleMessageSelect(message);
  }

  const handleOptionPress = (option) => {
    setModalVisible(false);

    switch (option) {
      case 'Reply':
        setReplyingTo(selectedMessage);
        break;
      case 'Forward':
        handleForward(selectedMessage);
        break;
      case 'Copy':
        Clipboard.setString(selectedMessage);
        Alert.alert('Copied', 'Message copied to clipboard');
        break;
      case 'Delete':
        Alert.alert('Delete', `Are you sure you want to delete this message?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => console.log('Message deleted') }
        ]);
        break;
      case 'Share':
        Alert.alert('Share', `Sharing: ${selectedMessage}`);
        break;
      case 'Info':
        Alert.alert('Info', `Message info: ${selectedMessage}`);
        break;
      case 'Cancel':
        // Just close the modal
        break;
      default:
        break;
    }
  };


  const renderMessage = ({ item }) => {
    const isUserMessage = item.sender._id === user._id; // Current user ID

    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.contactMessageContainer
      ]}>
        <View style={{ maxWidth: "100%" }}>
          <MessageBubble
            message={item}
            isOwn={isUserMessage}
            user={user}
            onPress={handleMessagePress}
            onLongPress={handleMessageLongPress}
            onReplyPress={handleReplyPress}
            isSelectMode={isSelectMode}
            isSelected={selectedMessages.some(m => m._id === item._id)}
            onToggleSelect={toggleMessageSelect}
          />
        </View>
      </View>
    );
  }

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording audio
  const startRecording = async () => {
    if (!hasPermission) {
      await checkPermissions();
      return;
    }

    try {
      setIsRecording(true);

      const result = await audioRecorderPlayer.startRecorder();
      console.log('Recording started at: ', result);

      audioRecorderPlayer.addRecordBackListener((e) => {
        const seconds = Math.floor(e.currentPosition / 1000);
        setRecordingTime(formatTime(seconds));
        // Auto-stop at max duration
        if (seconds >= maxDuration) {
          stopRecording();
        }
      });

      // setIsPaused(false);
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  }

  // Stop recording audio
  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      setIsRecording(false);

      // Check minimum duration
      const seconds = Math.floor(result / 1000);
      if (seconds < minDuration) {
        Alert.alert('Recording too short', `Minimum recording duration is ${minDuration} second(s)`);
        await deleteRecording();
        return;
      }

      setDuration(formatTime(seconds));

      const fileInfo = await RNFS.stat(result);
      const fileSizeInMB = (fileInfo.size / 1024 / 1024).toFixed(2);

      const fileName = getFileNameFromUri(result);
      const fileType = getFileTypeFromMimeType(fileName);

      setMediaPreview({
        type: 'audio',
        uri: result,
        duration: recordingTime,
        name: fileName,
        mimeType: Platform.OS === "android" ? "audio/mp4" : "audio/m4a",
        fileType: fileType,
        size: fileSizeInMB
      });
      setMessageType("audio")

      setRecordingTime('00:00');

    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  }

  const deleteRecording = async () => {
    if (recordingPath && await RNFS.exists(recordingPath)) {
      try {
        await RNFS.unlink(recordingPath);
      } catch (error) {
        console.error('Delete recording error:', error);
      }
    }
    resetRecording();
  };

  const resetRecording = () => {
    setRecordingPath(null);
    setRecordingTime('00:00');
    setDuration('00:00');
    setPlayTime('00:00');
    setWaveformData([]);
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
  };

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

  // Function to handle reply press and scroll to message
  const handleReplyPress = (repliedMessage) => {
    const index = messages.findIndex(msg => msg._id === repliedMessage._id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // Scroll to center of screen
      });

      // Optional: Highlight the message briefly
      const originalBgColor = messages[index].bgColor;
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[index] = {
          ...newMessages[index],
          bgColor: '#FFF9C4' // Highlight color
        };
        return newMessages;
      });

      // Reset the highlight after 2 seconds
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[index] = {
            ...newMessages[index],
            bgColor: originalBgColor
          };
          return newMessages;
        });
      }, 2000);
    }
  };

  // Toggle selection mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedMessages([]); // Clear selection when exiting
    }
  };

  // Toggle individual message selection
  const toggleMessageSelect = (message) => {
    setSelectedMessages(prev =>
      prev.some(m => m._id === message._id)
        ? prev.filter(m => m._id !== message._id)
        : [...prev, message]
    );
  };

  // Handle forwarding selected messages
  const handleForwardSelected = (contactIds) => {
    selectedMessages.forEach(message => {
      // Your forwarding logic for each message
      console.log('Forwarding message:', message._id, 'to contacts:', contactIds);
    });
    setForwardModalVisible(false);
    setIsSelectMode(false);
    setSelectedMessages([]);
  };

  const SelectionBar = () => (
    <View style={styles.selectionHeader}>
      <TouchableOpacity onPress={() => selectedMessages.length > 0 && setForwardModalVisible(true)}>
        <Ionicons name='arrow-redo-outline' size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {selectedMessages.length} Selectionnes
      </Text>
      <TouchableOpacity
        onPress={() => selectedMessages.length > 0 && setForwardModalVisible(true)}
        disabled={selectedMessages.length === 0}
      >
        <Ionicons name='share-outline' size={24} />
      </TouchableOpacity>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        setIsSelectMode={setIsSelectMode}
        isSelectMode={isSelectMode}
        chat={chat}
        chatInfo={chatInfo} />
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
            onScrollToIndexFailed={(info) => {
              // Fallback for when scrollToIndex fails
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              });
            }}
          />


          {
            isTyping && <TypingIndicator isVisible={isTyping} />
          }

          {
            replyingTo &&
            <ReplyTo
              onCancel={() => {
                setReplyingTo(null);
                setSelectedMessage(null)
                setMessageType("text");
              }}
              message={selectedMessage}
            />

          }

          {
            isSelectMode && <SelectionBar />
          }


          {!isSelectMode &&
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
                      onPress={takePhoto}
                    >
                      <Ionicons name="camera-outline" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={isRecording && { position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}>
                      <View style={styles.recordingContainer}>
                        {/* Recording Indicator */}
                        {isRecording && (

                          <View style={styles.recordingIndicator}>
                            <Ionicons name="recording-outline" size={16} color="red" />
                            <Text style={styles.recordingTime}>{recordingTime}</Text>
                            <Text style={styles.recordingText}>Recording...</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.attachButton}
                          onPressIn={startRecording}
                          onPressOut={stopRecording}
                        >
                          <Ionicons name={isRecording ? "stop" : "mic-outline"} size={24} color={isRecording ? "red" : "#075E54"} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </View>
              {showAttachmentOptions && renderAttachmentOptions()}
            </KeyboardAvoidingView>
          }
        </>
      }
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={[
                  styles.optionText,
                  option === 'Cancel' && styles.cancelText,
                  option === 'Delete' && styles.deleteText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ForwardModal
        visible={forwardModalVisible}
        onClose={() => setForwardModalVisible(false)}
        messages={selectedMessages}
        contacts={contacts}
        onForward={handleForwardSelected}
      />

    </SafeAreaView >
  )
}