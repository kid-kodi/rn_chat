import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(url) {
    if (!this.socket) {
      console.log('🔌 Attempting to connect to socket server:', url);

      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('✅ Connected to socket server');
        console.log('Socket ID:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.log('❌ Disconnected from socket server. Reason:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔴 Socket connection error:', error.message);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to socket server after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt', attemptNumber);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('🔴 Reconnection error:', error.message);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('🔴 Failed to reconnect to socket server');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from socket server');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getInstance() {
    return this.socket;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      connected: this.socket?.connected || false,
    };
  }
}

const socketService = new SocketService();
export default socketService;