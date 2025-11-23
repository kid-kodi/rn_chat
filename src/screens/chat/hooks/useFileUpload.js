import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';

// Import with try-catch for better error handling
let DocumentPicker, launchCamera, launchImageLibrary;

try {
  DocumentPicker = require('react-native-document-picker').default;
  if (!DocumentPicker) {
    DocumentPicker = require('react-native-document-picker');
  }
} catch (e) {
  console.error('DocumentPicker not available:', e.message);
}

try {
  const ImagePicker = require('react-native-image-picker');
  launchCamera = ImagePicker.launchCamera;
  launchImageLibrary = ImagePicker.launchImageLibrary;
} catch (e) {
  console.error('ImagePicker not available:', e.message);
}

/**
 * Custom hook for handling file uploads
 * Supports: images, videos, documents, audio, camera
 */
export const useFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Request camera permission (Android only)
   */
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  /**
   * Pick image or video from gallery
   */
  const pickImageOrVideo = useCallback(async () => {
    if (!launchImageLibrary) {
      Alert.alert(
        'Feature Not Available',
        'Image picker is not installed. Please rebuild the app after running:\nnpm install react-native-image-picker\ncd ios && pod install'
      );
      return null;
    }

    try {
      const options = {
        mediaType: 'mixed',
        selectionLimit: 1,
        quality: 0.8,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        return null;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick media');
        return null;
      }

      const asset = result.assets?.[0];
      if (asset) {
        const file = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `file_${Date.now()}.${asset.type?.split('/')[1] || 'jpg'}`,
          size: asset.fileSize,
        };
        setSelectedFile(file);
        return file;
      }
    } catch (error) {
      console.error('Error picking image/video:', error);
      Alert.alert('Error', 'Failed to select media');
      return null;
    }
  }, []);

  /**
   * Take photo with camera
   */
  const takePhoto = useCallback(async () => {
    if (!launchCamera) {
      Alert.alert(
        'Feature Not Available',
        'Camera is not available. Please rebuild the app after running:\nnpm install react-native-image-picker\ncd ios && pod install'
      );
      return null;
    }

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return null;
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      };

      const result = await launchCamera(options);

      if (result.didCancel) {
        return null;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to take photo');
        return null;
      }

      const asset = result.assets?.[0];
      if (asset) {
        const file = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize,
        };
        setSelectedFile(file);
        return file;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
      return null;
    }
  }, []);

  /**
   * Pick document (PDF, Excel, Word, etc.)
   */
  const pickDocument = useCallback(async () => {
    if (!DocumentPicker) {
      Alert.alert(
        'Feature Not Available',
        'Document picker is not available. Please rebuild the app after running:\nnpm install react-native-document-picker'
      );
      return null;
    }

    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.plainText,
        ],
        copyTo: 'cachesDirectory',
      });

      const doc = result[0];
      const file = {
        uri: doc.fileCopyUri || doc.uri,
        type: doc.type,
        name: doc.name,
        size: doc.size,
      };
      setSelectedFile(file);
      return file;
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return null;
      }
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
      return null;
    }
  }, []);

  /**
   * Pick audio file
   */
  const pickAudio = useCallback(async () => {
    if (!DocumentPicker) {
      Alert.alert(
        'Feature Not Available',
        'Document picker is not available. Please rebuild the app after running:\nnpm install react-native-document-picker'
      );
      return null;
    }

    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        copyTo: 'cachesDirectory',
      });

      const audio = result[0];
      const file = {
        uri: audio.fileCopyUri || audio.uri,
        type: audio.type,
        name: audio.name,
        size: audio.size,
      };
      setSelectedFile(file);
      return file;
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return null;
      }
      console.error('Error picking audio:', error);
      Alert.alert('Error', 'Failed to select audio');
      return null;
    }
  }, []);

  /**
   * Upload file to server
   */
  const uploadFile = useCallback(async (file, apiUrl, token) => {
    if (!file) return null;

    try {
      setUploading(true);

      // Determine file type and appropriate field name
      const isImage = file.type?.startsWith('image/');
      const isAudio = file.type?.startsWith('audio/');
      const isVideo = file.type?.startsWith('video/');

      // Use 'image' field for images, videos, AND audio (server expects 'image' field)
      const fieldName = (isImage || isVideo || isAudio) ? 'image' : 'file';

      // Use appropriate endpoint - images, videos, and audio use upload-image endpoint
      const endpoint = (isImage || isVideo || isAudio) ? apiUrl : apiUrl.replace('/upload-image', '/upload');

      const formData = new FormData();

      // Ensure URI is properly formatted
      let fileUri = file.uri;
      if (Platform.OS === 'android' && !fileUri.startsWith('file://')) {
        fileUri = `file://${fileUri}`;
      }

      formData.append(fieldName, {
        uri: fileUri,
        type: file.type || 'audio/mp4',
        name: file.name || `audio_${Date.now()}.mp4`,
      });

      // Add duration as a separate field if it exists (for audio files)
      if (file.duration) {
        formData.append('duration', file.duration.toString());
      }

      console.log('Uploading file:', {
        fieldName,
        uri: fileUri,
        type: file.type,
        name: file.name,
        duration: file.duration,
        endpoint
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Upload successful:', data);
        return data;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * Clear selected file
   */
  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return {
    selectedFile,
    uploading,
    pickImageOrVideo,
    takePhoto,
    pickDocument,
    pickAudio,
    uploadFile,
    clearFile,
  };
};
