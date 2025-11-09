from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import MessageThread, Message
from .serializers import MessageThreadSerializer, MessageSerializer
from django.db.models import Q
from users.models import User
from users.sms_utils import send_sms_notification

# Create your views here.

class IsThreadParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.buyer or request.user == obj.seller

class MessageThreadViewSet(viewsets.ModelViewSet):
    queryset = MessageThread.objects.all()
    serializer_class = MessageThreadSerializer
    permission_classes = [permissions.IsAuthenticated, IsThreadParticipant]

    def get_queryset(self):
        user = self.request.user
        return MessageThread.objects.filter(Q(buyer=user) | Q(seller=user)).order_by('-updated_at')

    def perform_create(self, serializer):
        # Ensure only buyer or seller can create, and prevent duplicate threads
        buyer = self.request.data.get('buyer')
        seller = self.request.data.get('seller')
        product = self.request.data.get('product')
        thread, created = MessageThread.objects.get_or_create(
            buyer_id=buyer, seller_id=seller, product_id=product
        )
        if created:
            serializer.instance = thread
        else:
            serializer.instance = thread

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        thread = self.get_object()
        messages = thread.messages.filter(is_read=False).exclude(sender=request.user)
        messages.update(is_read=True)
        return Response({'status': 'messages marked as read'})

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        thread_id = self.request.query_params.get('thread')
        qs = Message.objects.filter(thread__buyer=user) | Message.objects.filter(thread__seller=user)
        if thread_id:
            qs = qs.filter(thread_id=thread_id)
        return qs.order_by('timestamp')

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        # Send SMS notification to seller if sender is not seller
        thread = message.thread
        seller = thread.seller
        if self.request.user != seller and seller.phone_number:
            buyer = self.request.user
            if thread.product:
                sms_message = f"You have a new message from {buyer.first_name or buyer.email} about your product '{thread.product.name}'. Log in to UniTrade to reply."
            else:
                sms_message = f"You have a new message from {buyer.first_name or buyer.email} on UniTrade. Log in to reply."
            send_sms_notification(seller.phone_number, sms_message)
