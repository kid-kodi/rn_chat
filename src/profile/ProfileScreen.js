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
import { useApi } from '../core/contexts/ApiProvider';
// import { useUser } from '../core/contexts/UserProvider';

const ProfileScreen = ({ navigation }) => {

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

    // Request permissions for image picker (for profile photo)
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile picture.');
        }
      }
    })();
  }, []);

  const fetchUserProfile = async () => {
    const response = await api.get('/api/auth/me');
    if (response.user) {
        setProfileData(response.user);
    }
    else{
        setProfileData(null)
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            
          }
        }
      ]
    );
  };

  const handleChangeProfilePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      uploadProfilePicture(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    try {
      setUploading(true);
      
      // Create form data for image upload
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      });
      
      // Replace with your actual API endpoint
    //   const response = await fetch('https://yourapi.com/api/users/profile/picture', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${/* your auth token */}`,
    //       'Content-Type': 'multipart/form-data',
    //     },
    //     body: formData,
    //   });
      
    //   if (!response.ok) {
    //     throw new Error('Failed to upload profile picture');
    //   }
      
      // Update profile data with new image
      const updatedProfile = await response.json();
      setProfileData(prev => ({
        ...prev,
        profilePicture: updatedProfile.profilePicture
      }));
      
      setUploading(false);
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (err) {
      setUploading(false);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
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

  if (loading) {
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EDIT_PROFILE')}>
          <Text style={styles.editText}>Modifier</Text>
        </TouchableOpacity>
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
                <>
                  {profileData?.profilePicture !== "" ? (
                    <Image
                      source={{ uri: profileData?.profilePicture }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={[styles.profileImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>
                        {profileData?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                </>
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
            <View style={styles.infoItem}>
              <Icon name="mail-outline" size={24} color="#666" />
              <Text style={styles.infoText}>{profileData?.email || 'email@example.com'}</Text>
            </View>
            
            {profileData?.telephone && (
              <View style={styles.infoItem}>
                <Icon name="call-outline" size={24} color="#666" />
                <Text style={styles.infoText}>{profileData.telephone}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <Text style={styles.navigationLabel}>Privacy Settings</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => navigation.navigate('BlockedUsers')}
          >
            <Text style={styles.navigationLabel}>Blocked Users</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.navigationLabel}>Change Password</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => navigation.navigate('Help')}
          >
            <Text style={styles.navigationLabel}>Help & Support</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navigationItem}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.navigationLabel}>About</Text>
            <Icon name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navigationItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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