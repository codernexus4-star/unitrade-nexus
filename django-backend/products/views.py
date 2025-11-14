from django.shortcuts import render
from rest_framework import generics, permissions, filters
from .models import Product
from .serializers import ProductSerializer
import os

# Create your views here.

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ProductRating
from .serializers import ProductRatingSerializer
from orders.models import OrderItem
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied

class ProductRatingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        ratings = ProductRating.objects.filter(product_id=product_id)
        serializer = ProductRatingSerializer(ratings, many=True)
        avg = ratings.aggregate(models.Avg('rating'))['rating__avg']
        count = ratings.count()
        return Response({
            'results': serializer.data,
            'average': avg or 0,
            'count': count
        })

    def post(self, request, product_id):
        user = request.user
        # Check if user purchased this product
        purchased = OrderItem.objects.filter(
            order__buyer=user,
            product_id=product_id,
            order__status__in=['completed', 'delivered']
        ).exists()
        if not purchased:
            raise PermissionDenied('You can only rate products you have purchased.')
        # Check if already rated
        instance = ProductRating.objects.filter(product_id=product_id, user=user).first()
        data = request.data.copy()
        data['product'] = product_id
        if instance:
            serializer = ProductRatingSerializer(instance, data=data, partial=True)
        else:
            serializer = ProductRatingSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=user, product_id=product_id)
        return Response(serializer.data, status=status.HTTP_201_CREATED if not instance else status.HTTP_200_OK)


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'category', 'features']

    def get_queryset(self):
        queryset = super().get_queryset()
        university = self.request.query_params.get('university')
        if university and university != 'All':
            queryset = queryset.filter(seller__university__name=university)
        return queryset


class FeaturedProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(status='active')
        university = self.request.query_params.get('university')
        if university and university != 'All':
            queryset = queryset.filter(seller__university__name=university)
        return queryset


class RecentProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(status='active')
        university = self.request.query_params.get('university')
        if university and university != 'All':
            queryset = queryset.filter(seller__university__name=university)
        return queryset

from rest_framework.exceptions import PermissionDenied

class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        # Only allow the seller who owns the product to access (for sellers)
        if user.is_authenticated and hasattr(user, 'role') and user.role == 'seller':
            if obj.seller_id != user.id:
                raise PermissionDenied("You do not have permission to access this product.")
        return obj

    def perform_destroy(self, instance):
        # Delete associated image files before deleting the product
        for image in instance.images.all():
            if image.image:
                try:
                    # Delete the file from storage
                    if os.path.exists(image.image.path):
                        os.remove(image.image.path)
                except Exception as e:
                    # Log the error but continue with deletion
                    print(f"Error deleting image file {image.image.path}: {e}")
        
        # Delete the product (this will cascade delete ProductImage records)
        instance.delete()
