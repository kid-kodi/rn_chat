import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import Toast from 'react-native-toast-notifications';
import Orientation from 'react-native-orientation-locker';

import Strings from '../common/constants/Strings';

import {
  checkPendingBackgroundActions,
  configureNotifications,
  setupFirebaseMessaging,
  updateBadgeCount
} from '../services/NotificationService';
import { AppState } from 'react-native';
import AppProvider from '../contexts/AppProvider';
import axios from 'axios';
import RootNavigator from '../navigation/RootNavigator';

export default function App() {
  const appState = useRef(AppState.currentState);
  Orientation.lockToPortrait();

  const checkNetworkStatus = async () => {

    const response = await axios.get("http://localhost:5000/api/app/info");
    console.log(response)
    console.log("first");
  }

  // Configure notifications on app start
  useEffect(() => {

    Strings.setLanguage('FR');
    // Set up app initialization
    setupApp();

    // Listen for app state changes (foreground, background, inactive)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App has come to the foreground!');
        updateBadgeCount(0); // Reset badge counter when app opens
      }
      appState.current = nextAppState;
    });

    // Clean up on unmount
    return () => {
      appStateSubscription.remove();
      // removeEventListeners();
    };
  }, []);


  // Main setup function
  const setupApp = async () => {
    // Initialize notifications
    configureNotifications();

    // Set up Firebase Cloud Messaging
    await setupFirebaseMessaging();

    // Check for any pending actions from background state
    await checkPendingBackgroundActions();

    // await checkNetworkStatus();

    // Reset badge count when app opens
    updateBadgeCount(0);
  };

  return (
    <AppProvider>
      <RootNavigator />
      <Toast ref={ref => (global['toast'] = ref)} />
    </AppProvider>
  );
}