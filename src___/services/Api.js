// api/api.js
import {BASE_API_URL} from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: BASE_API_URL, // Change this to your backend API base URL
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('user');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Return full response instead of response.data
    return response.data;
  },
  (error) => {
    // Handle unauthorized (401) globally, for example:
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized! Redirecting to login...');
      // Optional: clear token, navigate to login, etc.
      // await AsyncStorage.removeItem('authToken');
    }

    return Promise.reject(error);
  }
);

export default api;
