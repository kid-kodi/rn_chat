import { Text, TouchableOpacity, View } from 'react-native'
import { styles } from './chatStyles';
import { navigate } from '../../utils/RootNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomImageView from '../../components/CustomImage';

import { BASE_API_URL } from '@env';
import { MeetingVariable } from '../../MeetingVariable';

import uuid from 'react-native-uuid';
import { useUser } from '../../contexts/UserProvider';
import { useApi } from '../../contexts/ApiProvider';

export default function ChatHeader({ chatInfo, chat }) {

  const { user } = useUser();
  const api = useApi();

  const initiateCall = async (callType) => {
    // if (isCallLoading) return;

    try {
      // setIsCallLoading(true);

      // Start the outgoing call with CallKeep

      // Generate a unique call ID
      const callId = uuid.v4();

      // Prepare call data
      const callData = {
        chatId: chat._id,
        callId,
        callType,
        caller: user,
      };

      // Call the backend API to initiate call
      const response = await api.post(`/api/call/initiate-call`, callData);
      // setChat(response.chat);

      MeetingVariable.callService.setup();

      const callUUID = MeetingVariable.callService.startCall(
        callId, chat._id, chatInfo.name, chatInfo.isGroupChat, callData.callType === "video");

      // Navigate to call screen
      navigate('CALL', {
        callUUID,
        chatId: callData.chatId,
        cameraStatus: callData.callType === "video",
        microphoneStatus: false,
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
    } finally {
      // setIsCallLoading(false);
    }
  };


  const handleAudioCall = () => {
    // Implement audio call functionality
    // Alert.alert('Audio Call', `Calling ${chatInfo.name}...`);
    initiateCall('audio');
  };

  const handleVideoCall = () => {
    // Implement video call functionality
    // Alert.alert('Video Call', `Starting video call with ${chatInfo.name}...`);
    initiateCall('video')
  };



  const joinCall = async data => {
    // Generate a unique call ID
    const callId = uuid.v4();

    // Prepare call data
    const callData = {
      chatId: chat._id,
      callId,
      callType : data.cameraStatus ? "video" : "audio",
      caller: user,
    };

    const callUUID = MeetingVariable.callService.startCall(
      callId, chat._id, chatInfo.name, chatInfo.isGroupChat, callData.callType === "video");

    navigate('CALL', {
      callUUID,
      chatId: data.chatId,
      cameraStatus: data.cameraStatus,
      microphoneStatus: data.microphoneStatus,
    });
    return false;
  };


  return (
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
          <Text style={styles.contactStatus}>
            {chatInfo?.status}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.headerActions}>
        {!chat?.ongoingCall && <>
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
        </>}

        {chat?.ongoingCall &&
          <TouchableOpacity style={[
            styles.headerButton,
            styles.joinButton]}
            onPress={() => {
              joinCall({
                chatId: chat?._id,
                cameraStatus: false,
                microphoneStatus: true,
              });
            }}>
            <Text style={styles.joinButtonText}>Rejoindre</Text>
          </TouchableOpacity>}
      </View>
    </View>
  )
}