import { View, Text, Alert, FlatList, KeyboardAvoidingView, Platform, TextInput, Keyboard, Image, ActivityIndicator, Modal } from 'react-native';
import styles from './styles';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { navigate } from '../../utils/RootNavigation';
import CustomImageView from '../../components/CustomImage';

import * as DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';

import { BASE_API_URL } from '@env';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '../../contexts/UserProvider';
import axiosInstance from '../../utils/AxiosInstance';
import { formatChatDate, getFileTypeFromMimeType } from '../../utils/Utility';
import { useSocket } from '../../contexts/SocketProvider';
import { filePicker } from '../../services/FileService';

export default function Chat({ route }) {
  const chatInfo = route?.params?.chatInfo;

  const { user } = useUser();
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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


  // const pickDocument = async (documentType = "*/*") => {
  //   try {
  //     setShowAttachmentOptions(false);
  //     setIsUploading(true);
  //     const results = await DocumentPicker.pick({
  //       type: [
  //         DocumentPicker.types.pdf,
  //         DocumentPicker.types.doc,
  //         DocumentPicker.types.docx,
  //         DocumentPicker.types.xls,
  //         DocumentPicker.types.xlsx,
  //         DocumentPicker.types.ppt,
  //         DocumentPicker.types.pptx,
  //         DocumentPicker.types.plainText,
  //       ],
  //       allowMultiSelection: true,
  //     });
  //     setIsUploading(false);

  //     results.forEach(async result => {
  //       console.log(result)

  //       setMediaPreview({
  //         type: getFileTypeFromMimeType(result.type),
  //         uri: result.uri,
  //         name: result.name,
  //         size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
  //         fileType: result.type
  //       });
  //     })
  //     setShowAttachmentOptions(false);
  //   } catch (error) {
  //     console.error('Error picking document:', error);
  //     Alert.alert('Error', 'Failed to attach document');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const takePhoto = async () => {
    try {
      setShowAttachmentOptions(false);

      ImagePicker.openCamera({
        width: 1200,
        height: 1500,
        cropping: true,
        includeBase64: false,
        compressImageQuality: 1
      })
        .then(async image => {
          setMediaPreview({
            type: getFileTypeFromMimeType(image.mime),
            uri: image.path
          });
        })
        .catch(error => {
          console.log('error riased', error);
        });


    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsUploading(false);
    }
  };

  // const pickImageOrVideo = async () => {
  //   try {
  //     setShowAttachmentOptions(false);
  //     setIsUploading(true);
  //     ImagePicker.openPicker({
  //       width: 1200,
  //       height: 1500,
  //       cropping: true,
  //       includeBase64: false,
  //       compressImageQuality: 1
  //     })
  //       .then(async image => {
  //         console.log(image);
  //         setMediaPreview({
  //           type: getFileTypeFromMimeType(image.mime),
  //           uri: image.path
  //         });
  //       })
  //       .catch(error => {
  //         console.log('error riased', error);
  //       });

  //   } catch (error) {
  //     console.error('Error picking media:', error);
  //     Alert.alert('Error', 'Failed to select media');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

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
    Alert.alert('Audio Call', `Calling ${chatInfo.name}...`);
  };

  const handleVideoCall = () => {
    // Implement video call functionality
    Alert.alert('Video Call', `Starting video call with ${chatInfo.name}...`);
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

  const handleAttachmentPress = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
    Keyboard.dismiss();
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '' && !mediaPreview) return;

    // Create new message
    const newMessage = {
      _id: Date.now().toString(),
      sender: user, // current user id
      createdAt: new Date(),
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
        newMessage.content = inputText.trim();
      }
    } else {
      // Text-only message
      newMessage.content = inputText.trim();
      newMessage.type = 'text';
    }

    // Add to messages list
    setMessages([...messages, newMessage]);

    // Clear input and preview
    setInputText('');
    setMediaPreview(null);

    // In a real app, you would send the message to your backend here
    if (!socket) return;

    socket.emit('send_message', {
      chatId: chatInfo.chatId,
      senderId: user._id,
      message: newMessage,
    });
  };

  const renderChatHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigate(`TAB`)}
      >
        <Ionicons name="arrow-back" size={24} color="#333333" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.contactInfo}
        onPress={() =>
          chatInfo?.isGroupChat
            ? navigate('CHAT_SETTINGS', { id: chatInfo.chatId })
            : navigate('CONTACT', { id: chatInfo.participants[0]._id })
        }
      >
        <CustomImageView
          source={`${BASE_API_URL}/image/${chatInfo.avatar}`}
          firstName={chatInfo?.name}
          size={40}
          fontSize={20}
        />
        <View style={styles.contactTextInfo}>
          <Text style={styles.contactName}>{chatInfo.name}</Text>
          {chatInfo.isGroupChat && <Text style={styles.contactStatus}>
            participants {chatInfo.usersLenght}
          </Text>}

          {!chatInfo.isGroupChat && <Text style={styles.contactStatus}>
            {chatInfo.status === 'online' ? 'Online' : chatInfo.lastSeen}
          </Text>}
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
    const isUserMessage = message.sender && message.sender?._id === user?._id; // Current user ID

    let bubbleContent;

    switch (message.type) {
      case 'text':
        bubbleContent = (
          <Text style={styles.messageText}>{message.content}</Text>
        );
        break;

      case 'image':
        bubbleContent = (
          <TouchableOpacity
            onPress={() => viewMediaInFullScreen({ type: 'image', uri: `${BASE_API_URL}/image/${message.file.name}` })}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: `${BASE_API_URL}/image/${message.file.name}` }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            {message.text && (
              <Text style={styles.messageText}>{message.content}</Text>
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
              <Text style={styles.messageText}>{message.content}</Text>
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
          <Text style={styles.messageText}>{message.content || 'Unsupported message type'}</Text>
        );
    }

    return (
      <View
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userBubble : styles.contactBubble
        ]}
      >
        {!isUserMessage && (<Text>{message.sender?.fullName}</Text>)}
        {bubbleContent}
        <Text
          style={[
            styles.timestamp,
            isUserMessage ? styles.userTimestamp : styles.contactTimestamp
          ]}
        >
          {formatChatDate(message.createdAt)}
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
    const isUserMessage = item.sender?._id === user?._id; // Current user ID

    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.contactMessageContainer
      ]}>
        {!isUserMessage && (
          <CustomImageView
            source={`${BASE_API_URL}/image/${item.sender.profilePicture}`}
            firstName={item.sender?.fullName}
            size={30}
            fontSize={20}
          />
        )}
        <View style={{ maxWidth: "80%" }}>
          {renderBubble(item)}
        </View>
      </View>
    );
  };

  const pickVideos = async () => {
    try {
      const videos = await filePicker({
        include: ['videos', 'mp4', 'mov'],
        multiple: true
      });

      videos.forEach(async result => {
        setMediaPreview({
          type: getFileTypeFromMimeType(result.type),
          uri: result.uri,
          name: result.name,
          size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: result.type
        });
      })

    } catch (error) {
      console.error('Error picking videos:', error);
    }
  };

  const pickImages = async () => {
    try {
      const images = await filePicker({
        include: ['images'],
        multiple: true
      });
      images.forEach(async result => {
        setMediaPreview({
          type: getFileTypeFromMimeType(result.type),
          uri: result.uri,
          name: result.name,
          size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: result.type
        });
      })
    } catch (error) {
      console.error('Error picking documents:', error);
    }
  };

  const pickDocuments = async () => {
    try {
      const selectedDocs = await filePicker({
        include: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'text', 'csv', 'rtf'],
        multiple: true
      });
      selectedDocs.forEach(async result => {
        setMediaPreview({
          type: getFileTypeFromMimeType(result.type),
          uri: result.uri,
          name: result.name,
          size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: result.type
        });
      })
    } catch (error) {
      console.error('Error picking documents:', error);
    }
  };

  const pickAudios = async () => {
    try {
      const audios = await filePicker({
        include: ['audio'],
        multiple: true
      });
      audios.forEach(async result => {
        setMediaPreview({
          type: getFileTypeFromMimeType(result.type),
          uri: result.uri,
          name: result.name,
          size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
          fileType: result.type
        });
      })
    } catch (error) {
      console.error('Error picking documents:', error);
    }
  };

  const renderAttachmentOptions = () => (
    <View style={styles.attachmentOptionsContainer}>
      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickDocuments}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#FF8C00' }]}>
          <Ionicons name="document-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Document</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickImages}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="images-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Photos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickVideos}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="images-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Videos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachmentOption}
        onPress={pickAudios}
      >
        <View style={[styles.attachmentIconContainer, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="images-outline" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.attachmentText}>Audios</Text>
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


  useEffect(() => {
    (async () => {
      if (!chatInfo?.chatId || !user?._id) return;
      const response = await axiosInstance.get(`/api/messages/${chatInfo?.chatId}/group`);

      if (response.success) {
        setMessages(response.messages);
        // setTimeout(() => {
        //   flatListRef.current.scrollToEnd({ animated: true });
        // }, 500);
      }
    })();
  }, [chatInfo?.chatId, user?._id]);

  return (
    <View style={styles.container}>
      {renderChatHeader()}

      {isUploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#5F77F6" />
          <Text style={styles.uploadingText}>Processing media...</Text>
        </View>
      )}

      {renderFullScreenMedia()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.messagesList}
      />

      {showAttachmentOptions && renderAttachmentOptions()}
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
              placeholder="Taper un message..."
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
                <>
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={takePhoto}
                  >
                    <Ionicons name="camera-outline" size={24} color="#5F77F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.micButton}
                    onPress={startRecording}
                    onLongPress={startRecording}
                  >
                    <Ionicons name="mic-outline" size={24} color="#5F77F6" />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>

    </View>
  )
}