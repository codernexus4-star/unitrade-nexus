# 🔔 Django Backend - Push Notifications Setup

## ✅ What Was Implemented

All backend code for push notifications has been added:

### 1. Models Added (`users/models.py`)
- ✅ `PushToken` - Store device tokens
- ✅ `NotificationLog` - Log all sent notifications

### 2. Service Created (`users/services/push_notifications.py`)
- ✅ `PushNotificationService` - Core service class
- ✅ Helper functions for common notifications:
  - `notify_new_order(order)`
  - `notify_order_status_update(order, status)`
  - `notify_new_message(recipient, sender, thread)`
  - `notify_payment_confirmed(order)`
  - `notify_new_review(product, review)`
  - `notify_product_approved(product)`

### 3. API Views Added (`users/views.py`)
- ✅ `SavePushTokenView` - POST /api/users/push-tokens/
- ✅ `RemovePushTokenView` - POST /api/users/push-tokens/remove/
- ✅ `SendTestNotificationView` - POST /api/users/push-tokens/test/

### 4. URLs Added (`users/urls.py`)
- ✅ All push notification endpoints registered

### 5. Admin Interface (`users/admin.py`)
- ✅ PushToken admin with actions
- ✅ NotificationLog admin (read-only)

---

## 🚀 Setup Instructions

### Step 1: Install Requirements

Add to your `requirements.txt`:
```
requests==2.31.0
```

Then install:
```bash
pip install requests
```

### Step 2: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

Expected output:
```
Migrations for 'users':
  users/migrations/0XXX_auto_YYYYMMDD_HHMM.py
    - Create model PushToken
    - Create model NotificationLog
```

### Step 3: Test the Setup

```bash
# Start Django server
python manage.py runserver 0.0.0.0:8000
```

### Step 4: Test API Endpoints

**Test from mobile app or use curl:**

```bash
# Save token (replace TOKEN with actual JWT)
curl -X POST http://localhost:8000/api/users/push-tokens/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "device_type": "android"
  }'

# Send test notification
curl -X POST http://localhost:8000/api/users/push-tokens/test/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 How to Use in Your Code

### Example 1: Send Notification When Order is Created

In `orders/views.py`:

```python
from users.services import notify_new_order

class OrderViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        # Get the created order
        order = self.get_object()
        
        # Send notification to seller
        notify_new_order(order)
        
        return response
```

### Example 2: Send Notification When Order Status Changes

In `orders/views.py`:

```python
from users.services import notify_order_status_update

@action(detail=True, methods=['post'])
def update_status(self, request, pk=None):
    order = self.get_object()
    new_status = request.data.get('status')
    
    # Update status
    order.status = new_status
    order.save()
    
    # Notify buyer
    notify_order_status_update(order, new_status)
    
    return Response({'success': True, 'message': 'Status updated'})
```

### Example 3: Send Notification When New Message

In `messaging/views.py`:

```python
from users.services import notify_new_message

class MessageViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        # Get message and thread
        message = self.get_object()
        thread = message.thread
        
        # Determine recipient
        recipient = thread.seller if thread.buyer == request.user else thread.buyer
        
        # Send notification
        notify_new_message(recipient, request.user, thread)
        
        return response
```

### Example 4: Custom Notification

```python
from users.services import PushNotificationService

# Send custom notification
PushNotificationService.send_notification(
    user_id=user.id,
    title='Welcome! 🎉',
    body='Thanks for joining UniTrade!',
    data={
        'type': 'system',
        'screen': 'Home'
    },
    notification_type='system'
)
```

### Example 5: Bulk Notifications

```python
from users.services import PushNotificationService

# Send to multiple users
user_ids = [1, 2, 3, 4, 5]
result = PushNotificationService.send_bulk_notifications(
    user_ids=user_ids,
    title='New Feature! 🚀',
    body='Check out our new marketplace feature',
    data={'type': 'system'},
    notification_type='system'
)

print(f"Sent: {result['successful']}/{result['total']}")
```

---

## 🧪 Testing Checklist

- [ ] Migrations ran successfully
- [ ] PushToken and NotificationLog visible in Django admin
- [ ] Can save push token via API
- [ ] Can send test notification via API
- [ ] Test notification appears on mobile device
- [ ] Can view tokens in admin panel
- [ ] Can view notification logs in admin panel
- [ ] Tokens properly deactivated when invalid
- [ ] Multiple devices per user work correctly

---

## 📊 Django Admin Features

### PushToken Admin
- View all registered tokens
- Filter by device type, active status, date
- Search by user email/name
- Bulk activate/deactivate tokens
- View token preview

### NotificationLog Admin
- View all sent notifications
- Filter by type, success status, date
- Search by user, title, body
- Read-only (no manual creation/editing)
- View full notification data

---

## 🔍 Monitoring & Debugging

### View Tokens in Django Shell

```python
python manage.py shell

from users.models import PushToken, NotificationLog

# View all tokens
PushToken.objects.all()

# View tokens for specific user
PushToken.objects.filter(user__email='user@example.com')

# View recent notifications
NotificationLog.objects.all()[:10]

# Check failed notifications
NotificationLog.objects.filter(successful=False)
```

### Send Test Notification from Shell

```python
from users.services import PushNotificationService

PushNotificationService.send_notification(
    user_id=1,
    title='Test from Shell',
    body='This is a test notification',
    data={'type': 'test'}
)
```

---

## 🚨 Common Issues & Solutions

### Issue: "No push tokens found for user"
**Solution:** User hasn't logged in from mobile app or token not saved yet.

### Issue: Notifications not appearing on device
**Check:**
1. Token is saved in database
2. Token is marked as `is_active=True`
3. Django can reach Expo servers (check firewall)
4. Mobile app has notification permissions

### Issue: "Invalid token format"
**Solution:** Ensure token starts with `ExponentPushToken[` or `ExpoPushToken[`

### Issue: Tokens marked as inactive
**This is expected** when:
- App is uninstalled
- User logs out
- Device changes
- Token expires

---

## 🔒 Security Notes

1. ✅ All endpoints require authentication
2. ✅ Tokens are validated before saving
3. ✅ Invalid tokens automatically deactivated
4. ✅ All notifications logged for audit
5. ✅ User can only delete their own tokens

---

## 📈 Performance Considerations

- Notifications sent asynchronously (no blocking)
- Invalid tokens automatically cleaned up
- Bulk operations supported
- Efficient database queries
- Proper indexing on models

---

## ✅ Integration Points

Where to add notification triggers:

### Orders App
- Order created → Notify seller
- Order status changed → Notify buyer
- Order delivered → Notify buyer

### Products App
- Product approved → Notify seller
- New review → Notify seller

### Messaging App
- New message → Notify recipient

### Payments App
- Payment confirmed → Notify buyer
- Payment failed → Notify buyer

---

## 🎉 You're Done!

Push notifications backend is fully implemented and ready to use!

**Next Steps:**
1. Run migrations
2. Test with mobile app
3. Add notification triggers to your events
4. Monitor in Django admin

---

**Status:** ✅ Complete  
**Last Updated:** November 5, 2025
