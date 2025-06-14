import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BASE_API_URL } from '@env';
import { useCallback, useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import ProfileImage from '../../components/ProfileImage';
import Input from '../../components/Input';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import { useChat } from '../../contexts/ChatProvider';
import DataItem from '../../components/DataItem';
import Colors from '../../constants/Colors';
import { useUser } from '../../contexts/UserProvider';
import { useApi } from '../../contexts/ApiProvider';

const chatSettingsSchema = Yup.object().shape({
  chatName: Yup.string().required('Champs requis !'),
});

export default function ChatSetting(props) {
  const id = props.route.params?.id;

  const [chat, setChat] = useState();
  const api = useApi();

  useEffect(() => {
    (async () => {
      const response = await api.get(`/api/chats/${id}`);
      setChat(response.chat)
    })()
  }, [id]);

  const { user } = useUser();
  const { updateChatData } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  let [defaultNumber, setDefaultNumber] = useState(2);

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
      <Header leftText="Paramètres" />
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
          <Text style={styles.heading}>{chat?.users?.length} Participants</Text>

          <DataItem
            title="Add users"
            icon={'add'}
            type="button"
            onPress={() =>
              props.navigation.navigate('MANAGE_USERS', {
                isGroupChat: true,
                chat,
              })
            }
          />
          
          

          {chat?.users?.slice(0, defaultNumber).map(u => {
            return (
              <DataItem
                key={u._id}
                image={u.profilePicture}
                title={u.fullName}
                subTitle={u.about}
                type={u._id !== user._id && 'link'}
                onPress={() =>
                  u._id !== user._id &&
                  props.navigation.navigate('CONTACT', { id: u._id, chat })
                }
              />
            );
          })}

          {chat?.users?.length > defaultNumber && (
            <View>
              <DataItem
                type="link"
                title={'Voir plus'}
                hideImage={true}
                onPress={() =>
                  setDefaultNumber(defaultNumber++)
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
            style={{ marginTop: 20 }}
          />
        )}
      </ScrollView>

      {chat &&
        chat?.isGroupChat &&
        (isLoading ? (
          <ActivityIndicator size={'small'} color={Colors.primary} />
        ) : (
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
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
