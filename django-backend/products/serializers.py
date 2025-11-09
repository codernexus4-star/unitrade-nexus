from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, ProductImage, ProductRating
import base64
import uuid
from django.core.files.base import ContentFile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # Add name field for frontend compatibility
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'name', 'role', 'seller_type']
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    seller = UserSerializer(read_only=True)
    # Add date field mapping for frontend compatibility
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    # Add stockCount alias for frontend compatibility
    stockCount = serializers.IntegerField(source='stock', read_only=True)
    # Add base64 images field for mobile app
    images_base64 = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'condition', 
            'features', 'status', 'stock', 'stockCount', 'images', 'seller',
            'createdAt', 'updatedAt', 'images_base64'
        ]
        read_only_fields = ['status', 'seller', 'stockCount', 'createdAt', 'updatedAt']

    def create(self, validated_data):
        request = self.context.get('request')
        
        # Handle base64 images from mobile app
        images_base64 = validated_data.pop('images_base64', [])
        
        # Handle regular file uploads
        images = request.FILES.getlist('images') if request else []
        
        print("=== DJANGO PRODUCT CREATION ===")
        print(f"📱 Base64 images received: {len(images_base64)}")
        print(f"📁 File uploads received: {len(images)}")
        
        # Create the product
        product = Product.objects.create(
            **validated_data,
            seller=request.user,
            status='active',
        )
        
        # Process base64 images (from mobile app)
        for i, image_data in enumerate(images_base64):
            try:
                if 'data' in image_data and image_data['data']:
                    print(f"🔄 Processing base64 image {i+1}...")
                    
                    # Extract base64 data (format: "data:image/jpeg;base64,/9j/4AAQ...")
                    data_url = image_data['data']
                    if ',' in data_url:
                        header, data = data_url.split(',', 1)
                        
                        # Get file extension from header
                        if 'jpeg' in header or 'jpg' in header:
                            ext = 'jpg'
                        elif 'png' in header:
                            ext = 'png'
                        elif 'webp' in header:
                            ext = 'webp'
                        else:
                            ext = 'jpg'  # default
                        
                        # Decode base64
                        image_content = base64.b64decode(data)
                        
                        # Create unique filename
                        filename = f"product_{product.id}_{uuid.uuid4().hex[:8]}.{ext}"
                        
                        # Create Django file object
                        image_file = ContentFile(image_content, name=filename)
                        
                        # Save to ProductImage model
                        ProductImage.objects.create(
                            product=product,
                            image=image_file
                        )
                        
                        print(f"✅ Saved base64 image {i+1}: {filename}")
                        
            except Exception as e:
                print(f"❌ Error processing base64 image {i+1}: {e}")
                continue
        
        # Process regular file uploads (from web/other sources)
        for image in images:
            ProductImage.objects.create(product=product, image=image)
            print(f"✅ Saved file upload: {image.name}")
        
        print(f"🎉 Product created with ID: {product.id}")
        print("===============================")
        
        return product

    def update(self, instance, validated_data):
        request = self.context.get('request')
        
        # Handle base64 images from mobile app
        images_base64 = validated_data.pop('images_base64', [])
        
        # Handle regular file uploads
        images = request.FILES.getlist('images') if request else []

        print("=== DJANGO PRODUCT UPDATE ===")
        print(f"📱 Base64 images received: {len(images_base64)}")
        print(f"📁 File uploads received: {len(images)}")

        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle image deletions
        delete_image_ids = request.data.get('delete_image_ids') if request else None
        if delete_image_ids:
            # Accept both comma-separated string or list
            if isinstance(delete_image_ids, str):
                delete_image_ids = [i for i in delete_image_ids.split(',') if i.strip()]
            for img_id in delete_image_ids:
                try:
                    img_obj = instance.images.get(id=img_id)
                    img_obj.delete()
                    print(f"🗑️ Deleted image ID: {img_id}")
                except ProductImage.DoesNotExist:
                    pass

        # Process base64 images (from mobile app)
        for i, image_data in enumerate(images_base64):
            try:
                if 'data' in image_data and image_data['data']:
                    print(f"🔄 Processing base64 image {i+1}...")
                    
                    # Extract base64 data
                    data_url = image_data['data']
                    if ',' in data_url:
                        header, data = data_url.split(',', 1)
                        
                        # Get file extension from header
                        if 'jpeg' in header or 'jpg' in header:
                            ext = 'jpg'
                        elif 'png' in header:
                            ext = 'png'
                        elif 'webp' in header:
                            ext = 'webp'
                        else:
                            ext = 'jpg'  # default
                        
                        # Decode base64
                        image_content = base64.b64decode(data)
                        
                        # Create unique filename
                        filename = f"product_{instance.id}_{uuid.uuid4().hex[:8]}.{ext}"
                        
                        # Create Django file object
                        image_file = ContentFile(image_content, name=filename)
                        
                        # Save to ProductImage model
                        ProductImage.objects.create(
                            product=instance,
                            image=image_file
                        )
                        
                        print(f"✅ Saved base64 image {i+1}: {filename}")
                        
            except Exception as e:
                print(f"❌ Error processing base64 image {i+1}: {e}")
                continue

        # Add new file uploads
        for image in images:
            ProductImage.objects.create(product=instance, image=image)
            print(f"✅ Saved file upload: {image.name}")

        print(f"🎉 Product updated with ID: {instance.id}")
        print("=============================")

        return instance

class ProductRatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ProductRating
        fields = ['id', 'product', 'user', 'rating', 'review', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'product']