import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import OTPTextView from 'react-native-otp-textinput';

import Screen from '../core/components/Screen';
import Colors from '../core/constants/Colors';
import Button from '../core/components/Button';
import {useRef} from 'react';
import {useUser} from '../core/contexts/UserProvider';

const ValidationSchema = Yup.object().shape({
  activation_code: Yup.string().required('Champs requis !'),
});

export default function CheckOtp({route, navigation}) {
  const {activation, register} = useUser();

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
      if (!response.success) {
        Alert.alert(response.error.message);
      }
      else{
        navigation.navigate("EDIT_PROFILE")
      }
    },
  });

  const handleCellTextChange = async (text, i) => {
    console.log(i);
  };

  const resendCode = async () => {
    const response = await register({
      email: route.params.email,
      password: route.params.password,
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
      <ScrollView style={{backgroundColor: 'white', flex: 1}}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Verification de compte</Text>
          </View>
          <Text style={{fontSize: 16, textAlign: 'center', marginBottom: 16}}>
            Entrer les quatres digits que vous avez recu a cette adresse :{' '}
            {route.params.email}
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('REGISTER')}>
            <Text style={styles.linkContainer}>changer de compte</Text>
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
            title={`Envoyer`}
            disabled={formik.errors.activation_code || formik.isSubmitting}
            onPress={formik.handleSubmit}
            isLoading={formik.isSubmitting}
            style={{marginTop: 20}}
          />

          {timer > 0 ? (
            <TouchableOpacity style={styles.linkContainer}>
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
