# 🧪 Local Testing Guide - UniTrade Mobile App

## Quick Start (5 minutes)

### Step 1: Start Django Backend

```bash
# Navigate to backend directory
cd c:\Users\damed\Desktop\UniTrade-Mobile-App\django-backend

# Activate virtual environment (if not already active)
.\venv\Scripts\activate

# Run migrations (first time only)
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start Django server
python manage.py runserver 0.0.0.0:8000
```

**Backend will run at:** `http://localhost:8000`

### Step 2: Get Your Local IP Address

Your mobile device needs to connect to your computer's IP address (not localhost).

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)

**Example:** `192.168.1.100`

### Step 3: Update Mobile App Configuration

**Option A: Use Your Computer's IP (Recommended for Physical Device)**

Edit `unitrade-mobile/src/constants/config.js`:

```javascript
// Replace localhost with your computer's IP address
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:8000/api'  // ← Change this to YOUR IP
  : 'https://unitradegh-backend-946167918479.europe-west1.run.app/api';
```

**Option B: Keep localhost (For Emulator/Simulator Only)**

- **Android Emulator:** Use `http://10.0.2.2:8000/api` (special alias for localhost)
- **iOS Simulator:** Use `http://localhost:8000/api` (works as-is)

### Step 4: Start Mobile App

```bash
# Navigate to mobile app directory
cd c:\Users\damed\Desktop\UniTrade-Mobile-App\unitrade-mobile

# Start Expo
npm start
# or
npx expo start
```

### Step 5: Run on Device/Emulator

**Option A: Physical Device (Recommended)**
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from terminal
3. Make sure your phone is on the same WiFi network as your computer

**Option B: Android Emulator**
1. Press `a` in the Expo terminal
2. Android Studio emulator will launch

**Option C: iOS Simulator (Mac only)**
1. Press `i` in the Expo terminal
2. iOS Simulator will launch

---

## 🔧 Configuration Details

### Backend CORS Settings

I've updated `django-backend/backend/settings.py` to allow all origins in development:

```python
CORS_ALLOW_ALL_ORIGINS = True  # For mobile app development
```

**For production**, you should set this back to `False` and specify allowed origins.

### Mobile App API Configuration

The app automatically switches between local and production:

```javascript
// config.js
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api'     // Development (local backend)
  : 'https://unitradegh-backend-946167918479.europe-west1.run.app/api'; // Production
```

`__DEV__` is automatically `true` when running with Expo in development mode.

---

## 📱 Testing on Physical Device

### Same WiFi Network Required

Your phone and computer MUST be on the same WiFi network.

### Find Your Computer's IP

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### Update config.js

```javascript
export const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:8000/api'  // e.g., http://192.168.1.100:8000/api
  : 'https://unitradegh-backend-946167918479.europe-west1.run.app/api';
```

### Restart Expo

After changing the IP, restart Expo:
```bash
# Press Ctrl+C to stop
npm start
```

---

## 🐛 Troubleshooting

### Issue: "Network request failed"

**Cause:** Mobile app can't reach backend

**Solutions:**
1. Check backend is running: Visit `http://localhost:8000/api/` in browser
2. Check firewall: Allow port 8000 through Windows Firewall
3. Check WiFi: Phone and computer on same network
4. Check IP address: Use correct IP in config.js
5. Try `0.0.0.0:8000` instead of `localhost:8000` when starting Django

### Issue: "CORS error"

**Cause:** Backend rejecting requests from mobile app

**Solution:**
- Verify `CORS_ALLOW_ALL_ORIGINS = True` in settings.py
- Restart Django server after changing settings

### Issue: "Connection refused" on Android Emulator

**Cause:** Android emulator can't use `localhost`

**Solution:**
Use `http://10.0.2.2:8000/api` in config.js for Android emulator

### Issue: "Module not found" or import errors

**Cause:** Dependencies not installed

**Solution:**
```bash
# In mobile app directory
npm install

# In backend directory
pip install -r requirements.txt
```

### Issue: Database errors

**Cause:** Migrations not run

**Solution:**
```bash
cd django-backend
python manage.py migrate
```

---

## 🔍 Verify Backend is Working

### 1. Check API Root
Visit in browser: `http://localhost:8000/api/`

Should see Django REST Framework browsable API.

### 2. Check Admin Panel
Visit: `http://localhost:8000/admin/`

Login with superuser credentials.

### 3. Test API Endpoints

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

---

## 📊 Monitoring Requests

### Django Server Logs

Watch the Django terminal for incoming requests:
```
[03/Nov/2025 11:30:00] "POST /api/users/login/ HTTP/1.1" 200 1234
[03/Nov/2025 11:30:05] "GET /api/products/ HTTP/1.1" 200 5678
```

### Mobile App Logs

Watch Expo terminal for API calls and errors.

### Network Inspector (Advanced)

Use React Native Debugger or Flipper to inspect network requests.

---

## 🎯 Testing Checklist

Once both backend and mobile app are running:

- [ ] Open app - should see Onboarding screen
- [ ] Register new account
- [ ] Verify OTP (check Django logs for OTP code)
- [ ] Complete registration flow
- [ ] Login with credentials
- [ ] Browse products (may be empty initially)
- [ ] Create a product listing (as seller)
- [ ] View product details
- [ ] Add to cart
- [ ] Test checkout flow
- [ ] Test messaging
- [ ] Test profile editing

---

## 💾 Sample Data (Optional)

### Create Test Products via Django Admin

1. Go to `http://localhost:8000/admin/`
2. Login with superuser
3. Add Products, Categories, etc.

### Or Use Django Shell

```bash
python manage.py shell
```

```python
from users.models import User
from products.models import Product

# Create test user
user = User.objects.create_user(
    email='seller@test.com',
    password='Test123!',
    first_name='Test',
    last_name='Seller'
)

# Create test product
product = Product.objects.create(
    seller=user,
    name='Test Product',
    description='This is a test product',
    price=100.00,
    category='Electronics',
    condition='new',
    is_available=True
)
```

---

## 🚀 Quick Commands Reference

### Backend
```bash
# Start server
cd django-backend
.\venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create app (if needed)
python manage.py startapp appname
```

### Mobile App
```bash
# Start Expo
cd unitrade-mobile
npm start

# Clear cache
npx expo start -c

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

---

## 📝 Notes

### Development vs Production

- **Development:** Uses local backend (`localhost:8000`)
- **Production:** Uses cloud backend (Google Cloud Run)

The app automatically switches based on `__DEV__` flag.

### Database

Backend uses SQLite by default (file: `db.sqlite3`). This is fine for local testing.

For production, you should use PostgreSQL (already configured in your cloud backend).

### Media Files

Product images are stored in `django-backend/media/` directory.

Make sure this directory exists and has write permissions.

---

## ✅ Success Indicators

**Backend is working when:**
- ✅ Django server starts without errors
- ✅ Can access `http://localhost:8000/api/` in browser
- ✅ Admin panel loads at `http://localhost:8000/admin/`
- ✅ See incoming requests in Django logs

**Mobile app is working when:**
- ✅ Expo starts without errors
- ✅ App loads on device/emulator
- ✅ Can register/login
- ✅ See API requests in Django logs
- ✅ Data loads in the app

---

## 🆘 Still Having Issues?

1. **Check both terminals** - Backend and Expo should both be running
2. **Check network** - Same WiFi for physical device testing
3. **Check IP address** - Correct IP in config.js
4. **Check firewall** - Allow port 8000
5. **Restart everything** - Stop backend, stop Expo, start both again
6. **Clear cache** - `npx expo start -c`

---

**Happy Testing! 🎉**
