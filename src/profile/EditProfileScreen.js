import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useUser } from '../core/contexts/UserProvider';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';


import { useFormik } from 'formik';
import * as Yup from 'yup';

import Input from '../core/components/Input';
import Colors from '../core/constants/Colors';
import Button from '../core/components/Button';
import ProfileImage from '../core/components/ProfileImage';
import { BASE_API_URL } from '@env';

const SettingsSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Champs requis !'),
});

export default function EditProfileScreen({ navigation }) {
  const { user, isLoading, update } = useUser()

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      profilePicture: user?.profilePicture,
      firstName: user?.firstName,
      lastName: user?.lastName,
      fullName: user?.firstName + ' ' + user?.lastName,
      email: user?.email,
      telephone: user?.telephone,
    },
    validationSchema: SettingsSchema,
    onSubmit: async values => {
      values._id = user._id;
      values.fullName = values.firstName + ' ' + values.lastName;
      const response = await update(values);
      if (response.success) {
        Alert.alert(response.message);
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier Votre Profile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={80}
          uri={`${BASE_API_URL}/image/${user?.profilePicture}`}
          showEditButton={true}
        />

        <Input
          label="Nom"
          icon="person-outline"
          iconPack={Icon}
          errorText={formik.errors.firstName}
          value={formik.values.firstName}
          onChangeText={formik.handleChange('firstName')}
        />

        <Input
          label="Prenoms"
          icon="person-outline"
          iconPack={Icon}
          errorText={formik.errors.lastName}
          value={formik.values.lastName}
          onChangeText={formik.handleChange('lastName')}
        />

        <Input
          label="Email"
          icon="mail-outline"
          iconPack={Icon}
          errorText={formik.errors.email}
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
        />
        <Input
          label="Telephone"
          icon="call-outline"
          iconPack={Icon}
          errorText={formik.errors.telephone}
          value={formik.values.telephone}
          onChangeText={formik.handleChange('telephone')}
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
            style={{ marginTop: 20 }}
          />
        )}
      </ScrollView>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
    keyboardAvoidingView: {
      flex: 1,
      justifyContent: 'center',
    },
    formContainer: {
      alignItems: 'center',
      padding: 20,
    },
})