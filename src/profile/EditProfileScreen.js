import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';

const EditProfileScreen = ({ navigation, route }) => {
  // Mock user data - in a real app, this would come from props or context
  const [userData, setUserData] = useState({
    id: '123456',
    name: 'Alex Johnson',
    username: 'alexj',
    bio: 'Software developer passionate about mobile apps and photography.',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    profilePicture: null, // Will be replaced with image URI
    status: 'Available',
    showOnlineStatus: true,
    allowMessagesFrom: 'everyone', // 'everyone', 'contacts', 'none'
    notifyWhenRead: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Temporary states for form data
  const [formData, setFormData] = useState({...userData});
  
  // Status options
  const statusOptions = ['Available', 'Busy', 'Away', 'Do Not Disturb', 'Offline'];
  
  // Message privacy options
  const privacyOptions = [
    { value: 'everyone', label: 'Everyone' },
    { value: 'contacts', label: 'Contacts Only' },
    { value: 'none', label: 'Nobody' }
  ];

  useEffect(() => {
    // Simulate loading user data
    setIsLoading(true);
    setTimeout(() => {
      // Set placeholder profile image
      setFormData(prev => ({
        ...prev,
        profilePicture: '/api/image/defaultProfile.jpeg',
      }));
      setIsLoading(false);
    }, 1000);
    
    // Request permission for camera roll
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change your profile picture.');
        }
      }
    })();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Simulate image upload
        setImageUploading(true);
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            profilePicture: result.assets[0].uri,
          }));
          setImageUploading(false);
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
      console.error(error);
    }
  };

  const handleSave = () => {
    // Validate form data
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Simulate API call to update profile
    setIsSaving(true);
    setTimeout(() => {
      setUserData(formData);
      setIsSaving(false);
      Alert.alert('Success', 'Profile updated successfully');
      // navigation.goBack(); // In a real app, navigate back after successful update
    }, 1500);
  };

  const setStatus = (status) => {
    handleInputChange('status', status);
    setShowStatusModal(false);
  };

  const setMessagePrivacy = (privacy) => {
    handleInputChange('allowMessagesFrom', privacy);
    setShowPrivacyModal(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Modifier Votre Profile</Text>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.profilePictureContainer}>
          {imageUploading ? (
            <View style={styles.profileImageLoading}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : (
            <Image
              source={{ uri: formData.profilePicture }}
              style={styles.profilePicture}
            />
          )}
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            onPress={pickImage}
            disabled={imageUploading}
          >
            <Text style={styles.changePhotoText}>
              {imageUploading ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Your full name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              placeholder="Your username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              placeholder="Write something about yourself"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Your email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Your phone number"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Presence Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status & Privacy</Text>
          
          <TouchableOpacity 
            style={styles.optionContainer}
            onPress={() => setShowStatusModal(true)}
          >
            <View>
              <Text style={styles.optionLabel}>Status</Text>
              <Text style={styles.optionValue}>{formData.status}</Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
          
          <View style={styles.toggleContainer}>
            <View>
              <Text style={styles.optionLabel}>Show Online Status</Text>
              <Text style={styles.optionDescription}>
                Allow others to see when you're online
              </Text>
            </View>
            <Switch
              value={formData.showOnlineStatus}
              onValueChange={(value) => handleInputChange('showOnlineStatus', value)}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor={Platform.OS === 'ios' ? '#ffffff' : formData.showOnlineStatus ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.optionContainer}
            onPress={() => setShowPrivacyModal(true)}
          >
            <View>
              <Text style={styles.optionLabel}>Allow Messages From</Text>
              <Text style={styles.optionValue}>
                {privacyOptions.find(option => option.value === formData.allowMessagesFrom)?.label}
              </Text>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
          
          <View style={styles.toggleContainer}>
            <View>
              <Text style={styles.optionLabel}>Read Receipts</Text>
              <Text style={styles.optionDescription}>
                Let others know when you've read their messages
              </Text>
            </View>
            <Switch
              value={formData.notifyWhenRead}
              onValueChange={(value) => handleInputChange('notifyWhenRead', value)}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor={Platform.OS === 'ios' ? '#ffffff' : formData.notifyWhenRead ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Status Selection Modal */}
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Status</Text>
              
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.modalOption,
                    formData.status === status && styles.selectedOption
                  ]}
                  onPress={() => setStatus(status)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.status === status && styles.selectedOptionText
                  ]}>
                    {status}
                  </Text>
                  {formData.status === status && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Privacy Options Modal */}
        <Modal
          visible={showPrivacyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Allow Messages From</Text>
              
              {privacyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    formData.allowMessagesFrom === option.value && styles.selectedOption
                  ]}
                  onPress={() => setMessagePrivacy(option.value)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    formData.allowMessagesFrom === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {formData.allowMessagesFrom === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileImageLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  changePhotoButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changePhotoText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  optionValue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  optionArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#f0fdf4',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectedOptionText: {
    color: '#10b981',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 20,
    color: '#10b981',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default EditProfileScreen;