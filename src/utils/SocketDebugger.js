/**
 * Socket Debugger Utility
 * Use this to test socket connection and events manually
 */

import socketService from './SocketService';

export const SocketDebugger = {
  /**
   * Get current socket status
   */
  getStatus: () => {
    const status = socketService.getConnectionStatus();
    console.log('=== Socket Status ===');
    console.log('Connected:', status.connected);
    console.log('Socket ID:', status.socketId);
    console.log('Is Connected:', status.isConnected);
    console.log('====================');
    return status;
  },

  /**
   * Test socket connection by emitting a test event
   */
  testConnection: () => {
    const socket = socketService.getInstance();
    if (!socket) {
      console.error('❌ Socket not initialized');
      return false;
    }

    console.log('🧪 Testing socket connection...');
    console.log('Socket connected:', socket.connected);
    console.log('Socket ID:', socket.id);

    // Try to emit a test event
    socket.emit('test_connection', { timestamp: Date.now() });
    console.log('✅ Test event emitted');

    return true;
  },

  /**
   * Listen for all events (for debugging)
   */
  listenAllEvents: () => {
    const socket = socketService.getInstance();
    if (!socket) {
      console.error('❌ Socket not initialized');
      return;
    }

    // Socket.io internal events
    const events = [
      'connect',
      'connect_error',
      'disconnect',
      'reconnect',
      'reconnect_attempt',
      'reconnect_error',
      'reconnect_failed',
      'new_message',
      'typing',
      'stop_typing',
    ];

    events.forEach(event => {
      socket.on(event, (data) => {
        console.log(`📡 Socket Event [${event}]:`, data);
      });
    });

    console.log('👂 Listening to all socket events');
  },

  /**
   * Manually join a chat room
   */
  joinChat: (chatId) => {
    const socket = socketService.getInstance();
    if (!socket) {
      console.error('❌ Socket not initialized');
      return;
    }

    console.log('📥 Manually joining chat:', chatId);
    socket.emit('join_chat', chatId);
  },

  /**
   * Manually leave a chat room
   */
  leaveChat: (chatId) => {
    const socket = socketService.getInstance();
    if (!socket) {
      console.error('❌ Socket not initialized');
      return;
    }

    console.log('📤 Manually leaving chat:', chatId);
    socket.emit('leave_chat', chatId);
  },

  /**
   * Get socket instance
   */
  getSocket: () => {
    return socketService.getInstance();
  },
};

// Make it available globally for easy debugging
if (typeof global !== 'undefined') {
  global.SocketDebugger = SocketDebugger;
}

export default SocketDebugger;
