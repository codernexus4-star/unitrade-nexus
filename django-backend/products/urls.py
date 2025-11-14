from django.urls import path
from .views import (
    ProductListCreateView,
    ProductRetrieveUpdateDestroyView,
    ProductRatingListCreateView,
    FeaturedProductsView,
    RecentProductsView,
)

urlpatterns = [
    path('featured/', FeaturedProductsView.as_view(), name='product-featured'),
    path('recent/', RecentProductsView.as_view(), name='product-recent'),
    path('<int:product_id>/ratings/', ProductRatingListCreateView.as_view(), name='product-ratings'),
    path('', ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', ProductRetrieveUpdateDestroyView.as_view(), name='product-detail'),
]