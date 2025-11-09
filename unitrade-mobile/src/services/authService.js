import api, { handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, APP_CONFIG } from '../constants/config';

export const authService = {
  // Send OTP to email
  sendOTP: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.SEND_OTP, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_OTP, { email, otp });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
      const { access, refresh, user } = response.data;

      // Store tokens and user data
      await AsyncStorage.multiSet([
        [APP_CONFIG.TOKEN_STORAGE_KEY, access],
        [APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY, refresh],
        [APP_CONFIG.USER_STORAGE_KEY, JSON.stringify(user)],
      ]);

      return { success: true, data: { user, access, refresh } };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        APP_CONFIG.TOKEN_STORAGE_KEY,
        APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
        APP_CONFIG.USER_STORAGE_KEY,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to logout' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.USER_ME);
      const user = response.data.user;
      
      // Update stored user data
      await AsyncStorage.setItem(APP_CONFIG.USER_STORAGE_KEY, JSON.stringify(user));
      
      return { success: true, data: user };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put(API_ENDPOINTS.USER_PROFILE, userData);
      const user = response.data.user;
      
      // Update stored user data
      await AsyncStorage.setItem(APP_CONFIG.USER_STORAGE_KEY, JSON.stringify(user));
      
      return { success: true, data: user };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Send password reset OTP
  sendPasswordResetOTP: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.PASSWORD_RESET_SEND_OTP, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Verify password reset OTP
  verifyPasswordResetOTP: async (email, otp) => {
    try {
      const response = await api.post(API_ENDPOINTS.PASSWORD_RESET_VERIFY_OTP, { email, otp });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post(API_ENDPOINTS.PASSWORD_RESET, {
        email,
        otp,
        new_password: newPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.TOKEN_STORAGE_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get stored user data
  getStoredUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem(APP_CONFIG.USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  },
};
