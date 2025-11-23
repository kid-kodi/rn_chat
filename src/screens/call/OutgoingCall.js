import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import {RoundButton, TextButton} from '../core/components/MyButton';
import { useSocket } from '../../contexts/SocketProvider';

export default function OutgoingCall({navigation, route}) {
  const socket = useSocket();
  const {cameraStatus, microphoneStatus, callee, caller, chat} = route.params;

  useEffect(() => {
    if (!socket) return;

    socket.on('reject', callData => {
      navigation.navigate('TAB');
    });

    socket.on('accept', callData => {
      navigation.navigate('CALL', {
        chat,
        callee,
        caller,
        cameraStatus,
        microphoneStatus,
        eventName: 'CALL',
      });
    });

    return () => {
      socket.off('reject');
      socket.off('accept');
    };
  }, [socket]);

  const handleCancelCall = () => {
    socket?.emit('cancelCall', {callee, caller, chat});
    navigation.navigate('TAB');
  };

  return (
    <View>
      <Text>{callee.fullName}</Text>
      <RoundButton pressEvent={handleCancelCall} />
    </View>
  );
}
