import {
  View,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  InteractionManager,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import backgroundImage from '../assets/images/bg.jpeg';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../core/constants/Colors';
import { useApi } from '../core/contexts/ApiProvider';
import Bubble from '../core/components/Bubble';
import { useUser } from '../core/contexts/UserProvider';
import ReplyTo from './ReplyTo';
import { hasAndroidPermission } from '../core/helpers/ImagePickerUtil';
import ImagePicker from 'react-native-image-crop-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import { BASE_API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../core/contexts/SocketProvider';
import Typing from './Typing';
import CommonStyles from '../core/constants/CommonStyles';
import uuid from 'react-native-uuid';

import moment from 'moment';
import throttle from 'lodash.throttle';
import TextWithFont from '../core/components/TextWithFont';
import { textScale } from '../assets/styles/responsiveSize';

import { TimeAgo, formatChatDate } from '../core/helpers/Utility';
import axiosInstance from '../core/networks/AxiosInstance';
import CustomImageView from '../core/components/CustomImage';
import { useChat } from '../core/contexts/ChatProvider';
import { navigate } from '../core/helpers/RootNavigation';
import { MeetingVariable } from '../MeetingVariable';

export default function Chat({ navigation, route }) {
  const { chatId, userId } = route.params;

  const flatListRef = useRef(null);

  const api = useApi();
  const socket = useSocket();
  const { user } = useUser();
  const { chat, setChat } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  // const [chat, setChat] = useState(null);
  const [image, setImage] = useState();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('text');
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState();

  // const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const textInputRef = useRef(null);
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [chatInfo, setChatInfo] = useState();

  const [isTyping, setIsTyping] = useState(false); // To track if the current user is typing


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
      navigation.navigate('CALL', {
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

  const initiateCall = async (callType) => {
    if (isCallLoading) return;

    try {
      setIsCallLoading(true);

      // Start the outgoing call with CallKeep

      // Generate a unique call ID
      const callId = uuid.v4();

      // Prepare call data
      const callData = {
        chatId,
        callId,
        callType,
        caller: user,
      };

      // Call the backend API to initiate call
      const response = await axiosInstance.post(`/api/call/initiate-call`, callData);
      setChat(response.chat);

      const callUUID = MeetingVariable.callService.startCall(
        callId, chatInfo.chatId, chatInfo.chatName, chatInfo.isGroupChat, callData.callType === "video");

      // Navigate to call screen
      navigation.navigate('CALL', {
        callUUID,
        chatId: callData.chatId,
        cameraStatus: callData.callType === "video",
        microphoneStatus: false,
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
      Alert.alert('Call Failed', 'Could not connect the call. Please try again later.');
    } finally {
      setIsCallLoading(false);
    }
  };


  const joinCall = async data => {
    navigation.navigate('CALL', {
      chatId: data.chatId,
      cameraStatus: data.cameraStatus,
      microphoneStatus: data.microphoneStatus,
    });
    return false;
  };

  useEffect(() => {
    socket.emit('join_room', chatId);

    socket.on('new_message', data => {
      handleIncomingMessage(data);
    });

    socket.on('user_online', ({ userId, online, lastSeen }) => {
      if (userId == user._id) {
        setChatInfo({
          isOnline: online,
          lastSeen: !!lastSeen ? lastSeen : null,
        });
      }
    });

    return () => {
      socket.removeListener('new_message');
      socket.removeListener('user_online');
      socket.emit('leave_room', chatId);
    };
  }, []);

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

  const startTyping = () => {
    socket.emit('is_typing', { roomId: chatId, userId: user?._id });
  };

  const stopTyping = () => {
    socket.emit('stop_typing', {
      roomId: chatId,
      userId: user?._id,
    });
  };

  useEffect(() => {
    (async () => {
      if (!chatId || !user?._id) return;

      loadMessages();
      const response = await api.get(`/api/chats/${chatId}`);
      if (response.success) {
        setChat(response.chat);
        const chat = response.chat;
        const callee = chat?.users.find(u => u._id !== user?._id);

        setChatInfo({
          id: chat.isGroupChat ? chat?._id : callee?._id,
          avatar: chat.isGroupChat ? chat.image?.name : callee?.profilePicture,
          chatName: chat.isGroupChat ? chat?.chatName : callee?.fullName,
          isOnline: chat.isGroupChat ?
            `${chat.users.length} participants` :
            `${callee.isOnline}, ${TimeAgo(chat?.lastMessage?.createdAt)}`,
          isGroupChat: chat.isGroupChat,
        })
      }
    })();
  }, [chatId, user?._id]);


  useEffect(() => {
    (async () => {
      if (!userId) return;
      // get to know if user chat exist
      const response = await axiosInstance.get(`/api/chats/is-chat-exist/${userId}`);
      if (response.isChatExist) {
        navigation.navigate('CHATLIST', {
          chatId: response.chat._id,
        });
      }
      setChatInfo({
        id: response.user._id,
        avatar: response.user.profilePicture,
        chatName: response.user.fullName,
        isOnline: response.user.isOnline,
        isGroupChat: false,
      })
    })()
  }, [userId])

  const loadMessages = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await api.get(`/api/messages/${chatId}?page=${page}`);

      if (!response.success) return false;

      const newMessages = response.messages;
      const groupedMessages = newMessages.reduce((groups, message) => {
        const date = moment(message.createdAt).format('YYYY-MM-DD');
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {});

      setMessages(prevMessages => ({
        ...prevMessages,
        ...groupedMessages,
      }));

      setPage(prevPage => prevPage + 1);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = (messageId, messageMap) => {
    setMessages(prevState => {

      const newState = {};

      for (const date in prevState) {
        newState[date] = prevState[date].map(msg =>
          msg._id === messageId ? { ...msg, ...messageMap } : msg
        );
      }
    
      return newState;
    });
  };

  const removeMessage = (messageId) => {
    setMessages(prevState => {

      const newState = {};

      for (const date in prevState) {
        newState[date] = prevState[date].filter(msg => msg._id !== messageId);
      }
    
      return newState;
    });
  }

  const renderItem = (message, i) => {
    const isOwnMessage = message?.sender?._id === user?._id;

    let messageType;

    if (message?.type && message?.type === 'info') {
      messageType = 'info';
    } else if (isOwnMessage) {
      messageType = 'myMessage';
    } else {
      messageType = 'theirMessage';
    }

    const onPress = (type) => {
      switch (type) {
        case "image":
          navigate("GALLERY_VIEWER", { chatId, file : message?.file });
          break;
        case "reply":
          // Scroll to message id
          flatListRef.current?.scrollToIndex({ 
            i, 
            animated: true,
            viewPosition: 0.5 // 0 (top), 0.5 (center), 1 (bottom)
          });
          break;
      
        default:
          break;
      }
    }

    return (
      <Bubble
        key={message._id}
        messageType={messageType}
        type={message.type}
        message={message}
        messageId={message._id}
        text={message.content}
        likes={message.likes}
        createdAt={message.createdAt}
        setReply={() => setReplyingTo(message)}
        updateMessage={updateMessage}
        removeMessage={removeMessage}
        replyingTo={message.replyTo}
        sender={message.sender}
        file={message.file}
        onPress={onPress}
      />
    );
  };

  const renderDate = ({ item }) => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <TextWithFont
          style={{
            padding: 5,
            fontSize: textScale(16),
            backgroundColor: Colors.whiteColor,
            borderRadius: 15,
          }}>
          {formatChatDate(item)}
        </TextWithFont>
      </View>
    );
  };

  const groupedMessages = Object.entries(messages).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));

  const handleLoadMore = useCallback(throttle(loadMessages, 2000), [
    page,
    loading,
    hasMore,
  ]);

  const sendMessage = useCallback(async () => {
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!chatId || !socket) return;

    // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
    stopTyping();
    setIsSending(true);

    try {
      const content = messageText;
      const type = messageType;

      setMessageText('');
      setMessageType('text');

      const { data } = await api.post(`/api/messages`, {
        chat: chatId,
        sender: user?._id,
        content,
        replyTo: replyingTo && {
          message: replyingTo._id,
          user: replyingTo.sender._id,
        },
        file,
        type,
      });

      setReplyingTo(null);
      setImage(null);
      setFile(null);

      socket.emit('send_message', {
        chatId: chat._id,
        senderId: user._id,
        message: data,
      });


      setIsSending(false);
    } catch (error) {
      // setErrorBannerText('Message failed to send');
      // setTimeout(() => setErrorBannerText(''), 5000);
      setIsSending(false);
    }
  }, [messageText]);

  const handleIncomingMessage = message => {
    const date = moment(message.createdAt).format('YYYY-MM-DD');
    setMessages(prevMessages => {
      const updatedMessages = { ...prevMessages };
      if (!updatedMessages[date]) {
        updatedMessages[date] = [];
      }
      updatedMessages[date].push(message); // Add the new message to the beginning of the array
      return updatedMessages;
    });
  };

  const handleOnMessageChange = text => {
    if (text.length > 0 && !isTyping) {
      startTyping();
      handleTextInput();
    }
    setMessageText(text);
  };

  const pickImage = async () => {
    try {
      await hasAndroidPermission();

      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      })
        .then(async image => {
          setTempImageUri(image.path);
          setMessageType("image");
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
      await hasAndroidPermission();

      ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      })
        .then(async image => {
          setTempImageUri(image.path);
          setMessageType("image");
        })
        .catch(error => {
          console.log('error riased', error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = async () => {
    setIsLoading(true);

    const data = new FormData();
    data.append('image', {
      fileName: 'image',
      name: 'image.png',
      type: 'image/png',
      uri:
        Platform.OS == 'android'
          ? tempImageUri
          : tempImageUri.replace('file://', ''),
    });

    let token = await AsyncStorage.getItem('user');

    const response = await api.post('/api/files/upload-image', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.success) {
      setFile(response.data);
      setImage({ uri: `${BASE_API_URL}/image/${response.data.name}` });
      setMessageType("image");

      setIsLoading(false);

      setTempImageUri('');
    }
  };

  function debounce(func, delay = 500) {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const createFirstMessage = async () => {
    const response = await axiosInstance.post(
      `/api/chats/create-first-message/${userId}`, 
      { users: [user._id, userId] }
    );
    if (response.success) {

      navigation.navigate('CHATLIST', {
        chatId: response.data._id,
      });
    }
  };

  const handleTextInput = debounce(() => {
    stopTyping();
  }, 6000);

  if (isLoading && !messages) {
    return (
      <View style={CommonStyles.center}>
        <ActivityIndicator size={'large'} color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}>
        {chatInfo && <View style={styles.chatHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>


            <TouchableOpacity style={styles.headerInfoContainer} onPress={() =>
              chatInfo?.isGroupChat
                ? navigation.navigate('CHAT_SETTINGS', { id: chatInfo.id })
                : navigation.navigate('CONTACT', { id: chatInfo.id })
            }>
              <View style={styles.headerAvatar}>
                <CustomImageView
                  source={`${BASE_API_URL}/image/${chatInfo.avatar}`}
                  firstName={chatInfo?.chatName}
                  size={40}
                  fontSize={20}
                />
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{chatInfo.chatName}</Text>
                <Text style={[
                  styles.headerStatus,
                  chatInfo.isOnline ? styles.onlineStatus : styles.offlineStatus
                ]}>
                  {chatInfo.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerActions}>
            {chat && !chat.ongoingCall && <>
              <TouchableOpacity style={styles.headerButton} onPress={() => initiateCall('audio')}>
                <Icon name="phone" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => initiateCall('video')}>
                <Icon name="video" size={20} color="#333" />
              </TouchableOpacity>
            </>}
            {chat && chat.ongoingCall && 
            <TouchableOpacity style={[
              styles.headerButton, 
              styles.joinButton]} 
              onPress={() => { joinCall({
                chatId: chat._id,
                cameraStatus: false,
                microphoneStatus: true,
              });
            }}>
              <Text style={styles.joinButtonText}>Rejoindre</Text>
            </TouchableOpacity>}
          </View>
        </View>}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground
            source={backgroundImage}
            style={styles.backgroundImage}>
            {errorMessage && <Bubble text={errorMessage} type="error" />}

            {groupedMessages && (
              <View>
                <FlatList
                ref={flatListRef}
                  style={{ padding: 20 }}
                  data={groupedMessages}
                  renderItem={({ item, index }) => (
                    <View key={index}>
                      {renderDate({ item: item.date })}
                      {item.messages.map(msg => (
                        <View key={msg._id}>{renderItem(msg)}</View>
                      ))}
                    </View>
                  )}
                  keyExtractor={item => item.date}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={
                    loading && <ActivityIndicator size="large" />
                  }
                />
              </View>
            )}
          </ImageBackground>
        </TouchableWithoutFeedback>

        {replyingTo && (
          <ReplyTo message={replyingTo} onCancel={() => setReplyingTo(null)} />
        )}

        {image && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 5,
            }}>
            <Image source={image} style={styles.image} />
            <TouchableOpacity
              onPress={() => {
                setImage(null);
                setFile(null);
                setMessageType("text");
              }}>
              <Icon name="x-circle" size={24} color={Colors.blue} />
            </TouchableOpacity>
          </View>
        )}

        {isTyping && <Typing />}

        {chat && <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <Icon name="plus" size={24} color={Colors.grey} />
          </TouchableOpacity>

          <TextInput
            ref={textInputRef}
            style={styles.textbox}
            value={messageText}
            onChangeText={handleOnMessageChange}
            onSubmitEditing={sendMessage}
          />

          {isSending && (
            <ActivityIndicator
              style={styles.mediaButton}
              size={'small'}
              color={Colors.primary}
            />
          )}

          {!isSending && messageText === '' && (
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
              <Icon name="camera" size={24} color={Colors.grey} />
            </TouchableOpacity>
          )}

          {!isSending && messageText !== '' && (
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}>
              <Icon name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}

          <AwesomeAlert
            show={tempImageUri !== ''}
            title="Envoyer cette image?"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Annuler"
            confirmText="Envoyer"
            confirmButtonColor={Colors.primary}
            cancelButtonColor={Colors.red}
            titleStyle={styles.popupTitleStyle}
            onCancelPressed={() => setTempImageUri('')}
            onConfirmPressed={uploadImage}
            onDismiss={() => setTempImageUri('')}
            customView={
              <View>
                {isLoading && (
                  <ActivityIndicator size={'small'} color={Colors.primary} />
                )}

                {!isLoading && tempImageUri !== '' && (
                  <Image
                    source={{ uri: tempImageUri }}
                    style={{ width: 200, height: 200 }}
                  />
                )}
              </View>
            }
          />
        </View>}

        {
          userId && 
          <View style={styles.firstMessageContainer}>
            <View style={styles.firstMessage}>
              <Text style={styles.firstMessageEmote}>Dit Salut! 👋</Text>
              <TouchableOpacity style={styles.firstMessageButton} onPress={createFirstMessage}>
                <Text style={styles.firstMessageText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.lightGrey,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 35,
  },
  sendButton: {
    backgroundColor: Colors.blue,
    borderRadius: 50,
    padding: 8,
  },
  image: {
    width: 200,
    height: 200,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
  },
  onlineStatus: {
    color: '#4CAF50',
  },
  offlineStatus: {
    color: '#8a8a8a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  buttonContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 9,
    paddingRight: 9,
  },
  joinButtonText : {
    color : Colors.white
  },
  firstMessageContainer: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  firstMessage: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: 20,
  },
  firstMessageEmote: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  firstMessageButton: {
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    paddingHorizontal: 16,
    marginTop: 10,
    borderColor: Colors.lightGrey,
    padding: 12,
    borderRadius: 50,
    backgroundColor: Colors.blue,
    color: Colors.white
  },
  firstMessageText: {
    color: Colors.white
  }
});


// import { StyleSheet, Text, View } from 'react-native'
// import React, { useEffect, useState } from 'react'
// import ChatHeader from './ChatHeader'
// import ChatMessages from './ChatMessages'
// import ChatInput from './ChatInput'
// import { useSocket } from '../core/contexts/SocketProvider'
// import { useUser } from '../core/contexts/UserProvider'
// import axiosInstance from '../core/networks/AxiosInstance'

// export default function Chat({ navigation, route }) {
//   const { chatId, userId } = route.params;

//   const { user } = useUser();
//   const socket = useSocket();

//   const [messages, setMessages] = useState([]);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [cursor, setCursor] = useState(null);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     loadMessages();
//   }, []);

//   const loadMessages = async () => {
//     if (loadingMore || !hasMore) return;

//     setLoadingMore(true);

//     try {
//       const response = await axiosInstance.get(
//         `api/messages/${chatId}/group?before=${cursor || new Date().toISOString()}&limit=50`
//       );

//       if (response.length === 0) {
//         setHasMore(false);
//       } else {
//         // setItems(prev => [...response, ...prev]);
//         setMessages((prev) => [...response, ...prev]);

//         const oldestMsg = response
//           .filter(item => item.type === 'message')
//           .at(-1);

//         if (oldestMsg) {
//           setCursor(oldestMsg.message.createdAt);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to load messages:', err);
//     }

//     setLoadingMore(false);
//   };

//   const handleIncomingMessage = (msgPayload) => {
//     const { message } = msgPayload;

//     const msgDate = message.createdAt.split('T')[0];
//     const lastDateItem = messages.find(
//       (item) => item.type === 'date' && item.date.split('T')[0] === msgDate
//     );

//     const newItems = [];

    

//     // Insert new message
//     newItems.push({ type: 'message', message });

//     // Insert date separator if not already present
//     if (!lastDateItem) {
//       newItems.push({ type: 'date', date: msgDate });
//     }

//     // Update chat (add at the top if list is inverted)
//     setMessages((prev) => [...newItems, ...prev]);
//   };

//   const sendMessage = (data) => {
//     const newMsg = {
//       chat: chatId,
//       content: data.content,
//       sender: user?._id,
//       type: data.type,
//       createdAt: new Date().toISOString(),
//     };

//     // Optimistic UI (instant add)
//     handleIncomingMessage({ message: newMsg });

//     // Emit to server
//     // socket.emit('send_message', newMsg);
//     socket.emit('send_message', {
//       chatId,
//       senderId: user._id,
//       message: newMsg,
//     });
//   };

//   useEffect(() => {
//     socket.emit('join_room', chatId);

//     socket.on('send_message', newMsg => {
//       handleIncomingMessage({ message: newMsg });
//     });

//     socket.on('user_online', ({ userId, online, lastSeen }) => {
//       if (userId == receiverIds) {
//         setChatInfo({
//           isOnline: online,
//           lastSeen: !!lastSeen ? lastSeen : null,
//         });
//       }
//     });

//     return () => {
//       socket.removeListener('send_message');
//       socket.removeListener('user_online');
//       socket.emit('leave_room', chatId);
//     };
//   }, []);

//   return (
//     <View style={styles.chatContainer}>
//       <ChatHeader
//         navigation={navigation}
//         chatId={chatId}
//         userId={userId}
//         ongoingCall={false}
//       />
//       <ChatMessages
//         chatId={chatId}
//         messages={messages}
//         loadMessages={loadMessages}
//         loadingMore={loadingMore}
//       />
//       <ChatInput
//         chatId={chatId}
//         sendMessage={sendMessage} />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   chatContainer: {
//     flex: 1,
//     flexDirection: "column"
//   }
// })
