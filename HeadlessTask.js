import messaging from '@react-native-firebase/messaging';
import CallKeepImpl from './src/core/utils/CallKeepImpl';

export default async (message) => {
  // Log the received message
  console.log('Received background message:', message);

  CallKeepImpl.displayIncomingCall("callerInfo.name");
//   CallKeepImpl.backToForeground();

  // Handle the message here, e.g., show a notification
  // You can use libraries like `react-native-notifications` to show notifications
  return Promise.resolve();
};
