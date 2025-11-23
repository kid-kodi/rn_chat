import {View, Text} from 'react-native';
import React, {useEffect} from 'react';
import {RoundButton, TextButton} from '../core/components/MyButton';
import socketService from '../core/networks/SocketService';

export default function OutgoingCall({navigation, route}) {
  const socket = socketService.getInstance();
  const {cameraStatus, microphoneStatus, callee, caller, chat} = route.params;

  useEffect(() => {
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
      socket.removeListener('reject');
      socket.removeListener('accept');
    };
  }, []);

  const handleCancelCall = () => {
    socket.emit('cancelCall', {callee, caller, chat});
    navigation.navigate('TAB');
  };

  return (
    <View>
      <Text>{callee.fullName}</Text>
      <RoundButton pressEvent={handleCancelCall} />
    </View>
  );
}
