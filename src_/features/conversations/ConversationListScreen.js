import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import Icon from 'react-native-vector-icons/Feather';

import Ionicons from 'react-native-vector-icons/Ionicons';
import uuid from 'react-native-uuid';

import DataItem from '../../components/DataItem';
import Colors from '../../common/constants/Colors';
import CommonStyles from '../../common/constants/CommonStyles';
import {useSocket} from '../../contexts/SocketProvider';
import {useApi} from '../../contexts/ApiProvider';
import {useUser} from '../../contexts/UserProvider';
import {useFocusEffect} from '@react-navigation/native';
import {formatChatDate} from '../../common/utils/Utility';
import Navbar from '../../components/Navbar';
import {navigate} from '../../common/utils/RootNavigation';
import {styles} from './styles';
import {MeetingVariable} from '../../common/MeetingVariable';
import SearchModal from './SearchModal';

export default function ConversationList({route, navigation}) {
  const chatId = route?.params?.chatId;
  const selectedUserId = route?.params?.selectedUserId;

  const {user} = useUser();
  const api = useApi();
  const socket = useSocket();

  const [chats, setChats] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const [unReadMessages, setUnreadMessages] = useState([]);

  // Search modal and filter state
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [sections, setSections] = useState([
    {key: 'conversations', title: 'Discussions', data: []},
    {key: 'messages', title: 'Messages', data: []},
    {key: 'contacts', title: 'Contacts', data: []},
  ]);

  const chatPressed = async chat => {
    navigate('CHAT', {chatId: chat._id});
  };

  function updateConversationWithJoinButton(
    chatId,
    callerId,
    cameraStatus,
    microphoneStatus,
  ) {
    setChats(prev =>
      prev.map(conv =>
        conv._id === chatId
          ? {
              ...conv,
              ongoingCall: {
                chatId,
                callerId,
                cameraStatus,
                microphoneStatus,
              },
            }
          : conv,
      ),
    );
  }

  function joinCall(data) {
    const callId = uuid.v4();
    const callData = {
      chatId: data.ongoingCall.chatId,
      callId,
      callType: data.ongoingCall.cameraStatus ? 'video' : 'audio',
      caller: user,
    };
    navigation.navigate('CALL', {
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
      if (response.success) {
        setIsLoading(false);
        chatPressed(response.chat);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    socket.emit('join_chat', user._id);

    socket.on('new_chat', chat => {
      setChats(oldArray => [...oldArray, chat]);
    });

    socket.on('new_message', values => {
      setChats(prevState => {
        const newState = prevState.map(obj => {
          if (obj._id === values.chat._id) {
            return {...obj, lastMessage: values};
          }
          return obj;
        });
        return newState;
      });
    });

    socket.on(
      'call_notification',
      ({chatId, callerId, cameraStatus, microphoneStatus}) => {
        updateConversationWithJoinButton(
          chatId,
          callerId,
          cameraStatus,
          microphoneStatus,
        );
      },
    );

    return () => {
      socket.removeListener('new_chat');
      socket.removeListener('new_message');
      socket.removeListener('call_notification');
      socket.emit('leave_chat', user._id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    navigate('CHAT', {newChat: {participants: [selectedUserId, user._id]}});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const response = await api.get(`/api/chats`);
      if (response.success) {
        setChats(response.chats);
        setIsLoading(false);
      }
    })();
  }, []);

  // Render chat list (filtered if searching)
  const renderChatList = dataList => (
    <FlatList
      style={{paddingVertical: 0, paddingHorizontal: 16}}
      data={dataList}
      keyExtractor={item => item._id}
      renderItem={({item}) => {
        return (
          <>
            {item.isGroupChat ? (
              <DataItem
                title={item?.chatName}
                subTitle={
                  item.lastMessage?.content || item.users[0]?.about || 'hi!'
                }
                rightText={formatChatDate(item.lastMessage?.createdAt)}
                unreadCount={
                  unReadMessages?.filter(n => n.chat._id === item._id).length
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
                  item?.lastMessage?.content || item?.users[0]?.about || 'hi!'
                }
                rightText={formatChatDate(item?.lastMessage?.createdAt)}
                unreadCount={
                  unReadMessages?.filter(n => n.chat._id === item._id).length
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
      ListEmptyComponent={
        <View style={CommonStyles.center}>
          <Icon
            name="message-circle"
            size={55}
            color={Colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>
            {searchText ? 'Aucun résultat trouvé.' : 'Aucunes conversations!'}
          </Text>
        </View>
      }
      keyboardShouldPersistTaps="handled"
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Navbar navigation={navigation} />

      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={20}
            color={Colors.grey}
            style={{marginRight: 8}}
          />
          <Text style={styles.searchText}>Rechercher...</Text>
        </TouchableOpacity>
      </View>
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        query={searchText}
        onChangeQuery={setSearchText}
        onPressFilter={key => {
          /* filter switch */
        }}
        sections={sections}
        loading={searchLoading}
      />

      {isLoading && (
        <View style={CommonStyles.center}>
          <ActivityIndicator size={'large'} color={Colors.primary} />
        </View>
      )}

      {!isLoading && (!chats || chats.length === 0) && (
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

      {!isLoading && chats?.length > 0 && renderChatList(chats)}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          navigation.navigate('NEWCHAT');
        }}>
        <Icon name="message-circle" color={'#fff'} size={25} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
