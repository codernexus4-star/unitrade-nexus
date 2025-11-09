import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { productService } from '../../services/productService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showSuccess, showError, showDestructiveConfirm } from '../../utils/alert';
import logger from '../../utils/logger';

const { width } = Dimensions.get('window');

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const SellerProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params || {};
  
  logger.log('SellerProductDetailScreen - Route params:', route.params);
  logger.log('SellerProductDetailScreen - Product ID:', productId);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [analytics, setAnalytics] = useState({
    views: 156,
    favorites: 23,
    inquiries: 8,
    conversionRate: 12.5,
  });

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      logger.log('No productId provided');
      showError('Error', 'No product ID provided');
      navigation.goBack();
    }
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    logger.log('Loading product with ID:', productId);
    
    try {
      const result = await productService.getProduct(productId);
      logger.log('Product service result:', result);
      
      if (result.success) {
        logger.log('Product loaded successfully:', result.data);
        setProduct(result.data);
      } else {
        logger.log('Failed to load product:', result.error);
        
        // Handle specific error cases
        if (result.error && result.error.includes('403')) {
          showError('Access Denied', 'You can only view your own products. This product belongs to another seller.');
        } else if (result.error && result.error.includes('404')) {
          showError('Product Not Found', 'This product no longer exists or has been deleted.');
        } else {
          showError('Error', result.error || 'Failed to load product details');
        }
        
        navigation.goBack();
      }
    } catch (error) {
      logger.log('Error in loadProduct:', error);
      showError('Error', 'Something went wrong while loading product');
      navigation.goBack();
    }
    
    setLoading(false);
  };

  const handleDeleteProduct = () => {
    showDestructiveConfirm(
      'Delete Product',
      `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
      'Delete',
      async () => {
        const result = await productService.deleteProduct(productId);
        if (result.success) {
          showSuccess('Product Deleted', 'Product has been deleted successfully', () => {
            navigation.goBack();
          });
        } else {
          showError('Error', result.error || 'Failed to delete product');
        }
      }
    );
  };

  const handleToggleStatus = async () => {
    const newStatus = product.status === 'active' ? 'hidden' : 'active';
    const result = await productService.updateProduct(productId, { status: newStatus });
    
    if (result.success) {
      setProduct({ ...product, status: newStatus });
      showSuccess(
        'Status Updated',
        `Product is now ${newStatus === 'active' ? 'visible to buyers' : 'hidden from buyers'}`
      );
    } else {
      showError('Error', 'Failed to update product status');
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Background Pattern */}
      <View style={styles.headerPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
      </View>

      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Product</Text>
          <Text style={styles.headerSubtitle}>Manage your listing</Text>
        </View>
        
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navigation.navigate('EditProduct', { productId })}
          activeOpacity={0.8}
        >
          <View style={styles.headerActionContainer}>
            <Ionicons name="create-outline" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderImageGallery = () => {
    const images = product?.images || [];
    if (images.length === 0) {
      return (
        <View style={styles.imageSection}>
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.placeholderText}>No image available</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.imageSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
              {/* Image overlay gradient */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageOverlay}
              />
            </View>
          ))}
        </ScrollView>
        
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <LinearGradient
            colors={
              product?.status === 'active'
                ? ['#4ADE80', '#22C55E']
                : product?.status === 'sold'
                ? [BRAND_COLORS.goldenYellow, '#FF8C00']
                : ['#94A3B8', '#64748B']
            }
            style={styles.statusBadgeGradient}
          >
            <Ionicons
              name={
                product?.status === 'active'
                  ? 'checkmark-circle'
                  : product?.status === 'sold'
                  ? 'trophy'
                  : 'eye-off'
              }
              size={16}
              color={COLORS.white}
            />
            <Text style={styles.statusBadgeText}>
              {product?.status === 'active'
                ? 'Live'
                : product?.status === 'sold'
                ? 'Sold'
                : 'Hidden'}
            </Text>
          </LinearGradient>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
          <View style={styles.shareButtonContainer}>
            <Ionicons name="share-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAnalytics = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIcon}>
            <Ionicons name="analytics-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Performance Analytics</Text>
            <Text style={styles.sectionSubtitle}>Last 30 days</Text>
          </View>
        </View>
      </View>

      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <Ionicons name="eye-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <Text style={styles.analyticsNumber}>{analytics.views}</Text>
          <Text style={styles.analyticsLabel}>Views</Text>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <Ionicons name="heart-outline" size={20} color={COLORS.error} />
          </View>
          <Text style={styles.analyticsNumber}>{analytics.favorites}</Text>
          <Text style={styles.analyticsLabel}>Favorites</Text>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <Ionicons name="chatbubble-outline" size={20} color={BRAND_COLORS.goldenYellow} />
          </View>
          <Text style={styles.analyticsNumber}>{analytics.inquiries}</Text>
          <Text style={styles.analyticsLabel}>Inquiries</Text>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIcon}>
            <Ionicons name="trending-up-outline" size={20} color={COLORS.success} />
          </View>
          <Text style={styles.analyticsNumber}>{analytics.conversionRate}%</Text>
          <Text style={styles.analyticsLabel}>Conversion</Text>
        </View>
      </View>
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.section}>
      <View style={styles.productHeader}>
        <View style={styles.productTitleRow}>
          <Text style={styles.productName} numberOfLines={2}>{product?.name}</Text>
          <View style={styles.priceContainer}>
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              style={styles.priceGradient}
            >
              <Text style={styles.productPrice}>GH₵ {product?.price}</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.productBadges}>
          <View style={styles.categoryBadge}>
            <Ionicons name="grid-outline" size={14} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.categoryText}>{product?.category}</Text>
          </View>
          <View style={styles.conditionBadge}>
            <Ionicons name="star-outline" size={14} color={BRAND_COLORS.goldenYellow} />
            <Text style={styles.conditionText}>{product?.condition}</Text>
          </View>
          <View style={styles.stockBadge}>
            <Ionicons name="cube-outline" size={14} color={COLORS.success} />
            <Text style={styles.stockText}>{product?.stock} in stock</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={18} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Listed</Text>
            <Text style={styles.infoValue}>
              {product?.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="pricetag-outline" size={18} color={BRAND_COLORS.goldenYellow} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Product ID</Text>
            <Text style={styles.infoValue}>#{product?.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <View style={styles.descriptionHeader}>
          <Ionicons name="document-text-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.descriptionTitle}>Description</Text>
        </View>
        <Text style={styles.description}>{product?.description}</Text>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleToggleStatus}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              product?.status === 'active'
                ? ['#94A3B8', '#64748B']
                : [COLORS.success, '#22C55E']
            }
            style={styles.quickActionGradient}
          >
            <Ionicons
              name={product?.status === 'active' ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={COLORS.white}
            />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>
            {product?.status === 'active' ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('EditProduct', { productId })}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="create-outline" size={18} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {/* Share functionality */}}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[BRAND_COLORS.goldenYellow, '#FF8C00']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="share-outline" size={18} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleDeleteProduct}
          activeOpacity={0.8}
        >
          <View style={styles.deleteActionButton}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </View>
          <Text style={[styles.quickActionLabel, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.primaryActions}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('Messages')}
          activeOpacity={0.9}
        >
          <View style={styles.primaryActionContent}>
            <Ionicons name="chatbubbles-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.primaryActionText}>View Messages</Text>
            <Text style={styles.primaryActionSubtext}>8 inquiries</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => navigation.navigate('Profile', { screen: 'MyProducts' })}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
            style={styles.primaryActionGradient}
          >
            <Ionicons name="storefront-outline" size={20} color={COLORS.white} />
            <Text style={styles.primaryActionTextWhite}>View All Products</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderImageGallery()}
        {renderAnalytics()}
        {renderProductInfo()}
        {renderActions()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -30,
    right: -30,
  },
  patternCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253, 185, 19, 0.1)',
    bottom: -20,
    left: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  headerAction: {
    padding: SPACING.xs,
  },
  headerActionContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  imageSection: {
    position: 'relative',
    height: 350,
    backgroundColor: COLORS.white,
    ...SHADOWS.lg,
  },
  imageContainer: {
    width: width,
    height: 350,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  placeholderText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  statusBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  shareButton: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  shareButtonContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  analyticsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  analyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  analyticsNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  analyticsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  productHeader: {
    marginBottom: SPACING.lg,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  productName: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 28,
  },
  priceContainer: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  priceGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  productBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 185, 19, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.goldenYellow,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  stockText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  productMeta: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  metaLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: SPACING.md,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  descriptionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  actionsSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  deleteActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  primaryActions: {
    gap: SPACING.md,
  },
  primaryActionButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  primaryActionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  primaryActionSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  primaryActionTextWhite: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default SellerProductDetailScreen;
