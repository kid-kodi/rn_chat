import axios from 'axios';
import {BASE_API_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ApiClient {
  constructor() {
    console.log(this.base_url);
    this.base_url = BASE_API_URL;
  }

  BaseURL() {
    return this.base_url;
  }

  async isAuthenticated() {
    let token = await AsyncStorage.getItem('doctor');
    console.log(token);
    return token !== null;
  }

  async authToken() {
    let token = await AsyncStorage.getItem('doctor');
    return token;
  }

  async authHeader() {
    // return auth header with jwt if user is logged in and request is to the api url
    const token = await this.authToken();
    const isLoggedIn = !!token;
    return {
      headers: {
        Authorization: isLoggedIn ? `Bearer ${token}` : '',
      },
    };
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      return {
        error: error.response.data,
        message: error.response.data.message,
      };
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
      return {error: error.request, message: 'Erreur de connexion'};
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
      return {error: error, message: error.message};
    }
  }

  async get(url, options = {}) {
    return axios
      .get(this.base_url + url, {...(await this.authHeader()), ...options})
      .then(resp => resp.data)
      .catch(this.handleError);
  }

  async post(url, payload = {}, options = {}) {
    console.log(this.base_url + url);
    return axios
      .post(this.base_url + url, payload, {
        ...(await this.authHeader()),
        ...options,
      })
      .then(resp => resp.data)
      .catch(this.handleError);
  }

  async put(url, payload = {}, options = {}) {
    return axios
      .put(this.base_url + url, payload, {
        ...(await this.authHeader()),
        ...options,
      })
      .then(resp => resp.data)
      .catch(this.handleError);
  }

  async delete(url, payload = {}, options = {}) {
    return axios
      .delete(this.base_url + url, payload, {
        ...(await this.authHeader()),
        ...options,
      })
      .then(resp => resp.data)
      .catch(this.handleError);
  }
}
