# UniTrade Mobile App - Development TODO List

## Phase 1: Setup & Configuration ✓
- [x] Analyze Django backend API
- [x] Document all endpoints and data models
- [ ] Initialize React Native project with Expo
- [ ] Set up project structure and navigation
- [ ] Configure environment variables for API endpoints
- [ ] Set up TypeScript (optional but recommended)
- [ ] Install and configure required dependencies

## Phase 2: Core Infrastructure
### Navigation Setup
- [ ] Install React Navigation (Stack, Bottom Tabs, Drawer)
- [ ] Create main navigation structure:
  - Auth Stack (Login, Register, OTP Verification)
  - Main Tabs (Home, Search, Messages, Profile)
  - Product Stack (Product Details, Seller Profile)
  - Order Stack (Cart, Checkout, Order History, Order Details)

### State Management
- [ ] Set up Context API or Redux for global state
- [ ] Create auth context (user, tokens, login/logout)
- [ ] Create cart context (items, add/remove, calculate total)
- [ ] Create wishlist context

### API Integration
- [ ] Create API client with Axios/Fetch
- [ ] Implement JWT token management (storage, refresh)
- [ ] Create API service functions for all endpoints:
  - Auth services (login, register, OTP, refresh token)
  - User services (profile, change password, wishlist)
  - Product services (list, search, create, update, delete, ratings)
  - Order services (create, list, details, payment)
  - Messaging services (threads, messages, mark read)
  - University/Campus services

## Phase 3: Authentication Screens
- [ ] **Splash Screen** - App loading/initialization
- [ ] **Onboarding Screen** - First-time user introduction
- [ ] **Login Screen**
  - Email input
  - Password input
  - Login button
  - "Forgot Password" link
  - "Sign Up" link
- [ ] **Registration Screen - Step 1** (Email Verification)
  - Email input
  - Send OTP button
- [ ] **Registration Screen - Step 2** (OTP Verification)
  - OTP input (6 digits)
  - Verify button
  - Resend OTP
- [ ] **Registration Screen - Step 3** (User Details)
  - First name, Last name
  - Password, Confirm password
  - Role selection (Buyer/Seller)
  - University selection (dropdown)
  - Campus selection (dropdown, filtered by university)
  - Phone number
  - Location
- [ ] **Registration Screen - Step 4** (Seller Details - conditional)
  - Seller type (Student/Professional)
  - For Students: Student ID, Level, Program of Study
  - For Professionals: Business Name, Business Description
  - Bio
  - Profile picture upload
- [ ] **Forgot Password Screen** (if implementing)

## Phase 4: Main App Screens

### Home/Browse Tab
- [ ] **Home Screen**
  - Search bar
  - University filter dropdown
  - Category filters
  - Featured/Recent products grid
  - Pull-to-refresh
  - Infinite scroll/pagination
- [ ] **Product Details Screen**
  - Image carousel/gallery
  - Product name, price, condition
  - Description
  - Features list
  - Stock availability
  - Seller info card (name, rating, university)
  - Add to Cart button
  - Add to Wishlist button
  - Contact Seller button
  - Ratings & Reviews section
  - Related products
- [ ] **Seller Profile Screen**
  - Profile picture
  - Name/Business name
  - Bio/Description
  - University/Campus
  - Seller's products grid
  - Contact button

### Search Tab
- [ ] **Search Screen**
  - Search input with suggestions
  - Recent searches
  - Category filters
  - University filter
  - Condition filter
  - Price range filter
  - Sort options (price, date, relevance)
  - Search results grid

### Messages Tab
- [ ] **Message Threads List Screen**
  - List of conversations
  - Show last message preview
  - Unread message indicator
  - Product thumbnail for context
  - Search/filter threads
- [ ] **Chat Screen**
  - Message list (scrollable)
  - Message input
  - Send button
  - Product info header
  - Mark as read functionality
  - Real-time updates (polling or WebSocket)

### Profile Tab
- [ ] **Profile Screen**
  - Profile picture
  - User info display
  - Edit Profile button
  - My Products (for sellers)
  - My Orders
  - Wishlist
  - Settings
  - Logout button
- [ ] **Edit Profile Screen**
  - Update all user fields
  - Profile picture upload
  - Password confirmation required
  - Save button
- [ ] **Change Password Screen**
  - Current password
  - New password
  - Confirm new password
  - Submit button
- [ ] **My Products Screen** (Sellers only)
  - List of seller's products
  - Add New Product button
  - Edit/Delete options
  - Status indicators (active, sold, hidden)
- [ ] **Add/Edit Product Screen**
  - Product name
  - Description
  - Price
  - Category dropdown
  - Condition dropdown
  - Features (dynamic list)
  - Stock quantity
  - Multiple image upload
  - Image preview with delete option
  - Save/Publish button
- [ ] **Wishlist Screen**
  - Grid of wishlisted products
  - Remove from wishlist option
  - Quick add to cart
- [ ] **Settings Screen**
  - Notification preferences
  - Language selection
  - About app
  - Terms & Conditions
  - Privacy Policy
  - App version

## Phase 5: Shopping & Orders

