import io from 'socket.io-client';
import {serviceConfig, SignalMethod, SignalType} from '../../ServiceConfig';
import {timeoutCallback} from '../helpers/media/MediaUtils';

export class SignalingService {
  URL;
  socket;
  callbackMap;
  disconnectCallback;

  constructor(URL, opts, onDisconnect) {
    this.URL = URL;
    this.socket = io(URL, opts);
    this.disconnectCallback = onDisconnect;
    console.log('[Socket]  Start to connect');

    this.callbackMap = new Map();
    this.callbackMap.set(SignalType.request, new Map());
    this.callbackMap.set(SignalType.notify, new Map());

    this.socket.on(SignalType.request, ({method, data}) => {
      this.handleSignal(SignalType.request, method, data);
    });

    this.socket.on(SignalType.notify, ({method, data}) => {
      this.handleSignal(SignalType.notify, method, data);
    });

    this.socket.on('disconnect', this.disconnectCallback);
  }

  handleSignal(type, method, data) {
    console.log(`[Socket]  Received signal (${type} , ${method})`);
    let callback = this.callbackMap.get(type).get(method);
    if (callback == undefined) {
      console.warn(`[Socket]  Undefined signal (${type} , ${method})`);
    } else {
      callback(data);
      console.log(`[Socket]  Signal handled (${type} , ${method})`);
    }
  }

  registerListener(type, method, callback) {
    this.callbackMap.get(type).set(method, callback);
  }

  removeAllListeners() {
    this.socket.off('disconnect', this.disconnectCallback);
    this.callbackMap.get(SignalType.notify).clear();
    this.callbackMap.get(SignalType.request).clear();
  }

  waitForConnection(user) {
    this.socket.auth = user;
    this.socket.connect();
    return new Promise((resolve, reject) => {
      console.log('[Socket]  Waiting for connection to ' + this.URL + '...');
      let returned = false;
      this.socket.once(
        'connect',
        timeoutCallback(() => {
          if (returned) return;

          returned = true;
          if (this.socket && this.socket.connected) {
            console.log('[Socket]  Connected');
            resolve();
          } else {
            reject('Socket connection failed');
          }
        }, serviceConfig.connectTimeout),
      );

      if (!returned && this.socket && this.socket.connected) {
        returned = true;
        console.log('[Socket]  Connected');
        resolve();
      }
      // this.socket.on('connect_error', this.timeoutCallback(() => {
      //     console.log('Socket connection failed!!!')
      //     reject();
      //     }, serviceConfig.connectTimeout));
    });
  }

  waitForReconnection() {
    return new Promise((resolve, reject) => {
      console.log('[Socket]  Waiting for reconnection to ' + this.URL + '...');
      let returned = false;
      this.socket.once(
        'connect',
        timeoutCallback(() => {
          if (returned) return;

          returned = true;
          if (this.socket && this.socket.connected) {
            console.log('[Socket]  Reconnected');
            resolve();
          } else {
            reject('Socket reconnection failed');
          }
        }, serviceConfig.reconnectTimeout),
      );

      if (!returned && this.socket && this.socket.connected) {
        returned = true;
        console.log('[Socket]  Reconnected');
        resolve();
      }
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  sendRequest(method, data = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject('No socket connection.');
      } else {
        this.socket.emit(
          SignalType.request,
          {method, data},
          timeoutCallback((err, response) => {
            if (err) {
              console.error('[Socket]  sendRequest ' + method + ' error!', err);
              reject(err);
            } else {
              resolve(response);
            }
          }, serviceConfig.requestTimeout),
        );
      }
    });
  }

  sendNotify(method, data = null) {
    this.socket.emit(SignalType.notify, {method, data});
  }

  connected() {
    return this.socket && this.socket.connected;
  }
}
