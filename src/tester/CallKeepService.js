import RNCallKeep from 'react-native-callkeep';
import { Platform, NativeModules } from 'react-native';
import uuid from 'react-native-uuid';

class CallKeepService {
  constructor() {
    this.currentCallId = null;
    this.isInitialized = false;
    this.eventListenersAdded = false;
  }

  initialize = async () => {
    if (this.isInitialized) return;

    try {
      const options = {
        android: {
          alertTitle: 'Permissions required',
          alertDescription: 'This app needs access to make and manage calls',
          cancelButton: 'Cancel',
          okButton: 'OK',
          foregroundService: {
            channelId: 'com.your.app.call',
            channelName: 'Call notifications',
            notificationTitle: 'Ongoing call',
            notificationIcon: 'ic_launcher',
          },
        },
        ios: {
          appName: 'My App',
          supportsVideo: false,
        }
      };

      // Special handling for Android thread issues
      if (Platform.OS === 'android') {
        await new Promise(resolve => {
          if (NativeModules.PlatformConstants) {
            NativeModules.PlatformConstants.getConstants();
          }
          setTimeout(resolve, 100); // Small delay for thread safety
        });
      }

      RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true);
      this.isInitialized = true;
      
      if (!this.eventListenersAdded) {
        this.addEventListeners();
      }
      
      console.log('CallKeep initialized successfully');
    } catch (error) {
      console.error('CallKeep initialization failed:', error);
      this.isInitialized = false;
    }
  };

  addEventListeners = () => {
    if (this.eventListenersAdded) return;

    const events = [
      'answerCall',
      'endCall',
      'didToggleHoldCallAction',
      'didPerformDTMFAction',
      'didActivateAudioSession'
    ];

    events.forEach(event => {
      RNCallKeep.addEventListener(event, (data) => {
        console.log(`CallKeep event: ${event}`, data);
        if (event === 'endCall') {
          this.currentCallId = null;
        }
      });
    });

    this.eventListenersAdded = true;
  };

  displayIncomingCall = async (callerName, handle) => {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.currentCallId = uuid.v4();

    const displayCall = () => {
      RNCallKeep.displayIncomingCall(
        this.currentCallId,
        callerName,
        handle || callerName,
        'number',
        true
      );
    };

    if (Platform.OS === 'android') {
      // Double timeout for Android thread safety
      setTimeout(() => {
        setTimeout(displayCall, 100);
      }, 100);
    } else {
      displayCall();
    }
  };

  endCurrentCall = () => {
    if (this.currentCallId) {
      RNCallKeep.endCall(this.currentCallId);
      this.currentCallId = null;
    }
  };

  cleanup = () => {
    RNCallKeep.setAvailable(false);
    this.isInitialized = false;
    this.eventListenersAdded = false;
  };
}

const callKeepService = new CallKeepService();
export default callKeepService;