from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Product(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('suspended', 'Suspended'),
        ('hidden', 'Hidden'),
    ]
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('very_good', 'Very Good'),
        ('good', 'Good'),
        ('acceptable', 'Acceptable'),
    ]

    name = models.CharField(max_length=100, db_index=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    category = models.CharField(max_length=50, db_index=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    features = models.JSONField(blank=True, null=True, default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    stock = models.PositiveIntegerField(default=1)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['price', 'category']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

class ProductRating(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='product_ratings')
    rating = models.PositiveSmallIntegerField()
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} rated {self.rating} by {self.user}"