### Cart & Checkout
- [ ] **Cart Screen**
  - List of cart items
  - Quantity adjustment (+/-)
  - Remove item option
  - Subtotal calculation
  - Proceed to Checkout button
- [ ] **Checkout Screen**
  - Order summary
  - Delivery address input
  - Payment method selection (Paystack)
  - Total amount display
  - Place Order button
- [ ] **Payment Screen** (Paystack WebView)
  - Integrate Paystack payment
  - Handle payment success/failure
  - Redirect to order confirmation
- [ ] **Order Confirmation Screen**
  - Order details
  - Payment status
  - Order number
  - View Order button
  - Continue Shopping button

### Order Management
- [ ] **Order History Screen**
  - List of all orders
  - Filter by status
  - Order cards with summary
- [ ] **Order Details Screen**
  - Order number
  - Order date
  - Status timeline
  - Items list with images
  - Total amount
  - Payment status
  - Delivery address
  - Track order (if applicable)
  - Contact seller option
  - Rate products (if delivered)

## Phase 6: Additional Features
- [ ] **Rate Product Screen/Modal**
  - Star rating (1-5)
  - Review text input
  - Submit button
  - Only for purchased products
- [ ] **Notifications Screen**
  - List of notifications
  - Mark as read
  - Notification types: new message, order status, etc.
- [ ] **University/Campus Selection**
  - Reusable component for filtering
  - Used in registration, search, filters

## Phase 7: UI/UX Enhancements
- [ ] Design system setup (colors, typography, spacing)
- [ ] Create reusable components:
  - Button
  - Input field
  - Card
  - Product card
  - Loading spinner
  - Empty state
  - Error state
  - Modal/Bottom sheet
  - Image picker
  - Image carousel
- [ ] Add loading states for all API calls
- [ ] Add error handling and user feedback (toasts/alerts)
- [ ] Add form validation
- [ ] Add image optimization and caching
- [ ] Add pull-to-refresh on lists
- [ ] Add skeleton loaders
- [ ] Implement smooth transitions and animations

## Phase 8: Testing & Optimization
- [ ] Test all API integrations
- [ ] Test authentication flow (login, register, OTP)
- [ ] Test product CRUD operations
- [ ] Test order creation and payment flow
- [ ] Test messaging functionality
- [ ] Test on iOS and Android devices
- [ ] Optimize images and assets
- [ ] Implement error boundaries
- [ ] Add offline support (cache data)
- [ ] Performance optimization (lazy loading, memoization)
- [ ] Memory leak detection and fixes

## Phase 9: Backend Updates Required
- [ ] Add mobile app URL to CORS_ALLOWED_ORIGINS in Django settings
- [ ] Update Paystack callback URL for mobile
- [ ] Consider implementing push notifications (FCM)
- [ ] Consider WebSocket for real-time messaging
- [ ] Move all secrets to environment variables
- [ ] Add API rate limiting
- [ ] Add API versioning

## Phase 10: Deployment
- [ ] Configure app.json for Expo
- [ ] Set up app icons and splash screens
- [ ] Configure build settings (iOS/Android)
- [ ] Test production builds
- [ ] Submit to App Store (iOS)
- [ ] Submit to Play Store (Android)
- [ ] Set up analytics (optional)
- [ ] Set up crash reporting (Sentry, etc.)

## Key Dependencies to Install
```json
{
  "dependencies": {
    "react-native": "latest",
    "expo": "latest",
    "@react-navigation/native": "^6.x",
    "@react-navigation/stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "axios": "^1.x",
    "@react-native-async-storage/async-storage": "^1.x",
    "react-native-webview": "^13.x",
    "expo-image-picker": "^14.x",
    "expo-secure-store": "^12.x",
    "react-native-gesture-handler": "^2.x",
    "react-native-reanimated": "^3.x",
    "react-native-safe-area-context": "^4.x",
    "react-native-screens": "^3.x"
  }
}
```

## Screen Count Summary
**Total Screens: ~30-35**

### Auth Flow (5 screens)
1. Splash
2. Onboarding
3. Login
4. Register (multi-step)
5. OTP Verification

### Main App (25-30 screens)
- Home/Browse: 3 screens
- Search: 1 screen
- Products: 3 screens
- Messages: 2 screens
- Profile: 8 screens
- Orders: 5 screens
- Additional: 3-5 screens

## Development Timeline Estimate
- **Phase 1-2 (Setup)**: 1-2 days
- **Phase 3 (Auth)**: 3-4 days
- **Phase 4 (Main Screens)**: 7-10 days
- **Phase 5 (Orders)**: 4-5 days
- **Phase 6 (Additional)**: 2-3 days
- **Phase 7 (UI/UX)**: 3-5 days
- **Phase 8 (Testing)**: 3-5 days
- **Total**: 23-34 days (1-1.5 months for single developer)

## Notes
- All screens require proper error handling
- All forms need validation
- All API calls need loading states
- Consider implementing offline mode for better UX
- Implement proper image caching to reduce data usage
- Consider implementing deep linking for product sharing
- Consider implementing social sharing features
