import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { useState } from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import Screen from '../core/components/Screen';
import Header from '../core/components/Header';
import Input from '../core/components/Input';
import Button from '../core/components/Button';
import {useUser} from '../core/contexts/UserProvider';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../assets/styles/responsiveSize';
import fontFamily from '../assets/styles/fontFamily';
import Strings from '../core/constants/Strings';
import Colors from '../core/constants/Colors';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Veuillez renseignez votre adresse e-mail !'),
  password: Yup.string().required('Le mot de passe est requis !'),
});

export default function Login({navigation}) {

  const [secureText, setSecureText] = useState(true)

  const {login} = useUser();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async values => {
      const response = await login(values);
      if (!response.success) {
        toast.show(response.error.message, {
          type: 'danger',
          duration: 5000,
          placement: 'top',
        });
      } else {
        navigation.navigate('TAB');
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
                text={Strings.WELCOME_BACK}
              />
              <TextCustom
                style={styles.descStyle}
                text={Strings.WE_ARE_HAPPY_TO_SEE}
              />

              <Input
                placeholder="Email"
                errorText={formik.errors.email}
                onChangeText={formik.handleChange('email')}
              />

              <Input
                placeholder="Password"
                errorText={formik.errors.password}
                onChangeText={formik.handleChange('password')}
                secureTextEntry={secureText}
                secureText={secureText ? Strings.SHOW : Strings.HIDE}
                onPressSecure={() => setSecureText(!secureText)}
              />

              <Text
                style={{
                  ...styles.descStyle,
                  alignSelf: 'flex-end',
                  color: Colors.blueColor,
                  fontFamily: fontFamily.semiBold,
                }}>
                {Strings.FORGOT_PASSWORD}?
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'flex-end',
                marginBottom: moderateScaleVertical(16),
              }}>
              <Button
                title={Strings.LOGIN}
                disabled={formik.errors.email || formik.isSubmitting}
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
