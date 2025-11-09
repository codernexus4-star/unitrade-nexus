from rest_framework import serializers
from .models import MessageThread, Message
from users.serializers import UserSerializer
from products.serializers import ProductSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'thread', 'sender', 'content', 'timestamp', 'is_read']

class MessageThreadSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = MessageThread
        fields = ['id', 'buyer', 'seller', 'product', 'created_at', 'updated_at', 'messages'] 