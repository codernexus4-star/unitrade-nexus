# 🐛 Bug Testing Checklist - UniTrade Mobile App

**Date:** November 5, 2025  
**Status:** Ready for Testing  
**Tester:** _____________________

---

## 🎯 Testing Approach

Mark each item as:
- ✅ Pass - Works correctly
- ❌ Fail - Bug found (describe below)
- ⏭️ Skip - Not applicable

---

## 1️⃣ **Authentication Flow** (Critical)

### Registration
- [ ] User can register with email
- [ ] OTP is sent to email
- [ ] OTP verification works
- [ ] Can select university/campus
- [ ] Can choose role (Buyer/Seller)
- [ ] Profile details saved correctly
- [ ] Redirects to appropriate home screen

### Login
- [ ] Can login with email/password
- [ ] Error shown for wrong credentials
- [ ] Token saved and persists
- [ ] Auto-login works on app restart
- [ ] Buyer sees buyer interface
- [ ] Seller sees seller interface

### Password Reset
- [ ] Can request password reset
- [ ] OTP sent for reset
- [ ] Can verify OTP
- [ ] Can set new password
- [ ] Can login with new password

### Logout
- [ ] Logout clears session
- [ ] Redirects to login screen
- [ ] Cannot access protected screens after logout

**Bugs Found:**
```
[List any bugs here]
```

---

## 2️⃣ **Product Management** (Critical)

### Browse Products (Buyer)
- [ ] Products load on home screen
- [ ] Can filter by category
- [ ] Search works correctly
- [ ] Product images display
- [ ] Product details show correctly
- [ ] Prices display in Ghana Cedis (GH₵)
- [ ] Can view product details
- [ ] Pull-to-refresh works

### Product CRUD (Seller)
- [ ] Can add new product
- [ ] Can upload images
- [ ] All fields save correctly
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Deleted products disappear
- [ ] Can view own products only

### Product Details
- [ ] Images gallery works
- [ ] Can swipe through images
- [ ] Seller info displays
- [ ] Contact seller button works
- [ ] Share product works
- [ ] Add to wishlist works
- [ ] Add to cart works (buyer)
- [ ] Edit/Delete shows for own products (seller)

**Bugs Found:**
```
[List any bugs here]
```

---

## 3️⃣ **Shopping Cart & Orders** (Critical)

### Cart (Buyer)
- [ ] Can add products to cart
- [ ] Quantity +/- works
- [ ] Can remove items
- [ ] Total calculates correctly
- [ ] Empty state shows when empty
- [ ] Checkout button works

### Checkout
- [ ] Delivery form accepts input
- [ ] Phone number validation works
- [ ] Can select payment method
- [ ] Order summary correct
- [ ] Can place order
- [ ] Loading state shows

### Payment
- [ ] Paystack modal opens
- [ ] Can complete payment
- [ ] Payment verification works
- [ ] Redirects to confirmation
- [ ] Order appears in history

### Order History
- [ ] Orders load correctly
- [ ] Can filter (All/Pending/Delivered/Cancelled)
- [ ] Order details show correctly
- [ ] Status displays properly
- [ ] Can view order details
- [ ] Pull-to-refresh works

**Bugs Found:**
```
[List any bugs here]
```

---

## 4️⃣ **Messaging System** (High Priority)

### Messages List
- [ ] Message threads load
- [ ] Unread count shows
- [ ] Product thumbnail displays
- [ ] Can tap to open chat
- [ ] Timestamps show correctly
- [ ] Pull-to-refresh works

### Chat
- [ ] Messages load in order
- [ ] Can send new message
- [ ] Messages appear immediately
- [ ] Product card shows at top
- [ ] Keyboard doesn't cover input
- [ ] Auto-scrolls to latest message
- [ ] Can go back to messages list

**Bugs Found:**
```
[List any bugs here]
```

---

## 5️⃣ **Profile & Settings** (Medium Priority)

### View Profile
- [ ] Profile info displays correctly
- [ ] Profile picture shows
- [ ] Stats display (if seller)
- [ ] Menu items work

### Edit Profile
- [ ] Can edit all fields
- [ ] Profile picture upload works
- [ ] Changes save correctly
- [ ] Validation works
- [ ] Updates reflect immediately

### Change Password
- [ ] Current password required
- [ ] New password validation works
- [ ] Passwords must match
- [ ] Success message shows
- [ ] Can login with new password

