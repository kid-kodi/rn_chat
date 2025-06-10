import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Pressable,
} from 'react-native';



import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_API_URL } from '@env';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import CustomImageView from '../../components/CustomImage';
import { formatChatDate, formatDate } from '../../utils/Utility';
import { MeetingVariable } from '../../MeetingVariable';
import FileViewer from 'react-native-file-viewer';
import Video from 'react-native-video';

const { width } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = width * 0.75;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: 'flex-end',
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  messageWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginLeft: 12,
  },
  textContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 4,
  },
  ownMessage: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFF',
  },
  mediaContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 4,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
  },
  loadingContainer: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageMessage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  videoMessage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  audioContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 12,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  audioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioDuration: {
    fontSize: 14,
    color: '#666',
  },
  documentContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 12,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 20,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  documentSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    color: '#000',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
    marginRight: 8,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});


export default function MessageItem(props) {

  const message = props.message;
  const onPress = props.onPress;
  const onLongPress = props.onLongPress;

  const [isLoading, setIsLoading] = useState(false);
  const [cachedUri, setCachedUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    loadCachedContent();

    // Initialize react-native-sound
    Sound.setCategory('Playback');

    return () => {
      if (sound) {
        sound.release();
      }
    }
  }, [message._id]);

  const loadCachedContent = async () => {
    if (message.type === 'text') return;

    try {
      const cacheKey = `message_${message._id}`;
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached) {
        setCachedUri(cached);
      } else if (message.file) {
        await cacheContent(message.file, cacheKey);
      }
    } catch (error) {
      console.error('Cache load error:', error);
    }
  };

  const cacheContent = async (file, cacheKey) => {
    const uri = `${BASE_API_URL}/image/${file?.name}`
    if (!uri) return;

    setIsLoading(true);
    try {
      const extension = uri.split('.').pop() || 'tmp';
      const localPath = `${RNFS.CachesDirectoryPath}/${cacheKey}.${extension}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: localPath,
      }).promise;


      if (downloadResult.statusCode === 200) {
        await AsyncStorage.setItem(cacheKey, `file://${localPath}`);
        setCachedUri(`file://${localPath}`);
      }
    } catch (error) {
      console.error('Cache error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const playAudio = async () => {
    try {
      if (sound) {
        sound.release();
      }

      const audioUri = cachedUri || `${BASE_API_URL}/image/${message.file?.name}`;
      const newSound = new Sound(audioUri, '', (error) => {
        if (error) {
          console.error('Sound loading error:', error);
          Alert.alert('Error', 'Could not load audio');
          return;
        }

        setDuration(newSound.getDuration());
        setSound(newSound);

        newSound.play((success) => {
          if (success) {
            setIsPlaying(false);
            setCurrentTime(0);
          } else {
            console.error('Sound playback failed');
          }
        });

        setIsPlaying(true);
      });

    } catch (error) {
      Alert.alert('Error', 'Could not play audio');
    }
  };

  const pauseAudio = () => {
    if (sound && isPlaying) {
      sound.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (sound && !isPlaying) {
      sound.play((success) => {
        if (success) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      });
      setIsPlaying(true);
    }
  };

  const openFile = async () => {
    try {

      // Now open the file
      FileViewer.open(cachedUri || `${BASE_API_URL}/image/${message.file?.name}`)
        .then(() => {
          console.log('File opened successfully');
        })
        .catch((error) => {
          console.error('Error opening file:', error);
        });

    } catch (error) {
      console.error('Error in openFile process:', error);
    }
  };

  const renderTextMessage = () => (
    <View style={[styles.textContainer, props.isOwn && styles.ownMessage]}>
      <Text style={[styles.messageText, props.isOwn && styles.ownMessageText]}>
        {message.content}
      </Text>
      {renderTimestamp()}
    </View>
  );

  const renderImageMessage = () => (
    <View style={[styles.mediaContainer, props.isOwn && styles.ownMessage]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <TouchableOpacity onPress={() => openFile?.()}>
          <Image
            source={{ uri: cachedUri || `${BASE_API_URL}/image/${message.file.name}` }}
            style={styles.imageMessage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      {message.caption && (
        <Text style={[styles.caption, props.isOwn && styles.ownMessageText]}>
          {message.caption}
        </Text>
      )}
      {renderTimestamp()}
    </View>
  );

  const renderVideoMessage = () => (
    <View style={[styles.mediaContainer, props.isOwn && styles.ownMessage]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <TouchableOpacity onPress={() => openFile?.()}>
          <Video
            source={{ uri: cachedUri || `${BASE_API_URL}/image/${message?.file?.name}` }}
            style={styles.videoMessage}
            resizeMode="cover"
            paused={true}
            controls={false}
          />
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>▶</Text>
          </View>
        </TouchableOpacity>
      )}
      {message.caption && (
        <Text style={[styles.caption, props.isOwn && styles.ownMessageText]}>
          {message.caption}
        </Text>
      )}
      {renderTimestamp()}
    </View>
  );

  const renderAudioMessage = () => (
    <View style={[styles.audioContainer, props.isOwn && styles.ownMessage]}>
      <TouchableOpacity
        style={styles.audioButton}
        onPress={isPlaying ? pauseAudio : (sound ? resumeAudio : playAudio)}
      >
        <Text style={styles.audioButtonText}>
          {isPlaying ? '⏸' : '▶'}
        </Text>
      </TouchableOpacity>
      <View style={styles.audioInfo}>
        <Text style={[styles.audioDuration, props.isOwn && styles.ownMessageText]}>
          {message.duration || '0:00'}
        </Text>
        {isPlaying && (
          <ActivityIndicator size="small" color={props.isOwn ? '#FFF' : '#007AFF'} />
        )}
      </View>
      {renderTimestamp()}
    </View>
  );

  const renderDocumentMessage = () => (
    <TouchableOpacity
      style={[styles.documentContainer, props.isOwn && styles.ownMessage]}
      onPress={() => openFile?.()}
    >
      <View style={styles.documentIcon}>
        <Text style={styles.documentIconText}>📄</Text>
      </View>
      <View style={styles.documentInfo}>
        <Text style={[styles.documentName, props.isOwn && styles.ownMessageText]} numberOfLines={1}>
          {message.file.name || 'Document'}
        </Text>
        <Text style={[styles.documentSize, props.isOwn && styles.ownMessageText]}>
          {`${(message.file.data.size / (1024 * 1024)).toFixed(1)} MB` || 'Unknown size'}
        </Text>
      </View>
      {renderTimestamp()}
    </TouchableOpacity>
  );

  const renderTimestamp = () => (
    <Text style={[styles.timestamp, props.isOwn && styles.ownTimestamp]}>
      {formatChatDate(message.createdAt)}
    </Text>
  );

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return renderTextMessage();
      case 'image':
        return renderImageMessage();
      case 'video':
        return renderVideoMessage();
      case 'audio':
        return renderAudioMessage();
      case 'file':
        return renderDocumentMessage();
      default:
        return renderTextMessage();
    }
  };

  return (
    <>

      <View style={[styles.container, props.isOwn && styles.ownContainer]}>
        {!props.isOwn && (
          <CustomImageView
            source={`${BASE_API_URL}/image/${message.sender?.profilePicture}`}
            firstName={message.sender?.fullName}
            size={40}
            fontSize={20}
            style={styles.avatar}
          />
        )}
        <View style={styles.messageWrapper}>
          {!props.isOwn && (
            <Text style={styles.senderName}>{message.sender?.fullName}</Text>
          )}
          <TouchableOpacity
            onPress={() => onPress?.(message)}
            onLongPress={() => onLongPress?.(message)}
            activeOpacity={0.8}
          >
            {renderContent()}
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        transparent
        visible={props.actionMenuVisible}
        onRequestClose={props.closeActionMenu}
        animationType="none"
      >
        <Pressable style={styles.modalOverlay} onPress={props.closeActionMenu}>
          <Animated.View style={[styles.actionMenu, { opacity: props.fadeAnim }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => props.handleAction('copy')}
            >
              <Text style={styles.actionText}>Copier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => props.handleAction('delete')}
            >
              <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

