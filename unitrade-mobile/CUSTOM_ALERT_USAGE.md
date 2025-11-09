# Custom Alert System - Usage Guide

## Overview
The UniTrade mobile app now uses a beautiful custom alert system that matches the brand design with gradients, icons, and smooth animations.

## Features
- ✅ Brand-consistent design (Navy Blue, Vibrant Blue, Golden Yellow)
- ✅ Animated entrance/exit
- ✅ Icon-based alert types (Success, Error, Warning, Info, Confirm)
- ✅ Gradient buttons
- ✅ Customizable buttons
- ✅ Backdrop dismissal

## Alert Types

### 1. Success Alert (Green)
```javascript
import { showSuccess } from '../utils/alert';

showSuccess('Success!', 'Your order has been placed successfully.', () => {
  // Optional callback when user taps OK
  navigation.navigate('OrderHistory');
});
```

### 2. Error Alert (Red)
```javascript
import { showError } from '../utils/alert';

showError('Error', 'Failed to load product', () => {
  // Optional callback
  navigation.goBack();
});
```

### 3. Warning Alert (Orange)
```javascript
import { showWarning } from '../utils/alert';

showWarning('Warning', 'This action cannot be undone');
```

### 4. Info Alert (Blue)
```javascript
import { showInfo } from '../utils/alert';

showInfo('Coming Soon', 'This feature will be available soon!');
```

### 5. Confirmation Alert
```javascript
import { showConfirm } from '../utils/alert';

showConfirm(
  'Confirm Action',
  'Are you sure you want to proceed?',
  () => {
    // User confirmed
    console.log('Confirmed');
  },
  () => {
    // User cancelled
    console.log('Cancelled');
  }
);
```

### 6. Destructive Confirmation (Delete/Logout)
```javascript
import { showDestructiveConfirm } from '../utils/alert';

showDestructiveConfirm(
  'Logout',
  'Are you sure you want to logout?',
  'Logout', // Button text
  () => {
    // User confirmed
    logout();
  },
  () => {
    // User cancelled (optional)
  }
);
```

## Advanced Usage

### Custom Alert with Multiple Buttons
```javascript
import { CustomAlert } from '../components/CustomAlert';

CustomAlert.show({
  type: 'info', // success, error, warning, info, confirm
  title: 'Choose an Option',
  message: 'What would you like to do?',
  buttons: [
    { 
      text: 'Cancel', 
      style: 'cancel',
      onPress: () => console.log('Cancelled')
    },
    { 
      text: 'Delete', 
      style: 'destructive',
      onPress: () => console.log('Deleted')
    },
    { 
      text: 'Save',
      onPress: () => console.log('Saved')
    },
  ],
  cancelable: true, // Allow dismissing by tapping backdrop
});
```

## Integration in Screens

The CustomAlertComponent is already added to `App.js` at the root level, so it's available throughout the entire app.

### Example: CartScreen
```javascript
import { showDestructiveConfirm } from '../../utils/alert';

const removeItem = (itemId) => {
  showDestructiveConfirm(
    'Remove Item',
    'Are you sure you want to remove this item from cart?',
    'Remove',
    () => {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    }
  );
};
```

### Example: CheckoutScreen
```javascript
import { showError, showSuccess } from '../../utils/alert';

const handlePlaceOrder = async () => {
  if (!deliveryAddress.trim()) {
    showError('Error', 'Please enter a delivery address');
    return;
  }

  const result = await orderService.createOrder(orderData);
  
  if (result.success) {
    showSuccess(
      'Order Placed!',
      'Your order has been placed successfully.',
      () => navigation.navigate('OrderHistory')
    );
  } else {
    showError('Error', result.error || 'Failed to place order');
  }
};
```

## Button Styles

- **Primary Button**: Gradient button (default for main action)
- **Cancel Button**: White background with text (style: 'cancel')
- **Destructive Button**: Red text for dangerous actions (style: 'destructive')

## Customization

To customize colors or icons, edit:
- `src/components/CustomAlert.js` - Main component
- `src/utils/alert.js` - Helper functions

## Screens Updated

✅ CartScreen - Remove item confirmation
✅ CheckoutScreen - Form validation, order success/error
✅ ProductDetailScreen - Error handling, contact seller
✅ ProfileScreen - Logout confirmation, "Coming soon" messages

## Migration from Alert

Replace:
```javascript
// Old way
import { Alert } from 'react-native';
Alert.alert('Title', 'Message');

// New way
import { showInfo } from '../utils/alert';
showInfo('Title', 'Message');
```

## Notes

- The alert component is rendered at the root level in `App.js`
- All alerts are non-blocking and use React Native's Modal
- Animations use React Native's Animated API
- The backdrop can be tapped to dismiss (if cancelable is true)
