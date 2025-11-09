import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const appState = useRef(AppState.currentState);

  // Register for push notifications when user logs in
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync();
    } else {
      // Unregister when user logs out
      if (expoPushToken) {
        unregisterPushToken();
      }
    }

    return () => {
      if (expoPushToken) {
        unregisterPushToken();
      }
    };
  }, [user]);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
        setNotification(notification);
        
        // Update badge count
        updateBadgeCount();
      }
    );

    // Listener for when user taps on notification
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    // Listen for app state changes (foreground/background)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      notificationService.removeNotificationSubscription(notificationListener.current);
      notificationService.removeNotificationSubscription(responseListener.current);
      subscription?.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to foreground - clear badge
      console.log('App came to foreground');
      await notificationService.clearBadge();
    }
    appState.current = nextAppState;
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      const result = await notificationService.registerForPushNotifications();
      
      if (result.success && result.token) {
        setExpoPushToken(result.token);
        console.log('✅ Push token obtained:', result.token);
        
        // Save token to backend
        const saveResult = await notificationService.savePushToken(result.token);
        if (saveResult.success) {
          console.log('✅ Token saved to backend');
        } else {
          console.log('⚠️ Failed to save token to backend:', saveResult.message);
        }
      } else {
        console.log('⚠️ Push notification registration failed:', result.message);
      }
    } catch (error) {
      console.error('Error in registerForPushNotificationsAsync:', error);
    }
  };

  const unregisterPushToken = async () => {
    if (expoPushToken) {
      await notificationService.removePushToken(expoPushToken);
      setExpoPushToken('');
      console.log('✅ Push token unregistered');
    }
  };

  const handleNotificationNavigation = (data) => {
    if (!data) return;

    try {
      // Navigate based on notification type
      switch (data.type) {
        case 'order':
          if (data.orderId) {
            navigation.navigate('Profile', {
              screen: 'OrderDetail',
              params: { orderId: data.orderId },
            });
          } else {
            navigation.navigate('Profile', { screen: 'OrderHistory' });
          }
          break;

        case 'message':
          if (data.threadId) {
            navigation.navigate('Messages', {
              screen: 'Chat',
              params: { threadId: data.threadId },
            });
          } else {
            navigation.navigate('Messages');
          }
          break;

        case 'product':
          if (data.productId) {
            navigation.navigate('ProductDetail', { productId: data.productId });
          } else {
            navigation.navigate('Home');
          }
          break;

        case 'review':
          if (data.productId) {
            navigation.navigate('ProductDetail', { productId: data.productId });
          }
          break;

        case 'payment':
          if (data.orderId) {
            navigation.navigate('Profile', {
              screen: 'OrderDetail',
              params: { orderId: data.orderId },
            });
          }
          break;

        default:
          // Default to notifications screen
          navigation.navigate('Profile', { screen: 'Notifications' });
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const updateBadgeCount = async () => {
    // You can fetch unread count from your backend here
    // For now, we'll just increment
    const result = await notificationService.getBadgeCount();
    if (result.success) {
      await notificationService.setBadgeCount(result.count + 1);
    }
  };

  // Send a test notification (for development)
  const sendTestNotification = async () => {
    await notificationService.sendLocalNotification(
      'Test Notification',
      'This is a test notification from UniTrade!',
      { type: 'test' }
    );
  };

  const value = {
    expoPushToken,
    notification,
    sendTestNotification,
    registerForPushNotifications: registerForPushNotificationsAsync,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
