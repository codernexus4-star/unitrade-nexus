# 🔔 Push Notifications Implementation Guide
**UniTrade Mobile App**

This guide explains how to implement and test push notifications in your app.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Frontend Setup](#frontend-setup)
4. [Backend Requirements](#backend-requirements)
5. [Testing](#testing)
6. [Production Setup](#production-setup)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What We've Implemented:

✅ **notificationService.js** - Complete push notification service
✅ **NotificationContext.js** - App-wide notification management
✅ **Device token registration** - Auto-register on login
✅ **Notification handling** - Handle taps and navigation
✅ **Badge management** - Update app badge counts
✅ **Local notifications** - For testing

### Notification Types Supported:
- 📦 **Order** - Order updates (placed, shipped, delivered)
- 💬 **Message** - New messages from buyers/sellers
- 💳 **Payment** - Payment confirmations
- 📦 **Product** - Product updates (approved, rejected)
- ⭐ **Review** - New product reviews
- 🔔 **System** - General system notifications

---

## 📦 Installation

### Step 1: Install Required Packages

```bash
cd unitrade-mobile
npx expo install expo-notifications expo-device expo-constants
```

### Step 2: Update app.json

Add notification permissions to your `app.json`:

```json
{
  "expo": {
    "name": "UniTrade",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#003366",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#003366",
      "androidMode": "default",
      "androidCollapsedTitle": "{{unread_count}} new notifications"
    },
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK"
      ],
      "useNextNotificationsApi": true
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    }
  }
}
```

### Step 3: Create Notification Icon (Android)

Create `assets/notification-icon.png`:
- Size: 96x96 pixels
- White icon on transparent background
- No colors (will be tinted by Android)

---

## 🔧 Frontend Setup

### Step 1: Import NotificationProvider

Update your `App.js`:

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <NotificationProvider>
            <MainNavigator />
          </NotificationProvider>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
```

### Step 2: Use Notifications in Screens

Add test button to ProfileScreen or SettingsScreen:

```javascript
import { useNotifications } from '../../contexts/NotificationContext';

const ProfileScreen = () => {
  const { sendTestNotification, expoPushToken } = useNotifications();

  // In your render:
  return (
    <View>
      {/* Your existing code */}
      
      {__DEV__ && (
        <TouchableOpacity onPress={sendTestNotification}>
          <Text>Send Test Notification</Text>
        </TouchableOpacity>
      )}
      
      {expoPushToken && (
        <Text style={styles.tokenText}>
          Token: {expoPushToken.substring(0, 20)}...
        </Text>
      )}
    </View>
  );
};
```

### Step 3: Badge Count Management

The NotificationContext automatically:
- ✅ Registers device token on login
- ✅ Unregisters token on logout
- ✅ Updates badge count when notifications arrive
- ✅ Clears badge when app comes to foreground
- ✅ Navigates to correct screen when notification tapped

---

## 🖥️ Backend Requirements

Your Django backend needs these endpoints:

### 1. Save Push Token

**Endpoint:** `POST /users/push-tokens/`

**Request:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxx]",
  "device_type": "ios" // or "android"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token saved successfully"
}
```

**Django Model Example:**
```python
# users/models.py
class PushToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_tokens')
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=10, choices=[('ios', 'iOS'), ('android', 'Android')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'token')
```

### 2. Remove Push Token

**Endpoint:** `POST /users/push-tokens/remove/`

**Request:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxx]"
}
```

### 3. Send Push Notification (Backend Service)

**Python Example using Expo Push API:**

```python
# users/utils/push_notifications.py
import requests
import json

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

def send_push_notification(tokens, title, body, data=None):
    """
    Send push notification to multiple devices
    
    Args:
        tokens: List of Expo push tokens
        title: Notification title
        body: Notification body
        data: Additional data (dict) - used for navigation
    """
    messages = []
    
    for token in tokens:
        message = {
            'to': token,
            'sound': 'default',
            'title': title,
            'body': body,
            'data': data or {},
            'badge': 1,
        }
        messages.append(message)
    
    try:
        response = requests.post(
            EXPO_PUSH_URL,
            headers={
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            data=json.dumps(messages)
        )
        return response.json()
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return None

# Usage example:
def notify_order_placed(order):
    """Send notification when order is placed"""
    seller_tokens = PushToken.objects.filter(
        user=order.product.seller,
        is_active=True
    ).values_list('token', flat=True)
    
    send_push_notification(
        tokens=list(seller_tokens),
        title='New Order! 🎉',
        body=f'{order.buyer.first_name} placed an order for {order.product.name}',
        data={
            'type': 'order',
            'orderId': str(order.id),
        }
    )
```

### 4. Notification Events to Implement

Send push notifications for these events:

**Orders:**
```python
# When buyer places order
notify_new_order(seller, order)

# When order status changes
notify_order_status_update(buyer, order, status)

# When order is delivered
notify_order_delivered(buyer, order)
```

**Messages:**
```python
# When new message received
notify_new_message(recipient, sender, thread)
```

**Products:**
```python
# When product is approved
notify_product_approved(seller, product)

# When product gets new review
notify_new_review(seller, product, review)
```

**Payments:**
```python
# When payment is confirmed
notify_payment_confirmed(buyer, order)

# When payment fails
notify_payment_failed(buyer, order)
```

---

## 🧪 Testing

### Option 1: Test with Local Notifications

Add this button to any screen:

```javascript
import { useNotifications } from '../contexts/NotificationContext';

const TestButton = () => {
  const { sendTestNotification } = useNotifications();
  
  return (
    <TouchableOpacity onPress={sendTestNotification}>
      <Text>Send Test Notification</Text>
    </TouchableOpacity>
  );
};
```

### Option 2: Test with Expo Push Tool

1. Get your Expo Push Token from the app (displayed in ProfileScreen)
2. Go to: https://expo.dev/notifications
3. Enter your token
4. Enter title and message
5. Click "Send a Notification"

### Option 3: Test with Backend

Create a test endpoint:

```python
# users/views.py
@api_view(['POST'])
def send_test_notification(request):
    user = request.user
    tokens = PushToken.objects.filter(
        user=user,
        is_active=True
    ).values_list('token', flat=True)
    
    send_push_notification(
        tokens=list(tokens),
        title='Test Notification',
        body='This is a test from Django backend!',
        data={'type': 'test'}
    )
    
    return Response({'success': True})
```

### Testing Checklist

- [ ] Notification appears when app is open
- [ ] Notification appears when app is closed
- [ ] Notification appears when app is in background
- [ ] Tapping notification opens correct screen
- [ ] Badge count updates correctly
- [ ] Badge clears when app is opened
- [ ] Sound plays (if enabled)
- [ ] Token saved to backend
- [ ] Token removed on logout
- [ ] Multiple devices per user work
- [ ] iOS notifications work
- [ ] Android notifications work

---

## 🚀 Production Setup

### Step 1: Configure EAS Build

Update `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-backend.com/api"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Step 2: Get FCM Server Key (Android)

1. Go to Firebase Console
2. Create a project
3. Add Android app
4. Get Server Key from Cloud Messaging settings
5. Add to Expo:
   ```bash
   eas credentials
   ```

### Step 3: Configure APNs (iOS)

1. Create Apple Developer account
2. Generate APNs key
3. Upload to Expo:
   ```bash
   eas credentials
   ```

### Step 4: Build for Production

```bash
# Build for both platforms
eas build --platform all --profile production

# Or separately
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Step 5: Test Production Builds

1. Install production build on device
2. Test all notification types
3. Verify token registration
4. Check backend logs

---

## 🐛 Troubleshooting

### "Must use physical device for Push Notifications"

**Problem:** Push notifications don't work on emulators.

**Solution:** Test on physical device connected via USB or WiFi.

### Notifications not appearing

**Check:**
1. Device has internet connection
2. App has notification permissions
3. Token is saved in backend
4. Backend is sending notifications
5. App is not blocking notifications (device settings)

### Token registration fails

**Check:**
1. Expo project is properly configured
2. App is running on physical device
3. User granted notification permissions
4. Backend endpoint is accessible

### Badge not updating

**Check:**
1. Badge permissions granted
2. NotificationContext is properly wrapped around app
3. App state listener is working

### Navigation not working

**Check:**
1. NotificationContext has access to navigation
2. Navigation structure matches notification data
3. Screen names are correct

---

## 📱 Device-Specific Notes

### iOS
- Requires Apple Developer account for production
- Must request permission explicitly
- Badge updates automatically
- Rich notifications supported
- Sound must be in correct format

### Android
- Works without Google Play Services
- Notification channels required
- Badge support varies by launcher
- Expanded notifications supported
- Custom sounds supported

---

## 🔒 Security Best Practices

1. ✅ **Validate tokens** on backend before saving
2. ✅ **Expire old tokens** periodically
3. ✅ **Rate limit** notification sending
4. ✅ **Encrypt sensitive data** in notifications
5. ✅ **Don't send passwords** or sensitive info
6. ✅ **Implement opt-out** for notification types
7. ✅ **Log notification delivery** for debugging
8. ✅ **Handle failed deliveries** gracefully

---

## 📊 Analytics & Monitoring

Track these metrics:
- Token registration success rate
- Notification delivery rate
- Notification open rate
- Navigation success rate
- Error rates

---

## ✅ Next Steps

1. [ ] Install required packages
2. [ ] Update app.json
3. [ ] Wrap app with NotificationProvider
4. [ ] Implement backend endpoints
5. [ ] Test on physical device
6. [ ] Implement notification triggers
7. [ ] Test all notification types
8. [ ] Configure for production
9. [ ] Submit to app stores

---

## 📚 Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [APNs Documentation](https://developer.apple.com/documentation/usernotifications)

---

**Implementation Status:** ✅ Frontend Complete  
**Backend Status:** ⚠️ Needs Implementation  
**Testing Status:** 📱 Ready for Physical Device Testing  

---

Need help? Check the troubleshooting section or contact the development team!
