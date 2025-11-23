import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from './ApiProvider';
import { useToast } from 'react-native-toast-notifications';

import queryString from 'query-string';
import { registerDeviceForNotifications } from '../services/NotificationService';
import { useSocket } from './SocketProvider';
import * as RootNavigation from '../utils/RootNavigation';

export const UserContext = createContext();

// type AuthStatus = 'checking' | 'unauthenticated' | 'otpPending' | 'onboarding' | 'authenticated';

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [authStatus, setAuthStatus] = useState();
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [fcmToken, setFcmToken] = useState();
  const api = useApi();
  const socket = useSocket();
  const toast = useToast();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    checkAuthState();
  }, []);

  // Join user's personal socket room for direct notifications
  useEffect(() => {
    if (!socket || !user) return;

    // Join user's personal room for direct notifications (calls, etc.)
    socket.emit('user_connect', user._id);
    console.log(`✅ User ${user._id} joined their personal socket room`);

    return () => {
      // Cleanup when user logs out or component unmounts
      socket.off('user_connect');
    };
  }, [socket, user]);

  // Listen to call events globally - CRITICAL for initiator to receive notifications
  useEffect(() => {
    if (!socket) return;

    // Handle call ended - ensures initiator's call screen closes when recipient declines
    const handleCallEnded = ({ callId, reason, declinedBy }) => {
      console.log(`📴 Call ${callId} ended: ${reason}`);

      // Get current route to determine if we need to close call screen
      const currentRoute = RootNavigation.getCurrentRoute();

      if (currentRoute === 'OUTGOING_CALL' ||
          currentRoute === 'CALL' ||
          currentRoute === 'INCOMING_CALL') {

        // Show toast based on reason
        if (reason === 'declined') {
          toast.show('Call declined', { type: 'warning' });
        } else if (reason === 'cancelled') {
          toast.show('Call cancelled', { type: 'normal' });
        } else if (reason === 'ended') {
          toast.show('Call ended', { type: 'normal' });
        }

        // Navigate back to close the call screen
        if (RootNavigation.canGoBack()) {
          RootNavigation.goBack();
        }
      }
    };

    // Handle call cancelled - when initiator cancels before anyone joins
    const handleCallCancelled = ({ callId, cancelledBy, isGroupCall }) => {
      console.log(`🚫 Call ${callId} cancelled by ${cancelledBy}`);

      const currentRoute = RootNavigation.getCurrentRoute();

      // If on incoming call screen, close it
      if (currentRoute === 'INCOMING_CALL') {
        toast.show('Call cancelled', { type: 'normal' });

        if (RootNavigation.canGoBack()) {
          RootNavigation.goBack();
        }
      }
    };

    // Handle participant declined (group calls only)
    const handleParticipantDeclined = ({ callId, userId, participantCount }) => {
      console.log(`👤 Participant declined call ${callId}. ${participantCount} remaining`);

      toast.show(`Participant declined (${participantCount} remaining)`, {
        type: 'warning'
      });
    };

    socket.on('call_ended', handleCallEnded);
    socket.on('call_cancelled', handleCallCancelled);
    socket.on('participant_declined', handleParticipantDeclined);

    return () => {
      socket.off('call_ended', handleCallEnded);
      socket.off('call_cancelled', handleCallCancelled);
      socket.off('participant_declined', handleParticipantDeclined);
    };
  }, [socket, toast]);

  // Track app state and notify server
  useEffect(() => {
    if (!socket || !user) return;

    const handleAppStateChange = (nextAppState) => {
      console.log('📱 App state changed:', appState.current, '→', nextAppState);

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('✅ App is now ACTIVE - enabling notifications OFF');
        socket.emit('app_state_change', {
          userId: user._id,
          state: 'active',
          timestamp: Date.now()
        });
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        console.log('🔕 App is now INACTIVE - enabling notifications ON');
        socket.emit('app_state_change', {
          userId: user._id,
          state: 'inactive',
          timestamp: Date.now()
        });
      }

      appState.current = nextAppState;
    };

    // Initial state - app is active when UserProvider mounts
    socket.emit('app_state_change', {
      userId: user._id,
      state: 'active',
      timestamp: Date.now()
    });

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      // When component unmounts or user logs out, set as inactive
      socket.emit('app_state_change', {
        userId: user._id,
        state: 'inactive',
        timestamp: Date.now()
      });
    };
  }, [socket, user]);

  const checkAuthState = async () => {
    try {
      const me = await api.get('/api/auth/me');

      if (me.user) {
        setUser(me.user);
        socket?.emit('join_chat', me.user._id);

        let _fcmToken = await AsyncStorage.getItem('fcmToken');
        if (_fcmToken) {
          setFcmToken(_fcmToken);
          await api.post('/api/auth/update-token', { fcmToken: _fcmToken });
          await registerDeviceForNotifications(me.user._id);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      console.log('###');
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   // Check auth from AsyncStorage
  //   const bootstrapAsync = async () => {
  //     const user = await AsyncStorage.getItem('user');
  //     if (!user) {
  //       setAuthStatus('unauthenticated');
  //     } else {
  //       const response = await autoLogin();
  //       if (response.user && response.user.fullName) {
  //         setAuthStatus('authenticated');
  //       } else if (response.user && !response.user.fullName) {
  //         setAuthStatus('onboarding');
  //       }
  //     }
  //   };
  //   bootstrapAsync();
  // }, []);

  // const autoLogin = async () => {
  //   setIsUserLoading(true);
  //   const me = await api.get('/api/auth/me');
  //   if (me.user) {
  //     setUser(me.user);
  //     // MeetingVariable.mediaService.registerUser(me.user);
  //     socket?.emit('join_chat', me.user._id);

  //     let _fcmToken = await AsyncStorage.getItem('fcmToken');
  //     if (_fcmToken) {
  //       // Update user fcmtoken
  //       setFcmToken(_fcmToken);
  //       await api.post('/api/auth/update-token', {fcmToken: _fcmToken});
  //       await registerDeviceForNotifications(me.user._id);
  //     }
  //     setIsUserLoading(false);
  //   }
  //   return me;
  // };

  const login = async auth_map => {
    const login_response = await api.post('/api/auth/login', auth_map);
    if (login_response.success) {
      AsyncStorage.setItem('user', login_response.token);
      const me = await api.get('/api/auth/me');
      if (me.success) {
        socket?.emit('join_chat', me.user._id);
        // handleConnect(me.user);
        setAuthStatus('onboarding');
        await registerDeviceForNotifications(me.user._id);
        setUser(me.user);
      } else {
        setUser(null);
      }
    }
    return login_response;
  };

  const forgotPassword = async email => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const verifyAccount = async activation_code => {
    try {
      const response = await api.post('/api/auth/verify-account', {
        activation_code,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const resetPassword = async (userId, password) => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        userId,
        password,
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfile = async values => {
    const response = await api.put(`/api/auth/update_profile`, values);
    if (response.success) {
      setUser(response.user);
      await AsyncStorage.setItem('onboarding_done', 'true');
      setAuthStatus('authenticated');
    }
    return response;
  };

  const register = async data => {
    const response = await api.post('/api/auth/register', data);
    return response;
  };

  const activation = async data => {
    const response = await api.post('/api/auth/activation', data);
    if (response.success) {
      AsyncStorage.setItem('user', response.token);
      const me = await api.get('/api/auth/me');
      if (me.success) {
        setUser(me.user);
      } else {
        setUser(null);
      }
    }
    return response;
  };

  const logout = async () => {
    const response = await api.post('/api/auth/logout', null);
    setUser(null);
    setAuthStatus('unauthenticated');
    AsyncStorage.clear();
    return response;
  };

  const removeAccount = async () => {
    // handleDisconnect("logout")
    const response = await api.post('/api/auth/remove', {});
    if (response.success) {
      setUser(null);
      AsyncStorage.clear();
    }
    return response;
  };

  const update = async user_map => {
    const response = await api.put(`/api/users/${user._id}`, user_map, {
      'Content-Type':
        'multipart/form-data; charset=utf-8; boundary=' +
        Math.random().toString().substr(2),
    });
    if (response.success) {
      setUser(response.user);
    }
    return response;
  };

  const searchUsers = async query => {
    const parser = queryString.stringify(query);
    const response = await api.get(`/api/users?${parser}`, null);
    return response;
  };

  return (
    <UserContext.Provider
      value={{
        authStatus,
        user,
        isLoading,
        // autoLogin,
        setUser,
        login,
        register,
        activation,
        setIsAuthenticated,
        isAuthenticated,
        logout,
        removeAccount,
        update,
        searchUsers,
        updateProfile,
        forgotPassword,
        verifyAccount,
        resetPassword,
      }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
