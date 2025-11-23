import { useState, useRef, useCallback } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

/**
 * Custom hook for audio recording functionality
 * Features:
 * - Request microphone permissions
 * - Start/stop recording
 * - Track recording duration
 * - Return audio file for upload
 */
export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioFile, setAudioFile] = useState(null);

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const recordingPath = useRef(null);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true; // iOS permissions handled via Info.plist
  }, []);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record audio messages.'
        );
        return false;
      }

      // Generate unique filename with proper writable path
      const timestamp = Date.now();
      const fileName = Platform.select({
        ios: `audio_${timestamp}.m4a`,
        android: `audio_${timestamp}.mp4`,
      });

      // Use cache directory which is writable
      const path = Platform.select({
        ios: `${RNFS.CachesDirectoryPath}/${fileName}`,
        android: `${RNFS.CachesDirectoryPath}/${fileName}`,
      });

      console.log('Recording to path:', path);

      // Start recording
      const uri = await audioRecorderPlayer.startRecorder(path);
      recordingPath.current = uri;
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingDuration(Math.floor(e.currentPosition / 1000));
      });

      return true;
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      return false;
    }
  }, [audioRecorderPlayer, requestPermission]);

  /**
   * Stop recording and prepare file
   */
  const stopRecording = useCallback(async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);

      if (result && recordingDuration > 0) {
        // Prepare file object for upload
        let fileUri = result;

        // Ensure proper URI format
        if (Platform.OS === 'android') {
          // Android returns full path, ensure it has file:// prefix
          if (!fileUri.startsWith('file://')) {
            fileUri = `file://${fileUri}`;
          }
        } else {
          // iOS typically returns proper file:// URI
          if (!fileUri.startsWith('file://')) {
            fileUri = `file://${fileUri}`;
          }
        }

        const audioFileObj = {
          uri: fileUri,
          type: Platform.select({
            ios: 'audio/m4a',
            android: 'audio/mp4',
          }),
          name: `audio_${Date.now()}.${Platform.OS === 'ios' ? 'm4a' : 'mp4'}`,
          duration: recordingDuration * 1000, // Convert seconds to milliseconds
        };

        console.log('Audio file created:', audioFileObj);
        setAudioFile(audioFileObj);
        return audioFileObj;
      } else {
        // Recording too short, discard
        console.log('Recording too short, discarding');
        return null;
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
      return null;
    }
  }, [audioRecorderPlayer, recordingDuration]);

  /**
   * Cancel recording without saving
   */
  const cancelRecording = useCallback(async () => {
    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setRecordingDuration(0);
      setAudioFile(null);
      recordingPath.current = null;
    } catch (error) {
      console.error('Cancel recording error:', error);
      setIsRecording(false);
    }
  }, [audioRecorderPlayer]);

  /**
   * Clear audio file
   */
  const clearAudio = useCallback(() => {
    setAudioFile(null);
    setRecordingDuration(0);
  }, []);

  /**
   * Format duration for display (MM:SS)
   */
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    recordingDuration,
    audioFile,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
    formatDuration,
  };
};