### Wishlist
- [ ] Wishlist items load
- [ ] Can remove items
- [ ] Can add to cart from wishlist
- [ ] Empty state shows correctly

### Notifications
- [ ] Notifications load
- [ ] Can mark as read
- [ ] Can mark all as read
- [ ] Can clear all
- [ ] Tapping navigates to correct screen

### Settings
- [ ] Privacy settings save
- [ ] Language selection works
- [ ] Help & Support links work
- [ ] About screen shows correctly

### Delete Account
- [ ] Password required
- [ ] Must type DELETE
- [ ] Confirmation alert shows
- [ ] Account deleted successfully
- [ ] Auto-logout after deletion

**Bugs Found:**
```
[List any bugs here]
```

---

## 6️⃣ **Search & Filters** (Medium Priority)

### Search
- [ ] Search box accepts input
- [ ] Results update as you type
- [ ] Empty state shows for no results
- [ ] Can search by name
- [ ] Can clear search

### Filters
- [ ] Category filter works
- [ ] Condition filter works
- [ ] Price range filter works
- [ ] Filters apply correctly
- [ ] Can clear all filters
- [ ] Results update immediately

**Bugs Found:**
```
[List any bugs here]
```

---

## 7️⃣ **Seller Features** (Medium Priority)

### Seller Dashboard
- [ ] Shows correct products
- [ ] Stats display correctly
- [ ] Can navigate to add product
- [ ] Can edit products
- [ ] Can delete products

### Product Management
- [ ] Only shows seller's products
- [ ] Can view product analytics
- [ ] Status changes work
- [ ] Stock updates work

**Bugs Found:**
```
[List any bugs here]
```

---

## 8️⃣ **UI/UX Issues** (Low Priority)

### Design Consistency
- [ ] Brand colors consistent (Navy Blue, Vibrant Blue, Golden Yellow)
- [ ] Fonts consistent throughout
- [ ] Spacing looks good
- [ ] Buttons are touchable
- [ ] Loading states show everywhere
- [ ] Error messages are clear

### Navigation
- [ ] Back buttons work
- [ ] Tab navigation works
- [ ] Screen transitions smooth
- [ ] No unexpected navigation
- [ ] Deep linking works (if applicable)

### Performance
- [ ] App loads quickly
- [ ] Scrolling is smooth
- [ ] No lag or freezing
- [ ] Images load reasonably fast
- [ ] API calls don't take too long

**Issues Found:**
```
[List any issues here]
```

---

## 9️⃣ **Edge Cases** (Low Priority)

### Network Issues
- [ ] Graceful handling of no internet
- [ ] Error messages show clearly
- [ ] Can retry failed requests
- [ ] Offline state handled

### Empty States
- [ ] Empty cart shows message
- [ ] No products shows message
- [ ] No messages shows message
- [ ] No orders shows message

### Validation
- [ ] Email format validated
- [ ] Phone number validated
- [ ] Required fields enforced
- [ ] Character limits enforced

**Bugs Found:**
```
[List any bugs here]
```

---

## 🔟 **Platform Specific** (If Testing on Device)

### iOS (if applicable)
- [ ] Looks good on iPhone
- [ ] Keyboard behavior correct
- [ ] Permissions work (camera, photos)
- [ ] Push notifications work

### Android (if applicable)
- [ ] Looks good on Android
- [ ] Keyboard behavior correct
- [ ] Permissions work (camera, photos)
- [ ] Push notifications work
- [ ] Back button handled correctly

**Issues Found:**
```
[List any issues here]
```

---

## 📊 **Test Results Summary**

**Total Items:** ~100  
**Passed:** _____  
**Failed:** _____  
**Skipped:** _____  

**Pass Rate:** _____%

---

## 🐛 **Critical Bugs Found**

1. 
2. 
3. 

---

## ⚠️ **Medium Bugs Found**

1. 
2. 
3. 

---

## ℹ️ **Minor Issues Found**

1. 
2. 
3. 

---

## ✅ **Next Steps**

1. [ ] Fix critical bugs first
2. [ ] Fix medium priority bugs
3. [ ] Address minor issues
4. [ ] Re-test fixed bugs
5. [ ] Final QA pass

---

## 📝 **Notes**

```
Additional observations:




```

---

**Testing Completed:** _____________________  
**Status:** _____________________  
**Ready for Production:** Yes / No
