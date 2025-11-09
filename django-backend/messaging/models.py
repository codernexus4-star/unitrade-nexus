from django.db import models
from django.conf import settings
from products.models import Product

# Create your models here.

class MessageThread(models.Model):
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='buyer_threads', on_delete=models.CASCADE)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='seller_threads', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='message_threads', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('buyer', 'seller', 'product')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Thread: {self.buyer} & {self.seller} ({self.product})"

class Message(models.Model):
    thread = models.ForeignKey(MessageThread, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender} at {self.timestamp}"
