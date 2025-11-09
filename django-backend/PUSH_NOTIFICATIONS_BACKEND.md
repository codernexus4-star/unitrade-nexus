# 🔔 Django Backend - Push Notifications Implementation

This guide shows how to implement push notifications on the Django backend for the UniTrade mobile app.

---

## 📦 Installation

```bash
pip install requests
```

Add to `requirements.txt`:
```
requests==2.31.0
```

---

## 🗄️ Database Models

### 1. Create PushToken Model

**File:** `users/models.py`

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class PushToken(models.Model):
    """Store Expo push notification tokens for each user device"""
    
    DEVICE_TYPES = (
        ('ios', 'iOS'),
        ('android', 'Android'),
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='push_tokens'
    )
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'token')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.device_type} - {self.token[:20]}..."


class NotificationLog(models.Model):
    """Log all sent notifications for debugging"""
    
    NOTIFICATION_TYPES = (
        ('order', 'Order'),
        ('message', 'Message'),
        ('payment', 'Payment'),
        ('product', 'Product'),
        ('review', 'Review'),
        ('system', 'System'),
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notification_logs'
    )
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(null=True, blank=True)
    sent_to_tokens = models.IntegerField(default=0)
    successful = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.type} - {self.created_at}"
```

### 2. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 🔧 Notification Service

**File:** `users/services/push_notifications.py`

```python
import requests
import json
import logging
from typing import List, Dict, Optional
from users.models import PushToken, NotificationLog

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
EXPO_PUSH_RECEIPT_URL = 'https://exp.host/--/api/v2/push/getReceipts'

