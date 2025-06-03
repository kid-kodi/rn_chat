import {createContext, useContext, useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import CallKeepImpl from '../utils/CallKeepImpl';
import {Alert, Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {updateCallStatus} from '../../chat/ChatApi';
import { Toast } from 'react-native-toast-notifications';

const NotificationContext = createContext();

export default function NotificationProvider({children}) {
  const navigation = useNavigation();

  const onMessageReceived = async message => {
    const data = JSON.parse(message.data.info);

    console.log(data);

    const callee = data.callee;
    const caller = data.caller;
    const chat = data.chat;
    const notification_type = data.notification_type;
    
    switch (notification_type) {
      case 'call':
        
        const incomingCallAnswer = ({callUUID}) => {
          CallKeepImpl.backToForeground();
          updateCallStatus({
            caller,
            chat,
            notification_type: 'ACCEPTED',
          });
          CallKeepImpl.endIncomingcallAnswer(callUUID);
          Linking.openURL(
            `ky92://call/${chat._id}/${data.cameraStatus}/${data.microphoneStatus}`,
          ).catch(err => {
            Toast.show(`Error`, err);
          });
        };

        const endIncomingCall = () => {
          CallKeepImpl.endIncomingcallAnswer();
          updateCallStatus({caller, chat, notification_type: 'REJECTED'});
        };

        CallKeepImpl.configure(incomingCallAnswer, endIncomingCall);
        CallKeepImpl.displayIncomingCall(caller.fullName);
        CallKeepImpl.backToForeground();
        break;
      case 'ACCEPTED':
        CallKeepImpl.backToForeground();
        break;
      case 'REJECTED':
        console.log('Call Rejected');
        navigation.goBack()
        CallKeepImpl.endIncomingcallAnswer();
        break;
      case 'chat':
        console.log('notification_type +++', notification_type);
        break;
      case 'system':
        console.log('notification_type +++', notification_type);
        break;
      default:
        console.log('notification_type +++', notification_type);
        break;
    }
  };

  useEffect(() => {
    messaging().onMessage(onMessageReceived);
    messaging().setBackgroundMessageHandler(onMessageReceived);

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.data.navigationId,
          );
        }
      });
  }, []);
  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
