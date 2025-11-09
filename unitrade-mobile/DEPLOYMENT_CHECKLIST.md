# 📱 UniTrade App Store & Play Store Deployment Checklist

## ✅ COMPLETED

### 1. App Configuration
- [x] Updated `app.json` with all required fields
- [x] Added app description
- [x] Configured bundle identifiers (iOS & Android)
- [x] Set version numbers (1.0.0)
- [x] Added permission descriptions
- [x] Configured splash screen and icons
- [x] Added privacy policy and terms URLs

### 2. Legal Documents
- [x] Created Privacy Policy screen
- [x] Created Terms of Service screen
- [x] Integrated legal screens into navigation
- [x] Updated Settings screen to link to legal pages

### 3. Navigation & Screens
- [x] All 35 screens implemented (33 main + 2 legal)
- [x] Complete navigation structure
- [x] Auth flow → Main app flow
- [x] All screens properly connected

### 4. Build Configuration
- [x] Created `eas.json` for Expo builds
- [x] Configured development, preview, and production builds
- [x] Set up Android APK and App Bundle builds
- [x] Configured iOS build settings

### 5. Environment Variables
- [x] Created `.env.example` template
- [x] Documented required API keys
- [x] Documented Paystack configuration

---

## 🔴 CRITICAL - MUST DO BEFORE SUBMISSION

### 1. Create `.env` File
```bash
# Copy the example file
cp .env.example .env

# Add your actual keys:
# - Paystack Public Key (from dashboard.paystack.com)
# - Paystack Secret Key
# - Production API URL (if different)
```

### 2. Update Legal URLs
In `app.json`, update these URLs with your actual hosted pages:
- `privacyPolicyUrl`: Host Privacy Policy on your website
- `termsOfServiceUrl`: Host Terms of Service on your website

**Options:**
- Host on your domain (e.g., unitrade.com/privacy)
- Use GitHub Pages
- Use a static hosting service

### 3. App Store Assets (iOS)

#### Required Screenshots (Multiple Sizes):
- **iPhone 6.7"** (1290 x 2796 px) - 3-10 screenshots
- **iPhone 6.5"** (1242 x 2688 px) - 3-10 screenshots
- **iPhone 5.5"** (1242 x 2208 px) - 3-10 screenshots

#### Recommended Screenshots:
1. Onboarding/Welcome screen
2. Home screen with products
3. Product detail page
4. Chat/messaging
5. Checkout/payment flow
6. Profile screen

#### App Store Information:
- **App Name**: UniTrade
- **Subtitle**: Campus Marketplace for Students
- **Keywords**: university, marketplace, student, buy, sell, campus, trade
- **Category**: Shopping
- **Support URL**: https://unitrade.com/support
- **Marketing URL**: https://unitrade.com
- **Privacy Policy URL**: https://unitrade.com/privacy

### 4. Play Store Assets (Android)

#### Required Screenshots (Multiple Sizes):
- **Phone** (1080 x 1920 px minimum) - 2-8 screenshots
- **7-inch Tablet** (1024 x 600 px) - Optional
- **10-inch Tablet** (1280 x 800 px) - Optional

