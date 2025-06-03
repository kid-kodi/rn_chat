import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import Screen from '../core/components/Screen';
import Input from '../core/components/Input';
import {useUser} from '../core/contexts/UserProvider';
import Colors from '../core/constants/Colors';
import Button from '../core/components/Button';
import ProfileImage from '../core/components/ProfileImage';
import {BASE_API_URL} from '@env';

const Schema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Champs requis !'),
});

export default function EditProfile({navigation}) {
  const {user, logout, update} = useUser();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      profilePicture: user?.profilePicture,
      firstName: user?.firstName,
      lastName: user?.lastName,
      fullName: user?.firstName + ' ' + user?.lastName,
      email: user?.email,
    },
    validationSchema: Schema,
    onSubmit: async values => {
      values._id = user._id;
      values.fullName = values.firstName + ' ' + values.lastName;
      const response = await update(values);
      if (response.success) {
        navigation.navigate("TAB")
      }
    },
  });

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={80}
          uri={`${BASE_API_URL}/image/${user?.profilePicture}`}
          showEditButton={true}
        />

        <Input
          label="Nom"
          icon="user"
          iconPack={Icon}
          errorText={formik.errors.firstName}
          value={formik.values.firstName}
          onChangeText={formik.handleChange('firstName')}
        />

        <Input
          label="Prenoms"
          icon="user"
          iconPack={Icon}
          errorText={formik.errors.lastName}
          value={formik.values.lastName}
          onChangeText={formik.handleChange('lastName')}
        />

        <Input
          label="Email"
          icon="mail"
          iconPack={Icon}
          errorText={formik.errors.email}
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
        />

        {formik.dirty && (
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
        )}

        <TouchableOpacity onPress={handleLogout} style={styles.linkContainer}>
          <Text style={styles.link}>Se deconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    alignItems: 'center',
    padding: 20,
  },
});
