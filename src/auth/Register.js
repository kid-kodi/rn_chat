import {View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import Screen from '../core/components/Screen';
import Input from '../core/components/Input';
import Button from '../core/components/Button';
import Colors from '../core/constants/Colors';
import {useUser} from '../core/contexts/UserProvider';

const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Veuillez renseignez votre adresse e-mail !'),
  password: Yup.string().required('Le mot de passe est requis !'),
});

export default function Register({navigation}) {
  const {register} = useUser();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async values => {
      const response = await register(values);
      if (response.success) {
        navigation.navigate('OTP', {
          activation_token: response.activationToken,
          email : values.email,
          password : values.password,
        });
      } else {
        Alert.alert(response.error.message);
      }
    },
  });

  return (
    <Screen>
      <ScrollView style={{backgroundColor: 'white', flex: 1}}>
        <View style={{padding: 20}}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Enregistrez-vous</Text>
          </View>

          <Input
            label="Email"
            icon="mail"
            iconPack={Icon}
            errorText={formik.errors.email}
            onChangeText={formik.handleChange('email')}
          />

          <Input
            label="Password"
            icon="lock"
            iconPack={Icon}
            errorText={formik.errors.password}
            secureTextEntry
            onChangeText={formik.handleChange('password')}
          />

          <Button
            title={`Enregistrer`}
            disabled={
              formik.errors.email ||
              formik.errors.password ||
              formik.isSubmitting
            }
            onPress={formik.handleSubmit}
            isLoading={formik.isSubmitting}
            style={{marginTop: 20}}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('LOGIN')}
            style={styles.linkContainer}>
            <Text style={styles.link}>Deja un compte ? Se connecter</Text>
          </TouchableOpacity>
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
});
