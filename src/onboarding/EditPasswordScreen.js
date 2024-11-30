import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import React, { useState } from 'react';

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
import {useApi} from '../core/contexts/ApiProvider';

const Schema = Yup.object().shape({
  password: Yup.string().required(Strings.PASSWORD_ERROR),
  confirm_password: Yup.string()
    .required(Strings.CONFIRM_PASSWORD_ERROR)
    .oneOf(
      [Yup.ref('password'), null],
      Strings.CONFIRM_PASSWORD_MUST_MATCH_ERROR,
    ),
});

export default function EditPasswordScreen({route, navigation}) {
  const [secureText, setSecureText] = useState(true)
  const api = useApi();
  const formik = useFormik({
    initialValues: {
      email: route?.params?.email,
      password: '',
    },
    validationSchema: Schema,
    onSubmit: async values => {
      const response = await api.post(`/api/auth/new_password`, values);

      if (response.success) {
        navigation.navigate('EDIT_NAME', {
          userId: response.user._id,
        });
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
      <Header />
      <KeyboardAvoidingView
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={{flex: 0.8}}>
              <TextCustom
                style={styles.headerStyle}
                text={Strings.SAVE_NEW_PASSWORD}
              />
              <TextCustom
                style={styles.descStyle}
                text={Strings.PLS_REGISTER_NEW_PASSWORD}
              />

              <Input
                placeholder={Strings.PASSWORD}
                errorText={formik.errors.password}
                onChangeText={formik.handleChange('password')}
                secureTextEntry={secureText}
                secureText={secureText ? Strings.SHOW : Strings.HIDE}
                onPressSecure={() => setSecureText(!secureText)}
              />

              <Input
                placeholder={Strings.CONFIRM_PASSWORD}
                errorText={formik.errors.confirm_password}
                secureTextEntry={secureText}
                onChangeText={formik.handleChange('confirm_password')}
              />
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'flex-end',
                marginBottom: moderateScaleVertical(16),
              }}>
              <Button
                title={Strings.DONE}
                disabled={formik.isSubmitting}
                onPress={formik.handleSubmit}
                isLoading={formik.isSubmitting}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// define your styles
const styles = StyleSheet.create({
  headerStyle: {
    fontSize: textScale(30),
    fontFamily: fontFamily.medium,
  },
  descStyle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.regular,
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(52),
  },
});
