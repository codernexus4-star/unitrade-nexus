# UniTrade Mobile App

A React Native mobile application for the UniTrade marketplace platform, built with Expo.

## Setup Complete ✅

The initial project setup is complete with:
- ✅ React Native with Expo
- ✅ Navigation (React Navigation - Stack & Bottom Tabs)
- ✅ State Management (Context API for Auth & Cart)
- ✅ API Service Layer (Axios with JWT authentication)
- ✅ Authentication Screens (Login, Register, OTP Verification)
- ✅ Main App Structure (Home, Search, Messages, Profile tabs)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Python 3.x (for Django backend)

### ⚡ Fast Setup (2 Steps)

**Step 1: Start Django Backend**
```bash
cd c:\Users\damed\Desktop\UniTrade-Mobile-App\django-backend
python manage.py runserver 0.0.0.0:8000
```

**Step 2: Start Mobile App (New Terminal)**
```bash
cd c:\Users\damed\Desktop\UniTrade-Mobile-App\unitrade-mobile
npx expo start
```

**Step 3: Run on Your Phone**
- Open **Expo Go** app on your phone
- Scan the QR code from the terminal
- Make sure your phone and computer are on the **same WiFi network**

### 🔧 If You Change Location/WiFi

1. **Find your new IP address:**
```bash
ipconfig
```
Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi"

2. **Update the config file:**
Edit `src/constants/config.js` line 3:
```javascript
? 'http://YOUR_NEW_IP:8000/api' // Replace with your IP
```

Current IP: **192.168.1.119**

### 📱 Installation (First Time Only)

1. Install mobile app dependencies:
```bash
cd unitrade-mobile
npm install
```

2. Install backend dependencies:
```bash
cd ../django-backend
pip install -r requirements.txt
python manage.py migrate
```

## Project Structure

```
unitrade-mobile/
├── src/
│   ├── screens/          # All screen components
│   │   ├── auth/         # Login, Register, OTP
│   │   ├── home/         # Home, Search
│   │   ├── products/     # Product details
│   │   ├── messages/     # Messages, Chat
│   │   ├── profile/      # Profile screens
│   │   └── orders/       # Cart, Checkout, Orders
│   ├── navigation/       # Navigation configuration
│   ├── contexts/         # React Context (Auth, Cart)
│   ├── services/         # API services
│   ├── components/       # Reusable components (to be added)
│   ├── constants/        # Config, theme, constants
│   ├── utils/            # Utility functions
│   └── assets/           # Images, fonts, etc.
├── App.js               # Root component
└── package.json         # Dependencies
```

## API Configuration

The app connects to the Django backend:
- **Development**: `http://192.168.1.119:8000/api` (Current IP)
- **Production**: `https://unitradegh-backend-946167918479.europe-west1.run.app/api`

**Configuration File**: `src/constants/config.js`

**Important**: 
- The IP address must match your computer's current WiFi IP
- Both phone and computer must be on the same WiFi network
- Run `ipconfig` to find your current IP if it changes

## Features Implemented

### Authentication
- Email-based registration with OTP verification
- Login with JWT tokens
- Automatic token refresh
- Secure token storage

### Navigation
- Bottom tab navigation (Home, Search, Messages, Profile)
- Stack navigation for screens
- Auth flow vs Main app flow

### State Management
- Auth Context: User authentication state
- Cart Context: Shopping cart management

### API Integration
- Complete service layer for all backend endpoints
- Error handling
- Token management

## Next Steps

See `TODO.md` in the parent directory for the complete development roadmap.

### Immediate Next Steps:
1. ✅ Test the app runs successfully
2. Build out the Home screen with product listings
3. Implement product search and filters
4. Create product detail screen
5. Build shopping cart functionality
6. Implement messaging features
7. Complete profile and order management

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

## Testing

### Test Credentials
You'll need to:
1. Start the Django backend server
2. Register a new account through the app
3. Verify email with OTP
4. Login with your credentials

## Backend Setup Required

Before testing, ensure the Django backend is running:

```bash
cd ../django-backend
python manage.py runserver
```

**Important**: Update `CORS_ALLOWED_ORIGINS` in Django settings to include your mobile device IP if testing on a physical device.

## Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --clear
```

### Dependency Issues
```bash
rm -rf node_modules
npm install
```

### iOS Specific
```bash
cd ios && pod install && cd ..
```

## Documentation

- Backend API Analysis: `../BACKEND_ANALYSIS.md`
- Development TODO: `../TODO.md`
- [React Navigation Docs](https://reactnavigation.org/)
- [Expo Docs](https://docs.expo.dev/)

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage, SecureStore
- **UI**: React Native core components (custom UI to be added)

## Contributing

This is a development project. Follow the TODO list for feature implementation priorities.

## License

Private project for UniTrade platform.
