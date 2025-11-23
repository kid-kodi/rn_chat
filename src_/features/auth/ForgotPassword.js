import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import {useUser} from '../../contexts/UserProvider';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../assets/styles/responsiveSize';
import fontFamily from '../../assets/styles/fontFamily';
import Strings from '../../common/constants/Strings';
import TextCustom from '../../components/TextCustom';
import {navigate} from '../../common/utils/RootNavigation';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Veuillez renseignez votre adresse e-mail !'),
});

export default function ForgotPassword() {
  const {forgotPassword} = useUser();

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async values => {
      const response = await forgotPassword(values.email);
      if (!response.success) {
        toast.show(response.error.message, {
          type: 'danger',
          duration: 5000,
          placement: 'top',
        });
      } else {
        navigate('VERIFY_ACCOUNT', {email: values.email});
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
                text={Strings.FORGOT_PASSWORD}
              />
              <TextCustom
                style={styles.descStyle}
                text={Strings.FORGOT_PASSWORD_DESC}
              />

              <Input
                placeholder="Email"
                errorText={formik.errors.email}
                onChangeText={formik.handleChange('email')}
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
