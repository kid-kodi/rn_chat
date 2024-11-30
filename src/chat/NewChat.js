import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {useEffect} from 'react';
import Screen from '../core/components/Screen';
import Header from '../core/components/Header';
import {moderateScale} from '../assets/styles/responsiveSize';
import Strings from '../core/constants/Strings';
import Colors from '../assets/styles/Colors';
import {useState} from 'react';
import DataItem from '../core/components/DataItem';
import Icon from 'react-native-vector-icons/Feather';
import CommonStyles from '../assets/styles/CommonStyles';
import {useChat} from '../core/contexts/ChatProvider';
import {useUser} from '../core/contexts/UserProvider';
import {useSocket} from '../core/contexts/SocketProvider';

export default function NewChat({route, navigation}) {
  const socket = useSocket();
  const {create} = useChat();
  const {searchUsers, user} = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === '') {
        setUsers();
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      const response = await searchUsers({search: searchTerm});
      if (response.success && response.data.length > 0) {
        setUsers(response.data);
        setNoResultsFound(false);
      } else if (response.success && response.data.length == 0) {
        setUsers({});
        setNoResultsFound(true);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const userPressed = async _user => {
    const chatUsers = [_user._id, user._id];
    const response = await create(chatUsers, '', false);
    if (response.success) {
      socket.emit('new_chat', {room: response.data, userId: _user._id});
      navigation.navigate('CHAT', {
        chatId: response.data._id,
      });
    }
  };

  return (
    <Screen>
      <Header leftText="Nouvelle Conversation" />
      <KeyboardAvoidingView
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={15} color={Colors.lightGrey} />

              <TextInput
                placeholder={'Rechercher'}
                style={styles.searchBox}
                onChangeText={text => setSearchTerm(text)}
              />
            </View>

            {isLoading && (
              <View style={CommonStyles.center}>
                <ActivityIndicator size={'large'} color={Colors.primary} />
              </View>
            )}

            {searchTerm === '' && (
              <View>
                <DataItem
                  icon="people"
                  title="New Group"
                  onPress={() => navigation.navigate('NEW_GROUP')}
                />
                {/* <DataItem icon="person-add" title="New Contact" onPress={() => userPressed(item)}/> */}
              </View>
            )}

            {!isLoading && !noResultsFound && users && (
              <FlatList
                data={users}
                renderItem={({item}) => {
                  return (
                    <DataItem
                      title={item.fullName}
                      subTitle={item.about}
                      image={item.profilePicture}
                      onPress={() => userPressed(item)}
                    />
                  );
                }}
              />
            )}

            {!isLoading && noResultsFound && (
              <View style={CommonStyles.center}>
                <Icon
                  name="cloud-off"
                  size={55}
                  color={Colors.lightGrey}
                  style={styles.noResultsIcon}
                />
                <Text style={styles.noResultsText}>
                  Aucun utilisateur trouvé!
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blackOpacity10,
    height: 32,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: '100%',
    height: 50,
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: Colors.textColor,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  chatNameContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  inputContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.nearlyWhite,
    flexDirection: 'row',
    borderRadius: 5,
  },
  textbox: {
    color: Colors.textColor,
    width: '100%',
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
  selectedUsersContainer: {
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  selectedUsersList: {
    height: '100%',
    paddingTop: 10,
  },
  selectedUserStyle: {
    marginRight: 10,
    marginBottom: 10,
  },
});
