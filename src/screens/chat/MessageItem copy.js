import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from './chatStyles';

import { BASE_API_URL } from '@env';
import { navigate } from '../../utils/RootNavigation';
import VideoMessage from './VideoMessage';
import BlurredImage from '../../components/BlurredImage';
import { useState } from 'react';



const ImageMessage = ({ message }) => {
  const [downloadedImages, setDownloadedImages] = useState({});
  return (
    <BlurredImage
      source={{ uri: `${BASE_API_URL}/image/${message?.file?.name}` }}
      style={styles.image}
      onLoad={() => {
        setDownloadedImages(prev => ({
          ...prev,
          [message?.file?.name]: true
        }));
      }}
    />
    // <TouchableOpacity onPress={() => navigate(`GALLERY_VIEWER`, { chatId: message.chat, file: message.file })}>
    //   <Image
    //     source={{ uri: `${BASE_API_URL}/image/${message?.file?.name}` }}
    //     style={styles.messageImage}
    //     resizeMode="cover"
    //   />
    // </TouchableOpacity>
  );
};

// const VideoMessage = ({ message }) => {
//   const [visible, setVisible] = useState(false);
//   return (
//     <TouchableOpacity onPress={() => setVisible(!visible)}>
//       <Image
//         source={{ uri: `${BASE_API_URL}/image/${message?.file?.name}` }}
//         style={styles.messageImage}
//         resizeMode="cover"
//       />
//       <Modal visible={visible}>
//         <Video videoUri={`${BASE_API_URL}/image/${message?.file?.name}` }/>
//       </Modal>
//     </TouchableOpacity>
//   );
// };

const MessageBubble = ({
  message,
  user,
  openFile,
  downloadFile,
  handleMessageLongPress,
  actionMenuVisible,
  closeActionMenu,
  fadeAnim,
  handleAction,
  formatChatDate
}) => {
  const isUserMessage = message.sender._id === user._id;

  const renderBubbleContent = () => {
    switch (message.type) {
      case 'text':
        return <Text style={styles.messageText}>{message.content}</Text>;

      case 'image':
        return (
          <ImageMessage
            message={message}
            isUserMessage={isUserMessage}
            openFile={openFile}
            downloadFile={downloadFile}
          />
        );

      case 'video':
        return (
          <VideoMessage message={message} />
        );

      case 'audio':
        return (
          <View style={styles.audioContainer}>
            <TouchableOpacity style={styles.audioPlayButton}>
              <Ionicons name="play" size={20} color="#000" />
            </TouchableOpacity>
            <View style={styles.audioWaveform}>
              {[10, 15, 20, 12, 18, 10, 15].map((height, index) => (
                <View
                  key={index}
                  style={[styles.audioWaveformBar, { height }]}
                />
              ))}
            </View>
            <Text style={styles.audioDuration}>{message.audio.duration}</Text>
          </View>
        );

      case 'file':
        return (
          <TouchableOpacity
            style={styles.fileContainer}
            onPress={() => downloadFile(message?.file)}
          >
            <View style={styles.fileIconContainer}>
              <Ionicons name="document-outline" size={24} color="#000" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {message?.file?.name}
              </Text>
              <Text style={styles.fileSize}>{message?.file?.size}</Text>
            </View>
            <Ionicons
              name="download-outline"
              size={20}
              color={isUserMessage ? "#000" : "#333"}
            />
          </TouchableOpacity>
        );

      default:
        return (
          <Text style={styles.messageText}>
            {message.content || 'Unsupported message type'}
          </Text>
        );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.messageBubble,
          isUserMessage ? styles.userBubble : styles.contactBubble
        ]}
        onLongPress={() => handleMessageLongPress(message)}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {!isUserMessage && <Text>{message.sender?.fullName}</Text>}
        {renderBubbleContent()}
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
              color={message.read ? "#333" : "#A8A8A8"}
              style={{ marginLeft: 4 }}
            />
          )}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={actionMenuVisible}
        onRequestClose={closeActionMenu}
        animationType="none"
      >
        <Pressable style={styles.modalOverlay} onPress={closeActionMenu}>
          <Animated.View style={[styles.actionMenu, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('copy')}
            >
              <Text style={styles.actionText}>Copier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleAction('delete')}
            >
              <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

export default MessageBubble;