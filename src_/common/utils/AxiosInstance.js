// api/axiosInstance.js
import {BASE_API_URL} from '@env';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: BASE_API_URL, // Change this to your backend API base URL
  timeout: 500,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Axios Response:', {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    // Return full response instead of response.data
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.log('Axios Error Response:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      // Handle unauthorized (401) globally, for example:
      if (error.response.status === 401) {
        console.warn('Unauthorized! Redirecting to login...');
        // Optional: clear token, navigate to login, etc.
        // await AsyncStorage.removeItem('authToken');
      }
    } else {
      console.log(BASE_API_URL)
      console.log('Axios Error (no response):', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
