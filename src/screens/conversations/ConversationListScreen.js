import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import Ionicons from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';

import DataItem from '../../components/DataItem';
import Colors from '../../constants/Colors';
import CommonStyles from '../../constants/CommonStyles';
import { useSocket } from '../../contexts/SocketProvider';
import { useApi } from '../../contexts/ApiProvider';
import { useUser } from '../../contexts/UserProvider';
import { useFocusEffect } from '@react-navigation/native';
import { formatChatDate } from '../../utils/Utility';
import Navbar from '../../components/Navbar';
import { navigate } from '../../utils/RootNavigation';
import { styles } from './styles';
import { MeetingVariable } from '../../MeetingVariable';



export default function ConversationList({ route, navigation }) {
  const chatId = route?.params?.chatId;

  const { user } = useUser();
  const api = useApi();
  const socket = useSocket();

  const [chats, setChats] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [unReadMessages, setUnreadMessages] = useState([]);

  const chatPressed = async (chat) => {
    navigate('CHAT', {
      chatInfo: {
        chatId: chat._id,
        participants: chat.users,
        avatar: chat.isGroupChat ? chat.chatImage : chat.users[0].profilePicture,
        name: chat.isGroupChat ? chat.chatName : chat.users[0].fullName,
        status: chat.users[0].status,
        usersLenght: chat.users.length,
        lastSeen: chat.users[0].lastSeen,
        isGroupChat: chat.isGroupChat,
      }
    });
  };

  function updateConversationWithJoinButton(chatId, callerId, cameraStatus,
    microphoneStatus) {
    setChats(prev =>
      prev.map(conv =>
        conv._id === chatId
          ? {
            ...conv, ongoingCall: {
              chatId, callerId, cameraStatus,
              microphoneStatus
            }
          }
          : conv
      )
    );
  }

  function joinCall(data) {

    // Generate a unique call ID
    const callId = uuid.v4();

    // Prepare call data
    const callData = {
      chatId: data.ongoingCall.chatId,
      callId,
      callType: data.ongoingCall.cameraStatus ? "video" : "audio",
      caller: user,
    };

    const callUUID = MeetingVariable.callService.startCall(
      callId, data.ongoingCall.chatId, 
      data.isGroupChat ? data.users[0].fullName : data.chatName, 
      data.isGroupChat, callData.callType === "video");


    navigation.navigate('CALL', {
      callUUID,
      chatId: data.ongoingCall.chatId,
      cameraStatus: data.ongoingCall.cameraStatus,
      microphoneStatus: data.ongoingCall.microphoneStatus,
    });
  }

  useEffect(() => {
    if (!chatId) return;
    (async () => {
      setIsLoading(true);
      const response = await api.get(`/api/chats/${chatId}`);
      console.log(response.success);
      if (response.success) {
        setIsLoading(false);
        chatPressed(response.chat);
      }
    })();
  }, [chatId]);

  useEffect(() => {
    socket.emit('join_chat', user._id);

    socket.on('new_chat', chat => {
      setChats(oldArray => [...oldArray, chat])
    });

    socket.on('new_message', values => {
      setChats(prevState => {
        const newState = prevState.map(obj => {
          console.log(obj._id === values.chat._id)
          if (obj._id === values.chat._id) {
            return { ...obj, lastMessage: values };
          }
          return obj;
        });

        return newState;
      });
    });

    socket.on("call_notification", ({ chatId, callerId, cameraStatus,
      microphoneStatus }) => {
      updateConversationWithJoinButton(chatId, callerId, cameraStatus,
        microphoneStatus);
    });

    return () => {
      socket.removeListener('new_chat');
      socket.removeListener('new_message');
      socket.removeListener("call_notification");
      socket.emit('leave_chat', user._id);
    };
  }, []);


  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setIsLoading(true);
        const response = await api.get(`/api/chats`);
        if (response.success) {
          setChats(response.chats);
          setIsLoading(false);
        }
      })();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar navigation={navigation} />
      {isLoading && (
        <View style={CommonStyles.center}>
          <ActivityIndicator size={'large'} color={Colors.primary} />
        </View>
      )}

      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#A0A0A0" style={styles.searchIcon} />
          <Text style={styles.searchInput}>Rechercher</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFilterVisible(!filterVisible)}
          >
            <Ionicons name="filter" size={20} color={Colors.textColor} />
          </TouchableOpacity>
        </View>
      </View> */}

      {!isLoading && chats?.length === 0 && (
        <View style={CommonStyles.center}>
          <Icon
            name="message-circle"
            size={55}
            color={Colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>Aucunes conversations!</Text>
        </View>
      )}

      {!isLoading && chats?.length > 0 && (
        <FlatList
          style={{ paddingVertical: 0, paddingHorizontal: 16 }}
          data={chats}
          renderItem={({ item }) => {
            return (
              <>
                {item.isGroupChat ? (
                  <DataItem
                    title={item?.chatName}
                    subTitle={
                      item.lastMessage?.content ||
                      item.users[0]?.about ||
                      'hi!'
                    }
                    rightText={formatChatDate(item.lastMessage?.createdAt)}
                    unreadCount={
                      unReadMessages?.filter(n => n.chat._id === item._id)
                        .length
                    }
                    image={item?.image?.name}
                    onPress={() => chatPressed(item)}
                    ongoingCall={item.ongoingCall}
                    joinCall={() => joinCall(item)}
                  />
                ) : (
                  <DataItem
                    title={item?.users[0]?.fullName}
                    subTitle={
                      item?.lastMessage?.content ||
                      item?.users[0]?.about ||
                      'hi!'
                    }
                    rightText={formatChatDate(item?.lastMessage?.createdAt)}
                    unreadCount={
                      unReadMessages?.filter(n => n.chat._id === item._id)
                        .length
                    }
                    image={item.users[0]?.profilePicture}
                    onPress={() => chatPressed(item)}
                    ongoingCall={item.ongoingCall}
                    joinCall={() => joinCall(item)}
                  />
                )}
              </>
            );
          }}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          navigation.navigate("NEWCHAT");
        }}>
        <Icon name="message-circle" color={'#fff'} size={25} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
