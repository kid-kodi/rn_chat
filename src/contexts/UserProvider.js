import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApi } from './ApiProvider';

import queryString from 'query-string';
import { registerDeviceForNotifications } from '../services/NotificationService';
import { useSocket } from './SocketProvider';

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState();
  const [token, setToken] = useState();
  const [fcmToken, setFcmToken] = useState();
  const api = useApi();
  const socket = useSocket();

  const autoLogin = async () => {
    setIsUserLoading(true);
    const me = await api.get('/api/auth/me');
    if (me.user) {
      setUser(me.user);
      // MeetingVariable.mediaService.registerUser(me.user);
      socket.emit('join_chat', me.user._id);
     
      let _fcmToken = await AsyncStorage.getItem('fcmToken');
      if (_fcmToken) {
        // Update user fcmtoken
        setFcmToken(_fcmToken);
        await api.post('/api/auth/update-token', { fcmToken: _fcmToken });
        await registerDeviceForNotifications(me.user._id)
      }
      setIsUserLoading(false);
    }
    return me;
  };

  const login = async auth_map => {
    const login_response = await api.post('/api/auth/login', auth_map);
    if (login_response.success) {
      AsyncStorage.setItem('user', login_response.token);
      const me = await api.get('/api/auth/me');
      if (me.success) {
        socket.emit('join_chat', me.user._id);
        // handleConnect(me.user);
        await registerDeviceForNotifications(me.user._id)
        setUser(me.user);
      } else {
        setUser(null);
      }
    }
    return login_response;
  };

  const updateProfile = async values => {
    const response = await api.put(`/api/auth/update_profile`, values);
    if (response.success) {
      setUser(response.user);
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
        user,
        isUserLoading,
        autoLogin,
        setUser,
        login,
        register,
        activation,
        setIsAuthenticated,
        isAuthenticated,
        logout,
        update,
        searchUsers,
        updateProfile
      }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
