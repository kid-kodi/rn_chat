import RNCallKeep from 'react-native-callkeep';
import { AppState, Platform } from 'react-native';
import BackgroundJob from 'react-native-background-job';

class CallKeepManager {
  constructor() {
    this.currentCall = null;
    this.isCallActive = false;
    this.setupCallKeep();
    this.setupEventListeners();
    this.setupAppStateListener();
  }

  setupCallKeep() {
    const options = {
      ios: {
        appName: 'YourAppName',
        maximumCallGroups: 1,
        maximumCallsPerCallGroup: 1,
        supportsVideo: true,
        includesCallsInRecents: true,
        imageName: 'sim_icon', // Add your app icon
        ringtoneSound: 'system_ringtone_default',
      },
      android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'OK',
        imageName: 'phone_account_icon',
        additionalPermissions: [],
        selfManaged: true, // Important for maintaining calls
        foregroundService: {
          channelId: 'com.yourapp.calls',
          channelName: 'Calls',
          notificationTitle: 'Call in progress',
          notificationIcon: 'ic_launcher',
        }
      }
    };

    try {
      RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true);
      
      // Request permissions for Android
      if (Platform.OS === 'android') {
        RNCallKeep.canMakeMultipleCalls(false);
      }
    } catch (err) {
      console.error('CallKeep setup error:', err);
    }
  }

  setupEventListeners() {
    // Answer call event
    RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
    
    // End call event
    RNCallKeep.addEventListener('endCall', this.onEndCallAction);
    
    // Hold call event
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
    
    // DTMF event
    RNCallKeep.addEventListener('didPerformDTMFAction', this.onDTMFAction);
    
    // Audio session activation (iOS)
    RNCallKeep.addEventListener('didActivateAudioSession', this.onAudioSessionActivated);
    
    // Audio session deactivation (iOS)
    RNCallKeep.addEventListener('didDeactivateAudioSession', this.onAudioSessionDeactivated);
    
    // Display incoming call
    RNCallKeep.addEventListener('didDisplayIncomingCall', this.onIncomingCallDisplayed);
    
    // Call state changes
    RNCallKeep.addEventListener('didChangeAudioRoute', this.onAudioRouteChange);
  }

  setupAppStateListener() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (nextAppState) => {
    console.log('App state changed to:', nextAppState);
    
    if (nextAppState === 'background' && this.isCallActive) {
      // Start background service to maintain call
      this.startBackgroundService();
    } else if (nextAppState === 'active') {
      // Stop background service when app becomes active
      this.stopBackgroundService();
    }
  };

  startBackgroundService() {
    if (Platform.OS === 'android') {
      BackgroundJob.start({
        jobKey: 'callKeepJob',
        period: 1000,
        callbackFunction: () => {
          // Keep the call session alive
          this.maintainCallSession();
        }
      });
    }
  }

  stopBackgroundService() {
    if (Platform.OS === 'android') {
      BackgroundJob.stop({ jobKey: 'callKeepJob' });
    }
  }

  maintainCallSession() {
    // Add your call session maintenance logic here
    // This could include sending keep-alive packets, updating call status, etc.
    if (this.currentCall && this.isCallActive) {
      console.log('Maintaining call session in background');
      // Your WebRTC or call session maintenance code here
    }
  }

  // Event handlers
  onAnswerCallAction = ({ callUUID }) => {
    console.log('Call answered:', callUUID);
    this.isCallActive = true;
    
    // Update your call state
    this.updateCallState('answered');
    
    // Start your WebRTC connection or call logic here
    this.startCall(callUUID);
  };

  onEndCallAction = ({ callUUID }) => {
    console.log('Call ended:', callUUID);
    this.isCallActive = false;
    this.currentCall = null;
    
    // Clean up call resources
    this.endCall(callUUID);
    
    // Remove the call from CallKeep
    RNCallKeep.endCall(callUUID);
  };

  onToggleMute = ({ muted, callUUID }) => {
    console.log('Call muted:', muted, callUUID);
    // Handle mute/unmute logic
    this.toggleMute(muted);
  };

  onDTMFAction = ({ digits, callUUID }) => {
    console.log('DTMF:', digits, callUUID);
    // Handle DTMF tones
  };

  onAudioSessionActivated = () => {
    console.log('Audio session activated');
    // Configure audio session for call
  };

  onAudioSessionDeactivated = () => {
    console.log('Audio session deactivated');
    // Clean up audio session
  };

  onIncomingCallDisplayed = ({ callUUID, handle, hasVideo, localizedCallerName, fromPushKit, payload }) => {
    console.log('Incoming call displayed:', callUUID);
  };

  onAudioRouteChange = ({ output }) => {
    console.log('Audio route changed to:', output);
  };

  // Public methods for your app to use
  startOutgoingCall(handle, displayName, hasVideo = false) {
    const callUUID = this.generateUUID();
    this.currentCall = {
      uuid: callUUID,
      handle,
      displayName,
      hasVideo,
      isOutgoing: true
    };

    RNCallKeep.startCall(callUUID, handle, displayName, 'number', hasVideo);
    this.isCallActive = true;
    
    return callUUID;
  }

  displayIncomingCall(handle, displayName, hasVideo = false) {
    const callUUID = this.generateUUID();
    this.currentCall = {
      uuid: callUUID,
      handle,
      displayName,
      hasVideo,
      isOutgoing: false
    };

    RNCallKeep.displayIncomingCall(callUUID, handle, displayName, 'number', hasVideo);
    
    return callUUID;
  }

  updateDisplay(callUUID, displayName, handle) {
    RNCallKeep.updateDisplay(callUUID, displayName, handle);
  }

  setConnectionState(callUUID, state) {
    // state can be: 'connecting', 'connected', 'disconnected'
    if (Platform.OS === 'android') {
      RNCallKeep.setConnectionState(callUUID, state);
    }
  }

  setCurrentCallActive(callUUID) {
    RNCallKeep.setCurrentCallActive(callUUID);
  }

  endCall(callUUID) {
    this.isCallActive = false;
    this.currentCall = null;
    
    // Clean up your call session here
    // Stop WebRTC, close connections, etc.
    
    RNCallKeep.endCall(callUUID);
    this.stopBackgroundService();
  }

  startCall(callUUID) {
    // Initialize your call session here
    // Start WebRTC, establish connections, etc.
    
    // Update CallKeep that call is connected
    this.setConnectionState(callUUID, 'connected');
    this.setCurrentCallActive(callUUID);
  }

  updateCallState(state) {
    // Update your app's call state
    console.log('Call state updated:', state);
  }

  toggleMute(muted) {
    // Handle mute/unmute in your call session
    console.log('Mute toggled:', muted);
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Cleanup method
  destroy() {
    // Remove all event listeners
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('endCall');
    RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.removeEventListener('didActivateAudioSession');
    RNCallKeep.removeEventListener('didDeactivateAudioSession');
    RNCallKeep.removeEventListener('didDisplayIncomingCall');
    RNCallKeep.removeEventListener('didChangeAudioRoute');
    
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.stopBackgroundService();
  }
}

// Usage example
export default class CallManager {
  constructor() {
    this.callKeep = new CallKeepManager();
  }

  // Make an outgoing call
  makeCall(phoneNumber, displayName) {
    const callUUID = this.callKeep.startOutgoingCall(phoneNumber, displayName, false);
    console.log('Started outgoing call:', callUUID);
    return callUUID;
  }

  // Receive an incoming call
  receiveCall(phoneNumber, displayName) {
    const callUUID = this.callKeep.displayIncomingCall(phoneNumber, displayName, false);
    console.log('Displaying incoming call:', callUUID);
    return callUUID;
  }

  // End any active call
  endActiveCall() {
    if (this.callKeep.currentCall) {
      this.callKeep.endCall(this.callKeep.currentCall.uuid);
    }
  }

  // Get current call status
  isCallActive() {
    return this.callKeep.isCallActive;
  }

  // Cleanup when app is destroyed
  cleanup() {
    this.callKeep.destroy();
  }
}