import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomImageView from '../../../components/CustomImage';
import AudioMessage from './AudioMessage';
import CallLogMessage from './CallLogMessage';
import { BASE_API_URL } from '@env';
import { styles } from '../chatStyles';

/**
 * Message item component - Memoized for performance
 */
const MessageItem = memo(({
  item,
  isMyMessage,
  contactInfo,
  isGroupChat,
  onImagePress,
  isSelectMode = false,
  isSelected = false,
  onLongPress,
  onPress,
  onCallBack
}) => {
  // Check if this is a call log message
  const isCallLog = item.messageType === 'call:log';

  // Render call log message
  if (isCallLog) {
    return (
      <CallLogMessage
        message={item}
        isMyMessage={isMyMessage}
        onCallBack={onCallBack}
      />
    );
  }

  // Check if this is a system message
  const isSystemMessage = item.messageType === 'system' || item.type === 'system';

  // Render system message (user added, etc.)
  if (isSystemMessage) {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessageBubble}>
          <Ionicons
            name={item.metadata?.callType === 'video' ? 'videocam-outline' : 'call-outline'}
            size={16}
            color="#999"
            style={styles.systemMessageIcon}
          />
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
        <Text style={styles.systemMessageTime}>
          {moment(item.createdAt).format('HH:mm')}
        </Text>
      </View>
    );
  }

  const hasFile = item.file && item.file.data;
  const isImage = item.type === 'image' || item.file?.data?.mimetype?.startsWith('image/');
  const isVideo = item.type === 'video' || item.file?.data?.mimetype?.startsWith('video/');
  const isAudio = item.type === 'audio' || item.type === 'voice' || item.file?.data?.mimetype?.startsWith('audio/');
  const isVoiceNote = item.type === 'voice'; // Recorded audio
  const isDocument = hasFile && !isImage && !isVideo && !isAudio;

  const handleImagePress = () => {
    if (isSelectMode) {
      onPress?.();
      return;
    }
    if (isImage && onImagePress) {
      onImagePress(item);
    }
  };

  const handleFilePress = () => {
    if (isSelectMode) {
      onPress?.();
      return;
    }
    if (hasFile && !isImage) {
      const fileUrl = `${BASE_API_URL}/file/${item.file.data.filename}`;
      Linking.openURL(fileUrl).catch(err => console.error('Error opening file:', err));
    }
  };

  const renderFileContent = () => {
    if (!hasFile) return null;

    const fileUrl = `${BASE_API_URL}/image/${item.file.data.filename}`;

    if (isImage) {
      return (
        <TouchableOpacity
          onPress={handleImagePress}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <Image
            source={{ uri: fileUrl }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (isAudio) {
      return (
        <View onStartShouldSetResponder={() => true}>
          <AudioMessage
            message={item}
            isUserMessage={isMyMessage}
            isVoiceNote={isVoiceNote}
            onLongPress={onLongPress}
          />
        </View>
      );
    }

    if (isDocument) {
      return (
        <TouchableOpacity
          style={styles.fileContainer}
          onPress={handleFilePress}
          onLongPress={onLongPress}
          delayLongPress={500}
        >
          <View style={styles.fileIconContainer}>
            <Ionicons name="document-outline" size={24} color="#007AFF" />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.file.name || item.file.data.originalname || 'Document'}
            </Text>
            <Text style={styles.fileSize}>
              {item.file.data.size ? `${(item.file.data.size / 1024).toFixed(1)} KB` : ''}
            </Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#666" />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      onPress={onPress}
      delayLongPress={500}
      activeOpacity={isSelectMode ? 0.7 : 1}
      disabled={!isSelectMode && !onLongPress}
      style={{ width: '100%' }}
    >
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.userMessageContainer : styles.contactMessageContainer,
          isSelectMode && styles.selectableContainer,
          isSelected && styles.selectedContainer
        ]}
      >
        {/* Selection Checkbox */}
        {isSelectMode && (
          <View style={styles.checkbox}>
            {isSelected && <View style={styles.checkboxSelected} />}
          </View>
        )}

        {/* Show avatar for received messages in non-group chats */}
        {!isMyMessage && !isGroupChat && (
          <CustomImageView
            source={`${BASE_API_URL}/image/${contactInfo?.avatar}`}
            firstName={contactInfo?.name}
            size={30}
            fontSize={15}
            style={styles.messageSenderAvatar}
          />
        )}

        {/* Message bubble */}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.userBubble : styles.contactBubble,
            hasFile && styles.messageBubbleWithFile
          ]}
        >
          {/* File content */}
          {renderFileContent()}

          {/* Text content */}
          {item.content && item.content.trim() !== '' && (
            <Text style={styles.messageText}>{item.content}</Text>
          )}

          {/* Timestamp */}
          <Text
            style={[
              styles.timestamp,
              isMyMessage ? styles.userTimestamp : styles.contactTimestamp
            ]}
          >
            {moment(item.createdAt).format('HH:mm')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
