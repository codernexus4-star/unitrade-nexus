import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Dimensions,
  Animated,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import { messagingService } from '../../services/messagingService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { showError, showInfo, showSuccess } from '../../utils/alert';

const { width } = Dimensions.get('window');

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [contactingLoading, setContactingLoading] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const addToCartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (isMounted) setLoading(true);
      const result = await productService.getProduct(productId);
      if (isMounted) {
        if (result.success) {
          setProduct(result.data);
        } else {
          showError('Error', 'Failed to load product', () => navigation.goBack());
        }
        setLoading(false);
      }
    };

    const loadSimilarProducts = async () => {
      try {
        const result = await productService.getProducts({ limit: 4 });
        if (isMounted && result.success) {
          setSimilarProducts(result.data.results || result.data || []);
        }
      } catch (error) {
        if (__DEV__) logger.log('Error loading similar products:', error);
      }
    };

    const checkWishlistStatus = async () => {
      try {
        const result = await userService.getWishlist();
        if (isMounted && result.success) {
          const wishlistItems = result.data.results || result.data || [];
          const isInWishlist = wishlistItems.some(
            (item) => item.product.id === productId
          );
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        if (__DEV__) logger.log('Error checking wishlist status:', error);
      }
    };

    loadProduct();
    checkWishlistStatus();
    loadSimilarProducts();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const toggleWishlist = async () => {
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const result = await userService.removeFromWishlist(productId);
        if (result.success) {
          setIsWishlisted(false);
          showSuccess('Removed', 'Removed from wishlist');
        } else {
          showError('Error', 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const result = await userService.addToWishlist(productId);
        if (result.success) {
          setIsWishlisted(true);
          showSuccess('Added', 'Added to wishlist');
        } else {
          showError('Error', result.error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      showError('Error', 'Something went wrong');
    } finally {
      setWishlistLoading(false);
    }
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on UniTrade!`,
        title: product.name,
      });
    } catch (error) {
      logger.log('Error sharing:', error);
    }
  };

  const contactSeller = async () => {
    // Check for seller information - try both seller.id and seller_id for compatibility
    const sellerId = product.seller?.id || product.seller_id;
    
    if (!sellerId) {
      showInfo('Contact Seller', 'Seller information not available');
      return;
    }

    if (!user?.id) {
      showInfo('Login Required', 'Please login to contact the seller');
      return;
    }

    // Don't allow users to contact themselves
    if (user.id === sellerId) {
      showInfo('Contact Seller', 'You cannot contact yourself');
      return;
    }

    if (contactingLoading) return;

    setContactingLoading(true);
    try {
      // Create or get existing thread
      const result = await messagingService.createThread(
        user.id,
        sellerId,
        product.id
      );
      
      if (result.success && result.data.id) {
        navigation.navigate('Messages', { 
          screen: 'Chat', 
          params: { threadId: result.data.id } 
        });
      } else {
        showError('Error', 'Unable to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      showError('Error', 'Unable to start chat. Please try again.');
    } finally {
      setContactingLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Animate button
    Animated.sequence([
      Animated.timing(addToCartScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addToCartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    showSuccess('Added to Cart', `${product.name} added to your cart`);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderSimilarProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.similarProductCard}
      onPress={() => navigation.push('ProductDetail', { productId: item.id })}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images?.[0]?.image || 'https://via.placeholder.com/150' }}
        style={styles.similarProductImage}
        resizeMode="cover"
      />
      <Text style={styles.similarProductName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.similarProductPrice}>GH₵ {item.price}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.animatedHeaderGradient}
        >
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.animatedHeaderTitle} numberOfLines={1}>
            {product.name}
          </Text>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareProduct}
          >
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={shareProduct}
          >
            <Ionicons name="share-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={toggleWishlist}
          >
            <Ionicons 
              name={isWishlisted ? "heart" : "heart-outline"} 
              size={24} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images?.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.image || 'https://via.placeholder.com/300' }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Enhanced Image Pagination */}
          <View style={styles.imagePagination}>
            <View style={styles.paginationContainer}>
              {product.images?.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === selectedImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {selectedImageIndex + 1}/{product.images?.length || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.productMetaRow}>
              <View style={styles.conditionBadge}>
                <Ionicons name="checkmark-circle" size={14} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.conditionText}>{product.condition || 'Good'}</Text>
              </View>
              <View style={styles.viewsContainer}>
                <Ionicons name="eye-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.viewsText}>234 views</Text>
              </View>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.productPrice}>GH₵ {product.price}</Text>
              <Text style={styles.priceNote}>Negotiable</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.sellerCard}
              onPress={() => navigation.navigate('SellerProfile', { sellerId: product.seller?.id || product.seller_id })}
              activeOpacity={0.7}
            >
              <View style={styles.sellerHeader}>
                <LinearGradient
                  colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                  style={styles.sellerAvatar}
                >
                  <Ionicons name="person" size={28} color={COLORS.white} />
                </LinearGradient>
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>{product.seller?.name || product.seller_name || 'Seller'}</Text>
                  <View style={styles.sellerRating}>
                    <Ionicons name="star" size={14} color={BRAND_COLORS.goldenYellow} />
                    <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
                  </View>
                  <Text style={styles.sellerBadge}>✓ Verified Seller</Text>
                </View>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    contactSeller();
                  }}
                  disabled={contactingLoading}
                >
                  <LinearGradient
                    colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                    style={styles.contactButtonGradient}
                  >
                    {contactingLoading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.white} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.sellerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>45</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>98%</Text>
                  <Text style={styles.statLabel}>Response</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>2h</Text>
                  <Text style={styles.statLabel}>Avg Reply</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text 
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 4}
            >
              {product.description || 'No description available for this product.'}
            </Text>
            {product.description && product.description.length > 150 && (
              <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Specifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.sectionTitle}>Specifications</Text>
            </View>
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Ionicons name="pricetag" size={20} color={BRAND_COLORS.vibrantBlue} />
                </View>
                <Text style={styles.detailLabel}>Condition</Text>
                <Text style={styles.detailValue}>{product.condition || 'Good'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{product.location || 'Campus'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>{product.created_at || 'Recently'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="grid-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{product.category || 'Other'}</Text>
              </View>
            </View>
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="apps-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.sectionTitle}>Similar Products</Text>
              </View>
              <FlatList
                data={similarProducts}
                renderItem={renderSimilarProduct}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarProductsList}
              />
            </View>
          )}

          {/* Safety Tips */}
          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark" size={24} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.safetyTitle}>Safety Tips</Text>
            </View>
            <View style={styles.safetyTips}>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.safetyTipText}>Meet in a safe public place</Text>
              </View>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.safetyTipText}>Check the item before payment</Text>
              </View>
              <View style={styles.safetyTip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.safetyTipText}>Pay only after receiving item</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Enhanced Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.bottomActionsContent}>
          <TouchableOpacity 
            style={styles.wishlistBottomButton}
            onPress={toggleWishlist}
          >
            <Ionicons 
              name={isWishlisted ? "heart" : "heart-outline"} 
              size={28} 
              color={isWishlisted ? COLORS.error : BRAND_COLORS.vibrantBlue} 
            />
          </TouchableOpacity>
          
          <Animated.View style={[styles.buyButton, { transform: [{ scale: addToCartScale }] }]}>
            <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.9}>
              <LinearGradient
                colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buyButtonGradient}
              >
                <Ionicons name="cart" size={22} color={COLORS.white} />
                <Text style={styles.buyButtonText}>Add to Cart</Text>
                <Text style={styles.buyButtonPrice}>GH₵ {product.price}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
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
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  animatedHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  imageContainer: {
    height: 400,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  productImage: {
    width: 400,
    height: 400,
  },
  imagePagination: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  imageCounter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  imageCounterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    marginTop: -BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 100,
  },
  productInfo: {
    marginBottom: SPACING.lg,
  },
  productName: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  conditionText: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viewsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  priceCard: {
    backgroundColor: BRAND_COLORS.lightBlue,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  priceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.xs,
  },
  priceNote: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  sellerCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sellerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  sellerBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  contactButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  contactButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.borderLight,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  readMoreText: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  specItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: BRAND_COLORS.lightBlue,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  specIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: BRAND_COLORS.lightBlue,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  similarProductsList: {
    paddingRight: SPACING.lg,
  },
  similarProductCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  similarProductImage: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.surface,
  },
  similarProductName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    padding: SPACING.sm,
    paddingBottom: 0,
  },
  similarProductPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
    padding: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  safetyCard: {
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  safetyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  safetyTips: {
    gap: SPACING.sm,
  },
  safetyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  safetyTipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  bottomActionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  wishlistBottomButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  buyButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  buyButtonPrice: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});

export default ProductDetailScreen;
