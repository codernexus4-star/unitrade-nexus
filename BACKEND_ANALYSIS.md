# UniTrade Backend API Analysis

## Overview
UniTrade is a university-focused marketplace platform where students and professionals can buy and sell products. The backend is built with Django REST Framework and includes authentication, product management, orders with Paystack payment integration, and messaging functionality.

## Technology Stack
- **Framework**: Django 5.2.4 + Django REST Framework
- **Authentication**: JWT (Simple JWT)
- **Database**: PostgreSQL (Google Cloud SQL)
- **Storage**: Google Cloud Storage
- **Payment**: Paystack
- **Email**: Zoho SMTP
- **SMS**: Zenoph Notify API

## Database Models

### Users App
1. **University** - University information
2. **Campus** - Campus linked to universities
3. **User** (Custom User Model)
   - Roles: buyer, seller, admin
   - Seller types: student, professional
   - Fields: email, role, university, campus, phone, location, student_id, level, program_of_study, business_name, bio, profile_picture
4. **Wishlist** - User's saved products
5. **EmailVerification** - OTP verification for registration

### Products App
1. **Product**
   - Fields: name, description, price, category, condition, features (JSON), status, stock, seller
   - Status: active, sold, suspended, hidden
   - Condition: new, like_new, very_good, good, acceptable
2. **ProductImage** - Multiple images per product
3. **ProductRating** - User ratings and reviews

### Orders App
1. **Order**
   - Fields: buyer, total, status, payment_method, payment_status, paystack_reference, delivery_address
   - Status: pending, processing, completed, cancelled, delivered, shipped
   - Payment status: pending, paid, refunded, failed
2. **OrderItem** - Products in an order

### Messaging App
1. **MessageThread** - Conversation between buyer and seller about a product
2. **Message** - Individual messages in a thread

## API Endpoints

### Authentication & Users (`/api/users/`)
- `POST /register/` - Register new user (requires email verification)
- `POST /send-otp/` - Send OTP to email
- `POST /verify-otp/` - Verify OTP code
- `POST /login/` - Login (returns JWT + user data)
- `POST /token/refresh/` - Refresh JWT token
- `GET /me/` - Get current user info (authenticated)
- `PUT /profile/` - Update user profile (authenticated)
- `POST /change-password/` - Change password (authenticated)
- `GET /wishlist/` - Get user's wishlist (authenticated)
- `POST /wishlist/` - Add product to wishlist (authenticated)
- `DELETE /wishlist/{product_id}/` - Remove from wishlist (authenticated)
- `GET /universities/` - List all universities
- `GET /universities/{id}/` - Get university details
- `GET /campuses/` - List campuses (filter by ?university_id=X)
- `GET /campuses/{id}/` - Get campus details

### Products (`/api/products/`)
- `GET /` - List products (supports ?search=X, ?university=X)
- `POST /` - Create product (authenticated, multipart/form-data for images)
- `GET /{id}/` - Get product details
- `PUT/PATCH /{id}/` - Update product (seller only)
- `DELETE /{id}/` - Delete product (seller only)
- `GET /{product_id}/ratings/` - Get product ratings
- `POST /{product_id}/ratings/` - Rate product (authenticated, must have purchased)

### Orders (`/api/orders/`)
- `GET /` - List user's orders (authenticated)
- `POST /` - Create order (authenticated)
- `GET /{id}/` - Get order details (authenticated)
- `POST /paystack-init/` - Initialize Paystack payment
- `POST /verify-payment/` - Verify Paystack payment
- `POST /paystack-webhook/` - Paystack webhook (no auth)

### Messaging (`/api/messaging/`)
- `GET /threads/` - List user's message threads (authenticated)
- `POST /threads/` - Create message thread (authenticated)
- `GET /threads/{id}/` - Get thread details (authenticated)
- `POST /threads/{id}/mark_read/` - Mark messages as read (authenticated)
- `GET /messages/?thread={thread_id}` - Get messages in thread (authenticated)
- `POST /messages/` - Send message (authenticated)

## Authentication Flow
1. User enters email → `POST /send-otp/`
2. User enters OTP → `POST /verify-otp/`
3. User completes registration → `POST /register/`
4. User logs in → `POST /login/` (returns access + refresh tokens)
5. Use Bearer token in Authorization header for authenticated requests
6. Refresh token when expired → `POST /token/refresh/`

## Payment Flow (Paystack)
1. User creates order → `POST /api/orders/` (returns order with paystack_reference)
2. Initialize payment → `POST /api/orders/paystack-init/` (returns authorization_url)
3. User completes payment on Paystack
4. Verify payment → `POST /api/orders/verify-payment/` with reference
5. Webhook updates order status automatically

## Key Features
- **Email-based authentication** (no username)
- **University/Campus filtering** for products
- **Multi-image upload** for products
- **Wishlist functionality**
- **Product ratings** (only for purchased items)
- **Real-time messaging** between buyers and sellers
- **SMS notifications** for new messages
- **Paystack payment integration**
- **Google Cloud Storage** for media files

## CORS Configuration
Currently allows:
- https://unitradegh.com
- http://localhost:3000
- http://127.0.0.1:3000

**Note**: Mobile app will need to be added to CORS_ALLOWED_ORIGINS if making direct API calls.

## Data Format Notes
- Dates are in ISO 8601 format
- Product features stored as JSON array
- Images returned as full URLs from Google Cloud Storage
- Pagination: 20 items per page (default)
- JWT tokens: 60 min access, 1 day refresh

## Security Considerations
- **CRITICAL**: Secret keys and credentials are exposed in settings.py
- Paystack secret key is visible
- Database credentials are visible
- Google Cloud credentials path is hardcoded
- Email credentials are visible
- SMS API key is visible

**Recommendation**: Move all secrets to environment variables before deployment.
