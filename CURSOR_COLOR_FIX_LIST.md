# 🎨 Cursor Color Fix - All Screens

## Files to Update

Add `cursorColor="#000000"` to all TextInput components in these files:

### ✅ Already Fixed:
1. RegisterDetailsScreen.js - All 5 inputs fixed

### 🔴 Need to Fix:

#### Authentication Screens:
1. LoginScreen.js - 2 inputs (email, password)
2. RegisterScreen.js - 1 input (email)
3. OTPVerificationScreen.js - OTP inputs
4. ResetPasswordOTPScreen.js - OTP inputs
5. ForgotPasswordScreen.js - 1 input (email)
6. ResetPasswordScreen.js - 2 inputs (password, confirm)
7. RoleDetailsScreen.js - Multiple inputs

#### Profile Screens:
8. EditProfileScreen.js - 6 inputs
9. ChangePasswordScreen.js - 3 inputs

#### Product Screens:
10. AddProductScreen.js - 5 inputs
11. EditProductScreen.js - 5 inputs
12. RateProductScreen.js - 1 input (review text)

#### Order Screens:
13. CheckoutScreen.js - 4 inputs

#### Message Screens:
14. ChatScreen.js - 1 input (message)

#### Search Screens:
15. SearchScreen.js - 1 input (search)

---

## Quick Fix Pattern

Find:
```javascript
<TextInput
  style={styles.input}
  placeholder="..."
  value={value}
  onChangeText={setValue}
```

Replace with:
```javascript
<TextInput
  style={styles.input}
  placeholder="..."
  value={value}
  onChangeText={setValue}
  cursorColor="#000000"
```

---

## Automated Fix (Run in VS Code)

1. Open Find & Replace (Ctrl+H)
2. Enable Regex mode
3. Find: `(<TextInput[^>]*?)(\n\s*/>|\n\s*>)`
4. Check each file manually and add `cursorColor="#000000"` before the closing

---

Total files: 16
Total TextInput components: ~58
