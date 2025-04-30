import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
  Keyboard
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';

import Video from 'react-native-video';
import { chat_messages } from './mock/Data';
// import * as FileSystem from 'expo-file-system';

const windowWidth = Dimensions.get('window').width;

const ChatScreen = ({ route, navigation }) => {
  // Normally you'd get this from route.params
  // const { contactId } = route.params;
  
  // Sample contact data - replace with your actual data
  const contactInfo = {
    id: '1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    status: 'online',
    lastSeen: 'Today at 2:30 PM',
  };

  // Sample messages - replace with your actual data and API calls
  const [messages, setMessages] = useState(chat_messages);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMediaView, setSelectedMediaView] = useState(null);
  
  const flatListRef = useRef(null);
  const recordingRef = useRef(null);
  const durationTimerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Clean up recording resources when component unmounts
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        stopRecording(true);
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '' && !mediaPreview) return;

    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      senderId: '1', // current user id
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    if (mediaPreview) {
      newMessage.type = mediaPreview.type;
      
      if (mediaPreview.type === 'image') {
        newMessage.image = mediaPreview.uri;
      } else if (mediaPreview.type === 'video') {
        newMessage.video = {
          uri: mediaPreview.uri,
          thumbnail: mediaPreview.thumbnail || 'https://via.placeholder.com/300x200'
        };
      } else if (mediaPreview.type === 'audio') {
        newMessage.audio = {
          uri: mediaPreview.uri,
          duration: mediaPreview.duration || '0:00'
        };
      } else if (mediaPreview.type === 'file') {
        newMessage.file = {
          name: mediaPreview.name,
          uri: mediaPreview.uri,
          size: mediaPreview.size,
          type: mediaPreview.fileType
        };
      }

      // Add text caption if any
      if (inputText.trim() !== '') {
        newMessage.text = inputText.trim();
      }
    } else {
      // Text-only message
      newMessage.text = inputText.trim();
      newMessage.type = 'text';
    }

    // Add to messages list
    setMessages([...messages, newMessage]);
    
    // Clear input and preview
    setInputText('');
    setMediaPreview(null);
    
    // In a real app, you would send the message to your backend here
  };

  const handleAttachmentPress = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
    Keyboard.dismiss();
  };

  const pickDocument = async () => {
    try {
      setShowAttachmentOptions(false);
      setIsUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        // Get file size
        // const fileInfo = await FileSystem.getInfoAsync(result.uri);
        // const fileSizeMB = (fileInfo.size / (1024 * 1024)).toFixed(1);
        
        setMediaPreview({
          type: 'file',
          uri: result.uri,
          name: result.name,
          size: `${10} MB`,
          fileType: result.mimeType
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to attach document');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setShowAttachmentOptions(false);
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }
      
      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setMediaPreview({
          type: 'image',
          uri: result.assets[0].uri
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsUploading(false);
    }
  };

  const pickImageOrVideo = async () => {
    try {
      setShowAttachmentOptions(false);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Media library access is required to select images or videos');
        return;
      }
      
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        allowsEditing: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const mediaType = result.assets[0].type === 'video' ? 'video' : 'image';
        
        setMediaPreview({
          type: mediaType,
          uri: result.assets[0].uri,
          ...(mediaType === 'video' && { thumbnail: 'https://via.placeholder.com/300x200' })
        });
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media');
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      // const { status } = await Audio.requestPermissionsAsync();
      // if (status !== 'granted') {
      //   Alert.alert('Permission needed', 'Microphone permission is required to record audio');
      //   return;
      // }
      
      // await Audio.setAudioModeAsync({
      //   allowsRecordingIOS: true,
      //   playsInSilentModeIOS: true,
      // });
      
      // const recording = new Audio.Recording();
      // await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      // await recording.startAsync();
      
      // recordingRef.current = recording;
      // setIsRecording(true);
      
      // // Start timer for recording duration
      // setRecordingDuration(0);
      // durationTimerRef.current = setInterval(() => {
      //   setRecordingDuration(prev => prev + 1);
      // }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async (discard = false) => {
    try {
      // if (!recordingRef.current) return;
      
      // // Stop duration timer
      // if (durationTimerRef.current) {
      //   clearInterval(durationTimerRef.current);
      //   durationTimerRef.current = null;
      // }
      
      // await recordingRef.current.stopAndUnloadAsync();
      
      // if (!discard) {
      //   const uri = recordingRef.current.getURI();
        
      //   // Format duration as MM:SS
      //   const minutes = Math.floor(recordingDuration / 60);
      //   const seconds = recordingDuration % 60;
      //   const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
      //   setMediaPreview({
      //     type: 'audio',
      //     uri,
      //     duration: formattedDuration
      //   });
      // }
      
      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDuration(0);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to process recording');
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const cancelMediaPreview = () => {
    setMediaPreview(null);
  };

  const handleAudioCall = () => {
    // Implement audio call functionality
    Alert.alert('Audio Call', `Calling ${contactInfo.name}...`);
  };

  const handleVideoCall = () => {
    // Implement video call functionality
    Alert.alert('Video Call', `Starting video call with ${contactInfo.name}...`);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const downloadFile = (file) => {
    // Implement file download functionality
    Alert.alert('Download', `Downloading ${file.name}...`);
    // In a real app, you would use FileSystem.downloadAsync() or similar
  };

  const viewMediaInFullScreen = (media) => {
    setSelectedMediaView(media);
  };

  const closeMediaView = () => {
    setSelectedMediaView(null);
  };

  const renderChatHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333333" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.contactInfo}
        onPress={() => navigation.navigate('SingleContactScreen', { contactId: contactInfo.id })}
      >
        <Image source={{ uri: contactInfo.avatar }} style={styles.avatar} />
        <View style={styles.contactTextInfo}>
          <Text style={styles.contactName}>{contactInfo.name}</Text>
          <Text style={styles.contactStatus}>
            {contactInfo.status === 'online' ? 'Online' : contactInfo.lastSeen}
          </Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleAudioCall}
        >
          <Ionicons name="call-outline" size={22} color="#5F77F6" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleVideoCall}
        >
          <Ionicons name="videocam-outline" size={22} color="#5F77F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBubble = (message) => {
    const isUserMessage = message.senderId === '1'; // Current user ID
    
    let bubbleContent;
    
    switch (message.type) {
      case 'text':
        bubbleContent = (
          <Text style={styles.messageText}>{message.text}</Text>
        );
        break;
        
      case 'image':
        bubbleContent = (
          <TouchableOpacity 
            onPress={() => viewMediaInFullScreen({ type: 'image', uri: message.image })}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: message.image }} 
              style={styles.messageImage} 
              resizeMode="cover"
            />
            {message.text && (
              <Text style={styles.messageText}>{message.text}</Text>
            )}
          </TouchableOpacity>
        );
        break;
        
      case 'video':
        bubbleContent = (
          <TouchableOpacity 
            onPress={() => viewMediaInFullScreen({ type: 'video', uri: message.video.uri })}
            activeOpacity={0.9}
          >
            <View style={styles.videoContainer}>
              <Image 
                source={{ uri: message.video.thumbnail }} 
                style={styles.videoThumbnail} 
              />
              <View style={styles.playButtonContainer}>
                <Ionicons name="play-circle" size={50} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
            {message.text && (
              <Text style={styles.messageText}>{message.text}</Text>
            )}
          </TouchableOpacity>
        );
        break;
        
      case 'audio':
        bubbleContent = (
          <View style={styles.audioContainer}>
            <TouchableOpacity style={styles.audioPlayButton}>
              <Ionicons name="play" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.audioWaveform}>
              <View style={styles.audioWaveformBar}></View>
              <View style={[styles.audioWaveformBar, { height: 15 }]}></View>
              <View style={[styles.audioWaveformBar, { height: 20 }]}></View>
              <View style={[styles.audioWaveformBar, { height: 12 }]}></View>
              <View style={[styles.audioWaveformBar, { height: 18 }]}></View>
              <View style={[styles.audioWaveformBar, { height: 10 }]}></View>
              <View style={[styles.audioWaveformBar, { height: 15 }]}></View>
            </View>
            <Text style={styles.audioDuration}>{message.audio.duration}</Text>
          </View>
        );
        break;
        
      case 'file':
        bubbleContent = (
          <TouchableOpacity 
            style={styles.fileContainer}
            onPress={() => downloadFile(message.file)}
          >
            <View style={styles.fileIconContainer}>
              <Ionicons name="document-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {message.file.name}
              </Text>
              <Text style={styles.fileSize}>{message.file.size}</Text>
            </View>
            <Ionicons name="download-outline" size={20} color={isUserMessage ? "#FFFFFF" : "#5F77F6"} />
          </TouchableOpacity>
        );
        break;
        
      default:
        bubbleContent = (
          <Text style={styles.messageText}>{message.text || 'Unsupported message type'}</Text>
        );
    }
    
    return (
      <View 
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userBubble : styles.contactBubble
        ]}
      >
        {bubbleContent}
        <Text 
          style={[
            styles.timestamp,
            isUserMessage ? styles.userTimestamp : styles.contactTimestamp
          ]}
        >
          {message.timestamp}
          {isUserMessage && (
            <Ionicons 
              name={message.read ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={message.read ? "#5F77F6" : "#A8A8A8"} 
              style={{ marginLeft: 4 }}
            />
          )}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.senderId === '1'; // Current user ID
    
    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.contactMessageContainer
      ]}>
        {!isUserMessage && (
          <Image source={{ uri: contactInfo.avatar }} style={styles.messageSenderAvatar} />
        )}
        <View style={{ flex: 1 }}>
          {renderBubble(item)}
        </View>
      </View>
    );
  };

  const renderAttachmentOptions = () => (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={pickDocument}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#FF8C00' }]}>
          <Ionicons name="document-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Document</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={pickImageOrVideo}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="images-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Gallery</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.attachmentOption}
        onPress={takePhoto}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#5F77F6' }]}>
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Camera</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;
    
    let preview;
    
    switch (mediaPreview.type) {
      case 'image':
        preview = (
          <Image 
            source={{ uri: mediaPreview.uri }} 
            style={styles.previewImage} 
            resizeMode="cover"
          />
        );
        break;
        
      case 'video':
        preview = (
          <View style={styles.previewVideoContainer}>
            <Image 
              source={{ uri: mediaPreview.thumbnail || 'https://via.placeholder.com/300x200' }} 
              style={styles.previewVideo} 
              resizeMode="cover"
            />
            <View style={styles.previewPlayButton}>
              <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        );
        break;
        
      case 'audio':
        preview = (
          <View style={styles.previewAudioContainer}>
            <Ionicons name="mic" size={24} color="#5F77F6" />
            <Text style={styles.previewAudioText}>
              Audio Recording - {mediaPreview.duration}
            </Text>
          </View>
        );
        break;
        
      case 'file':
        preview = (
          <View style={styles.previewFileContainer}>
            <Ionicons name="document-outline" size={24} color="#5F77F6" />
            <Text style={styles.previewFileName} numberOfLines={1}>
              {mediaPreview.name}
            </Text>
          </View>
        );
        break;
        
      default:
        preview = (
          <Text style={styles.previewText}>Unsupported media type</Text>
        );
    }
    
    return (
      <View style={styles.mediaPreviewContainer}>
        {preview}
        <TouchableOpacity 
          style={styles.cancelPreviewButton}
          onPress={cancelMediaPreview}
        >
          <Ionicons name="close-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFullScreenMedia = () => {
    if (!selectedMediaView) return null;
    
    return (
      <Modal
        visible={!!selectedMediaView}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMediaView}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity 
            style={styles.closeFullScreenButton}
            onPress={closeMediaView}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          {selectedMediaView.type === 'image' ? (
            <Image 
              source={{ uri: selectedMediaView.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          ) : selectedMediaView.type === 'video' ? (
            <View style={styles.fullScreenVideoContainer}>
              <Video
                source={{ uri: selectedMediaView.uri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                useNativeControls
                style={styles.fullScreenVideo}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderChatHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />
      
      {showAttachmentOptions && renderAttachmentOptions()}
      
      {isUploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#5F77F6" />
          <Text style={styles.uploadingText}>Processing media...</Text>
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {mediaPreview && renderMediaPreview()}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handleAttachmentPress}
          >
            <Ionicons name="add-circle-outline" size={24} color="#5F77F6" />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              multiline
              maxHeight={100}
              editable={!isRecording}
            />
          </View>
          
          {isRecording ? (
            <View style={styles.recordingContainer}>
              <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={() => stopRecording()}
              >
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelRecordingButton}
                onPress={() => stopRecording(true)}
              >
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {inputText.trim() !== '' || mediaPreview ? (
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="send" size={24} color="#5F77F6" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.micButton}
                  onPress={startRecording}
                  onLongPress={startRecording}
                >
                  <Ionicons name="mic-outline" size={24} color="#5F77F6" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      
      {renderFullScreenMedia()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contactTextInfo: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  contactStatus: {
    fontSize: 12,
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  contactMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageSenderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#5F77F6',
    borderBottomRightRadius: 4,
  },
  contactBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  contactMessageText: {
    color: '#333333',
  },
  // Continuation of the styles object from the previous code
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 4,
    opacity: 0.8,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contactTimestamp: {
    color: '#8E8E93',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  videoContainer: {
    position: 'relative',
    width: 200,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
    paddingVertical: 4,
  },
  audioPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5F77F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    justifyContent: 'space-evenly',
  },
  audioWaveformBar: {
    width: 3,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
  audioDuration: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    minWidth: 180,
  },
  fileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5F77F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachButton: {
    padding: 8,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  input: {
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
  },
  micButton: {
    padding: 8,
  },
  attachmentOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachmentOption: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#333333',
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  previewVideoContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  previewAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  previewAudioText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  previewFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
  },
  previewFileName: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    maxWidth: windowWidth - 100,
  },
  previewText: {
    fontSize: 14,
    color: '#333333',
  },
  cancelPreviewButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingTime: {
    fontSize: 16,
    color: '#FF6B6B',
    marginRight: 8,
  },
  cancelRecordingButton: {
    padding: 8,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  uploadingText: {
    marginLeft: 8,
    color: '#333333',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  fullScreenVideoContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  }
});

export default ChatScreen;