import { Text, SafeAreaView } from 'react-native'
import { useEffect } from 'react'
import { configureNotifications, setupFirebaseMessaging } from './services/NotificationService';

import messaging from '@react-native-firebase/messaging';

export default function App() {

  useEffect(() => {
    const initializeNotifications = async () => {

      // Configure notification handlers
      configureNotifications((notification) => {
        console.log('Notification received:', notification);
        // Handle notification click here
      });

      // Setup FCM
      await setupFirebaseMessaging();

      // Request notification permission
      // await messaging().requestPermission();
    };

    initializeNotifications();

    // Add foreground message handler
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>App</Text>
    </SafeAreaView>
  )
}