import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React from 'react';
import Screen from '../core/components/Screen';
import Header from '../core/components/Header';
import {moderateScale} from '../assets/styles/responsiveSize';
import Input from '../core/components/Input';
import Strings from '../core/constants/Strings';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useChat} from '../core/contexts/ChatProvider';
import {useUser} from '../core/contexts/UserProvider';

const Schema = Yup.object().shape({
  chatName: Yup.string().required(Strings.GROUP_NAME_ERROR),
});

export default function AddParticipants({route, navigation}) {
  const {user} = useUser();
  const {create} = useChat();

  const newChatUsers = route.params.users.map(u => u._id);

  const formik = useFormik({
    initialValues: {
      chatName: '',
    },
    validationSchema: Schema,
    onSubmit: async values => {
      const chatName = values.chatName;
      newChatUsers.push(user._id);
      const response = await create(newChatUsers, chatName, true);
      if (response.success) {
        navigation.navigate('TAB');
      } else {
        toast.show(response.message, {
          type: 'danger',
          duration: 5000,
          placement: 'top',
        });
      }
    },
  });

  return (
    <Screen>
      <Header
        leftText="Create Group"
        rightText="Save"
        onPressRight={formik.handleSubmit}
      />
      <KeyboardAvoidingView
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <Input
              placeholder={Strings.GROUP_NAME}
              errorText={formik.errors.chatName}
              onChangeText={formik.handleChange('chatName')}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}
