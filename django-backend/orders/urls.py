from django.urls import path
from .views import OrderListCreateView, OrderDetailView, PaystackVerifyPaymentView, PaystackWebhookView, PaystackInitView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('verify-payment/', PaystackVerifyPaymentView.as_view(), name='order-verify-payment'),
    path('paystack-webhook/', PaystackWebhookView.as_view(), name='order-paystack-webhook'),
    path('paystack-init/', PaystackInitView.as_view(), name='order-paystack-init'),
] 