import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { useApi } from '../../contexts/ApiProvider';
// import { useUser } from '../core/contexts/UserProvider';

import Avatar from '../../components/Avatar';

import { useUser } from '../../contexts/UserProvider';


import { useFormik } from 'formik';
import * as Yup from 'yup';

import Input from '../../components/Input';
import Button from '../../components/Button';
import { BASE_API_URL } from '@env';
import { hasAndroidPermission } from '../../core/helpers/ImagePickerUtil';

import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Champs requis !'),
});

const ProfileScreen = ({ navigation }) => {

  const { user, isLoading, updateProfile } = useUser()

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
      const response = await updateProfile(values);
      if (response.success) {
        Alert.alert(response.message);
      }
    },
  });

  const api = useApi();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Notification settings
  const [settings, setSettings] = useState({
    messageNotifications: true,
    groupNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    showPreview: true,
  });

  useEffect(() => {
    // Fetch user profile data
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const response = await api.get('/api/auth/me');
    if (response.user) {
      setProfileData(response.user);
    }
    else {
      setProfileData(null)
    }
  };


  const handleChangeProfilePicture = async () => {
    await hasAndroidPermission();
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(async image => {
        setUploading(true);

        const data = new FormData();
        data.append('image', {
          fileName: 'image',
          name: 'image.png',
          type: 'image/png',
          uri:
            Platform.OS == 'android'
              ? image.path
              : image.path.replace('file://', ''),
        });

        let token = await AsyncStorage.getItem('user');

        const response = await api.post('/api/files/upload-image', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        console.log(response.data.name);

        // update user profile image
        const update_response = await updateProfile({
          profilePicture: response.data.name,
        });
        if (!update_response.success) {
          Alert.alert(update_response.error.message);
        }
        setProfileData(prev => ({
          ...prev,
          profilePicture: response.data.name
        }));
        setUploading(false);
      })
      .catch(error => {
        console.log('error riased', error);
        setUploading(false);
      });
  };

  const toggleSetting = (setting) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting]
      };

      // Update user notification settings on server
      updateNotificationSettings(newSettings);

      return newSettings;
    });
  };

  const updateNotificationSettings = async (newSettings) => {
    // try {
    //   // Replace with your actual API endpoint
    //   await fetch('https://yourapi.com/api/notifications/settings', {
    //     method: 'PUT',
    //     headers: {
    //       'Authorization': `Bearer ${/* your auth token */}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(newSettings),
    //   });
    // } catch (err) {
    //   // Handle error (optionally show an alert)
    //   console.error('Failed to update notification settings:', err);
    // }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
          <Text style={styles.title}>Mon Profile</Text>
        </View>
      </View>

      <ScrollView>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {uploading ? (
                <View style={[styles.profileImage, styles.uploadingContainer]}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : (
                <Avatar
                  size={100}
                  letter={profileData?.fullName[0]}
                  source={profileData?.profilePicture ?
                    `${BASE_API_URL}/image/${profileData?.profilePicture}` : null} />
              )}
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleChangeProfilePicture}
              >
                <Icon name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{profileData?.fullName || 'User'}</Text>
            <Text style={styles.userStatus}>
              {profileData?.status || 'Available'}
            </Text>
          </View>

          <View style={styles.infoSection}>

            <Input
              icon="person-outline"
              iconPack={Icon}
              errorText={formik.errors.firstName}
              value={formik.values.firstName}
              onChangeText={formik.handleChange('firstName')}
            />

            <Input
              icon="person-outline"
              iconPack={Icon}
              errorText={formik.errors.lastName}
              value={formik.values.lastName}
              onChangeText={formik.handleChange('lastName')}
            />

            <Input
              icon="mail-outline"
              iconPack={Icon}
              errorText={formik.errors.email}
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
            />

            <Input
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
          </View>
        </View>


        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Message Notifications</Text>
            <Switch
              value={settings.messageNotifications}
              onValueChange={() => toggleSetting('messageNotifications')}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '' : '#fff'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Group Notifications</Text>
            <Switch
              value={settings.groupNotifications}
              onValueChange={() => toggleSetting('groupNotifications')}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '' : '#fff'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Switch
              value={settings.soundEnabled}
              onValueChange={() => toggleSetting('soundEnabled')}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '' : '#fff'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={() => toggleSetting('vibrationEnabled')}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '' : '#fff'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Message Preview</Text>
            <Switch
              value={settings.showPreview}
              onValueChange={() => toggleSetting('showPreview')}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={Platform.OS === 'ios' ? '' : '#fff'}
            />
          </View>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  );
};

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
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
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#888',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navigationLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
  },
});

export default ProfileScreen;