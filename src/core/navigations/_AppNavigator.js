import React, {useEffect, useState} from 'react';

import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';
import {useUser} from '../contexts/UserProvider';
import {useApi} from '../contexts/ApiProvider';
import {Alert, Platform, Text, View} from 'react-native';
import {MyAlert} from '../components/MyAlert';
import {TextButton} from '../components/MyButton';
import {useSocket} from '../contexts/SocketProvider';
// import SandScreen from '../../sand/SandScreen';

import {Vibration} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SplashScreen from '../SplashScreen';

export default function AppNavigator() {
  const api = useApi();
  const socket = useSocket();
  const {user} = useUser();
  const [appIsLoaded, setAppLoaded] = useState(false);
  const [someoneIsCalling, setSomeoneIsCalling] = useState(false);
  const [callee, setCallee] = useState();
  const [data, setData] = useState();

  const navigation = useNavigation();

  // Vibrate

  const ONE_SECOND_IN_MS = 1000;

  const PATTERN = [
    1 * ONE_SECOND_IN_MS,
    2 * ONE_SECOND_IN_MS,
    3 * ONE_SECOND_IN_MS,
  ];

  const PATTERN_DESC =
    Platform.OS === 'android'
      ? 'wait 1s, vibrate 2s, wait 3s'
      : 'wait 1s, vibrate, wait 2s, vibrate, wait 3s';

  const answerCall = () => {
    Vibration.cancel();
    setSomeoneIsCalling(false);
    socket?.emit('answer', {callee, chat: data.chat});
    // navigation.navigate('CALL', {chat: data.chat, callee });

    navigation.navigate('CALL', {
      chat : data.chat,
      callee: callee,
      cameraStatus: true,
      microphoneStatus: false,
      eventName: "ANSWER"
    })
  };

  const rejectCall = () => {
    Vibration.cancel();
    setSomeoneIsCalling(false);
    setCallee();
    setData();
  };

  useEffect(() => {
    setAppLoaded(true);
  }, [user]);

  useEffect(() => {
    // Listener for when a user is typing.
    socket?.on('call', data => {
      Vibration.vibrate(PATTERN, true);
      setCallee(data.caller);
      setData(data);
      setSomeoneIsCalling(true);
      // make phone ring or vibrate to signal user is calling
    });

    // Listener for when a user is answer.
    socket?.on('answer', data => {
      Vibration.cancel();
      setSomeoneIsCalling(false);
      setCallee();
      setData();
    });

    return () => {
      // Clean up the WebSocket connection on component unmount
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <>
      {!appIsLoaded && <SplashScreen />}
      {appIsLoaded && !user && <AuthNavigator />}
      {appIsLoaded && user && <MainNavigator />}
      <View>
        <MyAlert
          title={'Vous recevez un appel'}
          okButton={
            <TextButton
              text={'Decrocher'}
              pressEvent={answerCall}
              containerStyle={{
                borderColor: 'green',
                borderWidth: 1,
                borderRadius: 5,
              }}
              fontStyle={{fontSize: 14, color: 'green'}}
            />
          }
          content={
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text>{callee?.fullName}</Text>
            </View>
          }
          cancelButton={
            <TextButton
              text={'Annuler'}
              pressEvent={rejectCall}
              containerStyle={{
                borderColor: 'green',
                borderWidth: 1,
                backgroundColor: 'green',
                borderRadius: 5,
              }}
              fontStyle={{fontSize: 14, color: 'white'}}
            />
          }
          visible={someoneIsCalling}
          setVisible={() => setSomeoneIsCalling(false)}
          backEvent={rejectCall}
        />
      </View>
    </>
  );
}
