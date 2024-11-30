import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {Linking} from 'react-native';

export async function RequestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
}

const getFcmToken = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  if (!fcmToken) {
    try {
      // await messaging().registerDeviceForRemoteMessages();
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

export const NotificationListener = async () => {
  async function onMessageReceived(message) {
    // Do something
    onDisplayNotification(message);
  }

  messaging().onMessage(onMessageReceived);
  // messaging().setBackgroundMessageHandler(onMessageReceived);

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
  });

  // messaging()
  //   .getInitialNotification()
  //   .then(remoteMessage => {
  //     if (remoteMessage) {
  //       console.log(
  //         'Notification caused app to open from quit state:',
  //         remoteMessage.data.navigationId,
  //       );
  //     }
  //   });
};

export const onDisplayNotification = async message => {
  // Request permissions (required for iOS)
  await notifee.requestPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default10',
    name: 'Default Channel 10',
    sound: 'ring',
    vibration: true,
    vibrationPattern: [300, 500],
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  await notifee.displayNotification({
    title: message.notification.title,
    body: message.notification.body,
    android: {
      channelId,
      sound: 'ring',
      vibrationPattern: [300, 500],
      pressAction: {
        id: 'default',
      },
    },
  });

  notifee.onBackgroundEvent(({type, detail}) => {
    if (type === 1 && detail.pressAction.id) {
      console.log(
        'User pressed an action with the id: ',
        detail.pressAction.id,
      );
      Linking.openURL(message.data.navigationId);
    }
  });

  notifee.onForegroundEvent(({type, detail}) => {

    if (type === 1 && detail.pressAction.id) {
      console.log(
        'User pressed an action with the id: ',
        detail.pressAction.id,
      );
      Linking.openURL(message.data.navigationId);
    }
  });
};
