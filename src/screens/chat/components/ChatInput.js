import React, { memo } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, Text, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from '../chatStyles';

/**
 * Chat input component with send button, attachment support, and audio recording
 */
const ChatInput = memo(({
  messageText,
  onChangeText,
  onSend,
  onAttachPress,
  onAudioRecordStart,
  onAudioRecordEnd,
  onAudioRecordCancel,
  sending = false,
  hasAttachment = false,
  isRecording = false,
  recordingDuration = 0,
  formatDuration,
  placeholder = "Type a message...",
  maxLength = 1000
}) => {
  const hasText = messageText.trim().length > 0;
  const canSend = hasText || hasAttachment;

  // Recording UI
  if (isRecording) {
    return (
      <View style={styles.recordingContainer}>
        {/* Cancel button */}
        <TouchableOpacity
          style={styles.recordingCancelButton}
          onPress={onAudioRecordCancel}
        >
          <Ionicons name="close-circle" size={32} color="#FF3B30" />
        </TouchableOpacity>

        {/* Recording indicator */}
        <View style={styles.recordingInfo}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            {formatDuration ? formatDuration(recordingDuration) : `${recordingDuration}s`}
          </Text>
          <Text style={styles.recordingLabel}>Recording...</Text>
        </View>

        {/* Stop/Send button */}
        <TouchableOpacity
          style={styles.recordingStopButton}
          onPress={onAudioRecordEnd}
        >
          <Ionicons name="checkmark-circle" size={32} color="#34C759" />
        </TouchableOpacity>
      </View>
    );
  }

  // Normal input UI
  return (
    <View style={styles.inputContainer}>
      {/* Attachment button */}
      <TouchableOpacity
        style={styles.attachButton}
        onPress={onAttachPress}
        disabled={isRecording}
      >
        <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
      </TouchableOpacity>

      {/* Text input */}
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={messageText}
          onChangeText={onChangeText}
          multiline
          maxLength={maxLength}
          editable={!isRecording}
        />
      </View>

      {/* Send or voice button */}
      {canSend ? (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={onSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Ionicons name="send" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.micButton}
          onPressIn={onAudioRecordStart}
          onPressOut={onAudioRecordEnd}
          delayLongPress={0}
        >
          <Ionicons name="mic-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
