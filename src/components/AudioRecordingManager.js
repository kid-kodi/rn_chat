import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// Import with additional checks
// const AudioRecorderPlayer = require('react-native-audio-recorder-player').default;

const AudioRecordingManager = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [recorderReady, setRecorderReady] = useState(false);
  const audioRecorderRef = useRef(null);

  // Initialize recorder with validation
  useEffect(() => {
    const initRecorder = async () => {
      try {
        if (!AudioRecorderPlayer) {
          throw new Error('AudioRecorderPlayer module not available');
        }

        const instance = new AudioRecorderPlayer();
        
        // Verify instance methods exist
        if (typeof instance.startRecorder !== 'function') {
          throw new Error('startRecorder method not available');
        }

        audioRecorderRef.current = instance;
        setRecorderReady(true);
      } catch (error) {
        console.error('Recorder initialization failed:', error);
        setRecorderReady(false);
      }
    };

    initRecorder();

    return () => {
      // Cleanup
      if (audioRecorderRef.current) {
        audioRecorderRef.current.removeRecordBackListener();
        audioRecorderRef.current.stopRecorder();
      }
    };
  }, []);

  const startRecording = async () => {
    if (!recorderReady) {
      console.warn('Recorder not ready');
      return;
    }

    try {
      const audioSet = Platform.select({
        ios: {
          AVEncoderAudioQualityKeyIOS: 'high',
          AVNumberOfChannelsKeyIOS: 2,
          AVFormatIDKeyIOS: 'aac',
        },
        android: {
          AudioEncoderAndroid: 'aac',
          AudioSourceAndroid: 'mic',
          OutputFormatAndroid: 'aac_adts',
        },
      });

      console.log(audioRecorderRef.current.startRecorder)

      const path = await audioRecorderRef.current.startRecorder();
      console.log(path);
      
      // audioRecorderRef.current.addRecordBackListener((e) => {
      //   if (e.currentPosition) {
      //     setRecordTime(audioRecorderRef.current.mmssss(Math.floor(e.currentPosition)));
      //   }
      // });
      
      // setIsRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording || !audioRecorderRef.current) return;
    
    try {
      const result = await audioRecorderRef.current.stopRecorder();
      audioRecorderRef.current.removeRecordBackListener();
      
      setIsRecording(false);
      setRecordTime('00:00:00');
      
      if (result) {
        onSend({
          uri: result,
          type: Platform.OS === 'ios' ? 'audio/aac' : 'audio/aac',
          name: `recording_${Date.now()}.${Platform.OS === 'ios' ? 'aac' : 'aac'}`,
        });
      }
    } catch (error) {
      console.error('Stop recording failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
        disabled={!recorderReady}
        style={[
          styles.recordButton, 
          isRecording && styles.recording,
          !recorderReady && styles.disabled
        ]}
      >
        <Text style={styles.buttonText}>
          {!recorderReady ? 'Initializing...' : 
           isRecording ? `Recording... ${recordTime}` : 'Hold to Record'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  recordButton: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  recording: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
  },
});

export default AudioRecordingManager;