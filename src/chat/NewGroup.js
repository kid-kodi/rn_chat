import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';

import Screen from '../core/components/Screen';
import Header from '../core/components/Header';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../assets/styles/responsiveSize';
import TextCustom from '../core/components/TextCustom';
import Strings from '../core/constants/Strings';
import fontFamily from '../assets/styles/fontFamily';
import Input from '../core/components/Input';

import {useFormik} from 'formik';
import * as Yup from 'yup';
import Button from '../core/components/Button';
import {useUser} from '../core/contexts/UserProvider';

import Icon from 'react-native-vector-icons/Feather';
import {useChat} from '../core/contexts/ChatProvider';
import Colors from '../assets/styles/Colors';
import {BASE_API_URL} from '@env';
import CommonStyles from '../assets/styles/CommonStyles';
import DataItem from '../core/components/DataItem';
import ProfileImage from '../core/components/ProfileImage';

const Schema = Yup.object().shape({
  firstName: Yup.string().required(Strings.FIRST_NAME_ERROR),
  lastName: Yup.string().required(Strings.LAST_NAME_ERROR),
});

export default function NewGroup({route, navigation}) {
  const {create, updateChatData, sendTextMessage} = useChat();
  const {searchUsers, user} = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedUsers, setSelectedUsers] = useState([]);

  const selectedUsersFlatList = useRef();

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
    if (selectedUsers.filter(e => e._id === _user._id).length > 0) {
      setSelectedUsers(current =>
        current.filter(obj => {
          return obj._id !== _user._id;
        }),
      );
    } else {
      setSelectedUsers(oldArray => [...oldArray, _user]);
    }
  };

  const onNext = () => {
    if(selectedUsers.length > 0){
        navigation.navigate("ADD_PARTICIPANTS", {users : selectedUsers})
    }
  };

  return (
    <Screen>
      <Header
        leftText="New Group"
        rightText="Next"
        onPressRight={onNext}
        rightTextStyle={{
          color:
            selectedUsers.length > 0
              ? Colors.blackColor
              : Colors.blackOpacity25,
        }}
      />
      <KeyboardAvoidingView
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={15} color={Colors.lightGrey} />

              <TextInput
                placeholder={'Rechercher par nom ou contact'}
                style={styles.searchBox}
                onChangeText={text => setSearchTerm(text)}
              />
            </View>

            <>
              {selectedUsers.length > 0 && (
                <View style={styles.selectedUsersContainer}>
                  <FlatList
                    style={styles.selectedUsersList}
                    data={selectedUsers}
                    horizontal={true}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{alignItems: 'center'}}
                    ref={ref => (selectedUsersFlatList.current = ref)}
                    onContentSizeChange={() =>
                      selectedUsersFlatList.current.scrollToEnd()
                    }
                    renderItem={itemData => {
                      const user = itemData.item;
                      return (
                        <ProfileImage
                          size={40}
                          uri={
                            user?.profilePicture &&
                            `${BASE_API_URL}/image/${user?.profilePicture}`
                          }
                          onPress={() => userPressed(user)}
                          showRemoveButton={true}
                        />
                      );
                    }}
                  />
                </View>
              )}
            </>

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
                      type={'checkbox'}
                      isChecked={
                        selectedUsers.find(e => e._id === item._id)
                          ? true
                          : false
                      }
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
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
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
