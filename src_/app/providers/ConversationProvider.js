// ConversationContext.js
import React, {createContext, useContext, useState} from 'react';
import {useApi} from './ApiProvider';

export const ConversationContext = createContext();

export const ConversationProvider = ({children}) => {
  const api = useApi();

  const [conversations, setConversations] = useState([]);

  // Create
  const createConversation = async data => {
    try {
      const response = await api.post(`/api/chats`, data);
      setConversations(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  // Read (fetch all)
  const fetchConversations = async () => {
    try {
      const response = await api.get(`/api/chats/search`);
      setConversations(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  };

  // Update
  const updateConversation = async (id, data) => {
    try {
      const response = await api.put(`/api/chats/${id}`, data);
      setConversations(prev =>
        prev.map(conv => (conv.id === id ? response.data : conv)),
      );
      return response.data;
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  };

  // Delete
  const deleteConversation = async id => {
    try {
      await api.delete(`/api/chats/${id}`);
      setConversations(prev => prev.filter(conv => conv.id !== id));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  };

  return (
    <ConversationContext.Provider value={{conversations , fetchConversations}}>
      {children}
    </ConversationContext.Provider>
  );
};

export function useConversation() {
  return useContext(ConversationContext);
}
