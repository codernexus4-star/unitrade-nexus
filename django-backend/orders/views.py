from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.conf import settings
from .models import Order
from .serializers import OrderSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', None) == 'admin':
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(buyer=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

class PaystackVerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        reference = request.data.get('reference')
        if not reference:
            return Response({'detail': 'Reference is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify with Paystack
        headers = {
            'Authorization': f'Bearer {getattr(settings, "PAYSTACK_SECRET_KEY", "")}',
        }
        url = f'https://api.paystack.co/transaction/verify/{reference}'
        paystack_response = requests.get(url, headers=headers)
        data = paystack_response.json()

        if not data.get('status'):
            return Response({'detail': 'Verification failed.', 'paystack': data}, status=status.HTTP_400_BAD_REQUEST)

        # Find the order
        try:
            order = Order.objects.get(paystack_reference=reference)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found for this reference.'}, status=status.HTTP_404_NOT_FOUND)

        # Update order status if payment is successful
        if data['data']['status'] == 'success':
            order.payment_status = 'paid'
            order.status = 'processing'
            order.save()
            return Response({'detail': 'Payment verified and order updated.', 'order_id': order.id})
        else:
            return Response({'detail': 'Payment not successful.', 'paystack': data}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class PaystackWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        event = request.data.get('event')
        data = request.data.get('data', {})
        reference = data.get('reference')
        logger.info(f"Paystack webhook received: event={event}, reference={reference}")

        if not reference:
            return Response({'detail': 'No reference provided.'}, status=400)

        try:
            order = Order.objects.get(paystack_reference=reference)
        except Order.DoesNotExist:
            logger.warning(f"Order not found for reference: {reference}")
            return Response({'detail': 'Order not found.'}, status=404)

        if event == 'charge.success' and data.get('status') == 'success':
            order.payment_status = 'paid'
            order.status = 'processing'
            order.save()
            logger.info(f"Order {order.id} marked as paid via webhook.")
        elif event == 'charge.failed':
            order.payment_status = 'failed'
            order.save()
            logger.info(f"Order {order.id} marked as failed via webhook.")
        # You can handle more events as needed

        return Response({'detail': 'Webhook received.'})

class PaystackInitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        email = request.data.get('email')
        order_id = request.data.get('order_id')
        if not amount or not email or not order_id:
            return Response({'detail': 'amount, email, and order_id are required.'}, status=400)

        # Optionally, get the order and update its status to 'pending'
        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=404)

        # Prepare Paystack payload
        callback_url = f'http://localhost:3000/order-confirmation/{order_id}'
        payload = {
            'amount': int(float(amount) * 100),  # Paystack expects amount in kobo/pesewas
            'email': email,
            'reference': order.paystack_reference,
            'callback_url': callback_url,
        }
        headers = {
            'Authorization': f'Bearer {getattr(settings, "PAYSTACK_SECRET_KEY", "")}',
            'Content-Type': 'application/json',
        }
        paystack_url = 'https://api.paystack.co/transaction/initialize'
        resp = requests.post(paystack_url, json=payload, headers=headers)
        data = resp.json()
        if not data.get('status'):
            return Response({'detail': 'Paystack initialization failed.', 'paystack': data}, status=400)
        return Response({'authorization_url': data['data']['authorization_url']})
