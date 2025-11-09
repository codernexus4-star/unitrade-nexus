from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
import datetime

class University(models.Model):
    name = models.CharField(max_length=255, unique=True)
    # Optionally add logo, location, etc.

    def __str__(self):
        return self.name

class Campus(models.Model):
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='campuses')
    name = models.CharField(max_length=255)

    class Meta:
        unique_together = ('university', 'name')

    def __str__(self):
        return f"{self.name} ({self.university.name})"

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None  # Remove username field
    email = models.EmailField('email address', unique=True)

    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    ]
    SELLER_TYPE_CHOICES = [
        ('student', 'Student'),
        ('professional', 'Professional'),
    ]
    LEVEL_CHOICES = [
        ('100', '100'),
        ('200', '200'),
        ('300', '300'),
        ('400', '400'),
        ('500', '500'),
        ('postgrad', 'Postgraduate'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    seller_type = models.CharField(max_length=20, choices=SELLER_TYPE_CHOICES, blank=True, null=True)
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True)
    campus = models.ForeignKey(Campus, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    student_id = models.CharField(max_length=50, blank=True, null=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, blank=True, null=True)
    program_of_study = models.CharField(max_length=255, blank=True, null=True)
    business_name = models.CharField(max_length=255, blank=True, null=True)
    business_description = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

class Wishlist(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"

class EmailVerification(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.otp} ({'verified' if self.is_verified else 'pending'})"


class PushToken(models.Model):
    """Store Expo push notification tokens for each user device"""
    
    DEVICE_TYPES = (
        ('ios', 'iOS'),
        ('android', 'Android'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_tokens')
    token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'token')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.device_type} - {self.token[:20]}..."


class NotificationLog(models.Model):
    """Log all sent notifications for debugging and analytics"""
    
    NOTIFICATION_TYPES = (
        ('order', 'Order'),
        ('message', 'Message'),
        ('payment', 'Payment'),
        ('product', 'Product'),
        ('review', 'Review'),
        ('system', 'System'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_logs')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(null=True, blank=True)
    sent_to_tokens = models.IntegerField(default=0)
    successful = models.BooleanField(default=False)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.type} - {self.created_at}"
