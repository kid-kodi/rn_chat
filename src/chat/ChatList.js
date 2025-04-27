import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Feather';

import DataItem from '../core/components/DataItem';
import Colors from '../core/constants/Colors';
import CommonStyles from '../core/constants/CommonStyles';
import { useSocket } from '../core/contexts/SocketProvider';
import { useApi } from '../core/contexts/ApiProvider';
import { useUser } from '../core/contexts/UserProvider';
// import {useIsFocused} from '@react-navigation/native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import {
  TimeAgo,
  formatChatDate,
  formatToDate,
  formatToTime,
} from '../core/helpers/Utility';

export default function ChatList({ route, navigation }) {
  const chatId = route?.params?.chatId;


  const { user } = useUser();
  const api = useApi();
  const socket = useSocket();

  const [chats, setChats] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [unReadMessages, setUnreadMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const chatPressed = async chatId => {
    navigation.navigate('CHAT', {
      chatId,
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
    console.log(data);
    navigation.navigate('CALL', {
      chatId: data.ongoingCall.chatId,
      cameraStatus: data.ongoingCall.cameraStatus,
      microphoneStatus: data.ongoingCall.microphoneStatus,
    });
  }


  useEffect(() => {
    if (!chatId) return;
    chatPressed(chatId);
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
    <React.Fragment>
      {isLoading && (
        <View style={CommonStyles.center}>
          <ActivityIndicator size={'large'} color={Colors.primary} />
        </View>
      )}

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
        <View style={styles.chatList}>
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
                      onPress={() => chatPressed(item._id)}
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
                      onPress={() => chatPressed(item._id)}
                      ongoingCall={item.ongoingCall}
                      joinCall={() => joinCall(item)}
                    />
                  )}
                </>
              );
            }}
          />
        </View>
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          navigation.navigate("NEWCHAT");
        }}>
        <Icon name="message-circle" color={'#fff'} size={25} />
      </TouchableOpacity>
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  chatList: {
    backgroundColor: Colors.white,
    flexGrow: 1
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: Colors.textColor,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  newGroupText: {
    color: Colors.blue,
    fontSize: 17,
    marginBottom: 5,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 50,
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
