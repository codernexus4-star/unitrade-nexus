# 📱 Testing UniTrade on Your Phone - Quick Guide

## ✅ Configuration Complete!

Your app is now configured to connect to your computer at **`10.90.201.155`**

---

## 🚀 Steps to Test on Your Phone

### 1. Start Django Backend

Open **Terminal 1** (PowerShell or CMD):
```bash
cd C:\Users\damed\Desktop\UniTrade-Mobile-App\django-backend
.\venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

**Important:** Must use `0.0.0.0:8000` (not just `localhost:8000`)

✅ You should see:
```
Starting development server at http://0.0.0.0:8000/
```

### 2. Start Expo

Open **Terminal 2** (PowerShell or CMD):
```bash
cd C:\Users\damed\Desktop\UniTrade-Mobile-App\unitrade-mobile
npm start
```

✅ You should see a QR code in the terminal

### 3. Install Expo Go on Your Phone

**Android:** https://play.google.com/store/apps/details?id=host.exp.exponent
**iOS:** https://apps.apple.com/app/expo-go/id982107779

### 4. Connect Your Phone

**CRITICAL:** Your phone MUST be on the same WiFi network as your computer!

- **WiFi Network:** Check your phone is connected to the same WiFi
- **Computer WiFi:** `10.90.201.155` (already configured ✅)

### 5. Scan QR Code

**Android:**
- Open Expo Go app
- Tap "Scan QR code"
- Scan the QR code from Terminal 2

**iOS:**
- Open Camera app
- Point at QR code
- Tap the notification to open in Expo Go

### 6. Wait for App to Load

First time may take 1-2 minutes to build and load.

✅ You should see the UniTrade Onboarding screen!

---

## 🎯 Testing Checklist

Once the app loads:

- [ ] See Onboarding screen with animated bubbles
- [ ] Swipe through onboarding slides
- [ ] Tap "Get Started" → See Login screen
- [ ] Tap "Register" → Create account
- [ ] Check Terminal 1 (Django) for OTP code in logs
- [ ] Enter OTP → Complete registration
- [ ] Login with your credentials
- [ ] Browse products (may be empty)
- [ ] Test navigation (Home, Search, Messages, Profile)

---

## 🐛 Troubleshooting

### "Unable to connect to server"

**Check 1:** Is Django running?
- Look at Terminal 1
- Should see: `Starting development server at http://0.0.0.0:8000/`

**Check 2:** Is your phone on the same WiFi?
- Phone WiFi settings → Should show same network name as computer
- Computer is on WiFi with IP: `10.90.201.155`

**Check 3:** Windows Firewall
```bash
# Run as Administrator in PowerShell
New-NetFirewallRule -DisplayName "Django Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### "Network request failed"

**Solution:** Restart both servers
1. Stop Django (Ctrl+C in Terminal 1)
2. Stop Expo (Ctrl+C in Terminal 2)
3. Start Django again
4. Start Expo again
5. Reload app on phone (shake phone → "Reload")

### App loads but no data

**Solution:** Backend is running but not responding
- Visit `http://10.90.201.155:8000/api/` in your phone's browser
- Should see Django REST Framework page
- If not, check firewall settings

### QR code not scanning

**Solution:** Manual connection
1. In Expo Go app, tap "Enter URL manually"
2. Type the URL shown in Terminal 2 (starts with `exp://`)

---

## 📊 Monitor Backend Activity

Watch Terminal 1 (Django) for incoming requests:

```
[03/Nov/2025 11:35:00] "POST /api/users/register/ HTTP/1.1" 201 1234
[03/Nov/2025 11:35:05] "POST /api/users/send-otp/ HTTP/1.1" 200 567
[03/Nov/2025 11:35:10] "POST /api/users/verify-otp/ HTTP/1.1" 200 890
```

✅ If you see these, your phone is successfully connecting!

---

## 🔄 Hot Reload

Changes to your code will automatically reload on your phone!

**To manually reload:**
- Shake your phone
- Tap "Reload"

---

## 🎉 Success Indicators

**Everything is working when:**
- ✅ App loads on phone
- ✅ Can navigate between screens
- ✅ Can register/login
- ✅ See requests in Django terminal
- ✅ Data loads from backend

---

## 💡 Tips

### Keep Terminals Open
Don't close Terminal 1 or Terminal 2 while testing!

### Check Logs
- **Django logs:** Terminal 1 shows API requests
- **Expo logs:** Terminal 2 shows app errors
- **Phone logs:** Shake phone → "Show Developer Menu" → "Debug Remote JS"

### Test Features
- Registration & Login
- Product browsing
- Product creation (as seller)
- Cart & Checkout
- Messaging
- Profile editing

### Create Test Data
Use Django admin to create test products:
1. Visit `http://10.90.201.155:8000/admin/`
2. Login with superuser (create one if needed: `python manage.py createsuperuser`)
3. Add Products, Users, etc.

---

## 🆘 Still Having Issues?

1. **Restart everything:**
   - Stop Django (Ctrl+C)
   - Stop Expo (Ctrl+C)
   - Close Expo Go app on phone
   - Start Django
   - Start Expo
   - Reopen Expo Go and scan QR

2. **Check WiFi:**
   - Run `ipconfig` again
   - Verify IP is still `10.90.201.155`
   - If changed, update `config.js` again

3. **Clear cache:**
   ```bash
   npx expo start -c
   ```

4. **Check firewall:**
   - Windows Defender → Allow port 8000
   - Or temporarily disable firewall for testing

---

## 📝 Your Configuration

**Computer IP:** `10.90.201.155` (WiFi adapter)
**Backend URL:** `http://10.90.201.155:8000`
**API URL:** `http://10.90.201.155:8000/api`

**Config file:** `unitrade-mobile/src/constants/config.js`
```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://10.90.201.155:8000/api'  // ← Your IP
  : 'https://unitradegh-backend-946167918479.europe-west1.run.app/api';
```

---

**Ready to test! 🚀**

Run the two commands above and scan the QR code with Expo Go!
