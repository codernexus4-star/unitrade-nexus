# 🚀 UniTrade Performance Optimization Guide

This guide provides actionable performance improvements for your UniTrade mobile app.

---

## 📱 Frontend Performance (React Native/Expo)

### 1. Image Optimization ⭐ HIGH IMPACT

**Problem:** Large images slow down app and increase data usage.

**Solutions:**

#### A. Use Expo Image Component (Better than React Native Image)

```bash
npx expo install expo-image
```

Replace in all screens:
```javascript
// OLD
import { Image } from 'react-native';

// NEW
import { Image } from 'expo-image';

<Image
  source={{ uri: product.image }}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"  // Cache images
/>
```

#### B. Optimize Product Images on Upload

Create `src/utils/imageOptimizer.js`:
```javascript
import * as ImageManipulator from 'expo-image-manipulator';

export const optimizeImage = async (uri) => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        { resize: { width: 1000 } }, // Max width 1000px
      ],
      {
        compress: 0.7, // 70% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Image optimization error:', error);
    return uri;
  }
};

// Usage in AddProductScreen:
const optimizedUri = await optimizeImage(selectedImage.uri);
```

#### C. Lazy Load Images

```javascript
import { Image } from 'expo-image';

<Image
  source={{ uri: product.image }}
  placeholder={require('../assets/placeholder.png')}
  transition={200}
/>
```

---

### 2. FlatList Performance ⭐ HIGH IMPACT

**Problem:** Lists with many items lag during scroll.

**Solutions:**

#### Optimize FlatList Props

Update `HomeScreen.js`, `SearchScreen.js`, `OrderHistoryScreen.js`:

```javascript
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item.id.toString()}
  
  // Performance Props
  removeClippedSubviews={true}           // Unmount off-screen items
  maxToRenderPerBatch={10}               // Render 10 items per batch
  windowSize={10}                        // Keep 10 screens worth of items
  initialNumToRender={6}                 // Render 6 items initially
  updateCellsBatchingPeriod={50}         // Batch updates every 50ms
  getItemLayout={(data, index) => ({     // If item height is fixed
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

#### Memoize List Items

```javascript
import React, { memo } from 'react';

const ProductCard = memo(({ product, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Your product card UI */}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Only re-render if product changed
  return prevProps.product.id === nextProps.product.id;
});
```

---

### 3. API Call Optimization ⭐ HIGH IMPACT

#### A. Implement Request Debouncing (Search)

Update `SearchScreen.js`:

```javascript
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search - wait 500ms after user stops typing
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchProducts(query);
    }, 500),
    []
  );
  
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };
  
  return (
    <TextInput
      value={searchQuery}
      onChangeText={handleSearchChange}
      placeholder="Search products..."
    />
  );
};
```

Install lodash:
```bash
npm install lodash
```

#### B. Cache API Responses

Create `src/utils/cache.js`:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedFetch = async (key, fetchFunction) => {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (!isExpired) {
        console.log('Using cached data for:', key);
        return data;
      }
    }
    
    // Fetch fresh data
    const data = await fetchFunction();
    
    // Cache it
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fetchFunction();
  }
};

// Usage in HomeScreen:
const loadProducts = async () => {
  const products = await cachedFetch(
    'home_products',
    () => productService.getProducts()
  );
  setProducts(products);
};
```

#### C. Pagination for Large Lists

Update `productService.js`:

```javascript
getProducts: async (page = 1, limit = 20) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.PRODUCTS}?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
},
```

Implement in `HomeScreen.js`:

```javascript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMoreProducts = async () => {
  if (!hasMore || loading) return;
  
  setLoading(true);
  const result = await productService.getProducts(page + 1);
  
  if (result.success && result.data.length > 0) {
    setProducts([...products, ...result.data]);
    setPage(page + 1);
  } else {
    setHasMore(false);
  }
  setLoading(false);
};

<FlatList
  data={products}
  onEndReached={loadMoreProducts}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
/>
```

---

### 4. State Management Optimization

#### Use React.memo for Complex Components

```javascript
import React, { memo } from 'react';

const ProductCard = memo(({ product }) => {
  // Only re-renders when product changes
  return <View>{/* UI */}</View>;
});
```

#### Use useMemo for Expensive Calculations

```javascript
import { useMemo } from 'react';

const FilteredProducts = ({ products, category }) => {
  const filtered = useMemo(() => {
    return products.filter(p => p.category === category);
  }, [products, category]); // Only recalculate when these change
  
  return <ProductList products={filtered} />;
};
```

#### Use useCallback for Functions Passed to Children

```javascript
import { useCallback } from 'react';

const handleProductPress = useCallback((productId) => {
  navigation.navigate('ProductDetail', { productId });
}, [navigation]);
```

---

### 5. Navigation Performance

#### Enable Screen Options

Update `MainNavigator.js`:

```javascript
<Stack.Navigator
  screenOptions={{
    headerShown: false,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  }}
>
```

#### Lazy Load Screens

```javascript
import React, { lazy, Suspense } from 'react';

const ProductDetailScreen = lazy(() => import('./screens/ProductDetailScreen'));

<Suspense fallback={<LoadingScreen />}>
  <ProductDetailScreen />
</Suspense>
```

---

### 6. Remove Console.logs in Production

