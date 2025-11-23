import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Button from '../../components/Button';
import TextCustom from '../../components/TextCustom';
import Input from '../../components/Input';

import Strings from '../../constants/Strings';
import fontFamily from '../../assets/styles/fontFamily';
import {
  height,
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../assets/styles/responsiveSize';
import Colors from '../../constants/Colors';

import { useUser } from '../../contexts/UserProvider';
import { useState } from 'react';

const Schema = Yup.object().shape({
  firstName: Yup.string()
    .required('Veuillez renseignez votre nom !'),
  lastName: Yup.string()
    .required('Veuillez renseignez vos prenoms !'),
  email: Yup.string()
    .email('Email invalide')
    .required('Veuillez renseignez votre adresse e-mail !'),
  password: Yup.string().required('Le mot de passe est requis !'),
});

export default function EmailCheckScreen({ navigation }) {
  const [secureText, setSecureText] = useState(true);
  const { register } = useUser();
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    validationSchema: Schema,
    onSubmit: async values => {
      const response = await register(values);

      if (response.success) {
        navigation.navigate('OTP', {
          activation_token: response.activationToken,
          email: values.email
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
        style={{ flex: 1, margin: moderateScale(16) }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: 0.8 }}>
              <TextCustom
                style={styles.headerStyle}
                text={Strings.WELCOME_BACK}
              />
              <TextCustom
                style={styles.descStyle}
                text={Strings.WE_ARE_HAPPY_TO_SEE}
              />

              <View style={{ width: "100%", flexDirection: "row", gap: 4, marginBottom: 12 }}>
                <Input
                  style={{ flex: 1, height: 50 }}
                  placeholder="Nom"
                  errorText={formik.errors.firstName}
                  onChangeText={formik.handleChange('firstName')}
                />
                <Input
                  style={{ flex: 1, height: 50 }}
                  placeholder="Prenoms"
                  errorText={formik.errors.lastName}
                  onChangeText={formik.handleChange('lastName')}
                />
              </View>

              <Input
                placeholder="Email"
                errorText={formik.errors.email}
                onChangeText={formik.handleChange('email')}
                keyboardType="email-address"
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
                {Strings.FORGOT_PASSWORD} ?
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'flex-end',
                marginBottom: moderateScaleVertical(16),
              }}>
              <Button
                title={Strings.SIGN_UP}
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
