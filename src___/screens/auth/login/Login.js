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
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';


import KYScreen from '../../../components/KYScreen';
import KYHeader from '../../../components/KYHeader';
import { useAuth } from '../../../contexts/AuthProvider';
import { moderateScale } from '../../../styles/scaling';
import KYTextInput from '../../../components/KYTextInput';
import fontFamily from '../../../styles/fontFamily';
import KYText from '../../../components/KYText';
import { Colors } from '../../../styles/colors';
import KYButton from '../../../components/KYButton';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Veuillez renseignez votre adresse e-mail !'),
  password: Yup.string().required('Le mot de passe est requis !'),
});

export default function Login({navigation}) {

  const [secureText, setSecureText] = useState(true)

  const {login} = useAuth();

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
    <KYScreen>
      <KYHeader />
      <KeyboardAvoidingView
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={{flex: 0.8}}>
              <KYTextInput
                style={styles.headerStyle}
                text="REGISTER"
              />
              <KYTextInput
                style={styles.descStyle}
                text={"WE_ARE_HAPPY_TO_SEE"}
              />

              <KYTextInput
                placeholder="Email"
                errorText={formik.errors.email}
                onChangeText={formik.handleChange('email')}
              />

              <KYTextInput
                placeholder="Password"
                errorText={formik.errors.password}
                onChangeText={formik.handleChange('password')}
                secureTextEntry={secureText}
                secureText={secureText ? "SHOW" : "HIDE"}
                onPressSecure={() => setSecureText(!secureText)}
              />

              <KYText
                style={{
                  ...styles.descStyle,
                  alignSelf: 'flex-end',
                  color: Colors.blueColor,
                  fontFamily: fontFamily.semiBold,
                }}>
                {"FORGOT_PASSWORD"}?
              </KYText>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'flex-end',
                marginBottom: 16,
              }}>
              <KYButton
                title={"LOGIN"}
                disabled={formik.errors.email || formik.isSubmitting}
                onPress={formik.handleSubmit}
                isLoading={formik.isSubmitting}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </KYScreen>
  );
}

// define your styles
const styles = StyleSheet.create({
  headerStyle: {
    fontSize: 30,
    fontFamily: fontFamily.medium,
  },
  descStyle: {
    fontSize: 18,
    fontFamily: fontFamily.regular,
    marginTop: 8,
    marginBottom: 52,
  },
});
