import { Animated, FlatList, Keyboard, Modal, StyleSheet, Text, View, TextInput } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MeetingVariable } from '../MeetingVariable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { windowWidth } from '../core/utils/Utils';
import axiosInstance from '../core/networks/AxiosInstance';
import { useUser } from '../core/contexts/UserProvider';
import { MessageType } from '../core/utils/Types';
import moment from 'moment';
import { Avatar } from 'react-native-elements';
import { ChatBubble, FileBubble } from '../core/components/ChatBubble';
import { config_key } from '../core/constants/Config';

export default function ChatScreen(props) {
  const chatId = props.route.params.chatId;
  const [text, setText] = useState(null);
  const [toolBar, setToolBar] = useState(false);
  const [oneToOne, setOneToOne] = useState(0);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [messages, setMessages] = useState(MeetingVariable.messages);
  const [currentUser, setCurrentUser] = useState(null);

  const [chatName, setChatName] = useState('');
  const currentChat = useRef();
  const {user} = useUser();

  const sendButtonWidth = useRef(new Animated.Value(0)).current;
  const addButtonWidth = useRef(new Animated.Value(50)).current;
  const toolsBarFlex = useRef(new Animated.Value(0)).current;
  const listRef = useRef();

  const keyboardWillShow = useCallback(() => {
    if (toolBar) {
      hideToolBar();
    }
  }, [toolBar]);

  const onChangeText = (value) => {
    if (value != null && value.length !== 0) {
      hideAddButton();
      showSendButton();
    } else {
      showAddButton();
      hideSendButton();
    }
    setText(value);
    setToolBar(false);
  };

  const sendMessage = () => {
    const peerId = selected ? selected : null;
    const message = {
      type: MessageType.text,
      fromMyself: true,
      text: text,
      timestamp: moment(),
      broadcast: true,
      toPeerId: selected,
    };

    try {
      MeetingVariable.mediaService.sendText(peerId, text, message.timestamp);

      if (!message.broadcast && message.toPeerInfo == null) {
        message.toPeerInfo = MeetingVariable.mediaService
          .getPeerDetailByPeerId(message.toPeerId)
          .getPeerInfo();
      }

      MeetingVariable.messages.push(message);
      setMessages([...MeetingVariable.messages]);
      setText(null);

      hideSendButton();
      showAddButton();
      listRef.current?.scrollToEnd();
    } catch (e) {
      // Handle error (you commented out toast)
    }
  };

  const recvNewMessage = (message) => {
    message.peerInfo = MeetingVariable.mediaService
      .getPeerDetailByPeerId(message.fromPeerId)
      .getPeerInfo();
    message.fromMyself = false;
    MeetingVariable.messages.push(message);
    setMessages([...MeetingVariable.messages]);
    listRef.current?.scrollToEnd();
  };

  const showToolBar = () => {
    setToolBar(true);
    Animated.timing(toolsBarFlex, {
      toValue: 0.12,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const hideToolBar = () => {
    setToolBar(false);
    Animated.timing(toolsBarFlex, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const showSendButton = () => {
    Animated.timing(sendButtonWidth, {
      toValue: 75,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const hideSendButton = () => {
    Animated.timing(sendButtonWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const showAddButton = () => {
    Animated.timing(addButtonWidth, {
      toValue: 50,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const hideAddButton = () => {
    Animated.timing(addButtonWidth, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    (async () => {
      if (!chatId) return;

      const { chat } = await axiosInstance.get(`/api/chats/${chatId}`);

      if (chat) currentChat.current = chat;

      const callee = chat?.users.find(u => u._id !== user._id);
      const _chatName = chat?.isGroupChat ? chat?.chatName : callee?.fullName;
      setChatName(_chatName);

      // Scroll to bottom after initial mount
      if (listRef.current) {
        listRef.current.scrollToEnd();
      }


      try {
        await MeetingVariable.mediaService.joinMeeting(
          currentChat?.current._id,
          user,
        );
        await MeetingVariable.mediaStreamFactory.waitForUpdate();

      } catch (e) {
        console.log(e)
        toast.show(e, { type: 'danger', duration: 1300, placement: 'top' });
      }
    })();

    MeetingVariable.mediaService.registerNewMessageListener(
      'messagesInMeetingChatPage',
      recvNewMessage,
    );

    const keyboardListener = Keyboard.addListener('keyboardDidShow', keyboardWillShow);

    // Cleanup function, similar to componentWillUnmount
    return () => {
      MeetingVariable.mediaService.deleteNewMessageListener('messagesInMeetingChatPage');
      keyboardListener.remove();
    };
  }, []);


  // File upload
  uploadFile = async () => {
    if (this.state.selected) {
      return;
    }

    let file = null;

    try {
      file = await MeetingVariable.fileService.pickFile();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.warn('[File] User cancelled file picker');
        return;
      } else {
        console.error('[Error] Fail to upload file', err);
        return;
      }
    }

    let message = {
      type: MessageType.file,
      timestamp: moment(),
      fromMyself: true,
      fileJobType: FileJobType.upload,
      fileURL: null,
      filename: file.name,
      fileType: file.type,
      fileJobStatus: FileJobStatus.progressing,
      totalBytes: file.size,
      bytesSent: 0,
      filePath: file.path,
    };

    try {
      MeetingVariable.messages.push(message);
      this.setState({ messages: MeetingVariable.messages });

      const fileURL = await MeetingVariable.fileService.uploadFile(
        file,
        (bytesSent, totalBytes) => {
          message.bytesSent = bytesSent;
          message.totalBytes = totalBytes;
          this.setState({ messages: MeetingVariable.messages });
        },
      );
      message.fileURL = fileURL;
      message.fileJobStatus = FileJobStatus.completed;
      this.setState({ messages: MeetingVariable.messages });
      this.listRef.current.scrollToEnd();

      await MeetingVariable.mediaService.sendFile(
        fileURL,
        message.timestamp,
        message.filename,
        message.fileType,
      );
    } catch (err) {
      message.fileJobStatus = FileJobStatus.failed;
      this.setState({ messages: MeetingVariable.messages });
      console.error('[Error] Fail to upload file', err);
    }
  };

  // Download file
  downloadFile = async message => {
    try {
      const filePath = `${MeetingVariable.fileService.getBundlePath()}/${message.filename}`;
      await MeetingVariable.fileService.download(
        message.fileURL,
        filePath,
        (bytesSent, totalBytes) => {
          message.bytesSent = bytesSent;
          message.totalBytes = totalBytes;
          this.setState({ messages: MeetingVariable.messages });
        },
        status => {
          message.fileJobStatus = status;
          this.setState({ messages: MeetingVariable.messages });
        },
      );
      message.filePath = filePath;
      this.setState({ messages: MeetingVariable.messages });
    } catch (err) {
      message.fileJobStatus = FileJobStatus.failed;
      this.setState({ messages: MeetingVariable.messages });
      console.error('[Error] Fail to download file', JSON.stringify(err));
    }
  };

  // Render text message
  renderTextItem = ({ item }) => {
    return (
      <View style={[
        style.listItem,
        { justifyContent: item.fromMyself ? 'flex-end' : 'flex-start' },
      ]}>
        {item.fromMyself && !item.broadcast && (
          <View style={[style.privateTip, { marginRight: 3 }]}>
            <Text style={style.tipFont} numberOfLines={1}>
              Seulement {item.toPeerInfo.displayName} visible
            </Text>
          </View>
        )}
        {!item.fromMyself && (
          <View style={style.avatarContainer}>
            <Avatar
              rounded
              size={40}
              source={{ uri: item.peerInfo.avatar }}
            />
            <Text style={style.listUsername} numberOfLines={1}>
              {item.peerInfo.displayName}
            </Text>
          </View>
        )}
        <ChatBubble
          maxWidth={windowWidth * 0.7}
          myInf={item.fromMyself}
          text={item.text}
          time={item.timestamp}
        />
        {item.fromMyself && (
          <View style={style.avatarContainer}>
            <Avatar
              rounded
              size={40}
              source={{ uri: config_key?.avatarUri }}
            />
            <Text style={style.listUsername} numberOfLines={1}>
              {MeetingVariable.myName}
            </Text>
          </View>
        )}
        {!item.fromMyself && !item.broadcast && (
          <View style={[style.privateTip, { marginLeft: 3 }]}>
            <Text style={style.tipFont} numberOfLines={1}>
              Visible uniquement par vous
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render file message
  renderFileItem = ({ item }) => {
    if (!item.fromMyself && item.peerInfo == null) {
      item.peerInfo = MeetingVariable.mediaService
        .getPeerDetailByPeerId(item.fromPeerId)
        .getPeerInfo();
    }

    return (
      <View style={[
        style.listItem,
        { justifyContent: item.fromMyself ? 'flex-end' : 'flex-start' },
      ]}>
        {!item.fromMyself && (
          <View style={style.avatarContainer}>
            <Avatar
              rounded
              size={40}
              source={{ uri: item.peerInfo.avatar }}
            />
            <Text style={style.listUsername} numberOfLines={1}>
              {item.peerInfo.displayName}
            </Text>
          </View>
        )}
        <FileBubble
          file={item}
          maxWidth={windowWidth * 0.7}
          downloadFile={this.downloadFile}
        />
        {item.fromMyself && (
          <View style={style.avatarContainer}>
            <Avatar
              rounded
              size={40}
              source={{ uri: config_key.avatarUri }}
            />
            <Text style={style.listUsername} numberOfLines={1}>
              {MeetingVariable.myName}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Final renderItem
  renderItem = ({ item }) => {
    if (item.type === MessageType.text) {
      return this.renderTextItem({ item });
    } else {
      return this.renderFileItem({ item });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => toolBar && hideToolBar()}
          disabled={!toolBar}>
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item?._id?.toString()}
            ref={listRef}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}>
          <TouchableOpacity
            style={{ marginLeft: 5 }}
            onPress={() => setVisible(true)}>
            <Ionicons
              name={selected ? 'person' : 'person-outline'}
              size={34}
              color={selected ? '#87e0a8' : 'black'}
            />
          </TouchableOpacity>

          <TextInput
            value={text}
            style={{ flex: 1, marginHorizontal: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, minHeight: 40 }}
            multiline
            onChangeText={onChangeText}
            onFocus={hideToolBar}
          />

          <Animated.View style={{ width: addButtonWidth }}>
            <TouchableOpacity onPress={() => { Keyboard.dismiss(); toolBar ? hideToolBar() : showToolBar(); }}>
              <Ionicons
                name="add-circle-outline"
                size={37}
                color={toolBar ? '#87e0a8' : '#171717'}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ width: sendButtonWidth }}>
            <TouchableOpacity onPress={sendMessage}>
              <Text style={{ paddingHorizontal: 10, color: '#007aff', fontWeight: 'bold' }}>Envoyer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <Animated.View style={{ flex: toolsBarFlex }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={uploadFile} disabled={selected}>
            <Ionicons
              name="folder-outline"
              size={40}
              color={selected ? '#aaaaaa' : 'black'}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal
        animationType="slide"
        visible={visible}
        transparent
        onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center' }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setVisible(false)} />
          <MemberSelector
            selected={selected}
            setSelected={setSelected}
            name={selectedName}
            setName={setSelectedName}
            closeModal={() => setVisible(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const MemberSelector = ({ selected, setSelected, name, setName, closeModal }) => {
  const participants = MeetingVariable.mediaService.getPeerDetails();

  const renderItem = ({ item }) => {
    const inf = item.getPeerInfo();

    const meSelected = selected && selected === inf.id;

    return (
      <TouchableOpacity
        style={[
          selectorStyle.listItem,
          { backgroundColor: meSelected ? '#87e0a8' : 'white' },
        ]}
        onPress={() => {
          if (meSelected) {
            setName(null);
            setSelected(null);
          } else {
            setName(inf.displayName);
            setSelected(inf.id);
          }
        }}>
        <View style={{ marginLeft: 20 }}>
          <Avatar
            rounded
            size={40}
            source={{
              uri: inf.avatar,
            }}
          />
        </View>
        <View style={{ alignItems: 'center', marginLeft: 20 }}>
          <Text style={{ color: meSelected ? 'white' : 'black', fontSize: 16 }}>
            {inf.displayName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={style.memberListContainer}>
      <View style={selectorStyle.titleContainer}>
        <Text style={selectorStyle.title}>Choisissez quelqu'un</Text>
        <View style={selectorStyle.selectedUserContainer}>
          {name && (
            <Text style={selectorStyle.selectedUser}>utilisateur : {name}</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            if (selected) {
              setSelected(null);
              setName(null);
            } else {
              closeModal();
            }
          }}>
          <Ionicons
            name={'close-circle-outline'}
            color={'#aaaaaa'}
            size={20}
            style={{ marginLeft: 20, marginRight: 5 }}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={participants}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          return index;
        }}
        ListEmptyComponent={() => {
          return (
            <View
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#aaaaaa' }}>-Aucun autre membre-</Text>
            </View>
          );
        }}
        style={selectorStyle.list}
        extraData={selected}
      />
    </View>
  );
};

const selectorStyle = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    padding: 15,
    flexDirection: 'row',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedUser: {
    fontSize: 14,
  },
  selectedUserContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  list: {},
  listItem: {
    backgroundColor: 'white',
    padding: 6,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});

const style = StyleSheet.create({
  sendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    margin: 6,
    textAlignVertical: 'top',
    color: 'black',
  },
  listContainer: {
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 3,
  },
  listUsername: {
    fontSize: 10,
    color: '#555555',
  },
  avatarContainer: {
    flexDirection: 'column',
    width: 40,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 5,
    marginRight: 5,
  },
  sendButton: {
    backgroundColor: '#44CE55',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 5,
    margin: 7,
    paddingBottom: 5,
    borderRadius: 3,
  },
  sendText: {
    color: 'white',
  },
  toolButton: {
    alignItems: 'center',
  },
  iconContainer: {
    paddingLeft: 7,
    paddingRight: 5,
    paddingTop: 3,
    paddingBottom: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  toolContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: windowWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberListContainer: {
    flex: 2,
    backgroundColor: 'white',
    elevation: 5,
  },
  privateTip: {
    flex: 1,
    marginTop: 10,
  },
  tipFont: {
    color: '#aaaaaa',
    fontSize: 12,
  },
});
