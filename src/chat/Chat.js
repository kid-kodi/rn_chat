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
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';
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
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../core/components/CustomHeaderButton';
import { useSocket } from '../core/contexts/SocketProvider';
import Typing from './Typing';
import CommonStyles from '../core/constants/CommonStyles';
import CallKeepImpl from '../core/utils/CallKeepImpl';

import moment from 'moment';
import throttle from 'lodash.throttle';
import TextWithFont from '../core/components/TextWithFont';
import { textScale } from '../assets/styles/responsiveSize';

import { TimeAgo, formatChatDate } from '../core/helpers/Utility';
import CustomHeaderTitle from '../core/components/CustomHeaderTitle';


export default function Chat({ navigation, route }) {
  const { chatId } = route.params;

  const api = useApi();
  const socket = useSocket();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [chat, setChat] = useState(null);
  const [image, setImage] = useState();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [file, setFile] = useState();

  // const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const textInputRef = useRef(null);

  // useSocketListeners();

  const [receiverFullDetails, setReceriverFullDetails] = useState({
    online: false,
    lastSeen: null,
  });

  const typingTimeoutRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false); // To track if the current user is typing

  const flatList = useRef();

  const handleFocus = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleBlur = () => {
    if (textInputRef.current) {
      textInputRef.current.blur();
    }
  };

  const leaveRoom = () => {
    socket.emit('leave_room', chatId);
    navigation.goBack();
  };

  const initiateCall = async data => {
    await api.post(`/api/call/initiate-call`, data);
    socket.emit('call_started', {
      chatId, callerId: user?._id, cameraStatus: data.cameraStatus,
      microphoneStatus: data.microphoneStatus,
    });

    // CallKeepImpl.startCall({
    //   handle: data.callee.fullName,
    //   localizedCallerName: data.callee.fullName,
    // });
    navigation.navigate('CALL', {
      chatId: data.chatId,
      cameraStatus: data.cameraStatus,
      microphoneStatus: data.microphoneStatus,
    });
    // CallKeepImpl.backToForeground()
    return false;
  };

  const joinCall = async data => {
    

    // CallKeepImpl.startCall({
    //   handle: data.callee.fullName,
    //   localizedCallerName: data.callee.fullName,
    // });
    navigation.navigate('CALL', {
      chatId: data.chatId,
      cameraStatus: data.cameraStatus,
      microphoneStatus: data.microphoneStatus,
    });
    // CallKeepImpl.backToForeground()
    return false;
  };

  useEffect(() => {
    socket.emit('join_room', chatId);

    socket.on('send_message', data => {
      handleIncomingMessage(data);
    });

    socket.on('user_online', ({ userId, online, lastSeen }) => {
      if (userId == receiverIds) {
        setReceriverFullDetails({
          online: online,
          lastSeen: !!lastSeen ? lastSeen : null,
        });
      }
    });

    return () => {
      socket.removeListener('send_message');
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
      loadMessages();
      const response = await api.get(`/api/chats/${chatId}`);
      if (response.success) {
        setChat(response.chat);
        const chat = response.chat;
        const callee = chat?.users.find(u => u._id !== user._id);
        const chatName = chat.isGroupChat ? chat.chatName : callee.fullName;

        navigation.setOptions({
          headerTitle: () => {
            return (
              <CustomHeaderTitle
                title={chatName}
                subtitle={TimeAgo(chat?.lastMessage?.createdAt)}
                onPress={() =>
                  chat?.isGroupChat
                    ? navigation.navigate('CHAT_SETTINGS', { chat })
                    : navigation.navigate('CONTACT', { callee, chat })
                }
              />
            );
          },
          headerRight: () => {
            return (
              <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                {!chat.ongoingCall && <Item
                  title="Video"
                  iconName="video"
                  onPress={() => {
                    initiateCall({
                      chatId: chat._id,
                      callerId: user._id,
                      callee,
                      cameraStatus: true,
                      microphoneStatus: true,
                    });
                  }}
                />}
                {!chat.ongoingCall && <Item
                  title="Phone"
                  iconName="phone"
                  onPress={() => {
                    initiateCall({
                      chatId: chat._id,
                      callerId: user._id,
                      callee,
                      cameraStatus: false,
                      microphoneStatus: true,
                    });
                  }}
                />}
                {chat.ongoingCall && <Item
                  title="Rejoindre"
                  iconName="phone"
                  onPress={() => {
                    joinCall({
                      chatId: chat._id,
                      callerId: user._id,
                      callee,
                      cameraStatus: false,
                      microphoneStatus: true,
                    });
                  }}
                />}
              </HeaderButtons>
            );
          },
        });
      }
    })();
  }, [chatId]);

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

  const renderItem = (message, i) => {
    const isOwnMessage = message.sender._id === user._id;

    let messageType;

    if (message?.type && message?.type === 'info') {
      messageType = 'info';
    } else if (isOwnMessage) {
      messageType = 'myMessage';
    } else {
      messageType = 'theirMessage';
    }

    return (
      <Bubble
        key={message._id}
        type={messageType}
        message={message}
        messageId={message._id}
        text={message.content}
        likes={message.likes}
        createdAt={message.createdAt}
        setReply={() => setReplyingTo(message)}
        removeMessage={() => removeMessage(message)}
        replyingTo={message.replyTo}
        sender={message.sender}
        file={message.file}
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

  // const fetchUserDetails = async () => {
  //   try {
  //     const response = await api.get(`/api/users/${callee?._id}`);
  //     if (response.success) {
  //       setReceriverFullDetails({
  //         online: !!response.data?.online ? response?.data?.online : false,
  //         lastSeen: !!response.data?.lastSeen ? response?.data?.lastSeen : null,
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const sendMessage = useCallback(async () => {
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!chatId || !socket) return;

    // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
    stopTyping();
    setIsSending(true);

    try {
      const content = messageText;
      setMessageText('');
      const { data } = await api.post(`/api/messages`, {
        chat: chatId,
        sender: user?._id,
        content,
        replyTo: replyingTo && {
          message: replyingTo._id,
          user: replyingTo.sender._id,
        },
        file,
        type: 'text',
      });

      setReplyingTo(null);
      setImage(null);
      setFile(null);
      handleIncomingMessage(data);

      socket.emit('send_message', {
        chatId: chat._id,
        userId: user._id,
        senderId: user._id,
        message: data,
      });
      setIsSending(false);
    } catch (error) {
      setErrorBannerText('Message failed to send');
      setTimeout(() => setErrorBannerText(''), 5000);
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
      updatedMessages[date].unshift(message); // Add the new message to the beginning of the array
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground
            source={backgroundImage}
            style={styles.backgroundImage}>
            {errorMessage && <Bubble text={errorMessage} type="error" />}

            {groupedMessages && (
              <View>
                <FlatList
                  style={{ padding: 20 }}
                  data={groupedMessages}
                  renderItem={({ item }) => (
                    <>
                      {item.messages.map(msg => (
                        <View key={msg._id}>{renderItem(msg)}</View>
                      ))}
                      {renderDate({ item: item.date })}
                    </>
                  )}
                  keyExtractor={item => item.date}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.1}
                  ListFooterComponent={
                    loading && <ActivityIndicator size="large" />
                  }
                  inverted
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
              }}>
              <Icon name="x-circle" size={24} color={Colors.blue} />
            </TouchableOpacity>
          </View>
        )}

        {isTyping && <Typing />}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
            <Icon name="plus" size={24} color={Colors.blue} />
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
              <Icon name="camera" size={24} color={Colors.blue} />
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
        </View>
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
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//   },
//   backgroundImage: {
//     flex: 1,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     paddingVertical: 8,
//     paddingHorizontal: 10,
//     height: 50,
//   },
//   textbox: {
//     flex: 1,
//     borderWidth: 1,
//     borderRadius: 50,
//     borderColor: Colors.lightGrey,
//     marginHorizontal: 15,
//     paddingHorizontal: 12,
//   },
//   mediaButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 35,
//   },
//   sendButton: {
//     backgroundColor: Colors.blue,
//     borderRadius: 50,
//     padding: 8,
//   },
//   popupTitleStyle: {
//     fontFamily: 'medium',
//     letterSpacing: 0.3,
//     color: Colors.textColor,
//   },
//   image: {
//     width: 200,
//     height: 200,
//   },
// });
