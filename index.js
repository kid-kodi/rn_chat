import { AppRegistry } from 'react-native';
import App from './src/App';
// import App from './func/App';
import { name as appName } from './app.json';
import { registerGlobals } from 'react-native-webrtc';
import { onBackgroundMessage } from './src/services/NotificationService';
import messaging from '@react-native-firebase/messaging';

registerGlobals();

AppRegistry.registerComponent(appName, () => App);

// Register background messaging handler
messaging().setBackgroundMessageHandler(onBackgroundMessage);
