import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Vibration,
  Modal,
} from 'react-native';
import React, {useEffect} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import {useUser} from '../contexts/UserProvider';
import {useSocket} from '../contexts/SocketProvider';
import {useNavigation} from '@react-navigation/native';
import {useCall} from '../contexts/CallKeepProvider';

export default function CallNotification() {
  const {user} = useUser();
  const socket = useSocket();
  const navigation = useNavigation();
  const {InCallManager, incomingCall, setIncomingCall} = useCall();

  const onAccept = () => {
    Vibration.cancel();
    InCallManager.stopRingback();
    InCallManager.start();
    setIncomingCall(null);

    socket?.emit('accept', incomingCall);

    navigation.navigate('CALL', {
      chat: incomingCall.chat,
      callee: incomingCall.callee,
      caller: user,
      cameraStatus: false,
      microphoneStatus: true,
      eventName: 'ANSWER',
    });
  };
  const onDecline = () => {
    // Handle reject acceptance
    Vibration.cancel();
    InCallManager.stopRingback();
    InCallManager.start();
    setIncomingCall(null);

    socket?.emit('reject', incomingCall);
  };

  useEffect(() => {
    socket.on('cancelCall', () => {
      Vibration.cancel();
      InCallManager.stopRingback();
      InCallManager.start();
      setIncomingCall(null);
    });
  }, []);

  return (
    <Modal transparent={true} animationType="slide" visible={!!incomingCall}>
      <View style={styles.bg}>
        <Text style={styles.name}>K{incomingCall?.callee?.fullName}</Text>
        <Text style={styles.phoneNumber}>Appel Entrant...</Text>

        <View style={[styles.row, {marginTop: 'auto'}]}>
          {/* <View style={styles.iconContainer}>
            <Ionicons name="alarm" color="white" size={30} />
            <Text style={styles.iconText}>Remind me</Text>
          </View>
          <View style={styles.iconContainer}>
            <Entypo name="message" color="white" size={30} />
            <Text style={styles.iconText}>Message</Text>
          </View> */}
        </View>

        <View style={styles.row}>
          {/* Decline Button */}
          <Pressable onPress={onDecline} style={styles.iconContainer}>
            <View style={styles.iconButtonContainer}>
              <Feather name="x" color="white" size={40} />
            </View>
            <Text style={styles.iconText}>Refuser</Text>
          </Pressable>

          {/* Accept Button */}
          <Pressable onPress={onAccept} style={styles.iconContainer}>
            <View
              style={[
                styles.iconButtonContainer,
                {backgroundColor: '#2e7bff'},
              ]}>
              <Feather name="check" color="white" size={40} />
            </View>
            <Text style={styles.iconText}>Accepter</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 100,
    marginBottom: 15,
  },
  phoneNumber: {
    fontSize: 20,
    color: 'white',
  },
  bg: {
    backgroundColor: '#000',
    flex: 1,
    alignItems: 'center',
    padding: 10,
    paddingBottom: 50,
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconText: {
    color: 'white',
    marginTop: 10,
  },
  iconButtonContainer: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 50,
    margin: 10,
  },
});
