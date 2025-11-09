import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '../constants/config';

export const messagingService = {
  // Get all message threads
  getThreads: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.MESSAGE_THREADS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get single thread
  getThread: async (id) => {
    try {
      const response = await api.get(API_ENDPOINTS.MESSAGE_THREAD_DETAIL(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Create message thread
  createThread: async (buyerId, sellerId, productId) => {
    try {
      const response = await api.post(API_ENDPOINTS.MESSAGE_THREADS, {
        buyer: buyerId,
        seller: sellerId,
        product: productId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get messages in thread
  getMessages: async (threadId) => {
    try {
      const response = await api.get(API_ENDPOINTS.MESSAGES, {
        params: { thread: threadId },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Send message
  sendMessage: async (threadId, content) => {
    try {
      const response = await api.post(API_ENDPOINTS.MESSAGES, {
        thread: threadId,
        content,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Mark messages as read
  markAsRead: async (threadId) => {
    try {
      const response = await api.post(API_ENDPOINTS.MARK_READ(threadId));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
