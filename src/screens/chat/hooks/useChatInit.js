import { useEffect, useState } from 'react';

/**
 * Custom hook to initialize chat and handle route params
 */
export const useChatInit = ({
  userId,
  chatId,
  getChatById,
  checkIfChatExist,
  resetChat,
  setMessages,
  setContactInfo,
}) => {
  /**
   * Handle chatId parameter - fetch existing chat
   */
  useEffect(() => {
    if (!chatId) return;

    const initChat = async () => {
      await getChatById(chatId);
    };

    initChat();
  }, [chatId, getChatById]);

  /**
   * Handle userId parameter - check if chat exists or prepare for new chat
   */
  useEffect(() => {
    if (!userId) return;

    const initUserChat = async () => {
      // Reset chat state for clean slate
      resetChat();
      setMessages([]);
      setContactInfo(null);

      await checkIfChatExist(userId);
    };

    initUserChat();
  }, [userId, resetChat, setMessages, setContactInfo, checkIfChatExist]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (userId) {
        resetChat();
        setMessages([]);
      }
    };
  }, []);
};
