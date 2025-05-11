import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import queryString from 'query-string';
import { registerDeviceForNotifications } from '../services/NotificationService';
import api from '../services/Api';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setAuth] = useState();
  const [token, setToken] = useState();
  const [fcmToken, setFcmToken] = useState();

  const autoLogin = async () => {
    setIsAuthLoading(true);
    const me = await api.get('/api/auth/me');
    if (me.user) {
      setAuth(me.user);
      let _fcmToken = await AsyncStorage.getItem('fcmToken');
      if (_fcmToken) {
        // Update user fcmtoken
        setFcmToken(_fcmToken);
        await api.post('/api/auth/update-token', { fcmToken: _fcmToken });
        await registerDeviceForNotifications(me.user._id)
      }
      setIsAuthLoading(false);
    }
    return me;
  };

  const login = async auth_map => {
    const login_response = await api.post('/api/auth/login', auth_map);
    if (login_response.success) {
      AsyncStorage.setItem('user', login_response.token);
      const me = await api.get('/api/auth/me');
      if (me.success) {
        // socket.emit('join_chat', me.user._id);
        await registerDeviceForNotifications(me.user._id)
        setAuth(me.user);
      } else {
        setAuth(null);
      }
    }
    return login_response;
  };

  const updateProfile = async values => {
    const response = await api.put(`/api/auth/update_profile`, values);
    if (response.success) {
      setAuth(response.user);
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
        setAuth(me.user);
      } else {
        setAuth(null);
      }
    }
    return response;
  };

  const logout = async () => {
    // socket.emit('leave_chat', user._id);
    const response = await api.post('/api/auth/logout', null);
    if (response.success) {
      setAuth(null);
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
      setAuth(response.user);
    }
    return response;
  };

  const searchAuths = async query => {
    const parser = queryString.stringify(query);
    const response = await api.get(`/api/users?${parser}`, null);
    return response;
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        autoLogin,
        setAuth,
        login,
        register,
        activation,
        setIsAuthenticated,
        isAuthenticated,
        logout,
        update,
        searchAuths,
        updateProfile
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
