#!/usr/bin/env python
"""
Quick script to clear all products
Run with: python clear_products.py
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append('/path/to/your/django-backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from products.models import Product, ProductImage

def clear_all_products():
    print("🚨 WARNING: This will delete ALL products!")
    
    # Count products
    product_count = Product.objects.count()
    image_count = ProductImage.objects.count()
    
    print(f"📊 Found {product_count} products and {image_count} images")
    
    if product_count == 0:
        print("✅ No products to delete")
        return
    
    # Confirm deletion
    confirm = input(f"Are you sure you want to delete {product_count} products? (yes/no): ")
    
    if confirm.lower() == 'yes':
        # Delete image files first
        for image in ProductImage.objects.all():
            if image.image:
                try:
                    if os.path.exists(image.image.path):
                        os.remove(image.image.path)
                        print(f"🗑️ Deleted image: {image.image.name}")
                except Exception as e:
                    print(f"❌ Error deleting image: {e}")
        
        # Delete all products
        deleted_count, deleted_objects = Product.objects.all().delete()
        
        print(f"✅ Deleted {deleted_count} products successfully!")
        print(f"📋 Details: {deleted_objects}")
    else:
        print("❌ Deletion cancelled")

if __name__ == "__main__":
    clear_all_products()
