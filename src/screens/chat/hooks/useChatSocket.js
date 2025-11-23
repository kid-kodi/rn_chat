import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage socket events for chat
 */
export const useChatSocket = ({
  socket,
  chat,
  user,
  setMessages,
  setIsTyping,
  scrollToBottom
}) => {
  const typingTimeoutRef = useRef(null);

  /**
   * Join and leave chat room
   */
  useEffect(() => {
    if (!chat?._id || !socket) {
      console.log('⚠️ Cannot join chat room - missing chat ID or socket');
      return;
    }

    // Join chat room
    console.log('📥 Joining chat room:', chat._id);
    socket.emit('join_chat', chat._id);

    // Cleanup: leave chat room
    return () => {
      console.log('📤 Leaving chat room:', chat._id);
      socket.emit('leave_chat', chat._id);
      setIsTyping(false);
    };
  }, [chat?._id, socket, setIsTyping]);

  /**
   * Listen for socket events
   */
  useEffect(() => {
    if (!socket || !chat?._id) {
      console.log('⚠️ Cannot setup socket listeners - missing socket or chat ID');
      return;
    }

    console.log('👂 Setting up socket listeners for chat:', chat._id);
    console.log('Socket connected:', socket.connected);

    const handleNewMessage = (message) => {
      console.log('📨 Received new_message event:', {
        messageId: message._id,
        messageChatId: message.chat._id || message.chat,
        currentChatId: chat._id,
        sender: message.sender?.fullName,
        content: message.content?.substring(0, 50),
      });

      if (message.chat._id === chat._id || message.chat === chat._id) {
        console.log('✅ Message belongs to current chat, adding to messages');
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m._id === message._id);
          if (!exists) {
            console.log('✅ New message added to list');
            return [...prev, message];
          }
          console.log('⚠️ Message already exists, skipping');
          return prev;
        });

        scrollToBottom();
      } else {
        console.log('⚠️ Message belongs to different chat, ignoring');
      }
    };

    const handleTyping = (data) => {
      console.log('⌨️ Received typing event:', data);
      // Only show typing indicator if it's for current chat and not from current user
      if (data.chatId === chat._id && data.userId !== user._id) {
        console.log('✅ Showing typing indicator');
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      console.log('⌨️ Received stop_typing event:', data);
      // Only hide typing indicator if it's for current chat
      if (data.chatId === chat._id) {
        console.log('✅ Hiding typing indicator');
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    console.log('✅ Socket listeners registered successfully');

    return () => {
      console.log('🔇 Removing socket listeners for chat:', chat._id);
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, chat?._id, user?._id, setMessages, setIsTyping, scrollToBottom]);

  /**
   * Emit typing event
   */
  const emitTyping = useCallback(() => {
    if (!socket || !chat?._id) return;

    socket.emit('typing', chat._id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', chat._id);
    }, 1000);
  }, [socket, chat?._id]);

  return {
    emitTyping,
  };
};
