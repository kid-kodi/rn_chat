import io from 'socket.io-client';
import {BASE_API_URL} from '@env';

const SOCKET_URL = BASE_API_URL;

class WSService {
  initializeSocket = async () => {
    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });
      // console.log('initializing socket', this.socket);

      this.socket.on('connect', data => {
        console.log('=== socket connected ====');
        // this.socket.emit("user_online", { userId });
      });

      this.socket.on('disconnect', data => {
        console.log('=== socket disconnected ====');
      });

      this.socket.on('error', data => {
        console.log('socekt error', data);
      });
    } catch (error) {
      console.log('scoket is not inialized', error);
    }
  };

  emit(event, data = {}) {
    this.socket.emit(event, data);
  }

  on(event, cb) {
    this.socket.on(event, cb);
  }

  removeListener(listenerName) {
    this.socket.removeListener(listenerName);
  }
}

const WsSocket = new WSService();

export default WsSocket;
