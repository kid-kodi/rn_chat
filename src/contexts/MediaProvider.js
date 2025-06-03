import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  MediaStream,
  MediaStreamTrack,
  registerGlobals,
} from 'react-native-webrtc';
import * as mediasoupClient from 'mediasoup-client';
import { EventEmitter } from 'events';

import {
  avatarURL,
  MeetingEndReason,
  meetingURL,
  serviceConfig,
  SignalMethod,
  SignalType,
  socketConnectionOptions,
  TransportType,
} from '../../ServiceConfig';
import { useSignaling } from './SignalingContext'; // Assuming you've created this from previous conversion
import { PeerMedia } from '../../core/helpers/media/PeerMedia';
import { timeoutCallback } from '../../core/helpers/media/MediaUtils';
import * as types from '../../core/helpers/Types';

const MediaContext = createContext(null);

export const MediaProvider = ({ children }) => {
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [myId, setMyId] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [deviceName, setDeviceName] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [hostPeerId, setHostPeerId] = useState(null);
  const [joined, setJoined] = useState(false);
  const [permissionUpdated, setPermissionUpdated] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const deviceRef = useRef(null);
  const sendingTracksRef = useRef(new Map());
  const producersRef = useRef(new Map());
  const peerMediaRef = useRef(new PeerMedia());
  const eventEmitterRef = useRef(new EventEmitter());
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const sendTransportOptRef = useRef(null);

  const updatePeerCallbacksRef = useRef(new Map());
  const newMessageCallbacksRef = useRef(new Map());
  const meetingEndCallbacksRef = useRef(new Map());
  const beMutedCallbacksRef = useRef(new Map());

  const { signaling, registerListener } = useSignaling();

  // Initialize device
  useEffect(() => {
    try {
      registerGlobals();
      deviceRef.current = new mediasoupClient.Device();
    } catch (err) {
      console.error('[Error] Fail to initialize MediaService', err);
    }

    return () => {
      cleanupMediaService();
    };
  }, []);

  const cleanupMediaService = () => {
    leaveMeeting();
  };

  const registerPeerUpdateListener = (key, updatePeerCallback) => {
    updatePeerCallbacksRef.current.set(key, updatePeerCallback);
  };

  const deletePeerUpdateListener = (key) => {
    updatePeerCallbacksRef.current.delete(key);
  };

  const registerNewMessageListener = (key, newMessageCallback) => {
    newMessageCallbacksRef.current.set(key, newMessageCallback);
  };

  const deleteNewMessageListener = (key) => {
    newMessageCallbacksRef.current.delete(key);
  };

  const registerMeetingEndListener = (key, meetingEndCallback) => {
    meetingEndCallbacksRef.current.set(key, meetingEndCallback);
  };

  const deleteMeetingEndListener = (key) => {
    meetingEndCallbacksRef.current.delete(key);
  };

  const registerBeMutedListener = (key, beMutedCallback) => {
    beMutedCallbacksRef.current.set(key, beMutedCallback);
  };

  const deleteBeMutedListener = (key) => {
    beMutedCallbacksRef.current.delete(key);
  };

  const getPeerDetails = () => {
    return peerMediaRef.current.getPeerDetails();
  };

  const getPeerDetailByPeerId = (peerId) => {
    return peerMediaRef.current.getPeerDetailByPeerId(peerId);
  };

  const waitForAllowed = () => {
    return new Promise((resolve, reject) => {
      console.log('[Log] Waiting for server to allow the connection...');
      let returned = false;
      
      eventEmitterRef.current.once(
        'permissionUpdated',
        timeoutCallback(() => {
          if (returned) return;
          returned = true;
          
          if (allowed) {
            console.log('[Log] Server allowed the connection');
            resolve();
          } else {
            reject('[Error] Server reject the connection');
          }
        }, serviceConfig.mediaTimeout)
      );

      if (!returned && permissionUpdated) {
        returned = true;
        if (allowed) {
          console.log('[Log] Server allowed the connection');
          resolve();
        } else {
          reject('[Error] Server reject the connection');
        }
      }
    });
  };

  const joinMeeting = (chatId, user) => {
    return _joinMeeting(false, chatId, user);
  };

  const _joinMeeting = async (reenter, chatId, user) => {
    if (joined) {
      console.warn('[Warning] Vous avez déjà rejoint une réunion');
      return Promise.reject('Vous avez déjà rejoint une réunion');
    }

    if (!reenter) {
      setChatId(chatId);
      setUser(user);
      setDisplayName(user.fullName);
      setDeviceName(user.fullName);
      setAvatar(avatarURL(user.profilPicture ? avatar : "defaultProfile.jpeg"));
      console.log('[Log] Try to join meeting with chatId = ' + chatId);
    }

    try {
      await waitForAllowed();
    } catch (err) {
      console.error('[Error] Impossible de connecter le socket ou le serveur a été rejeté', err);
      meetingEndCallbacksRef.current.forEach(callback => {
        callback(MeetingEndReason.notAllowed);
      });
      leaveMeeting();
      return Promise.reject('Impossible de connecter le socket ou le serveur a été rejeté');
    }

    try {
      const rtpCapabilities = await signaling.sendRequest(
        SignalMethod.getRouterRtpCapabilities,
      );
      console.log('[Log] Router RTP Capabilities received');

      if (!deviceRef.current.loaded) {
        await deviceRef.current.load({ routerRtpCapabilities: rtpCapabilities });
      }

      await createSendTransport();
      await createRecvTransport();
    } catch (err) {
      console.error('[Error] Fail to prepare device and transports', err);
      meetingEndCallbacksRef.current.forEach(callback => {
        callback(MeetingEndReason.lostConnection);
      });
      leaveMeeting();
      return Promise.reject('Fail to prepare device and transports');
    }

    try {
      const { host, peerInfos } = await signaling.sendRequest(
        SignalMethod.join,
        {
          displayName: displayName,
          avatar: avatar,
          joined: joined,
          device: deviceName,
          rtpCapabilities: deviceRef.current.rtpCapabilities,
        },
      );

      setHostPeerId(host);

      for (const info of peerInfos) {
        peerMediaRef.current.addPeerInfo(info);
      }

      updatePeerCallbacksRef.current.forEach(callback => {
        callback();
      });

      setJoined(true);
    } catch (err) {
      console.error('[Error] Fail to join the meeting', err);
      meetingEndCallbacksRef.current.forEach(callback => {
        callback(MeetingEndReason.lostConnection);
      });
      leaveMeeting();
      return Promise.reject('Fail to join the meeting');
    }
  };

  const onSignalingDisconnect = async () => {
    console.warn('[Socket] Disconnected');
    if (joined) {
      try {
        await signaling.waitForReconnection();
      } catch (err) {
        meetingEndCallbacksRef.current.forEach(callback => {
          callback(MeetingEndReason.lostConnection);
        });
        leaveMeeting();
        return;
      }

      try {
        await restartIce();
      } catch (err) {
        await reenter();
      }
    }
  };

  const restartIce = async () => {
    console.log('[Log] Trying to restartIce...');
    if (!sendTransportRef.current || !recvTransportRef.current) {
      console.error('[Error] Fail to restart Ice: sendTransport or recvTransport has not been created');
      return Promise.reject('Fail to restart Ice');
    }

    try {
      const sendParam = await signaling.sendRequest(
        SignalMethod.restartIce,
        { transportId: sendTransportRef.current.id },
      );
      await sendTransportRef.current.restartIce({
        iceParameters: sendParam.iceParameters,
      });

      const recvParam = await signaling.sendRequest(
        SignalMethod.restartIce,
        { transportId: recvTransportRef.current.id },
      );
      await recvTransportRef.current.restartIce({
        iceParameters: recvParam.iceParameters,
      });

      console.log('[Log] Ice restarted');
    } catch (err) {
      console.error('[Error] Fail to restart Ice', err);
      return Promise.reject('Fail to restart Ice');
    }
  };

  const reenter = async () => {
    try {
      console.log('[Log] Trying to reenter the meeting...');
      setJoined(false);
      deleteProducers();
      deletePeers();
      deleteTransports();
      resetDevice();
      await _joinMeeting(true);
    } catch (err) {
      console.error('[Error] Fail to rejoin the meeting when reentering');
      return;
    }

    try {
      let tracks = [];
      sendingTracksRef.current.forEach(track => {
        tracks.push(track);
      });
      await sendMediaStream(new MediaStream(tracks));
      console.log('[Log] Reentered');
    } catch (err) {
      console.error('[Error] Fail to resend tracks when reentering');
    }
  };

  const sendMediaStream = async (stream) => {
    try {
      const tracks = stream.getTracks();
      for (const track of tracks) {
        let source = null;
        let params = null;
        if (track.kind === 'video') {
          source = `Video_from_peer_${myId}_track_${track.id}`;
          params = {
            track,
            appData: { source },
            codecOptions: { videoGoogleStartBitrate: 1000 },
          };
        } else {
          source = `Audio_from_peer_${myId}_track_${track.id}`;
          params = {
            track,
            appData: { source },
          };
        }

        const producer = await sendTransportRef.current.produce(params);

        producer.on('transportclose', () => {
          console.log(`[Producer event] ${source}_transport_close`);
          if (!producer.closed) {
            producer.close();
          }
          producersRef.current.delete(track.id);
        });

        producer.on('trackended', () => {
          console.log(`[Producer event] ${source}_track_ended`);
          signaling.sendRequest(SignalMethod.closeProducer, {
            producerId: producer.id,
          });
          if (!producer.closed) {
            producer.close();
          }
          producersRef.current.delete(track.id);
        });

        producersRef.current.set(track.id, producer);
        sendingTracksRef.current.set(track.id, track);

        console.log(`[Log] Producing ${source}`);
      }
    } catch (err) {
      console.error('[Error] Fail to send MediaStream', err);
      return Promise.reject('Fail to send MediaStream');
    }
  };

  // ... (continue with other methods like sendText, sendFile, etc.)

  const leaveMeeting = () => {
    setJoined(false);
    resetAllowedState();
    deleteProducers();
    deletePeers();
    deleteTransports();
    resetDevice();
    deleteSendingTracks();
  };

  const resetAllowedState = () => {
    setPermissionUpdated(false);
    setAllowed(false);
  };

  const resetDevice = () => {
    deviceRef.current = new mediasoupClient.Device();
  };

  const deleteProducers = () => {
    producersRef.current.forEach(producer => {
      if (!producer.closed) producer.close();
    });
    producersRef.current.clear();
  };

  const deletePeers = () => {
    setHostPeerId(null);
    peerMediaRef.current.clear();
  };

  const deleteTransports = () => {
    if (sendTransportRef.current && !sendTransportRef.current.closed) {
      sendTransportRef.current.close();
    }
    sendTransportRef.current = null;
    sendTransportOptRef.current = null;

    if (recvTransportRef.current && !recvTransportRef.current.closed) {
      recvTransportRef.current.close();
    }
    recvTransportRef.current = null;
  };

  const deleteSendingTracks = () => {
    sendingTracksRef.current.clear();
  };

  // ... (implement other methods similarly)

  const value = {
    chatId,
    user,
    myId,
    displayName,
    hostPeerId,
    joined,
    isConnected,
    joinMeeting,
    leaveMeeting,
    sendMediaStream,
    registerPeerUpdateListener,
    deletePeerUpdateListener,
    registerNewMessageListener,
    deleteNewMessageListener,
    registerMeetingEndListener,
    deleteMeetingEndListener,
    registerBeMutedListener,
    deleteBeMutedListener,
    getPeerDetails,
    getPeerDetailByPeerId,
    // ... other methods
  };

  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};