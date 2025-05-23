import 'react-native-gesture-handler';
import React, { createContext, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import Orientation from 'react-native-orientation-locker';

import ApiProvider from './core/contexts/ApiProvider';
import { NavigationContainer } from '@react-navigation/native';
import UserProvider from './core/contexts/UserProvider';
import ChatProvider from './core/contexts/ChatProvider';

import SocketProvider from './core/contexts/SocketProvider';
import { MenuProvider } from 'react-native-popup-menu';

import Strings from './core/constants/Strings';

import messaging from '@react-native-firebase/messaging';
import { RequestUserPermission } from './core/helpers/NotificationService';

import { Platform, AppState, PermissionsAndroid, View, Dimensions, StyleSheet, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  configureNotifications,
  processPendingBackgroundActions,
  getFCMToken,
  saveFCMToken,
  requestNotificationPermissions,
  onTokenRefresh,
  handleIncomingCall,
} from '../NotificationService';
import MainNavigator from './core/navigations/MainNavigator';

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
  }
};

import { navigationRef } from './core/helpers/RootNavigation';
import UpdateChecker from './core/components/UpdateChecker';

export default function App() {
  const appState = useRef(AppState.currentState);
  Orientation.lockToPortrait();

  useEffect(() => {
    RequestUserPermission();
    // Call this before creating the channel.
    requestNotificationPermission();
    Strings.setLanguage('FR');


  }, [messaging]);

  // Configure notifications on app start
  useEffect(() => {
    // const initializeCallKeep = async () => {
    //   try {
    //     // Request necessary permissions first (important for Android)
    //     if (Platform.OS === 'android') {
    //       const hasPermissions = await CallKeepManager.checkAndRequestPermissions();
    //       if (!hasPermissions) {
    //         Alert.alert('Permission Denied', 'Call features will not work without required permissions');
    //         return;
    //       }
    //     }

    //     // Setup CallKeep
    //     await CallKeepManager.setup();

    //     // Register event listeners specific to your UI
    //     // setupEventListeners();
    //   } catch (error) {
    //     console.error('Failed to initialize CallKeep:', error);
    //   }
    // };

    // initializeCallKeep();
    // setupEventListeners();
    // Set up app initialization
    setupApp();

    // Listen for app state changes (foreground, background, inactive)
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Clean up on unmount
    return () => {
      appStateSubscription.remove();
      // removeEventListeners();
    };
  }, []);


  // Main setup function
  const setupApp = async () => {
    // Initialize notifications
    initializeNotifications();

    // Set up Firebase Cloud Messaging
    await setupFirebaseMessaging();

    // Check for any pending actions from background state
    await checkPendingBackgroundActions();

    // Reset badge count when app opens
    updateBadgeCount(0);
  };

  // Initialize local notifications
  const initializeNotifications = () => {
    configureNotifications(handleNotification);
  };

  // Set up Firebase Cloud Messaging
  const setupFirebaseMessaging = async () => {
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
          await saveFCMToken(token); // Send to your backend
        }

        // Listen for token refresh
        const unsubscribeTokenRefresh = onTokenRefresh(async (newToken) => {
          console.log('FCM token refreshed:', newToken);
          await saveFCMToken(newToken); // Send to your backend
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

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      console.log('App has come to the foreground!');
      updateBadgeCount(0); // Reset badge counter when app opens
    }
    appState.current = nextAppState;
  };

  // Process pending background actions
  const checkPendingBackgroundActions = async () => {
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


  // Check if app was opened from a notification
  const checkInitialNotification = async () => {
    // Get notification that opened the app from killed state
    const initialNotification = await messaging().getInitialNotification();

    if (initialNotification) {
      console.log('App opened from killed state by notification:', initialNotification);
      handleDeepLinking(initialNotification.data);
    }
  };


  // Handle incoming messages based on type
  const handleIncomingMessage = (message) => {
    const { data, notification } = message;
    const notificationType = data?.type;

    // Check if this is a call notification
    if (notificationType === 'call') {
      handleIncomingCall(data);
    } else {
      // Regular chat message or other notification
      displayLocalNotification(notification?.title, notification?.body, data);
    }
  };

  // Display a local notification
  const displayLocalNotification = (title, body, data = {}) => {
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

  // Handle notifications when clicked
  const handleNotification = (notification) => {
    const data = Platform.OS === 'ios' ? notification.data : notification.data;

    // Different handling based on notification type
    if (data.type === 'call') {
      // Handle user responding to call notification
      handleCallAction(data);
    } else {
      // Regular notification - navigate to the appropriate screen
      handleDeepLinking(data);
    }
  };

  // Handle call acceptance or rejection
  const handleCallAction = (callData) => {
    if (callData.action === 'accept') {
      // Navigate to call screen
      if (navigationRef.current) {
        navigationRef.current.navigate('INCOMING_CALL', {
          callData,
          isIncoming: true
        });
      }
      console.log('Navigating to call screen with data:', callData);
    } else {
      // Reject call - notify server
      console.log('Call rejected:', callData.call_id);
      // Call your API to reject the call
      // rejectCall(callData.call_id);
    }
  };

  // Handle navigation based on notification data
  const handleDeepLinking = (data) => {
    if (!navigationRef.current) return;

    if (data.chatId) {
      // Navigate to specific chat
      console.log('Navigate to chat:', data.chatId);
      navigationRef.current.navigate('CHAT', { chatId: data.chatId });
    } else if (data.screen) {
      // Navigate to a specific screen
      console.log('Navigate to screen:', data.screen);
      navigationRef.current.navigate(data.screen, data.params);
    }
  };

  // Update badge count for iOS and some Android launchers
  const updateBadgeCount = async (manualCount = null) => {
    let count;

    if (manualCount !== null) {
      count = manualCount;
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

  return (
    <ToastProvider>
      <ApiProvider>
        <SocketProvider>
          <UserProvider>
            <ChatProvider>
              <SafeAreaProvider>
                <MenuProvider>
                  <NavigationContainer
                    ref={navigationRef}>
                    <MainNavigator />
                  </NavigationContainer>
                  <UpdateChecker />
                  <Toast ref={ref => (global['toast'] = ref)} />
                </MenuProvider>
              </SafeAreaProvider>
            </ChatProvider>
          </UserProvider>
        </SocketProvider>
      </ApiProvider>
    </ToastProvider>
  );
}