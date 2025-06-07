import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';
import Toast from 'react-native-toast-notifications';
import Orientation from 'react-native-orientation-locker';
import { NavigationContainer } from '@react-navigation/native';

import ApiProvider from './contexts/ApiProvider';
import UserProvider from './contexts/UserProvider';
import ChatProvider from './contexts/ChatProvider';

import SocketProvider from './contexts/SocketProvider';
import { MenuProvider } from 'react-native-popup-menu';

import Strings from './constants/Strings';

import messaging from '@react-native-firebase/messaging';
import {
  RequestUserPermission, configureNotifications,
  processPendingBackgroundActions,
  getFCMToken,
  saveFCMToken,
  requestNotificationPermissions,
  onTokenRefresh,
  handleIncomingCall,
  setupFirebaseMessaging,
  updateBadgeCount
} from './services/NotificationService';
import { Platform, AppState, PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainNavigator from './navigations/MainNavigator';
import { navigate, navigationRef } from './utils/RootNavigation';
import UpdateChecker from './components/UpdateChecker';
import { SignalingProvider } from './contexts/SignalingProvider';

export default function App() {
  const appState = useRef(AppState.currentState);
  Orientation.lockToPortrait();

  useEffect(() => {
    // RequestUserPermission();
    // Call this before creating the channel.
    // requestNotificationPermission();
    Strings.setLanguage('FR');
  }, [messaging]);

  // Configure notifications on app start
  useEffect(() => {
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
    configureNotifications(handleNotification);

    // Set up Firebase Cloud Messaging
    await setupFirebaseMessaging();

    // Check for any pending actions from background state
    await checkPendingBackgroundActions();

    // Reset badge count when app opens
    updateBadgeCount(0);
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
          navigate('Call', {
            callData: pendingAction.data,
            isIncoming: true
          });
        }
      }
    } catch (error) {
      console.error('Error processing pending background actions:', error);
    }
  };


  // // Check if app was opened from a notification
  // const checkInitialNotification = async () => {
  //   // Get notification that opened the app from killed state
  //   const initialNotification = await messaging().getInitialNotification();

  //   if (initialNotification) {
  //     console.log('App opened from killed state by notification:', initialNotification);
  //     handleDeepLinking(initialNotification.data);
  //   }
  // };


  // // Handle incoming messages based on type
  // const handleIncomingMessage = (message) => {
  //   const { data, notification } = message;
  //   const notificationType = data?.type;

  //   // Check if this is a call notification
  //   if (notificationType === 'call') {
  //     handleIncomingCall(data);
  //   } else {
  //     // Regular chat message or other notification
  //     displayLocalNotification(notification?.title, notification?.body, data);
  //   }
  // };

  // // Display a local notification
  // const displayLocalNotification = (title, body, data = {}) => {
  //   const channelId = data.type === 'call' ? 'incoming-calls' : 'chat-messages';

  //   PushNotification.localNotification({
  //     channelId,
  //     title,
  //     message: body,
  //     playSound: true,
  //     soundName: data.type === 'call' ? 'ringtone' : 'default',
  //     userInfo: data,
  //     // For Android
  //     smallIcon: 'ic_notification',
  //     largeIcon: '',
  //     // For iOS
  //     category: data.type === 'call' ? 'callinvite' : 'message',
  //   });

  //   // Update badge count
  //   updateBadgeCount();
  // };

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
      navigate('CALL', {
        callData,
        isIncoming: true
      });
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
      navigate('CHAT', { chatId: data.chatId });
    } else if (data.screen) {
      // Navigate to a specific screen
      console.log('Navigate to screen:', data.screen);
      navigate(data.screen, data.params);
    }
  };

  // // Update badge count for iOS and some Android launchers
  // const updateBadgeCount = async (manualCount = null) => {
  //   let count;

  //   if (manualCount !== null) {
  //     count = manualCount;
  //   } else {
  //     // Get unread count from storage or increment
  //     try {
  //       const currentCount = await AsyncStorage.getItem('unreadCount');
  //       count = currentCount ? parseInt(currentCount) + 1 : 1;
  //       await AsyncStorage.setItem('unreadCount', count.toString());
  //     } catch (error) {
  //       console.log('Error updating badge count:', error);
  //       count = 1;
  //     }
  //   }

  //   // Set badge count
  //   if (Platform.OS === 'ios') {
  //     PushNotificationIOS.setApplicationIconBadgeNumber(count);
  //   } else {
  //     PushNotification.setApplicationIconBadgeNumber(count);
  //   }
  // };

  return (
    <ToastProvider>
      <ApiProvider>
        <SocketProvider>
          {/* <SignalingProvider> */}
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
          {/* </SignalingProvider> */}
        </SocketProvider>
      </ApiProvider>
    </ToastProvider>
  );
}