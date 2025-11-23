import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(url) {
    if (!this.socket) {
      this.socket = io(url);

      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getInstance() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;