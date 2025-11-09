import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { PRODUCT_CATEGORIES } from '../../constants/config';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { showSuccess, showError, showDestructiveConfirm } from '../../utils/alert';
import logger from '../../utils/logger';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isSeller = user?.role?.toLowerCase() === 'seller';
  const { getCartCount, cartItems, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, [isSeller]);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadProducts('All'),
      !isSeller ? loadFeaturedProducts() : Promise.resolve(),
      loadWishlist(),
    ]);
    setLoading(false);
  };


  const loadProducts = async (category = 'All') => {
    const params = {
      ...(category !== 'All' ? { category } : {}),
      ...(isSeller && user?.id ? { seller: user.id } : {}),
    };
    
    logger.log('Loading products with params:', params);
    logger.log('User ID:', user?.id, 'isSeller:', isSeller);
    
    const result = await productService.getProducts(params);
    if (result.success) {
      const data = result.data.results || result.data || [];
      logger.log('=== PRODUCTS DEBUG ===');
      logger.log('Loaded products:', data.length, 'products');
      logger.log('Full product data:', JSON.stringify(data, null, 2));
      logger.log('Product summary:', data.map(p => ({ 
        id: p.id, 
        name: p.name, 
        seller: p.seller, 
        price: p.price,
        status: p.status,
        images: p.images?.length || 0
      })));
      logger.log('=====================');
      setProducts(data);
    } else {
      logger.log('Failed to load products:', result.error);
    }
  };

  const loadFeaturedProducts = async () => {
    const result = await productService.getProducts({ ordering: '-created_at', page_size: 5 });
    if (result.success) {
      const data = result.data.results || result.data || [];
      setFeaturedProducts(data.slice(0, 5));
    }
  };

  const loadWishlist = async () => {
    try {
      const result = await userService.getWishlist();
      if (result.success) {
        const wishlistItems = result.data.results || result.data || [];
        const ids = new Set(wishlistItems.map((item) => item.product.id));
        setWishlistIds(ids);
      }
    } catch (error) {
      logger.log('Error loading wishlist:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleDeleteProduct = async (productId, productName) => {
    showDestructiveConfirm(
      'Delete Product',
      `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      'Delete',
      async () => {
        const result = await productService.deleteProduct(productId);
        if (result.success) {
          showSuccess('Product Deleted', 'Product has been deleted successfully');
          // Reload products to reflect the change
          loadProducts(selectedCategory);
        } else {
          showError('Error', result.error || 'Failed to delete product');
        }
      }
    );
  };

  const toggleWishlist = async (productId, event) => {
    // Prevent navigation to product detail
    if (event) {
      event.stopPropagation();
    }

    const isWishlisted = wishlistIds.has(productId);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const result = await userService.removeFromWishlist(productId);
        if (result.success) {
          setWishlistIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      } else {
        // Add to wishlist
        const result = await userService.addToWishlist(productId);
        if (result.success) {
          setWishlistIds((prev) => new Set(prev).add(productId));
        }
      }
    } catch (error) {
      logger.log('Error toggling wishlist:', error);
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Hello {user?.first_name || 'Student'} 👋</Text>
          <Text style={styles.headerSubtitle}>
            {isSeller ? 'Manage your products and grow your business' : 'What are you looking for today?'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color={BRAND_COLORS.navyBlue} />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderBanner = () => (
    <View style={styles.bannerSection}>
      <LinearGradient
        colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Get connected on{'\n'}your campus</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => {
              setSelectedCategory('All');
              // Scroll to products section (approximately 600px down)
              scrollViewRef.current?.scrollTo({ y: 600, animated: true });
            }}
          >
            <Text style={styles.shopButtonText}>Shop</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require('../../../assets/shoes.png')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
      </LinearGradient>
      <View style={styles.bannerDots}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === 0 && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderFeaturedProducts = () => {
    if (isSeller) return null;
    if (featuredProducts.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="flame" size={24} color={BRAND_COLORS.goldenYellow} />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredContainer}
        >
          {featuredProducts.map((item, index) => {
            const isWishlisted = wishlistIds.has(item.id);
            return (
              <View key={item.id} style={styles.featuredCard}>
                <TouchableOpacity
                  style={styles.featuredImageContainer}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: item.images?.[0]?.image || 'https://via.placeholder.com/200' }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                  />
                  
                  {/* Trending Badge */}
                  <View style={styles.trendingBadge}>
                    <LinearGradient
                      colors={[BRAND_COLORS.goldenYellow, '#FF8C00']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.trendingBadgeGradient}
                    >
                      <Ionicons name="trending-up" size={12} color={COLORS.white} />
                      <Text style={styles.trendingBadgeText}>#{index + 1}</Text>
                    </LinearGradient>
                  </View>

                  {/* Wishlist Button */}
                  <TouchableOpacity
                    style={styles.featuredWishlistButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item.id, e);
                    }}
                  >
                    <Ionicons
                      name={isWishlisted ? "heart" : "heart-outline"}
                      size={20}
                      color={isWishlisted ? COLORS.error : COLORS.white}
                    />
                  </TouchableOpacity>

                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.featuredOverlay}
                  >
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <View style={styles.featuredPriceRow}>
                        <Text style={styles.featuredPrice}>GH₵ {item.price}</Text>
                        <View style={styles.featuredRating}>
                          <Ionicons name="star" size={14} color={BRAND_COLORS.goldenYellow} />
                          <Text style={styles.featuredRatingText}>4.8</Text>
                        </View>
                      </View>
                      <View style={styles.featuredMeta}>
                        <View style={styles.featuredCondition}>
                          <Ionicons name="checkmark-circle" size={12} color={BRAND_COLORS.goldenYellow} />
                          <Text style={styles.featuredConditionText}>{item.condition || 'Good'}</Text>
                        </View>
                        <View style={styles.featuredViews}>
                          <Ionicons name="eye" size={12} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.featuredViewsText}>1.2k</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const getCategoryImage = (category) => {
    const images = {
      Books: require('../../../assets/Book.jpeg'),
      Clothing: require('../../../assets/Clothing.jpeg'),
      Electronics: require('../../../assets/Electronics.jpeg'),
      Food: require('../../../assets/Food.jpeg'),
      Furniture: require('../../../assets/Furniture.jpeg'),
      Sports: require('../../../assets/favicon.png'),
    };
    return images[category];
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{isSeller ? 'My Categories' : 'Shop by Category'}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {['All', ...PRODUCT_CATEGORIES].map((category) => {
          const categoryImage = getCategoryImage(category);
          const isActive = selectedCategory === category;
          
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                isActive && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              {categoryImage ? (
                <Image
                  source={categoryImage}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name={getCategoryIcon(category)}
                  size={22}
                  color={isActive ? COLORS.white : BRAND_COLORS.vibrantBlue}
                />
              )}
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderProductCard = ({ item }) => {
    const isWishlisted = wishlistIds.has(item.id);

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => {
            logger.log('Product clicked:', item.id, 'isSeller:', isSeller);
            logger.log('Product seller ID:', item.seller, 'Current user ID:', user?.id);
            
            if (isSeller) {
              // Check if this product belongs to the current seller
              if (item.seller === user?.id || item.seller?.id === user?.id) {
                logger.log('Navigating to SellerProductDetail with productId:', item.id);
                navigation.navigate('SellerProductDetail', { productId: item.id });
              } else {
                logger.log('Product does not belong to current seller');
                showError('Access Denied', 'You can only view your own products.');
              }
            } else {
              logger.log('Navigating to ProductDetail with productId:', item.id);
              navigation.navigate('ProductDetail', { productId: item.id });
            }
          }}
        >
          <Image
            source={{ uri: item.images?.[0]?.image || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={(e) => toggleWishlist(item.id, e)}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={20}
              color={isWishlisted ? COLORS.error : COLORS.white}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.productInfo}
          onPress={() => {
            logger.log('Product info clicked:', item.id, 'isSeller:', isSeller);
            logger.log('Product seller ID:', item.seller, 'Current user ID:', user?.id);
            
            if (isSeller) {
              // Check if this product belongs to the current seller
              if (item.seller === user?.id || item.seller?.id === user?.id) {
                logger.log('Navigating to SellerProductDetail with productId:', item.id);
                navigation.navigate('SellerProductDetail', { productId: item.id });
              } else {
                logger.log('Product does not belong to current seller');
                showError('Access Denied', 'You can only view your own products.');
              }
            } else {
              logger.log('Navigating to ProductDetail with productId:', item.id);
              navigation.navigate('ProductDetail', { productId: item.id });
            }
          }}
        >
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>GH₵ {item.price}</Text>
          <View style={styles.productMeta}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{item.condition || 'Good'}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={BRAND_COLORS.goldenYellow} />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isSeller ? (
          // Seller buttons: Edit and Delete
          <View style={styles.sellerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Profile', { 
                screen: 'EditProduct', 
                params: { productId: item.id } 
              })}
            >
              <Ionicons name="create-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProduct(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Buyer button: Add to Cart
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => {
              addToCart(item, 1);
              showSuccess('Added to Cart', `${item.name} added to cart`);
            }}
          >
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addToCartGradient}
            >
              <Ionicons name="cart" size={16} color={COLORS.white} />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderFloatingNav = () => (
    <View style={styles.floatingNavContainer}>
      <BlurView intensity={100} tint="dark" style={styles.floatingNav}>
        <LinearGradient
          colors={['rgba(65, 105, 225, 0.9)', 'rgba(0, 51, 102, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.navGradient}
        >
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={24} color={BRAND_COLORS.goldenYellow} />
            <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Messages')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="rgba(255,255,255,0.7)" />
            <Text style={styles.navText}>Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => isSeller ? navigation.navigate('Profile', { screen: 'AddProduct' }) : navigation.navigate('Cart')}
          >
            {isSeller ? (
              <>
                <Ionicons name="add-circle-outline" size={24} color="rgba(255,255,255,0.7)" />
                <Text style={styles.navText}>Sell</Text>
              </>
            ) : (
              <>
                <View style={styles.cartIconContainer}>
                  <Ionicons name="cart-outline" size={24} color="rgba(255,255,255,0.7)" />
                  {getCartCount() > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>
                        {getCartCount() > 99 ? '99+' : getCartCount()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.navText}>Cart</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={24} color="rgba(255,255,255,0.7)" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderBanner()}
        {renderCategories()}
        {renderFeaturedProducts()}
        
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Products</Text>
            <TouchableOpacity onPress={() => isSeller ? navigation.navigate('Profile', { screen: 'MyProducts' }) : navigation.navigate('AllProducts')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {products.map((item) => (
              <View key={item.id} style={styles.productWrapper}>
                {renderProductCard({ item })}
              </View>
            ))}
          </View>
          {products.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
      
      {renderFloatingNav()}
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      )}
    </View>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    All: 'grid',
    Electronics: 'phone-portrait',
    Books: 'book',
    Clothing: 'shirt',
    Furniture: 'bed',
    Sports: 'football',
    Food: 'fast-food',
    Services: 'construct',
    Other: 'apps',
  };
  return icons[category] || 'apps';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bannerSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  banner: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.md,
    lineHeight: 28,
  },
  shopButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    color: BRAND_COLORS.navyBlue,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  bannerImage: {
    width: 180,
    height: 140,
    position: 'absolute',
    right: -10,
    bottom: 0,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    width: 24,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  featuredContainer: {
    gap: SPACING.lg,
    paddingRight: SPACING.lg,
  },
  featuredCard: {
    width: 220,
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  featuredImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  trendingBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  trendingBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: 4,
  },
  trendingBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.white,
  },
  featuredWishlistButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: SPACING.xxl * 2,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  featuredInfo: {
    gap: SPACING.xs,
  },
  featuredName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 20,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: BRAND_COLORS.goldenYellow,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  featuredRatingText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredConditionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  featuredViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredViewsText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  categoriesContainer: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  categoryChipActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  categoryImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  productsSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  productWrapper: {
    width: (width - SPACING.lg * 3) / 2,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  productImageContainer: {
    width: '100%',
    height: (width - SPACING.lg * 3) / 2,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: SPACING.xs,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionBadge: {
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  addToCartButton: {
    margin: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  addToCartText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  sellerActions: {
    flexDirection: 'row',
    margin: SPACING.sm,
    gap: SPACING.xs,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  editButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.error,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  floatingNav: {
    borderRadius: 30,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  navGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    minWidth: 65,
  },
  navText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: BRAND_COLORS.goldenYellow,
    fontWeight: '700',
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: BRAND_COLORS.navyBlue,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default HomeScreen;
