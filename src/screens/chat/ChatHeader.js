import { Text, TouchableOpacity, View } from 'react-native'
import { styles } from './chatStyles';
import { navigate } from '../../utils/RootNavigation';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomImageView from '../../components/CustomImage';
import { getMessagePreview } from '../../utils/messageFormatter';

import { BASE_API_URL } from '@env';

import { useUser } from '../../contexts/UserProvider';
import { useApi } from '../../contexts/ApiProvider';
import { useConversation } from '../../contexts/ConversationProvider';

export default function ChatHeader({ chatInfo, chat, isSelectMode, setIsSelectMode, selectedCount, onCancelSelect, onDeleteSelected }) {

  const { user } = useUser();
  const api = useApi();
  const navigation = useNavigation();
  const { setChat: updateChat, joinCall: joinCallFromContext, initiateCall: initiateCallFromContext } = useConversation();

  // Get last message preview if available, otherwise show status
  const headerSubtitle = chat?.lastMessage
    ? getMessagePreview(chat.lastMessage, user?._id)
    : chatInfo?.status;

  const handleAudioCall = async () => {
    try {
      await initiateCallFromContext(chat, 'audio', user, api, updateChat, navigation);
    } catch (error) {
      console.error('Failed to initiate audio call:', error);
    }
  };

  const handleVideoCall = async () => {
    try {
      await initiateCallFromContext(chat, 'video', user, api, updateChat, navigation);
    } catch (error) {
      console.error('Failed to initiate video call:', error);
    }
  };



  const handleJoinCall = () => {
    // Use the context's joinCall function which includes callId and proper state
    joinCallFromContext(chat, navigation, user);
  };

  return (
    <View style={styles.header}>
      {/* Normal Mode - Back Button */}
      {!isSelectMode && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigate(`TAB`)}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
      )}

      {/* Select Mode - Close Button */}
      {isSelectMode && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onCancelSelect}
        >
          <Ionicons name="close" size={24} color="#333333" />
        </TouchableOpacity>
      )}

      {/* Contact Info or Selection Count */}
      {!isSelectMode ? (
        <TouchableOpacity
          style={styles.contactInfo}
          onPress={() =>
            chatInfo?.isGroupChat
              ? navigate('CHAT_SETTINGS', { id: chatInfo?.chatId })
              : navigate('CONTACT', { id: chat?.users[0]._id, chat })
          }
        >
          <CustomImageView
            source={`${BASE_API_URL}/image/${chatInfo?.avatar}`}
            firstName={chatInfo?.name}
            size={40}
            fontSize={20}
          />
          <View style={styles.contactTextInfo}>
            <Text style={styles.contactName}>{chatInfo?.name}</Text>
            <Text style={styles.contactStatus} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {selectedCount} selected
          </Text>
        </View>
      )}

      {/* Normal Mode Actions */}
      {!isSelectMode && (
        <View style={styles.headerActions}>
          {!chat?.ongoingCall && (
            <>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleAudioCall}
              >
                <Ionicons name="call-outline" size={22} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleVideoCall}
              >
                <Ionicons name="videocam-outline" size={22} color="#333" />
              </TouchableOpacity>
            </>
          )}

          {chat?.ongoingCall && (
            <TouchableOpacity
              style={[styles.headerButton, styles.joinButton]}
              onPress={handleJoinCall}
            >
              <Text style={styles.joinButtonText}>Rejoindre</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Select Mode Actions */}
      {isSelectMode && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onDeleteSelected}
            disabled={selectedCount === 0}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={selectedCount > 0 ? '#FF3B30' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}