class PushNotificationService:
    """Service for sending Expo push notifications"""
    
    @staticmethod
    def validate_token(token: str) -> bool:
        """Validate if token is a valid Expo push token"""
        return token.startswith('ExponentPushToken[') or token.startswith('ExpoPushToken[')
    
    @staticmethod
    def send_notification(
        user_id: int,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        notification_type: str = 'system'
    ) -> Dict:
        """
        Send push notification to all user's devices
        
        Args:
            user_id: User ID to send notification to
            title: Notification title
            body: Notification body
            data: Additional data for navigation
            notification_type: Type of notification (order, message, etc.)
        
        Returns:
            Dict with success status and details
        """
        try:
            # Get all active tokens for user
            tokens = PushToken.objects.filter(
                user_id=user_id,
                is_active=True
            ).values_list('token', flat=True)
            
            if not tokens:
                logger.warning(f"No push tokens found for user {user_id}")
                return {
                    'success': False,
                    'message': 'No push tokens registered for user'
                }
            
            # Prepare messages
            messages = []
            for token in tokens:
                if PushNotificationService.validate_token(token):
                    message = {
                        'to': token,
                        'sound': 'default',
                        'title': title,
                        'body': body,
                        'data': data or {},
                        'badge': 1,
                        'priority': 'high',
                    }
                    messages.append(message)
            
            if not messages:
                return {
                    'success': False,
                    'message': 'No valid tokens found'
                }
            
            # Send to Expo
            response = requests.post(
                EXPO_PUSH_URL,
                headers={
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                data=json.dumps(messages),
                timeout=10
            )
            
            result = response.json()
            
            # Log notification
            NotificationLog.objects.create(
                user_id=user_id,
                type=notification_type,
                title=title,
                body=body,
                data=data,
                sent_to_tokens=len(messages),
                successful=response.status_code == 200,
                error_message=None if response.status_code == 200 else str(result)
            )
            
            # Handle errors
            if response.status_code != 200:
                logger.error(f"Expo push error: {result}")
                return {
                    'success': False,
                    'message': 'Failed to send push notification',
                    'details': result
                }
            
            # Check for invalid tokens
            data_results = result.get('data', [])
            for i, ticket in enumerate(data_results):
                if ticket.get('status') == 'error':
                    error_code = ticket.get('details', {}).get('error')
                    if error_code in ['DeviceNotRegistered', 'InvalidCredentials']:
                        # Mark token as inactive
                        token = list(tokens)[i]
                        PushToken.objects.filter(token=token).update(is_active=False)
                        logger.warning(f"Marked token as inactive: {token}")
            
            logger.info(f"Push notification sent to {len(messages)} devices for user {user_id}")
            
            return {
                'success': True,
                'message': 'Notification sent successfully',
                'sent_to': len(messages),
                'details': result
            }
            
        except Exception as e:
            logger.error(f"Error sending push notification: {str(e)}")
            return {
                'success': False,
                'message': str(e)
            }
    
    @staticmethod
    def send_bulk_notifications(
        user_ids: List[int],
        title: str,
        body: str,
        data: Optional[Dict] = None,
        notification_type: str = 'system'
    ) -> Dict:
        """Send notification to multiple users"""
        results = {
            'successful': 0,
            'failed': 0,
            'total': len(user_ids)
        }
        
        for user_id in user_ids:
            result = PushNotificationService.send_notification(
                user_id, title, body, data, notification_type
            )
            if result['success']:
                results['successful'] += 1
            else:
                results['failed'] += 1
        
        return results


# Convenience functions for common notification types

def notify_new_order(order):
    """Send notification when seller receives new order"""
    seller = order.product.seller
    return PushNotificationService.send_notification(
        user_id=seller.id,
        title='New Order! 🎉',
        body=f'{order.buyer.first_name} ordered {order.product.name}',
        data={
            'type': 'order',
            'orderId': str(order.id),
        },
        notification_type='order'
    )


def notify_order_status_update(order, status):
    """Notify buyer when order status changes"""
    status_messages = {
        'processing': 'Your order is being processed',
        'shipped': 'Your order has been shipped',
        'delivered': 'Your order has been delivered',
        'cancelled': 'Your order has been cancelled',
    }
    
    return PushNotificationService.send_notification(
        user_id=order.buyer.id,
        title='Order Update',
        body=status_messages.get(status, f'Order status: {status}'),
        data={
            'type': 'order',
            'orderId': str(order.id),
        },
        notification_type='order'
    )


def notify_new_message(recipient, sender, thread):
    """Notify when user receives new message"""
    return PushNotificationService.send_notification(
        user_id=recipient.id,
        title=f'New message from {sender.first_name}',
        body='Tap to view message',
        data={
            'type': 'message',
            'threadId': str(thread.id),
        },
        notification_type='message'
    )


def notify_payment_confirmed(order):
    """Notify buyer when payment is confirmed"""
    return PushNotificationService.send_notification(
        user_id=order.buyer.id,
        title='Payment Confirmed ✅',
        body=f'Payment for {order.product.name} was successful',
        data={
            'type': 'payment',
            'orderId': str(order.id),
        },
        notification_type='payment'
    )


def notify_new_review(product, review):
    """Notify seller when product gets new review"""
    return PushNotificationService.send_notification(
        user_id=product.seller.id,
        title='New Review ⭐',
        body=f'Your product "{product.name}" received a {review.rating}-star review',
        data={
            'type': 'review',
            'productId': str(product.id),
        },
        notification_type='review'
    )
```

---

## 🔌 API Views

**File:** `users/views.py`

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import PushToken
from users.services.push_notifications import PushNotificationService

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_push_token(request):
    """Save user's push notification token"""
    token = request.data.get('token')
    device_type = request.data.get('device_type', 'android')
    
    if not token:
        return Response(
            {'success': False, 'message': 'Token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate token format
    if not PushNotificationService.validate_token(token):
        return Response(
            {'success': False, 'message': 'Invalid token format'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create or update token
        push_token, created = PushToken.objects.update_or_create(
            user=request.user,
            token=token,
            defaults={
                'device_type': device_type,
                'is_active': True
            }
        )
        
        return Response({
            'success': True,
            'message': 'Token saved successfully',
            'created': created
        })
    
    except Exception as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_push_token(request):
    """Remove user's push notification token"""
    token = request.data.get('token')
    
    if not token:
        return Response(
            {'success': False, 'message': 'Token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        deleted_count = PushToken.objects.filter(
            user=request.user,
            token=token
        ).delete()[0]
        
        return Response({
            'success': True,
            'message': 'Token removed successfully',
            'deleted': deleted_count
        })
    
    except Exception as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    """Send test notification to user (for development)"""
    result = PushNotificationService.send_notification(
        user_id=request.user.id,
        title='Test Notification',
        body='This is a test notification from UniTrade!',
        data={'type': 'test'},
        notification_type='system'
    )
    
    return Response(result)
```

---

## 🔗 URLs

**File:** `users/urls.py`

```python
from django.urls import path
from .views import (
    save_push_token,
    remove_push_token,
    send_test_notification
)

urlpatterns = [
    # ... existing URLs ...
    
    # Push Notifications
    path('push-tokens/', save_push_token, name='save_push_token'),
    path('push-tokens/remove/', remove_push_token, name='remove_push_token'),
    path('push-tokens/test/', send_test_notification, name='test_notification'),
]
```

---

## 🎯 Integration Examples

### 1. Send Notification When Order is Created

**File:** `orders/views.py`

```python
from users.services.push_notifications import notify_new_order

class OrderViewSet(viewsets.ModelViewSet):
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        # Send notification to seller
        order = self.get_object()
        notify_new_order(order)
        
        return response
```

### 2. Send Notification When Order Status Changes

**File:** `orders/views.py`

```python
from users.services.push_notifications import notify_order_status_update

@action(detail=True, methods=['post'])
def update_status(self, request, pk=None):
    order = self.get_object()
    new_status = request.data.get('status')
    
    order.status = new_status
    order.save()
    
    # Notify buyer
    notify_order_status_update(order, new_status)
    
    return Response({'success': True})
```

### 3. Send Notification When Message is Received

**File:** `messaging/views.py`

```python
from users.services.push_notifications import notify_new_message

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

---

## 🧪 Testing

### Test Endpoint

```bash
# Save token
curl -X POST http://localhost:8000/api/users/push-tokens/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "device_type": "android"
  }'

