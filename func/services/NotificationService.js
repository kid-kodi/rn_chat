// services/messaging-service.js - Service to handle Firebase Cloud Messaging

import { DeviceEventEmitter, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import IncomingCall from 'react-native-incoming-call';
import DeviceInfo from 'react-native-device-info';
import { navigate } from '../utils/RootNavigation';
import axiosInstance from '../utils/AxiosInstance';

// Handle navigation based on notification data
const handleDeepLinking = (data) => {
  if (data.chatId) {
    // Navigate to specific chat
    console.log('Navigate to chat:', data.chatId);
    navigate('CHAT', { chatId: data.chatId });
  } else if (data.screen) {
    // Navigate to a specific screen
    console.log('Navigate to screen:', data.screen);
    navigate(data.screen, data.params);
  }
};


// Check if app was opened from a notification
const checkInitialNotification = async () => {
  // Get notification that opened the app from killed state
  const initialNotification = await messaging().getInitialNotification();

  if (initialNotification) {
    console.log('App opened from killed state by notification:', initialNotification);
    handleDeepLinking(initialNotification.data);
  }
};


// Process pending background actions
export const checkPendingBackgroundActions = async () => {
  try {
    const pendingAction = await processPendingBackgroundActions();
    if (pendingAction && pendingAction.type === 'call') {
      console.log('Processing pending call action:', pendingAction.data);
      // Navigate to call screen with the pending call data
      if (navigationRef.current) {
        navigationRef.current.navigate('IncomingCall', {
          callData: pendingAction.data,
          isIncoming: true
        });
      }
    }
  } catch (error) {
    console.error('Error processing pending background actions:', error);
  }
};

// Set up Firebase Cloud Messaging
export const setupFirebaseMessaging = async () => {
  try {
    // Request permissions
    const hasPermission = await requestNotificationPermissions();

    if (hasPermission) {
      console.log('Notification permissions granted');

      // Get and save FCM token
      const token = await getFCMToken();
      if (token) {
        console.log('FCM Token:', token);
        await AsyncStorage.setItem('fcmToken', token);
        // await saveFCMToken(token); // Send to your backend
      }

      // Listen for token refresh
      const unsubscribeTokenRefresh = onTokenRefresh(async (newToken) => {
        console.log('FCM token refreshed:', newToken);
        // await saveFCMToken(newToken); // Send to your backend
      });

      // Handle foreground messages
      const unsubscribeForegroundMessage = messaging().onMessage(async (remoteMessage) => {
        console.log('Message received in foreground:', remoteMessage);
        handleIncomingMessage(remoteMessage);
      });

      // Check for initial notification (app opened from killed state)
      await checkInitialNotification();

      // Return unsubscribe functions for cleanup
      return () => {
        unsubscribeTokenRefresh();
        unsubscribeForegroundMessage();
      };
    }
  } catch (error) {
    console.error('Error setting up Firebase messaging:', error);
  }
};

// Function to handle background messages - this is the headless task that gets registered
export async function onBackgroundMessage(remoteMessage) {
  console.log('Message handled in the background:', remoteMessage);

  try {
    // Handle the message based on its type
    const { data, notification } = remoteMessage;
    const notificationType = data?.type;

    // Save message to AsyncStorage for retrieval when app opens
    await saveBackgroundMessageData(remoteMessage);

    // Check if this is a call notification
    if (notificationType === 'call') {
      await handleIncomingCall(data);
    } else if (notification) {
      // Regular chat message or other notification
      // Firebase will automatically show the notification in the background
      // We just need to update our internal state
      await incrementBadgeCount();
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Error in background message handler:', error);
    return Promise.resolve();
  }
}

// Save message data to AsyncStorage for retrieval when app opens
const saveBackgroundMessageData = async (message) => {
  try {
    // Get existing messages array or create new one
    const storedMessages = await AsyncStorage.getItem('backgroundMessages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];

    // Add new message with timestamp
    messages.push({
      ...message,
      receivedAt: new Date().toISOString()
    });

    // Keep only last 20 messages to avoid storage issues
    const recentMessages = messages.slice(-20);

    // Save back to AsyncStorage
    await AsyncStorage.setItem('backgroundMessages', JSON.stringify(recentMessages));
  } catch (error) {
    console.error('Error saving background message to storage:', error);
  }
};

// Handle incoming calls when app is in background
export const handleIncomingCall = async (callData) => {
  try {
    const { chatId, caller_id, caller_name, call_id, video } = callData;

    // Save call data for when app opens
    await AsyncStorage.setItem('pendingCall', JSON.stringify({
      ...callData,
      timestamp: new Date().toISOString(),
    }));

    if (Platform.OS === 'android') {

      // Display incoming call activity.
      IncomingCall.display(
        caller_id, // Call UUID v4
        caller_name, // Username
        'https://avatars3.githubusercontent.com/u/16166195', // Avatar URL
        'Appel Entrant', // Info text
        20000 // Timeout for end call after 20s
      );
      DeviceEventEmitter.addListener('endCall', payload => {
        // End call action here
        console.log('endCall', payload);
      });
      DeviceEventEmitter.addListener('answerCall', payload => {
        // Start call action here
        console.log('answerCall', payload);
        navigate('CALL', {
          call_id,
          chatId: chatId,
          cameraStatus: video,
          microphoneStatus: false,
        });
        if (payload.isHeadless) {
          IncomingCall.openAppFromHeadlessMode(payload.uuid);
        } else {
          IncomingCall.backToForeground();
        }
      });

      // For Android, use react-native-incoming-call to display call UI
      // IncomingCall.display(
      //   call_id,
      //   caller_name,
      //   caller_id,
      //   'generic', // Avatar placeholder
      //   video === 'true' ? 'video' : 'audio'
      // );
    }
    // iOS PushKit handling would normally happen through a separate mechanism
    // Not fully implementable in the headless task

  } catch (error) {
    console.error('Error handling background call:', error);
  }
};

// Increment badge count in storage
const incrementBadgeCount = async () => {
  try {
    const currentCount = await AsyncStorage.getItem('unreadCount');
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
    await AsyncStorage.setItem('unreadCount', newCount.toString());
  } catch (error) {
    console.error('Error updating badge count in background:', error);
  }
};

// Process any pending background actions when app is opened
export const processPendingBackgroundActions = async () => {
  try {
    // Check for pending calls
    const pendingCall = await AsyncStorage.getItem('pendingCall');
    if (pendingCall) {
      const callData = JSON.parse(pendingCall);

      // Check if call is still relevant (not too old)
      const callTime = new Date(callData.timestamp);
      const currentTime = new Date();
      const timeDifference = (currentTime - callTime) / 1000; // in seconds

      if (timeDifference < 60) { // If call is less than 60 seconds old
        console.log('Processing pending call from background:', callData);
        // Return call data for handling in App.js
        return { type: 'call', data: callData };
      }

      // Clear old call data
      await AsyncStorage.removeItem('pendingCall');
    }

    // Process other pending background messages if needed
    return null;
  } catch (error) {
    console.error('Error processing background actions:', error);
    return null;
  }
};

// Utility function to get FCM token
export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Function to request notification permissions
export const requestNotificationPermissions = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Export the onTokenRefresh handler that apps can use
export const onTokenRefresh = (callback) => {
  return messaging().onTokenRefresh(async (token) => {
    try {
      await AsyncStorage.setItem('fcmToken', token);
      if (callback && typeof callback === 'function') {
        callback(token);
      }
    } catch (error) {
      console.error('Error in token refresh handler:', error);
    }
  });
};

// Create notification channels for Android
export const createNotificationChannels = () => {
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: 'chat-messages',
        channelName: 'Chat Messages',
        channelDescription: 'Notifications for new chat messages',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel 'chat-messages' created: ${created}`)
    );

    PushNotification.createChannel(
      {
        channelId: 'incoming-calls',
        channelName: 'Incoming Calls',
        channelDescription: 'Notifications for incoming calls',
        playSound: true,
        soundName: 'default',
        importance: 5,
        vibrate: true,
      },
      (created) => console.log(`Channel 'incoming-calls' created: ${created}`)
    );
  }
};

// Register device with backend
export const registerDeviceForNotifications = async (userId) => {
  try {
    // Get device information
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceModel = DeviceInfo.getModel();
    const systemVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();

    // Get FCM token (or create new if needed)
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await getFCMToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }

    // Register with your server
    const response = await axiosInstance.post('/api/notifications/register', {
      userId,
      deviceId,
      deviceToken: fcmToken,
      platform: Platform.OS,
      deviceModel,
      systemVersion,
      appVersion,
    });

    console.log('Device registered for notifications:', response);
    return response;
  } catch (error) {
    console.error('Error registering device for notifications:', error);
    throw error;
  }
};

// Save FCM token to backend
export const saveFCMToken = async (token) => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.log('User not logged in, storing token for later registration');
      return;
    }

    const deviceId = await DeviceInfo.getUniqueId();

    // Send token to server
    const response = await axiosInstance.post('/api/notifications/token', {
      userId,
      deviceId,
      token,
      platform: Platform.OS,
    });

    console.log('FCM token saved on server:', response);
    return response;
  } catch (error) {
    console.error('Error saving FCM token on server:', error);
    throw error;
  }
};

// Unregister device from backend
export const unregisterDevice = async () => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();

    // Unregister from server
    const response = await axiosInstance.post('/api/notifications/unregister', {
      deviceId,
    });

    console.log('Device unregistered from notifications:', response);
    return response;
  } catch (error) {
    console.error('Error unregistering device from notifications:', error);
    throw error;
  }
};

// Configure local notifications
export const configureNotifications = (onNotificationHandler) => {
  PushNotification.configure({
    // Called when a remote or local notification is opened or received
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);

      // Call the handler passed from App.js
      if (onNotificationHandler && typeof onNotificationHandler === 'function') {
        onNotificationHandler(notification);
      }

      // Required on iOS for local notifications
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },

    // IOS ONLY
    onRegister: function (tokenData) {
      console.log('TOKEN:', tokenData);
    },

    // Should the initial notification be popped automatically
    popInitialNotification: true,

    requestPermissions: Platform.OS === 'ios',

    // Android specific properties
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
  });

  // Create notification channels for Android
  if (Platform.OS === 'android') {
    createNotificationChannels();
  }
};

// Display a local notification
export const displayLocalNotification = (title, body, data = {}) => {
  const channelId = data.type === 'call' ? 'incoming-calls' : 'chat-messages';

  PushNotification.localNotification({
    channelId,
    title,
    message: body,
    playSound: true,
    soundName: data.type === 'call' ? 'ringtone' : 'default',
    userInfo: data,
    // For Android
    smallIcon: 'ic_notification',
    largeIcon: '',
    // For iOS
    category: data.type === 'call' ? 'callinvite' : 'message',
  });

  // Update badge count
  updateBadgeCount();
};

// Update badge count for iOS and some Android launchers
export const updateBadgeCount = async (manualCount = null) => {
  let count;

  if (manualCount !== null) {
    count = manualCount;
    await AsyncStorage.setItem('unreadCount', count.toString());
  } else {
    // Get unread count from storage or increment
    try {
      const currentCount = await AsyncStorage.getItem('unreadCount');
      count = currentCount ? parseInt(currentCount) + 1 : 1;
      await AsyncStorage.setItem('unreadCount', count.toString());
    } catch (error) {
      console.log('Error updating badge count:', error);
      count = 1;
    }
  }

  // Set badge count
  if (Platform.OS === 'ios') {
    PushNotificationIOS.setApplicationIconBadgeNumber(count);
  } else {
    PushNotification.setApplicationIconBadgeNumber(count);
  }
};