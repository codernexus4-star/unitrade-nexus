import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api, { handleApiError } from './api';
import { API_ENDPOINTS } from '../constants/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Register for push notifications and get token
  registerForPushNotifications: async () => {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return { success: false, message: 'Must use physical device for Push Notifications' };
      }

      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { success: false, message: 'Permission not granted for push notifications' };
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.log('Project ID not found. Using default Expo token.');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });

      console.log('Push notification token:', token.data);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return { success: true, token: token.data };
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return { success: false, message: error.message };
    }
  },

  // Save push token to backend
  savePushToken: async (token) => {
    try {
      const response = await api.post(API_ENDPOINTS.SAVE_PUSH_TOKEN, {
        token,
        device_type: Platform.OS,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Remove push token from backend (on logout)
  removePushToken: async (token) => {
    try {
      const response = await api.post(API_ENDPOINTS.REMOVE_PUSH_TOKEN, {
        token,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Send local notification (for testing)
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
        },
        trigger: null, // Show immediately
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending local notification:', error);
      return { success: false, message: error.message };
    }
  },

  // Schedule notification for later
  scheduleNotification: async (title, body, seconds, data = {}) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          badge: 1,
        },
        trigger: {
          seconds,
        },
      });
      return { success: true, notificationId: id };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, message: error.message };
    }
  },

  // Cancel scheduled notification
  cancelNotification: async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cancel all scheduled notifications
  cancelAllNotifications: async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get badge count
  getBadgeCount: async () => {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return { success: true, count };
    } catch (error) {
      return { success: false, count: 0 };
    }
  },

  // Set badge count
  setBadgeCount: async (count) => {
    try {
      await Notifications.setBadgeCountAsync(count);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Clear badge
  clearBadge: async () => {
    try {
      await Notifications.setBadgeCountAsync(0);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Add notification received listener
  addNotificationReceivedListener: (handler) => {
    return Notifications.addNotificationReceivedListener(handler);
  },

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener: (handler) => {
    return Notifications.addNotificationResponseReceivedListener(handler);
  },

  // Remove listeners
  removeNotificationSubscription: (subscription) => {
    if (subscription) {
      subscription.remove();
    }
  },
};
