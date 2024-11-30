import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {BASE_API_URL} from '@env';
import React, {useCallback, useState} from 'react';
import Screen from '../core/components/Screen';
import Header from '../core/components/PageTitle';
import ProfileImage from '../core/components/ProfileImage';
import Input from '../core/components/Input';

import {useFormik} from 'formik';
import * as Yup from 'yup';
import Button from '../core/components/Button';
import {useChat} from '../core/contexts/ChatProvider';
import DataItem from '../core/components/DataItem';
import Colors from '../core/constants/Colors';
import {useUser} from '../core/contexts/UserProvider';

const chatSettingsSchema = Yup.object().shape({
  chatName: Yup.string().required('Champs requis !'),
});

export default function ChatSetting(props) {
  const chat = props.route.params?.chat;

  const {user} = useUser();
  const {updateChatData} = useChat();

  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      image: chat?.image?._id,
      chatName: chat?.chatName,
    },
    validationSchema: chatSettingsSchema,
    onSubmit: async values => {
      const update_response = await updateChatData(chat._id, values);
      if (update_response.success) {
        Alert.alert(update_response.message);
      }
    },
  });

  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await removeUserFromChat(chat._id, user, user);
      if (response.success) {
        props.navigation.goBack();
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  }, []);

  return (
    <Screen>
      <Header title="Chat Settings" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ProfileImage
          showEditButton={true}
          size={80}
          uri={
            chat?.image && chat?.image?.name !== ''
              ? `${BASE_API_URL}/image/${chat?.image?.name}`
              : null
          }
          chat={chat}
        />

        <Input
          label="ChatName"
          errorText={formik.errors.chatName}
          value={formik.values.chatName}
          onChangeText={formik.handleChange('chatName')}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>{chat.users.length} Participants</Text>

          <DataItem
            title="Add users"
            icon={'add'}
            type="button"
            onPress={() =>
              props.navigation.navigate('NEWCHAT', {
                isGroupChat: true,
                chat,
              })
            }
          />

          {chat.users.slice(0, 2).map(u => {
            return (
              <DataItem
                key={u._id}
                image={u.profilePicture}
                title={u.fullName}
                subTitle={u.about}
                type={u._id !== user._id && 'link'}
                onPress={() =>
                  u._id !== user._id &&
                  props.navigation.navigate('CONTACT', {currentUser: u, chat})
                }
              />
            );
          })}

          {chat.users.length > 2 && (
            <View>
              <DataItem
                type="link"
                title={'Voir plus'}
                hideImage={true}
                onPress={() =>
                  props.navigation.navigate('PARTICIPANTS', {
                    title: 'Participants',
                    data: chat.users,
                    type: 'users',
                    chat,
                  })
                }
              />
            </View>
          )}
        </View>

        {formik.dirty && (
          <Button
            title={`Enregistrer`}
            disabled={formik.errors.name || formik.isSubmitting}
            onPress={formik.handleSubmit}
            isLoading={formik.isSubmitting}
            style={{marginTop: 20}}
          />
        )}
      </ScrollView>

      {chat &&
        chat.isGroupChat &&
        (isLoading ? (
          <ActivityIndicator size={'small'} color={Colors.primary} />
        ) : (
          <View style={{paddingHorizontal: 20, paddingBottom: 10}}>
            <Button
              title="Quitter le chat"
              color={Colors.red}
              onPress={leaveChat}
            />
          </View>
        ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    alignItems: 'center',
    padding: 20,
  },
  sectionContainer: {
    width: '100%',
    marginTop: 10,
  },
  heading: {
    marginVertical: 8,
    color: Colors.textColor,
    fontFamily: 'bold',
    letterSpacing: 0.3,
  },
});
