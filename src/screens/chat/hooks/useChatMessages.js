import { useState, useEffect, useRef, useCallback } from 'react';
import { BASE_API_URL } from '@env';

const MESSAGES_PER_PAGE = 50;

/**
 * Custom hook to manage chat messages, pagination, and loading states
 */
export const useChatMessages = ({ chat, user, api, setMessages }) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  /**
   * Load initial messages for a chat
   */
  const loadMessages = useCallback(async (page = 1, isInitial = false) => {
    if (!chat?._id) return;

    const currentChatId = chat._id;

    try {
      if (isInitial) {
        setLoading(true);
      }

      const response = await api.get(
        `/api/messages/${currentChatId}?page=${page}&limit=${MESSAGES_PER_PAGE}`
      );

      // Only update if we're still on the same chat (prevent race conditions)
      if (response.success && chat._id === currentChatId) {
        setMessages(response.messages.reverse());
        setHasMore(response.hasMore);
        setCurrentPage(page);
        setInitialLoad(false);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      if (isInitial && chat._id === currentChatId) {
        setLoading(false);
      }
    }
  }, [chat?._id, api, setMessages]);

  /**
   * Load more messages for infinite scroll
   */
  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !hasMore || initialLoad || !chat?._id) return;

    const currentChatId = chat._id;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const response = await fetch(
        `${BASE_API_URL}/api/messages/${currentChatId}/group?page=${nextPage}&limit=${MESSAGES_PER_PAGE}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        }
      );
      const data = await response.json();

      // Only update if we're still on the same chat
      if (data.success && chat._id === currentChatId) {
        setMessages(prev => [...data.messages.reverse(), ...prev]);
        setHasMore(data.hasMore);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      if (chat._id === currentChatId) {
        setLoadingMore(false);
      }
    }
  }, [loadingMore, hasMore, initialLoad, chat?._id, currentPage, user?.token, setMessages]);

  /**
   * Reset state when chat changes
   */
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    setInitialLoad(true);
  }, []);

  return {
    loading,
    loadingMore,
    hasMore,
    initialLoad,
    loadMessages,
    loadMoreMessages,
    resetPagination,
  };
};
