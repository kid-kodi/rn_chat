import {AppRegistry, Linking} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerGlobals} from 'react-native-webrtc';
import messaging from '@react-native-firebase/messaging';
import CallKeepImpl from './src/core/utils/CallKeepImpl';
import { updateCallStatus } from './src/chat/ChatApi';

registerGlobals();

const firebaseListener = async message => {
  const data = JSON.parse(message.data.info);

    const callee = data.callee;
    const caller = data.caller;
    const chat = data.chat;
    const cameraStatus = data.cameraStatus;
    const microphoneStatus = data.microphoneStatus;
    const notification_type = data.notification_type;

  if (notification_type === 'call') {
    const incomingCallAnswer = ({callUUID}) => {
      CallKeepImpl.backToForeground();
      updateCallStatus({
        caller,
        chat,
        notification_type: 'ACCEPTED',
      });
      CallKeepImpl.endIncomingcallAnswer(callUUID);
      Linking.openURL(
        `ky92://call/${chat._id}/${cameraStatus}/${microphoneStatus}`,
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
  }
};

messaging().setBackgroundMessageHandler(firebaseListener);

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
