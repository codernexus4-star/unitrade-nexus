from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from users.serializers import UserSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), required=False)
    seller = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'name', 'price', 'quantity', 'image', 'seller_name', 'category', 'seller'
        ]
        read_only_fields = ['id']

    def get_seller(self, obj):
        # Return seller id and name from the related product, if available
        if obj.product and obj.product.seller:
            return {
                'id': obj.product.seller.id,
                'name': getattr(obj.product.seller, 'get_full_name', lambda: obj.product.seller.username)() or obj.product.seller.username
            }
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    buyer = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'total', 'status', 'payment_method', 'payment_status',
            'paystack_reference', 'delivery_address', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'buyer', 'status', 'payment_status', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # request = self.context.get('request')
        # buyer = request.user if request else None
        order = Order.objects.create(status='pending', payment_status='pending', payment_method='paystack', **validated_data)
        for item_data in items_data:
            product = item_data.get('product')
            # Set image from product if not already provided
            if not item_data.get('image') and product:
                # Get first image if available
                first_image = product.images.first()
                if first_image:
                    item_data['image'] = first_image.image.url if hasattr(first_image.image, 'url') else str(first_image.image)
            OrderItem.objects.create(order=order, **item_data)
        return order 