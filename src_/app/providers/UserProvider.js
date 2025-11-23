import {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useApi} from './ApiProvider';

import queryString from 'query-string';
import {registerDeviceForNotifications} from '../../services/NotificationService';
import {useSocket} from './SocketProvider';

export const UserContext = createContext();

// type AuthStatus = 'checking' | 'unauthenticated' | 'otpPending' | 'onboarding' | 'authenticated';

export default function UserProvider({children}) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [authStatus, setAuthStatus] = useState();
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [fcmToken, setFcmToken] = useState();
  const api = useApi();
  const socket = useSocket();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const me = await api.get('/api/auth/me');

      if (me.user) {
        setUser(me.user);
        socket?.emit('join_chat', me.user._id);

        let _fcmToken = await AsyncStorage.getItem('fcmToken');
        if (_fcmToken) {
          setFcmToken(_fcmToken);
          await api.post('/api/auth/update-token', {fcmToken: _fcmToken});
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
        socket.emit('join_chat', me.user._id);
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
      const response = await api.post('/api/auth/forgot-password', {email});
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
    // handleDisconnect("logout")
    const response = await api.post('/api/auth/logout', null);
    if (response.success) {
      setUser(null);
      setAuthStatus('unauthenticated');
      AsyncStorage.clear();
    }
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
