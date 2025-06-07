// CallService.js - A service to manage calls with CallKeep

import { Platform, PermissionsAndroid } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import uuid from 'react-native-uuid';
import { EventEmitter } from 'events';
import { navigate } from '../../utils/RootNavigation';

export class CallService {
  constructor() {
    this.callEventEmitter = new EventEmitter();
    this.currentCallId = null;
    this.currentCallUUID = null;
    this.isCallActive = false;
    this.hasSetup = false;

    // Bind methods
    this.setup = this.setup.bind(this);
    this.startCall = this.startCall.bind(this);
    this.endCall = this.endCall.bind(this);
    this.acceptCall = this.acceptCall.bind(this);
    this.rejectCall = this.rejectCall.bind(this);
    this.backToChat = this.backToChat.bind(this);
  }

  async setup() {
    if (this.hasSetup) return;

    // Request necessary permissions for Android
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        ]);
      } catch (err) {
        console.error('Failed to get permissions', err);
      }
    }

    // Configure CallKeep
    const options = {
      ios: {
        appName: 'My Chat App',
        supportsVideo: true,
      },
      android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'OK',
        additionalPermissions: [],
        selfManaged: true,
      },
    };

    try {
      await RNCallKeep.setup(options);
      this.hasSetup = true;
      this.registerEvents();
    } catch (err) {
      console.error('Error setting up CallKeep', err);
    }
  }

  registerEvents() {
    // Handle incoming calls
    RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
      this.acceptCall(callUUID);
    });

    RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
      if (this.currentCallUUID === callUUID) {
        this.endCall(callUUID);
      }
    });

    RNCallKeep.addEventListener('didPerformDTMFAction', ({ callUUID, digits }) => {
      console.log('DTMF performed', callUUID, digits);
    });

    // RNCallKeep.addEventListener('didRejectCall', ({ callUUID }) => {
    //   this.rejectCall(callUUID);
    // });

    // RNCallKeep.addEventListener('didToggleHoldCall', ({ callUUID, isOnHold }) => {
    //   console.log('Call toggled hold state', callUUID, isOnHold);
    // });

    RNCallKeep.addEventListener('didDisplayIncomingCall', ({
      callUUID, handle, hasVideo, localizedCallerName
    }) => {
      console.log('Incoming call displayed', callUUID);
    });

    // Audio session activation events
    if (Platform.OS === 'ios') {
      RNCallKeep.addEventListener('didActivateAudioSession', () => {
        console.log('Audio session activated');
      });
    }
  }

  // Call this from ChatScreen when initiating a call
  startCall(callUUID, chatId, chatName, isGroupChat, hasVideo = false) {
    // Generate a unique UUID for this call
    this.currentCallUUID = callUUID;
    this.currentCallId = chatId;

    // Display the call UI
    RNCallKeep.startCall(callUUID, chatId, chatName, 'number', hasVideo);

    // Notify your app about the call
    this.callEventEmitter.emit('callStarted', {
      callUUID,
      chatId,
      chatName,
      isGroupChat,
      hasVideo
    });

    return callUUID;
  }

  // Handle receiving calls (from push notification or signaling server)
  displayIncomingCall(chatId, chatName, hasVideo = false) {
    const callUUID = uuid.v4();
    this.currentCallId = chatId;
    this.currentCallUUID = callUUID;

    RNCallKeep.displayIncomingCall(
      callUUID,
      chatId,
      chatName,
      'number',
      hasVideo
    );

    // Listen for CallKit events
    RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
      console.log('Call answered by user');
      navigate('CALL', {
        callUUID,
        chatId,
        cameraStatus: hasVideo,
        microphoneStatus: false,
      });
    });

    RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
      console.log('Call ended by user');
      this.endCall(callUUID);
    });

    return callUUID;
  }

  // Call this from MeetingScreen when ending a call
  endCall(callUUID = this.currentCallUUID) {
    if (!callUUID) return;

    RNCallKeep.endCall(callUUID);
    this.isCallActive = false;
    this.currentCallId = null;

    // Notify your app the call has ended
    this.callEventEmitter.emit('callEnded', { callUUID });
    this.currentCallUUID = null;
  }

  // Accept an incoming call - call this from ChatScreen
  acceptCall(callUUID = this.currentCallUUID) {
    if (!callUUID) return;

    this.isCallActive = true;
    RNCallKeep.answerIncomingCall(callUUID);

    // Notify your app the call was accepted
    this.callEventEmitter.emit('callAccepted', { callUUID });
  }

  // Reject an incoming call - call this from ChatScreen
  rejectCall(callUUID = this.currentCallUUID) {
    if (!callUUID) return;

    RNCallKeep.rejectCall(callUUID);
    this.currentCallId = null;

    // Notify your app the call was rejected
    this.callEventEmitter.emit('callRejected', { callUUID });
    this.currentCallUUID = null;
  }

  // Update call state when returning to chat from a meeting
  backToChat() {
    if (this.currentCallUUID) {
      this.endCall(this.currentCallUUID);
    }
  }

  // Subscribe to call events
  addEventListener(eventType, listener) {
    this.callEventEmitter.addListener(eventType, listener);
    return () => this.callEventEmitter.removeListener(eventType, listener);
  }

  // Update call state when there's a change (e.g., mute, video toggle)
  updateCall(options = {}) {
    if (!this.currentCallUUID) return;

    const { hasVideo, isMuted } = options;

    if (hasVideo !== undefined) {
      // You could update CallKit UI here if needed
    }

    if (isMuted !== undefined) {
      // You could update CallKit UI here if needed
    }
  }
}