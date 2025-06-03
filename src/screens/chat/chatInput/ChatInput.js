import { View, Text } from 'react-native'
import { styles } from './styles'
import { TouchableOpacity } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';

export default function ChatInput({ onSendMessage, placeholder }) {

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);
  const recording = useRef(null);
  const timer = useRef(null);
  const attachmentAnimation = useRef(new Animated.Value(0)).current;

  const { colors } = useTheme();

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
      stopRecording();
    };
  }, []);

  useEffect(() => {
    Animated.timing(attachmentAnimation, {
      toValue: showAttachmentOptions ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showAttachmentOptions]);

  const toggleAttachmentOptions = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage({
      text: message.trim(),
      attachments: attachments,
      timestamp: new Date().toISOString(),
    });

    setMessage('');
    setAttachments([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <View View style={styles.container}>
      {
        isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
            </View>
            <TouchableOpacity onPress={stopRecording} style={styles.stopRecording}>
              <Text style={styles.stopRecordingText}>STOP</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={toggleAttachmentOptions}
            >
              <Ionicons name='add-outline' size={24} color="#333333" />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder={placeholder}
                placeholderTextColor="#9E9E9E"
                multiline
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    message.trim() || attachments.length > 0
                      ? "green"
                      : '#E0E0E0',
                },
              ]}
              onPress={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || isLoading}
            >
              <Ionicons name='send' size={20} color="#FFF" />
            </TouchableOpacity>
          </>
        )
      }
    </View>
  )
}