Create `src/utils/logger.js`:

```javascript
export const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
};

// Replace all console.log with:
import { logger } from './utils/logger';
logger.log('User logged in');
```

---

## 🖥️ Backend Performance (Django)

### 1. Database Query Optimization ⭐ HIGH IMPACT

#### A. Use select_related and prefetch_related

Update `products/views.py`:

```python
# BAD - N+1 queries
products = Product.objects.all()  # 1 query
for product in products:
    print(product.seller.name)  # N queries

# GOOD - 2 queries total
products = Product.objects.select_related('seller', 'category').all()

# For reverse foreign keys
products = Product.objects.prefetch_related('ratings', 'images').all()
```

#### B. Add Database Indexes

Update `products/models.py`:

```python
class Product(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['category', 'created_at']),
            models.Index(fields=['seller', 'status']),
        ]
```

Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

#### C. Use only() and defer()

```python
# Only fetch needed fields
products = Product.objects.only('id', 'name', 'price', 'image')

# Exclude heavy fields
products = Product.objects.defer('description')
```

---

### 2. API Response Optimization

#### A. Pagination

Update `products/views.py`:

```python
from rest_framework.pagination import PageNumberPagination

class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    pagination_class = ProductPagination
```

#### B. Response Caching

```python
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator

class ProductViewSet(viewsets.ModelViewSet):
    @method_decorator(cache_page(60 * 5))  # Cache for 5 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
```

#### C. Compress Responses

Add to `settings.py`:

```python
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',  # Add this at top
    # ... other middleware
]
```

---

### 3. Database Connection Pooling

Install:
```bash
pip install psycopg2-binary
```

Update `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'unitrade',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
        'CONN_MAX_AGE': 600,  # Keep connections for 10 minutes
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

---

### 4. Background Tasks for Heavy Operations

Install Celery:
```bash
pip install celery redis
```

Create `backend/celery.py`:

```python
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('unitrade')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

Use for notifications:
```python
from celery import shared_task

@shared_task
def send_notification_async(user_id, title, body, data):
    from users.services import PushNotificationService
    return PushNotificationService.send_notification(
        user_id, title, body, data
    )

# Usage:
send_notification_async.delay(user_id, 'New Order', 'You have a new order!')
```

---

## 🗄️ Image Storage Optimization

### Use Cloudinary or AWS S3

Install:
```bash
pip install cloudinary
```

Update `settings.py`:

```python
import cloudinary

cloudinary.config(
    cloud_name='your_cloud_name',
    api_key='your_api_key',
    api_secret='your_api_secret'
)

# Use Cloudinary for media files
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

---

## 📊 Monitoring & Analytics

### 1. Add Performance Monitoring

```bash
npx expo install expo-analytics
```

Track screen views and events:

```javascript
import * as Analytics from 'expo-firebase-analytics';

// Track screen view
Analytics.logEvent('screen_view', {
  screen_name: 'ProductDetail',
  screen_class: 'ProductDetailScreen',
});

// Track events
Analytics.logEvent('product_viewed', {
  product_id: product.id,
  product_name: product.name,
});
```

---

## ✅ Quick Wins Checklist

### Frontend (30 minutes)
- [ ] Add `removeClippedSubviews` to all FlatLists
- [ ] Replace `console.log` with logger in production
- [ ] Add image caching with expo-image
- [ ] Memoize list item components

### Backend (30 minutes)
- [ ] Add database indexes to frequently queried fields
- [ ] Enable GZIP compression
- [ ] Add pagination to product list
- [ ] Use select_related for foreign keys

### Images (20 minutes)
- [ ] Optimize images on upload
- [ ] Add image caching
- [ ] Use CDN for static assets

---

## 📈 Expected Performance Gains

| Optimization | Impact | Effort |
|--------------|--------|--------|
| Image optimization | 40% faster load | Medium |
| FlatList optimization | 60% smoother scroll | Low |
| API caching | 80% faster repeat loads | Medium |
| Database indexes | 50% faster queries | Low |
| Pagination | 90% faster initial load | Medium |
| Remove console.logs | 10% faster | Low |

---

## 🎯 Priority Order

### Week 1 (High Impact, Low Effort)
1. Add FlatList performance props
2. Add database indexes
3. Enable GZIP compression
4. Remove console.logs

### Week 2 (High Impact, Medium Effort)
5. Implement pagination
6. Add API caching
7. Optimize images
8. Add request debouncing

### Week 3 (Medium Impact, Medium Effort)
9. Memoize components
10. Lazy load screens
11. Add CDN for images
12. Implement background tasks

---

## 🧪 Performance Testing

### Measure Before & After

```javascript
// Add to any screen
import { PerformanceObserver, performance } from 'react-native-performance';

const start = performance.now();

// Your operation
await loadProducts();

const end = performance.now();
console.log(`Load time: ${end - start}ms`);
```

### Use Flipper for Debugging
- Install Flipper desktop app
- Monitor network requests
- Profile React renders
- Check image sizes

---

## 📚 Additional Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Django Optimization](https://docs.djangoproject.com/en/stable/topics/performance/)
- [Expo Performance](https://docs.expo.dev/guides/performance/)

---

**Status:** Ready to Implement  
**Total Implementation Time:** ~2-3 days  
**Expected Performance Gain:** 50-70% overall improvement
