import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import OTPTextView from 'react-native-otp-textinput';

import Screen from '../../components/Screen';
import Colors from '../../constants/Colors';
import Button from '../../components/Button';
import {useRef} from 'react';
import {useUser} from '../../contexts/UserProvider';
import Strings from '../../constants/Strings';
import Header from '../../components/Header';
import TextCustom from '../../components/TextCustom';
import {
  moderateScale,
  moderateScaleVertical,
  textScale,
} from '../../assets/styles/responsiveSize';
import fontFamily from '../../assets/styles/fontFamily';

const ValidationSchema = Yup.object().shape({
  activation_code: Yup.string().required('Champs requis !'),
});

export default function VerifyAccount({route, navigation}) {
  const {verifyAccount} = useUser();

  const [timer, setTimer] = useState(60);

  const input = useRef(null);

  const formik = useFormik({
    initialValues: {
      activation_code: '',
    },
    validationSchema: ValidationSchema,
    onSubmit: async values => {
      const response = await verifyAccount(values.activation_code);
      if (!response.success) {
        Alert.alert(response.error.message);
      } else {
        navigation.navigate('RESET_PASSWORD', {user_id: response.user._id});
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
        style={{flex: 1, margin: moderateScale(16)}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <View style={{flex: 0.8}}>
              <TextCustom
                style={styles.headerStyle}
                text={Strings.ENTER_THE_FOUR_DIGIT}
              />
              <TextCustom
                style={styles.descStyle}
                text={route?.params?.email}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('FORGOT_PASSWORD')}>
                <Text style={styles.linkContainer}>
                  changer votre adresse email
                </Text>
              </TouchableOpacity>

              <View>
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

              {timer > 0 ? (
                <TouchableOpacity
                  onPress={resendCode}
                  style={styles.linkContainer}>
                  <Text style={styles.link}>
                    Vous n'avez pas recu de code ? renvoyer le code dans (
                    {timer})
                  </Text>

                  <Text style={styles.link}></Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={resendCode}
                  style={styles.linkContainer}>
                  <Text style={styles.link}>Renvoyer</Text>
                </TouchableOpacity>
              )}
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
      {/* <ScrollView style={{backgroundColor: 'white', flex: 1}}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Verification de compte</Text>
          </View>
          <Text style={{fontSize: 16, textAlign: 'center', marginBottom: 16}}>
            Entrer les quatres digits que vous avez recu a cette adresse :{' '}
            {route.params.email}
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('FORGOT_PASSWORD')}>
            <Text style={styles.linkContainer}>
              changer votre adresse email
            </Text>
          </TouchableOpacity>

          <View>
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

          <Button
            title={Strings.DONE}
            disabled={formik.errors.activation_code || formik.isSubmitting}
            onPress={formik.handleSubmit}
            isLoading={formik.isSubmitting}
            style={{marginTop: 20}}
          />

          {timer > 0 ? (
            <TouchableOpacity onPress={resendCode} style={styles.linkContainer}>
              <Text style={styles.link}>
                Vous n'avez pas recu de code ? renvoyer le code dans ({timer})
              </Text>

              <Text style={styles.link}></Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={resendCode} style={styles.linkContainer}>
              <Text style={styles.link}>Renvoyer</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView> */}
    </Screen>
  );
}

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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  logo: {
    fontSize: 35,
  },
  container: {
    padding: 20,
  },
  linkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  link: {
    color: Colors.blue,
    fontFamily: 'medium',
    letterSpacing: 0.3,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '50%',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  textInputContainer: {
    backgroundColor: Colors.grey,
    borderBottomWidth: 0,
    borderRadius: 8,
    color: Colors.white,
  },
});
