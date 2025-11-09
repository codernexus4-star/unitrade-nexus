from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UniversityViewSet, CampusViewSet, UserRegistrationView, SendOTPView, 
    VerifyOTPView, MyTokenObtainPairView, UserMeView, UserProfileUpdateView, 
    ChangePasswordView, WishlistListCreateView, WishlistDeleteView,
    SavePushTokenView, RemovePushTokenView, SendTestNotificationView
)

router = DefaultRouter()
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'campuses', CampusViewSet, basename='campus')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='user-me'),
    path('profile/', UserProfileUpdateView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('wishlist/', WishlistListCreateView.as_view(), name='wishlist-list-create'),
    path('wishlist/<int:product_id>/', WishlistDeleteView.as_view(), name='wishlist-delete'),
    
    # Push Notifications
    path('push-tokens/', SavePushTokenView.as_view(), name='save-push-token'),
    path('push-tokens/remove/', RemovePushTokenView.as_view(), name='remove-push-token'),
    path('push-tokens/test/', SendTestNotificationView.as_view(), name='test-notification'),
    
    path('', include(router.urls)),
] 