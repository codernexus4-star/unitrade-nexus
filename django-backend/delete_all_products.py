#!/usr/bin/env python
"""
Script to delete all products from the database
Run this from the django-backend directory with:
python manage.py shell < delete_all_products.py
"""

from products.models import Product, ProductImage
import os

print("=== DELETING ALL PRODUCTS ===")

# Get all products
products = Product.objects.all()
product_count = products.count()

print(f"Found {product_count} products to delete")

if product_count > 0:
    # Delete associated image files first
    for product in products:
        print(f"Deleting product: {product.name} (ID: {product.id})")
        
        # Delete image files from storage
        for image in product.images.all():
            if image.image:
                try:
                    if os.path.exists(image.image.path):
                        os.remove(image.image.path)
                        print(f"  ✅ Deleted image file: {image.image.name}")
                except Exception as e:
                    print(f"  ❌ Error deleting image file: {e}")
    
    # Delete all products (this will cascade delete ProductImages)
    deleted_count, deleted_objects = products.delete()
    
    print(f"✅ Successfully deleted {deleted_count} products")
    print(f"📊 Deleted objects: {deleted_objects}")
else:
    print("No products found to delete")

print("===============================")
