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
    from orders.models import Order
    
    seller = order.product.seller
    buyer_name = f"{order.buyer.first_name} {order.buyer.last_name}"
    
    return PushNotificationService.send_notification(
        user_id=seller.id,
        title='New Order! 🎉',
        body=f'{buyer_name} ordered {order.product.name}',
        data={
            'type': 'order',
            'orderId': str(order.id),
        },
        notification_type='order'
    )


def notify_order_status_update(order, status):
    """Notify buyer when order status changes"""
    from orders.models import Order
    
    status_messages = {
        'processing': 'Your order is being processed',
        'shipped': 'Your order has been shipped 📦',
        'delivered': 'Your order has been delivered ✅',
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
    sender_name = f"{sender.first_name} {sender.last_name}"
    
    return PushNotificationService.send_notification(
        user_id=recipient.id,
        title=f'New message from {sender_name} 💬',
        body='Tap to view message',
        data={
            'type': 'message',
            'threadId': str(thread.id),
        },
        notification_type='message'
    )


def notify_payment_confirmed(order):
    """Notify buyer when payment is confirmed"""
    from orders.models import Order
    
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


def notify_product_approved(product):
    """Notify seller when product is approved"""
    return PushNotificationService.send_notification(
        user_id=product.seller.id,
        title='Product Approved ✅',
        body=f'Your product "{product.name}" has been approved and is now live!',
        data={
            'type': 'product',
            'productId': str(product.id),
        },
        notification_type='product'
    )
