// API Configuration
// FOR PUBLIC WIFI: Use ngrok URL or production URL
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.155:8000/api' // Local development
  : 'https://unitradegh-backend-946167918479.europe-west1.run.app/api'; // Production

export const API_ENDPOINTS = {
  // Auth & Users
  REGISTER: '/users/register/',
  SEND_OTP: '/users/send-otp/',
  VERIFY_OTP: '/users/verify-otp/',
  LOGIN: '/users/login/',
  TOKEN_REFRESH: '/users/token/refresh/',
  USER_ME: '/users/me/',
  USER_PROFILE: '/users/profile/',
  CHANGE_PASSWORD: '/users/change-password/',
  
  // Password Reset
  PASSWORD_RESET_SEND_OTP: '/users/password-reset/send-otp/',
  PASSWORD_RESET_VERIFY_OTP: '/users/password-reset/verify-otp/',
  PASSWORD_RESET: '/users/password-reset/',
  
  // Wishlist
  WISHLIST: '/users/wishlist/',
  
  // Universities & Campuses
  UNIVERSITIES: '/users/universities/',
  CAMPUSES: '/users/campuses/',
  
  // Payment Methods
  PAYMENT_METHODS: '/users/payment-methods/',
  PAYMENT_METHOD_DETAIL: (id) => `/users/payment-methods/${id}/`,
  
  // Delivery Addresses
  DELIVERY_ADDRESSES: '/users/delivery-addresses/',
  DELIVERY_ADDRESS_DETAIL: (id) => `/users/delivery-addresses/${id}/`,
  
  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id) => `/products/${id}/`,
  PRODUCT_RATINGS: (id) => `/products/${id}/ratings/`,
  
  // Orders
  ORDERS: '/orders/',
  ORDER_DETAIL: (id) => `/orders/${id}/`,
  PAYSTACK_INIT: '/orders/paystack-init/',
  VERIFY_PAYMENT: '/orders/verify-payment/',
  
  // Messaging
  MESSAGE_THREADS: '/messaging/threads/',
  MESSAGE_THREAD_DETAIL: (id) => `/messaging/threads/${id}/`,
  MARK_READ: (id) => `/messaging/threads/${id}/mark_read/`,
  MESSAGES: '/messaging/messages/',
  
  // Notifications
  NOTIFICATIONS: '/users/notifications/',
  MARK_NOTIFICATION_READ: (id) => `/users/notifications/${id}/mark-read/`,
  SAVE_PUSH_TOKEN: '/users/push-tokens/',
  REMOVE_PUSH_TOKEN: '/users/push-tokens/remove/',
  
  // Privacy & Security
  PRIVACY_SETTINGS: '/users/privacy-settings/',
  
  // Account Management
  DELETE_ACCOUNT: '/users/delete-account/',
};

// App Configuration
export const APP_CONFIG = {
  TOKEN_STORAGE_KEY: '@unitrade_token',
  REFRESH_TOKEN_STORAGE_KEY: '@unitrade_refresh_token',
  USER_STORAGE_KEY: '@unitrade_user',
  PAGINATION_LIMIT: 20,
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_QUALITY: 0.8,
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Books',
  'Clothing',
  'Furniture',
  'Sports',
  'Food',
  'Services',
  'Other',
];

// Product Conditions
export const PRODUCT_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'acceptable', label: 'Acceptable' },
];

// User Roles
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

// Seller Types
export const SELLER_TYPES = {
  STUDENT: 'student',
  PROFESSIONAL: 'professional',
};

// Student Levels
export const STUDENT_LEVELS = [
  { value: '100', label: 'Level 100' },
  { value: '200', label: 'Level 200' },
  { value: '300', label: 'Level 300' },
  { value: '400', label: 'Level 400' },
  { value: '500', label: 'Level 500' },
  { value: 'postgrad', label: 'Postgraduate' },
];

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
  SHIPPED: 'shipped',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};
