# 🧪 Backend Connection Test Checklist

Use this checklist to manually test all backend connections in the app.

## ✅ How to Test

1. Start the app with production backend
2. Go through each screen listed below
3. Check if data loads correctly
4. Mark ✅ when working, ❌ if broken

---

## 1. 🔐 Authentication Flow

- [ ] **Login** - Try logging in with valid credentials
- [ ] **Register** - Try creating a new account
  - [ ] OTP sent successfully
  - [ ] OTP verification works
  - [ ] Registration completes
- [ ] **Forgot Password** - Try resetting password
  - [ ] OTP sent for reset
  - [ ] OTP verified
  - [ ] Password reset successful
- [ ] **Auto-login** - Close and reopen app (should stay logged in)

---

## 2. 🏠 Home & Products

- [ ] **Home Screen**
  - [ ] Products load on launch
  - [ ] Pull-to-refresh works
  - [ ] Can navigate to product details
- [ ] **Search Screen**
  - [ ] Search by keyword works
  - [ ] Category filter works
  - [ ] Condition filter works
  - [ ] Price filter works
  - [ ] Results display correctly
- [ ] **Product Detail**
  - [ ] Product details load
  - [ ] Images display
  - [ ] Seller info shows
  - [ ] Can add to wishlist
  - [ ] "Contact Seller" button works
- [ ] **My Products** (Seller only)
  - [ ] Your products list loads
  - [ ] Can navigate to edit
  - [ ] Can delete product
- [ ] **Add Product** (Seller only)
  - [ ] Can pick images
  - [ ] Form validation works
  - [ ] Product creates successfully
- [ ] **Edit Product** (Seller only)
  - [ ] Product data loads in form
  - [ ] Can update product
  - [ ] Can delete images
- [ ] **Rate Product**
  - [ ] Can view existing ratings
  - [ ] Can submit new rating
  - [ ] Rating saves successfully

---

## 3. 🛒 Cart & Orders

- [ ] **Cart**
  - [ ] Items display (add from Home first)
  - [ ] Quantity controls work
  - [ ] Remove item works
  - [ ] Total calculates correctly
- [ ] **Checkout**
  - [ ] Delivery form displays
  - [ ] Payment method selection works
  - [ ] Order summary correct
  - [ ] Can place order
- [ ] **Payment** (if using Paystack)
  - [ ] Paystack page loads
  - [ ] Can complete payment
  - [ ] Redirects to confirmation
- [ ] **Order History**
  - [ ] Past orders load
  - [ ] Status filters work
  - [ ] Can tap to see details
- [ ] **Order Detail**
  - [ ] Order details display
  - [ ] Products list shows
  - [ ] Status updates visible

---

## 4. 💬 Messages

- [ ] **Messages List**
  - [ ] Threads load
  - [ ] User names display
  - [ ] Unread badges show
  - [ ] Can tap to open chat
- [ ] **Chat Screen**
  - [ ] Messages load
  - [ ] Can send message
  - [ ] Message displays immediately
  - [ ] Product card shows (if applicable)

---

## 5. 👤 Profile

- [ ] **Profile Screen**
  - [ ] User info loads
  - [ ] Stats display correctly
  - [ ] Menu items navigate properly
- [ ] **Edit Profile**
  - [ ] Current data pre-fills
  - [ ] Can update name
  - [ ] Can update bio
  - [ ] Changes save successfully
- [ ] **Change Password**
  - [ ] Current password validates
  - [ ] New password saves
  - [ ] Can login with new password
- [ ] **Wishlist**
  - [ ] Wishlist items load
  - [ ] Can remove items
  - [ ] Can navigate to products
- [ ] **Payment Methods**
  - [ ] Payment methods load
  - [ ] Can add new method
  - [ ] Can delete method
- [ ] **Delivery Addresses**
  - [ ] Addresses load
  - [ ] Can add new address
  - [ ] Can delete address
- [ ] **Seller Profile** (view other seller)
  - [ ] Seller info loads
  - [ ] Seller products display
  - [ ] Contact button works

---

## 6. ⚙️ Settings

- [ ] **Settings Screen** - All menu items navigate
- [ ] **Notifications** - Screen loads (data pending)
- [ ] **Privacy & Security** - Screen loads (static)
- [ ] **Language** - Screen loads, can select
- [ ] **Help & Support** - FAQ expands, links work
- [ ] **About** - Screen loads with app info

---

## 7. ⚖️ Legal

- [ ] **Privacy Policy** - Loads and displays
- [ ] **Terms of Service** - Loads and displays

---

## 🚨 Common Issues & Fixes

### Issue: "Network Error" on all screens
**Fix:**
1. Check internet connection
2. Verify backend URL in `src/constants/config.js`
3. Make sure you're using production URL for public WiFi

### Issue: "Authentication Error" or "Unauthorized"
**Fix:**
1. Logout and login again
2. Clear app data (uninstall/reinstall)
3. Check token expiry

### Issue: Images not loading
**Fix:**
1. Check image URLs in backend
2. Verify CORS settings allow images
3. Check network speed

### Issue: Some endpoints return 404
**Fix:**
1. Check backend is running latest version
2. Verify endpoint paths in config
3. Check Django URL patterns

---

## 📊 Expected Results

### All ✅ Checkboxes Marked?
**Excellent!** Your app is fully connected to the backend.

### Some ❌ Found?
**No problem!** Note which screens failed and check:
1. Backend error logs
2. Mobile app console logs
3. Network tab in dev tools
4. Endpoint definitions in config.js

---

## 🔧 Quick Debug Commands

### Check Backend Health
```bash
# Test if backend is accessible
curl https://unitradegh-backend-946167918479.europe-west1.run.app/api/products/
```

### Check Token
Open React Native Debugger Console:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('@unitrade_token').then(console.log);
```

### Check Network Requests
Enable Network Inspect in React Native Debugger to see all API calls.

---

**Happy Testing! 🚀**