#### Feature Graphic:
- **Size**: 1024 x 500 px
- Use brand colors (Navy Blue #003366, Golden Yellow #FDB913)

#### Play Store Listing:
- **Short Description** (80 chars max):
  "Buy & sell products within your university community safely"
  
- **Full Description** (4000 chars max):
  ```
  UniTrade - Your Campus Marketplace
  
  🎓 FOR STUDENTS, BY STUDENTS
  UniTrade connects university students to buy and sell products within their campus community. Safe, convenient, and designed specifically for student life.
  
  ✨ KEY FEATURES:
  • Browse thousands of products from fellow students
  • List items in minutes with photos and descriptions
  • Secure payments via Paystack or cash on delivery
  • Direct messaging with sellers
  • Order tracking and history
  • Wishlist your favorite items
  • Rate and review products
  
  🛡️ SAFE & SECURE:
  • University-verified accounts
  • Secure payment processing
  • In-app messaging
  • Buyer and seller ratings
  
  💰 CATEGORIES:
  Electronics, Books, Clothing, Furniture, Sports Equipment, Food, Services, and more!
  
  📱 EASY TO USE:
  1. Sign up with your university email
  2. Browse or search for products
  3. Chat with sellers
  4. Complete secure transactions
  5. Rate your experience
  
  Join thousands of students already trading on UniTrade!
  ```

- **Category**: Shopping
- **Content Rating**: Everyone
- **Contact Email**: support@unitrade.com
- **Privacy Policy URL**: https://unitrade.com/privacy

### 5. Apple Developer Account Setup
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID in Apple Developer Portal
- [ ] Generate provisioning profiles
- [ ] Configure App Store Connect
- [ ] Update `eas.json` with Apple ID and Team ID

### 6. Google Play Console Setup
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Create app in Play Console
- [ ] Generate upload key
- [ ] Create service account for automated uploads
- [ ] Save service account JSON as `google-service-account.json`

### 7. Build & Test

#### Development Build:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create development build
eas build --profile development --platform android
eas build --profile development --platform ios
```

#### Preview Build (Internal Testing):
```bash
# Android APK for testing
eas build --profile preview --platform android

# iOS for TestFlight
eas build --profile preview --platform ios
```

#### Production Build:
```bash
# Android App Bundle for Play Store
eas build --profile production --platform android

# iOS for App Store
eas build --profile production --platform ios
```

### 8. Testing Checklist
- [ ] Test all authentication flows
- [ ] Test product listing and editing
- [ ] Test search and filters
- [ ] Test messaging system
- [ ] Test cart and checkout
- [ ] Test Paystack payment integration
- [ ] Test order history and details
- [ ] Test wishlist functionality
- [ ] Test profile editing
- [ ] Test legal pages (Privacy Policy, Terms)
- [ ] Test on multiple device sizes
- [ ] Test on both iOS and Android
- [ ] Test offline behavior
- [ ] Test error handling

---

## 🟡 RECOMMENDED (Before Launch)

### 1. Analytics Integration
- [ ] Add Firebase Analytics or Mixpanel
- [ ] Track key user actions
- [ ] Monitor app performance

### 2. Crash Reporting
- [ ] Integrate Sentry or Bugsnag
- [ ] Set up error monitoring
- [ ] Configure alerts

### 3. Push Notifications
- [ ] Set up Firebase Cloud Messaging (Android)
- [ ] Set up Apple Push Notification Service (iOS)
- [ ] Implement notification handling
- [ ] Test notification delivery

### 4. Backend Preparation
- [ ] Ensure production API is stable
- [ ] Set up database backups
- [ ] Configure CDN for images
- [ ] Set up monitoring and alerts
- [ ] Load testing

### 5. Marketing Preparation
- [ ] Create social media accounts
- [ ] Design promotional materials
- [ ] Plan launch campaign
- [ ] Prepare press release
- [ ] Create demo video

### 6. Support Infrastructure
- [ ] Set up support email (support@unitrade.com)
- [ ] Create FAQ page
- [ ] Prepare support documentation
- [ ] Set up ticketing system

---

## 📋 SUBMISSION PROCESS

### iOS App Store Submission:

1. **Build the app:**
   ```bash
   eas build --profile production --platform ios
   ```

2. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```
   Or manually upload via Xcode/Transporter

3. **App Store Connect:**
   - Add screenshots
   - Write app description
   - Set pricing (Free)
   - Add keywords
   - Submit for review

4. **Review Time:** 1-3 days typically

### Google Play Store Submission:

1. **Build the app:**
   ```bash
   eas build --profile production --platform android
   ```

2. **Submit to Play Store:**
   ```bash
   eas submit --platform android
   ```
   Or manually upload in Play Console

3. **Play Console:**
   - Add screenshots and feature graphic
   - Write store listing
   - Set up pricing & distribution
   - Complete content rating questionnaire
   - Submit for review

4. **Review Time:** Few hours to 1 day typically

---

## 🚨 COMMON REJECTION REASONS (Avoid These!)

### iOS:
- ❌ Missing or incomplete Privacy Policy
- ❌ Permissions without clear explanations
- ❌ Crashes or bugs
- ❌ Incomplete functionality
- ❌ Misleading screenshots or descriptions
- ❌ Missing required metadata

### Android:
- ❌ Privacy Policy not accessible
- ❌ Dangerous permissions without justification
- ❌ Crashes on startup
- ❌ Broken core functionality
- ❌ Misleading content
- ❌ Copyright violations

---

## 📞 SUPPORT CONTACTS

**Expo Documentation:**
- https://docs.expo.dev/

**EAS Build Documentation:**
- https://docs.expo.dev/build/introduction/

**App Store Review Guidelines:**
- https://developer.apple.com/app-store/review/guidelines/

**Play Store Policies:**
- https://play.google.com/about/developer-content-policy/

**Paystack Documentation:**
- https://paystack.com/docs

---

## ✅ FINAL PRE-LAUNCH CHECKLIST

- [ ] All critical issues resolved
- [ ] Legal documents hosted and accessible
- [ ] Environment variables configured
- [ ] Production API tested and stable
- [ ] Payment integration tested with real transactions
- [ ] All required assets created (icons, screenshots, graphics)
- [ ] App Store/Play Store accounts set up
- [ ] Builds created and tested
- [ ] Team members have tested the app
- [ ] Support infrastructure ready
- [ ] Marketing materials prepared
- [ ] Launch date planned

---

**Good luck with your launch! 🚀**
