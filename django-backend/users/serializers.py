from rest_framework import serializers
from .models import University, Campus, User, EmailVerification, Wishlist
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from products.serializers import ProductSerializer

CAMEL_TO_SNAKE = {
    'firstName': 'first_name',
    'lastName': 'last_name',
    'phoneNumber': 'phone_number',
    'studentId': 'student_id',
    'businessName': 'business_name',
    'businessDescription': 'business_description',
    'profilePicture': 'profile_picture',
    'sellerType': 'seller_type',
    'programOfStudy': 'program_of_study',
}

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ['id', 'name']

class CampusSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), source='university', write_only=True
    )
    class Meta:
        model = Campus
        fields = ['id', 'name', 'university', 'university_id']

class UserSerializer(serializers.ModelSerializer):
    university = UniversitySerializer(read_only=True)
    university_id = serializers.PrimaryKeyRelatedField(
        queryset=University.objects.all(), source='university', write_only=True, required=False
    )
    campus = CampusSerializer(read_only=True)
    campus_id = serializers.PrimaryKeyRelatedField(
        queryset=Campus.objects.all(), source='campus', write_only=True, required=False
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = get_user_model()
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'role', 'seller_type', 'university', 'university_id', 'campus', 'campus_id',
            'phone_number', 'location', 'student_id', 'level', 'program_of_study',
            'business_name', 'business_description', 'bio', 'profile_picture', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def to_internal_value(self, data):
        # Map camelCase keys to snake_case
        if isinstance(data, dict):
            data = data.copy()
            for camel, snake in CAMEL_TO_SNAKE.items():
                if camel in data:
                    data[snake] = data.pop(camel)
        return super().to_internal_value(data)

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = get_user_model().objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

class EmailVerificationSendSerializer(serializers.Serializer):
    email = serializers.EmailField()

class EmailVerificationCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=ProductSerializer.Meta.model.objects.all(), source='product', write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'product', 'created_at']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info to the response
        data['user'] = UserSerializer(self.user).data
        data['success'] = True
        return data