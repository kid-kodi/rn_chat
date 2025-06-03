import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../assets/styles/responsiveSize';
import Strings from '../../constants/Strings';
import fontFamily from '../../assets/styles/fontFamily';
import Colors from '../../constants/Colors';

import OTPTextView from 'react-native-otp-textinput';

import Screen from '../../components/Screen';
import Header from '../../components/Header';
import TextCustom from '../../components/TextCustom';
import Button from '../../components/Button';

import { useUser } from '../../contexts/UserProvider';

const ValidationSchema = Yup.object().shape({
  activation_code: Yup.string().required('Champs requis !'),
});

export default function OtpScreen({ route, navigation }) {
  const { activation, register } = useUser();
  const [timer, setTimer] = useState(60);

  const input = useRef(null);

  const formik = useFormik({
    initialValues: {
      activation_token: route.params.activation_token,
      activation_code: '',
    },
    validationSchema: ValidationSchema,
    onSubmit: async values => {
      const response = await activation(values);

      if (response.success) {
        navigation.navigate('EDIT_PASSWORD', {
          activation_token: route.params.activation_token,
          email: route.params.email,
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

  const handleCellTextChange = async (text, i) => {
    console.log(i);
  };

  const resendCode = async () => {
    const response = await register({
      email: route.params.email,
    });
    if (response.success) {
      formik.setFieldValue('activation_code', '');
      setTimer(60);
    } else {
      Alert.alert(response.error.message);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timer]);

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
                text={Strings.ENTER_THE_FOUR_DIGIT + ` xyz@gmail.com`}
              />
              <TextCustom
                onPress={() => navigation.goBack()}
                style={styles.descStyle}
                text={Strings.EDIT_MY_EMAIL}
              />

              <OTPTextView
                ref={input}
                textInputStyle={styles.textInputContainer}
                handleTextChange={text =>
                  formik.setFieldValue('activation_code', text)
                }
                handleCellTextChange={handleCellTextChange}
                inputCount={4}
                keyboardType="numeric"
                autoFocus
                tintColor={Colors.whiteColor}
                offTintColor={Colors.whiteColorOpacity40}
              />
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'flex-end',
                marginBottom: moderateScaleVertical(16),
              }}>
              {timer > 0 ? (
                <TextCustom
                  style={{
                    ...styles.descStyle,
                    marginBottom: 12,
                  }}
                  text={Strings.RESEND_CODE + 'In'}>
                  <Text>{timer}</Text>
                </TextCustom>
              ) : (
                <TextCustom
                  onPress={resendCode}
                  style={styles.resendCodeStyle}
                  text={Strings.RESEND_CODE}
                />
              )}

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
    fontSize: textScale(24),
    fontFamily: fontFamily.medium,
  },
  descStyle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
    color: Colors.blueColor,
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(52),
  },
  textInputContainer: {
    backgroundColor: Colors.lightGrey,
    borderBottomWidth: 0,
    borderRadius: 8,
    color: Colors.whiteColor,
  },
  resendCodeStyle: {
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
    marginTop: moderateScaleVertical(8),
    marginBottom: moderateScaleVertical(16),
  },
});
