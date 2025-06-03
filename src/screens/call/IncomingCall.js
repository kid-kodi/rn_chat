import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import { BASE_API_URL } from '@env';
import CustomImageView from '../../components/CustomImage';
import axiosInstance from '../../utils/AxiosInstance';
import Colors from '../../constants/Colors';


const IncomingCall = ({
  route, navigation
}) => {
  // const [ringtone, setRingtone] = useState(null);
  // const [vibrationPattern] = useState([1000, 2000, 3000]);
  const pulseAnim = new Animated.Value(1);
  const callData = route.params.callData;

  // Set up animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Set up ringtone and vibration
  useEffect(() => {
    // Initialize ringtone
    // Sound.setCategory('Playback');
    // const tone = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
    //   if (error) {
    //     console.log('Failed to load ringtone', error);
    //     return;
    //   }
    //   tone.setNumberOfLoops(-1); // Loop indefinitely
    //   tone.play();
    //   setRingtone(tone);
    // });

    // Start vibration
    // Vibration.vibrate(vibrationPattern, true);

    // Clean up on unmount
    // return () => {
    //   if (ringtone) {
    //     ringtone.stop();
    //     ringtone.release();
    //   }
    //   Vibration.cancel();
    // };
  }, []);

  const handleAccept = async () => {
    try {
      // setCallState('connecting');

      // Emit socket event to accept call
      // socket.emit('call:accept', {
      //   callId,
      //   recipientId: caller.id,
      // });

      // Update call status in the backend
      await axiosInstance.post(
        `/api/call/update-call`,
        {
          callId: callData.callId,
          status: 'accepted'
        }
      );

      // globalPageRef.current.init({
      //   visible: true,
      //   maximized: true,
      //   videoBubble: false,
      //   content:
      //     <MeetingPage
      //       chatId={callData.chatId}
      //       user={user}
      //       cameraStatus={callData.callType === "video"}
      //       microphoneStatus={true} />
      // });

      navigation.navigate('CALL', {
        chatId: callData.chatId,
        cameraStatus: callData.callType === "video",
        microphoneStatus: false,
      });

      // setCallState('connected');
      // startCallTimer();

      // The caller will send the offer once they receive the accept event
    } catch (error) {
      console.error('Failed to accept call:', error);
      // handleCallFailed('Failed to connect');
    }
  };

  const handleDecline = async () => {
    await axiosInstance.post(`/api/call/update-call`, { callId: callData.callId, status: 'declined' });

    navigation.goBack();
    // if (ringtone) {
    //   ringtone.stop();
    //   ringtone.release();
    // }
    // Vibration.cancel();
    // onDecline();
  };

  return (
    <View style={styles.container}>
      <View style={styles.callInfo}>
        <Text style={styles.callStatus}>Appel Entrant</Text>
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <CustomImageView
            source={`${BASE_API_URL}/image/${callData.caller.profilePicture}`}
            firstName={callData.caller?.name}
            size={120}
            fontSize={60}
          />
        </Animated.View>
        <Text style={styles.callerName}>{callData.caller.name}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={handleDecline}
        >
          <Icon name='x' size={28} color={Colors.white} />
          <Text style={styles.buttonText}>Refuser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={handleAccept}
        >
          <Icon name='check' size={28} color={Colors.white} />
          <Text style={styles.buttonText}>Accepter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  callInfo: {
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  callStatus: {
    color: '#FFF',
    fontSize: 20,
    marginBottom: 30,
    opacity: 0.7,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    color: '#FFF',
    fontWeight: 'bold',
  },
  callerName: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callerNumber: {
    color: '#FFF',
    fontSize: 18,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#e74c3c',
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  buttonText: {
    color: '#FFF',
    marginTop: 5,
    fontSize: 12,
  },
});

export default IncomingCall;