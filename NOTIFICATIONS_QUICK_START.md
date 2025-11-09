# 🔔 Push Notifications - Quick Start Guide

**TL;DR:** Complete guide to enable push notifications in UniTrade mobile app.

---

## 📱 **For Mobile App (React Native/Expo)**

### Step 1: Install Packages (2 minutes)

```bash
cd unitrade-mobile
npx expo install expo-notifications expo-device expo-constants
```

### Step 2: Wrap App with NotificationProvider (1 minute)

In `App.js`:

```javascript
import { NotificationProvider } from './src/contexts/NotificationContext';

// Wrap your app:
<NotificationProvider>
  <YourAppContent />
</NotificationProvider>
```

### Step 3: Test Notifications (5 minutes)

Add test button anywhere:

```javascript
import { useNotifications } from '../contexts/NotificationContext';

const { sendTestNotification } = useNotifications();

<Button onPress={sendTestNotification} title="Test Notification" />
```

**Done!** ✅ Frontend is ready.

---

## 🖥️ **For Django Backend**

### Step 1: Install Package (1 minute)

```bash
pip install requests
```

### Step 2: Create Models (5 minutes)

Copy from `PUSH_NOTIFICATIONS_BACKEND.md`:
- PushToken model
- NotificationLog model
- Run migrations

### Step 3: Add Views (5 minutes)

Add these endpoints:
- `POST /api/users/push-tokens/` - Save token
- `POST /api/users/push-tokens/remove/` - Remove token

### Step 4: Send Notifications (10 minutes)

When events happen:

```python
from users.services.push_notifications import PushNotificationService

# Example: New order
PushNotificationService.send_notification(
    user_id=seller_id,
    title='New Order! 🎉',
    body=f'{buyer_name} ordered {product_name}',
    data={
        'type': 'order',
        'orderId': str(order_id),
    }
)
```

**Done!** ✅ Backend is ready.

---

## 🧪 **Testing (5 minutes)**

### Option 1: Local Test
```javascript
// In app, press test button
sendTestNotification();
```

### Option 2: Expo Push Tool
1. Get token from app (displayed in ProfileScreen)
2. Go to: https://expo.dev/notifications
3. Paste token and send

### Option 3: Backend Test
```bash
curl -X POST http://localhost:8000/api/users/push-tokens/test/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ **What Works Now**

### Mobile App Side ✅
- Device token registration on login
- Automatic token removal on logout
- Notification handling when app is:
  - Open (foreground)
  - Closed (background)
  - Killed (not running)
- Navigation to correct screen when tapped
- Badge count management
- Sound and vibration

### Backend Side (After Implementation) ✅
- Token storage per user/device
- Send to specific users
- Send to multiple users (bulk)
- Track notification delivery
- Handle invalid tokens
- Notification logging

---

## 📋 **Notification Types & Navigation**

| Type | When | Navigates To |
|------|------|--------------|
| `order` | Order placed/updated | OrderDetail screen |
| `message` | New message | Chat screen |
| `payment` | Payment confirmed | OrderDetail screen |
| `product` | Product approved/reviewed | ProductDetail screen |
| `review` | New review received | ProductDetail screen |
| `system` | General notifications | Notifications screen |

---

## 🎯 **Events That Send Notifications**

Implement these in your Django backend:

### Orders
```python
# When buyer places order
notify_new_order(order)

# When order status changes
notify_order_status_update(order, 'shipped')

# When order delivered
notify_order_status_update(order, 'delivered')
```

### Messages
```python
# When new message received
notify_new_message(recipient, sender, thread)
```

### Products
```python
# When product gets review
notify_new_review(product, review)
```

### Payments
```python
# When payment confirmed
notify_payment_confirmed(order)
```

---

## 📱 **Physical Device Required**

⚠️ **Important:** Push notifications **ONLY work on physical devices**.

**Won't work on:**
- iOS Simulator ❌
- Android Emulator ❌

**Will work on:**
- iPhone connected via USB or WiFi ✅
- Android phone connected via USB or WiFi ✅

---

## 🚀 **Production Checklist**

Before going live:

- [ ] Test on iOS physical device
- [ ] Test on Android physical device
- [ ] Configure FCM for Android (Firebase)
- [ ] Configure APNs for iOS (Apple Developer)
- [ ] Test all notification types
- [ ] Test navigation from notifications
- [ ] Verify badge counts work
- [ ] Check notification permissions
- [ ] Test opt-out functionality
- [ ] Monitor notification logs
- [ ] Set up error tracking

---

## 📚 **Documentation Files**

| File | Purpose |
|------|---------|
| `PUSH_NOTIFICATIONS_SETUP.md` | Complete frontend guide |
| `PUSH_NOTIFICATIONS_BACKEND.md` | Complete backend guide |
| `NOTIFICATIONS_QUICK_START.md` | This file (quick reference) |

---

## 🆘 **Common Issues**

### "Must use physical device"
- **Fix:** Connect real phone via USB/WiFi

### Notifications not appearing
- **Check:** Permissions, internet, backend running

### Token registration fails
- **Check:** Device is physical, not emulator

### Navigation doesn't work
- **Check:** NotificationProvider wraps NavigationContainer

---

## 💡 **Tips**

1. **Start Simple** - Get local test notification working first
2. **Use Expo Tool** - Test with Expo push tool before backend
3. **Check Logs** - Use console.log to see token and events
4. **Physical Device** - Always test on real phone
5. **Permissions** - Ask for permissions at right time

---

## 📞 **Need Help?**

Check detailed docs:
- Frontend: `PUSH_NOTIFICATIONS_SETUP.md`
- Backend: `django-backend/PUSH_NOTIFICATIONS_BACKEND.md`

---

## ⏱️ **Total Time to Implement**

- **Frontend:** 10 minutes (already done!) ✅
- **Backend:** 30 minutes
- **Testing:** 15 minutes
- **Production:** 1-2 hours (app store setup)

**Total:** ~2 hours to fully working notifications! 🎉

---

**Status:** ✅ Frontend Complete, ⏳ Backend Pending  
**Last Updated:** November 5, 2025
