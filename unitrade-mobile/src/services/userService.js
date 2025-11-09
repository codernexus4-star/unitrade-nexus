import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '../constants/config';

export const userService = {
  // Get universities
  getUniversities: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.UNIVERSITIES);
      // Handle paginated response from backend
      const data = response.data.results || response.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get campuses
  getCampuses: async (universityId = null) => {
    try {
      const params = universityId ? { university_id: universityId } : {};
      const response = await api.get(API_ENDPOINTS.CAMPUSES, { params });
      // Handle paginated response from backend
      const data = response.data.results || response.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get wishlist
  getWishlist: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.WISHLIST);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await api.post(API_ENDPOINTS.WISHLIST, {
        product_id: productId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    try {
      await api.delete(`${API_ENDPOINTS.WISHLIST}${productId}/`);
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get current user profile
  getUserProfile: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USER_ME);
      return { success: true, data: response.data.user };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_ENDPOINTS.USER_PROFILE, profileData);
      return { success: true, data: response.data.user };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Payment Methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_METHODS);
      const data = response.data.results || response.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return handleApiError(error);
    }
  },

  addPaymentMethod: async (paymentData) => {
    try {
      const response = await api.post(API_ENDPOINTS.PAYMENT_METHODS, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updatePaymentMethod: async (id, paymentData) => {
    try {
      const response = await api.put(API_ENDPOINTS.PAYMENT_METHOD_DETAIL(id), paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deletePaymentMethod: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.PAYMENT_METHOD_DETAIL(id));
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delivery Addresses
  getDeliveryAddresses: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.DELIVERY_ADDRESSES);
      const data = response.data.results || response.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return handleApiError(error);
    }
  },

  addDeliveryAddress: async (addressData) => {
    try {
      const response = await api.post(API_ENDPOINTS.DELIVERY_ADDRESSES, addressData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateDeliveryAddress: async (id, addressData) => {
    try {
      const response = await api.put(API_ENDPOINTS.DELIVERY_ADDRESS_DETAIL(id), addressData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteDeliveryAddress: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.DELIVERY_ADDRESS_DETAIL(id));
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS);
      const data = response.data.results || response.data;
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      return handleApiError(error);
    }
  },

  markNotificationRead: async (id) => {
    try {
      const response = await api.post(API_ENDPOINTS.MARK_NOTIFICATION_READ(id));
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await api.post(`${API_ENDPOINTS.NOTIFICATIONS}mark-all-read/`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}${id}/`);
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Privacy & Security Settings
  getPrivacySettings: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRIVACY_SETTINGS);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updatePrivacySettings: async (settings) => {
    try {
      const response = await api.put(API_ENDPOINTS.PRIVACY_SETTINGS, settings);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Account Deletion
  deleteAccount: async (password) => {
    try {
      const response = await api.post(API_ENDPOINTS.DELETE_ACCOUNT, {
        password,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
