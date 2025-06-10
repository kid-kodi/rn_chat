import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  Animated,
  PanResponder,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const AudioRecordingManager = ({
  onSendAudio,
  onCancel,
  maxDuration = 300, // 5 minutes in seconds
  minDuration = 1 // minimum 1 second
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [recordingPath, setRecordingPath] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [hasPermission, setHasPermission] = useState(false);
  const [waveformData, setWaveformData] = useState([]);

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const recordingTimer = useRef(null);
  const animatedValue = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pan responder for slide to cancel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < -50) {
          slideAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -100) {
          cancelRecording();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    checkPermissions();

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  // Animated recording pulse effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [isRecording, isPaused]);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          setHasPermission(true);
        } else {
          Alert.alert('Permission denied', 'Cannot record audio without permissions');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      setHasPermission(true); // iOS permissions handled in Info.plist
    }
  };

  const generateFileName = () => {
    const timestamp = new Date().getTime();
    const fileName = `audio_${timestamp}.m4a`;
    return Platform.OS === 'ios'
      ? `${RNFS.DocumentDirectoryPath}/${fileName}`
      : `${RNFS.ExternalDirectoryPath}/${fileName}`;
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await checkPermissions();
      return;
    }

    try {
      const path = generateFileName();
      setRecordingPath(path);

      const audioSet = {
        AudioEncoderAndroid: 3, // 3 = AAC (Android MediaRecorder.AudioEncoder.AAC)
        AudioSourceAndroid: 1, // 1 = MIC (Android MediaRecorder.AudioSource.MIC)
        AudioSamplingRateAndroid: 16000,
        AudioChannelsAndroid: 1,
        AudioBitrateAndroid: 128000,
        AVEncoderAudioQualityKeyIOS: 'high',
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: 'mp4a',
      };

      await audioRecorderPlayer.startRecorder(path, audioSet);

      // ... rest of the function remains the same
    } catch (error) {
      console.error('Start recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const pauseRecording = async () => {
    try {
      await audioRecorderPlayer.pauseRecorder();
      setIsPaused(true);
    } catch (error) {
      console.error('Pause recording error:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      await audioRecorderPlayer.resumeRecorder();
      setIsPaused(false);
    } catch (error) {
      console.error('Resume recording error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      setIsRecording(false);
      setIsPaused(false);

      // Check minimum duration
      const seconds = Math.floor(result / 1000);
      if (seconds < minDuration) {
        Alert.alert('Recording too short', `Minimum recording duration is ${minDuration} second(s)`);
        await deleteRecording();
        return;
      }

      setDuration(formatTime(seconds));
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recordingPath) return;

    try {
      await audioRecorderPlayer.startPlayer(recordingPath);

      audioRecorderPlayer.addPlayBackListener((e) => {
        const currentSeconds = Math.floor(e.currentPosition / 1000);
        const durationSeconds = Math.floor(e.duration / 1000);

        setPlayTime(formatTime(currentSeconds));

        if (e.currentPosition === e.duration) {
          setIsPlaying(false);
          setPlayTime('00:00');
        }
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Play recording error:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const pausePlayback = async () => {
    try {
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Pause playback error:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  };

  const sendRecording = async () => {
    if (!recordingPath) return;

    try {
      // Get file info
      const fileInfo = await RNFS.stat(recordingPath);
      const fileSizeInMB = (fileInfo.size / 1024 / 1024).toFixed(2);

      const audioMessage = {
        id: Date.now().toString(),
        type: 'audio',
        uri: recordingPath,
        duration: duration,
        fileSize: `${fileSizeInMB} MB`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };

      onSendAudio?.(audioMessage);
      resetRecording();
    } catch (error) {
      console.error('Send recording error:', error);
      Alert.alert('Error', 'Failed to send recording');
    }
  };

  const cancelRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }
    await deleteRecording();
    onCancel?.();
  };

  const deleteRecording = async () => {
    if (recordingPath && await RNFS.exists(recordingPath)) {
      try {
        await RNFS.unlink(recordingPath);
      } catch (error) {
        console.error('Delete recording error:', error);
      }
    }
    resetRecording();
  };

  const resetRecording = () => {
    setRecordingPath(null);
    setRecordTime('00:00');
    setDuration('00:00');
    setPlayTime('00:00');
    setWaveformData([]);
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {waveformData.map((amplitude, index) => (
        <View
          key={index}
          style={[
            styles.waveformBar,
            { height: amplitude, opacity: index === waveformData.length - 1 ? 1 : 0.6 }
          ]}
        />
      ))}
    </View>
  );

  if (!isRecording && !recordingPath) {
    return (
      <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
        <Text style={styles.recordButtonText}>🎤</Text>
      </TouchableOpacity>
    );
  }

  if (isRecording) {
    return (
      <Animated.View
        style={[styles.recordingContainer, { transform: [{ translateX: slideAnim }] }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.slideToCancel}>← Slide to cancel</Text>

        <View style={styles.recordingContent}>
          {renderWaveform()}

          <View style={styles.recordingControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isPaused ? resumeRecording : pauseRecording}
            >
              <Text style={styles.controlButtonText}>{isPaused ? '▶️' : '⏸️'}</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.recordingIndicator, { transform: [{ scale: animatedValue }] }]}>
              <Text style={styles.recordingDot}>🔴</Text>
            </Animated.View>

            <Text style={styles.recordingTime}>{recordTime}</Text>

            <TouchableOpacity style={styles.controlButton} onPress={stopRecording}>
              <Text style={styles.controlButtonText}>⏹️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Preview mode after recording
  return (
    <View style={styles.previewContainer}>
      <TouchableOpacity style={styles.cancelButton} onPress={deleteRecording}>
        <Text style={styles.cancelButtonText}>🗑️</Text>
      </TouchableOpacity>

      <View style={styles.previewContent}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={isPlaying ? pausePlayback : playRecording}
        >
          <Text style={styles.playButtonText}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>

        <View style={styles.audioInfo}>
          <Text style={styles.audioTime}>{isPlaying ? playTime : duration}</Text>
          <View style={styles.waveformPreview}>
            {waveformData.slice(0, 20).map((amplitude, index) => (
              <View
                key={index}
                style={[styles.waveformBar, { height: amplitude * 0.5 }]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={sendRecording}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  recordButtonText: {
    fontSize: 24,
  },
  recordingContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    margin: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slideToCancel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    flex: 1,
    marginHorizontal: 8,
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#007AFF',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  controlButtonText: {
    fontSize: 16,
  },
  recordingIndicator: {
    marginHorizontal: 8,
  },
  recordingDot: {
    fontSize: 12,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginHorizontal: 8,
    minWidth: 50,
    textAlign: 'center',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    margin: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
  },
  previewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playButtonText: {
    fontSize: 16,
  },
  audioInfo: {
    flex: 1,
    alignItems: 'center',
  },
  audioTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  waveformPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFF',
  },
});

export default AudioRecordingManager;