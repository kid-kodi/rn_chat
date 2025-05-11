import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { roomURL, serviceConfig, SignalMethod, SignalType, socketConnectionOptions } from '../config/serviceConfig';
import { timeoutCallback } from '../helpers/media/MediaUtils';
import { useAuth } from './AuthProvider';

const SignalContext = createContext(null);

export const SignalProvider = ({ children }) => {
  const socketRef = useRef(null);
  const callbackMapRef = useRef(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const {user} = useAuth();

  // Initialize socket and callbacks
  useEffect(() => {
    if(!user) return;
    console.log('[Socket] Start to connect');

    const URL = roomURL(user._id);

    socketRef.current = io(URL, socketConnectionOptions);

    // Initialize callback maps
    callbackMapRef.current.set(SignalType.request, new Map());
    callbackMapRef.current.set(SignalType.notify, new Map());

    // Setup event listeners
    socketRef.current.on(SignalType.request, ({ method, data }) => {
      handleSignal(SignalType.request, method, data);
    });

    socketRef.current.on(SignalType.notify, ({ method, data }) => {
      handleSignal(SignalType.notify, method, data);
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.log('[Socket] Connection error', err);
      setError(err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  const handleSignal = (type, method, data) => {
    console.log(`[Socket] Received signal (${type}, ${method})`);
    const callback = callbackMapRef.current.get(type)?.get(method);
    if (!callback) {
      console.warn(`[Socket] Undefined signal (${type}, ${method})`);
    } else {
      callback(data);
      console.log(`[Socket] Signal handled (${type}, ${method})`);
    }
  };

  // Register listeners
  // registerListener(SignalType.request, 'someMethod', (data) => {
  //   console.log('Received data:', data);
  // });
  const registerListener = (type, method, callback) => {
    callbackMapRef.current.get(type)?.set(method, callback);
  };

  const removeAllListeners = () => {
    if (socketRef.current) {
      socketRef.current.off('disconnect');
    }
    callbackMapRef.current.get(SignalType.notify)?.clear();
    callbackMapRef.current.get(SignalType.request)?.clear();
  };

  const waitForConnection = () => {
    if (!socketRef.current) return Promise.reject('Socket not initialized');

    socketRef.current.connect();
    return new Promise((resolve, reject) => {
      console.log('[Socket] Waiting for connection to ' + URL + '...');
      let returned = false;

      const connectHandler = timeoutCallback(() => {
        if (returned) return;
        returned = true;

        if (socketRef.current?.connected) {
          console.log('[Socket] Connected');
          resolve();
        } else {
          reject('Socket connection failed');
        }
      }, serviceConfig.connectTimeout);

      socketRef.current.once('connect', connectHandler);

      if (!returned && socketRef.current?.connected) {
        returned = true;
        console.log('[Socket] Connected');
        resolve();
      }
    });
  };

  const waitForReconnection = () => {
    return new Promise((resolve, reject) => {
      console.log('[Socket] Waiting for reconnection to ' + URL + '...');
      let returned = false;

      const reconnectHandler = timeoutCallback(() => {
        if (returned) return;
        returned = true;

        if (socketRef.current?.connected) {
          console.log('[Socket] Reconnected');
          resolve();
        } else {
          reject('Socket reconnection failed');
        }
      }, serviceConfig.reconnectTimeout);

      socketRef.current.once('connect', reconnectHandler);

      if (!returned && socketRef.current?.connected) {
        returned = true;
        console.log('[Socket] Reconnected');
        resolve();
      }
    });
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // Example: Send a request when component mounts
  // sendRequest('someMethod', { some: 'data' })
  //   .then(response => console.log('Response:', response))
  //   .catch(err => console.error('Error:', err));
  const sendRequest = (method, data = null) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        reject('No socket connection.');
      } else {
        socketRef.current.emit(
          SignalType.request,
          { method, data },
          timeoutCallback((err, response) => {
            if (err) {
              console.error('[Socket] sendRequest ' + method + ' error!', err);
              reject(err);
            } else {
              resolve(response);
            }
          }, serviceConfig.requestTimeout)
        );
      }
    });
  };

  const sendNotify = (method, data = null) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SignalType.notify, { method, data });
    }
  };

  const value = {
    isConnected,
    error,
    registerListener,
    removeAllListeners,
    waitForConnection,
    waitForReconnection,
    disconnect,
    sendRequest,
    sendNotify,
    connected: () => socketRef.current?.connected || false,
  };

  return (
    <SignalContext.Provider value={value}>
      {children}
    </SignalContext.Provider>
  );
};

export const useSignal = () => {
  const context = useContext(SignalContext);
  if (!context) {
    throw new Error('useSignal must be used within a SignalProvider');
  }
  return context;
};