# Send test notification
curl -X POST http://localhost:8000/api/users/push-tokens/test/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Database

```python
# Django shell
python manage.py shell

from users.models import PushToken, NotificationLog

# View tokens
PushToken.objects.all()

# View notification logs
NotificationLog.objects.all()

# Send manual test
from users.services.push_notifications import PushNotificationService

PushNotificationService.send_notification(
    user_id=1,
    title='Test',
    body='Hello from Django!',
    data={'type': 'test'}
)
```

---

## ✅ Implementation Checklist

- [ ] Install `requests` package
- [ ] Create PushToken and NotificationLog models
- [ ] Run migrations
- [ ] Create `push_notifications.py` service
- [ ] Add views for token management
- [ ] Update URLs
- [ ] Test token registration
- [ ] Test sending notifications
- [ ] Integrate with orders
- [ ] Integrate with messages
- [ ] Integrate with products
- [ ] Set up logging
- [ ] Test on physical device

---

## 📊 Monitoring & Analytics

Add to Django Admin:

```python
# users/admin.py
from django.contrib import admin
from .models import PushToken, NotificationLog

@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_type', 'is_active', 'created_at')
    list_filter = ('device_type', 'is_active', 'created_at')
    search_fields = ('user__email', 'token')

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'successful', 'created_at')
    list_filter = ('type', 'successful', 'created_at')
    search_fields = ('user__email', 'title', 'body')
    readonly_fields = ('created_at',)
```

---

## 🔒 Security Notes

1. ✅ Always validate tokens before saving
2. ✅ Mark invalid tokens as inactive
3. ✅ Log all notification sends
4. ✅ Rate limit notification endpoints
5. ✅ Don't send sensitive data in notifications
6. ✅ Implement user opt-out preferences

---

**Status:** Ready for Implementation  
**Last Updated:** November 5, 2025
