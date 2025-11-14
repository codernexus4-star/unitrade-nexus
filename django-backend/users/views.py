from django.shortcuts import render
from rest_framework import viewsets, generics, permissions
from .models import University, Campus, User, EmailVerification
from .serializers import UniversitySerializer, CampusSerializer, UserSerializer, EmailVerificationSendSerializer, EmailVerificationCheckSerializer, WishlistSerializer
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

# Create your views here.

from .models import Wishlist

class WishlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        from django.db import IntegrityError
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Item already in wishlist.'})

class WishlistDeleteView(generics.DestroyAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'product_id'

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        product_id = self.kwargs.get('product_id')
        return generics.get_object_or_404(queryset, product_id=product_id)

class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]

class CampusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        university_id = self.request.query_params.get('university_id')
        if university_id:
            queryset = queryset.filter(university_id=university_id)
        return queryset

class SendOTPView(generics.GenericAPIView):
    serializer_class = EmailVerificationSendSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = f"{random.randint(100000, 999999)}"
        # Remove old OTPs for this email
        EmailVerification.objects.filter(email=email, is_verified=False).delete()
        record = EmailVerification.objects.create(email=email, otp=otp)
        print('DEBUG: Created EmailVerification:', record, record.pk, 'OTP:', otp)
        email_sent = False
        try:
            send_mail(
                subject='Your UniTrade Verification Code',
                message=f'Your verification code is: {otp}',
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@unitrade.com'),
                recipient_list=[email],
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            print('DEBUG: Failed to send OTP email:', e)

        message = 'Verification code sent.' if email_sent else 'Verification code generated. Check console/Network response for OTP.'
        return Response({'success': True, 'message': message, 'otp': otp})

class VerifyOTPView(generics.GenericAPIView):
    serializer_class = EmailVerificationCheckSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        try:
            record = EmailVerification.objects.get(email=email, otp=otp, is_verified=False)
            if record.is_expired():
                return Response({'success': False, 'message': 'OTP expired.'}, status=400)
            record.is_verified = True
            record.save()
            return Response({'success': True, 'message': 'Email verified successfully.'})
        except EmailVerification.DoesNotExist:
            return Response({'success': False, 'message': 'Invalid code.'}, status=400)

# Update UserRegistrationView to check email verification
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        print('DEBUG: Registration email from request:', email)
        if not email:
            return Response({'success': False, 'message': 'Email is required.'}, status=400)
        # Check if email is verified
        is_verified = EmailVerification.objects.filter(email=email, is_verified=True).exists()
        print('DEBUG: EmailVerification is_verified for', email, ':', is_verified)
        if not is_verified:
            return Response({'success': False, 'message': 'Email not verified.'}, status=400)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            # Handle validation errors with proper response format
            if hasattr(e, 'detail'):
                detail_str = str(e.detail) if hasattr(e.detail, '__str__') else str(e.detail)
                if 'No active account found' in detail_str or 'invalid' in detail_str.lower():
                    return Response({
                        'success': False,
                        'message': 'Invalid email or password.',
                        'code': 'invalid_credentials'
                    }, status=400)
            return Response({
                'success': False,
                'message': 'Unable to log in with provided credentials.',
                'code': 'authentication_failed'
            }, status=400)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'success': True, 'user': serializer.data})

class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        password = request.data.get('password')
        if not password or not request.user.check_password(password):
            return Response({'success': False, 'message': 'Incorrect password. Please enter your current password to confirm changes.'}, status=400)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'user': serializer.data})
        return Response(serializer.errors, status=400)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not current_password or not new_password or not confirm_password:
            return Response({'success': False, 'message': 'All password fields are required.'}, status=400)
        if not user.check_password(current_password):
            return Response({'success': False, 'message': 'Current password is incorrect.'}, status=400)
        if new_password != confirm_password:
            return Response({'success': False, 'message': 'New passwords do not match.'}, status=400)
        from django.core.exceptions import ValidationError as DjangoValidationError
        from django.contrib.auth.password_validation import validate_password
        try:
            validate_password(new_password, user)
        except DjangoValidationError as e:
            return Response({'success': False, 'message': ' '.join(e.messages)}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'success': True, 'message': 'Password changed successfully.'})


# Push Notification Views
from .models import PushToken
from .services.push_notifications import PushNotificationService

class SavePushTokenView(APIView):
    """Save user's push notification token"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        token = request.data.get('token')
        device_type = request.data.get('device_type', 'android')
        
        if not token:
            return Response(
                {'success': False, 'message': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate token format
        if not PushNotificationService.validate_token(token):
            return Response(
                {'success': False, 'message': 'Invalid token format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create or update token
            push_token, created = PushToken.objects.update_or_create(
                user=request.user,
                token=token,
                defaults={
                    'device_type': device_type,
                    'is_active': True
                }
            )
            
            return Response({
                'success': True,
                'message': 'Token saved successfully',
                'created': created
            })
        
        except Exception as e:
            return Response(
                {'success': False, 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RemovePushTokenView(APIView):
    """Remove user's push notification token"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'success': False, 'message': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            deleted_count = PushToken.objects.filter(
                user=request.user,
                token=token
            ).delete()[0]
            
            return Response({
                'success': True,
                'message': 'Token removed successfully',
                'deleted': deleted_count
            })
        
        except Exception as e:
            return Response(
                {'success': False, 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SendTestNotificationView(APIView):
    """Send test notification to user (for development)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        result = PushNotificationService.send_notification(
            user_id=request.user.id,
            title='Test Notification',
            body='This is a test notification from UniTrade! 🎉',
            data={'type': 'test'},
            notification_type='system'
        )
        
        return Response(result)
