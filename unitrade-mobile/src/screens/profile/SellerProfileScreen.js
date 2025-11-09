import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const SellerProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sellerId } = route.params || {};

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    loadSellerProfile();
    loadSellerProducts();
  }, [sellerId]);

  const loadSellerProfile = async () => {
    setLoading(true);
    const result = await userService.getUserProfile(sellerId);
    if (result.success) {
      setSeller(result.data);
    }
    setLoading(false);
  };

  const loadSellerProducts = async () => {
    setProductsLoading(true);
    const result = await productService.getProducts({ seller: sellerId });
    if (result.success) {
      setProducts(result.data.results || result.data || []);
    }
    setProductsLoading(false);
  };

  const formatPrice = (price) => {
    return `GH₵${parseFloat(price).toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderHeader = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      );
    }

    if (!seller) {
      return null;
    }

    return (
      <View>
        {/* Modern Gradient Header */}
        <LinearGradient
          colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <StatusBar barStyle="light-content" />
          
          {/* Header Top Controls */}
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="heart-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Floating Profile Card */}
          <View style={styles.floatingCard}>
            {/* Profile Image Circle */}
            <View style={styles.profileCircle}>
              {seller.profile_picture ? (
                <Image
                  source={{ uri: seller.profile_picture }}
                  style={styles.profileImage}
                />
              ) : (
                <LinearGradient
                  colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                  style={styles.profilePlaceholder}
                >
                  <Ionicons name="person" size={36} color={COLORS.white} />
                </LinearGradient>
              )}
              
              {seller.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                </View>
              )}
            </View>
            
            {/* Seller Name & Type */}
            <View style={styles.sellerHeader}>
              <Text style={styles.sellerName}>
                {seller.business_name || `${seller.first_name} ${seller.last_name}`}
              </Text>
              
              <View style={styles.typeBadge}>
                <LinearGradient
                  colors={[BRAND_COLORS.goldenYellow, '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.typeBadgeGradient}
                >
                  <Ionicons 
                    name={seller.seller_type === 'student' ? 'school' : 'business'}
                    size={12}
                    color={COLORS.white}
                  />
                  <Text style={styles.typeBadgeText}>
                    {seller.seller_type === 'student' ? 'Student' : 'Professional'}
                  </Text>
                </LinearGradient>
              </View>
            </View>
            
            {seller.bio && (
              <Text style={styles.bio}>{seller.bio}</Text>
            )}
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconBg}>
                  <Ionicons name="cube" size={20} color={BRAND_COLORS.vibrantBlue} />
                </View>
                <Text style={styles.statNumber}>{products.length}</Text>
                <Text style={styles.statText}>Products</Text>
              </View>
              
              <View style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="star" size={20} color={BRAND_COLORS.goldenYellow} />
                </View>
                <Text style={styles.statNumber}>
                  {seller.average_rating ? seller.average_rating.toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.statText}>Rating</Text>
              </View>
              
              <View style={styles.statBox}>
                <View style={[styles.statIconBg, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>{seller.total_sales || 0}</Text>
                <Text style={styles.statText}>Sales</Text>
              </View>
            </View>
            
            {/* Info Cards */}
            <View style={styles.infoCardsContainer}>
              {seller.university && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="school" size={18} color={BRAND_COLORS.vibrantBlue} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>University</Text>
                    <Text style={styles.infoValue}>{seller.university}</Text>
                  </View>
                </View>
              )}
              
              {seller.campus && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="location" size={18} color={BRAND_COLORS.vibrantBlue} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Campus</Text>
                    <Text style={styles.infoValue}>{seller.campus}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar" size={18} color={BRAND_COLORS.vibrantBlue} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Joined</Text>
                  <Text style={styles.infoValue}>
                    {seller.date_joined ? new Date(seller.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Action Buttons Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Messages', {
                  screen: 'Chat',
                  params: { sellerId: seller.id },
                })}
              >
                <LinearGradient
                  colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButtonGradient}
                >
                  <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
                  <Text style={styles.primaryButtonText}>Message</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="call" size={20} color={BRAND_COLORS.vibrantBlue} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="bookmark-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Products Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIconBox}>
              <Ionicons name="grid" size={18} color={BRAND_COLORS.vibrantBlue} />
            </View>
            <Text style={styles.sectionTitle}>Products</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{products.length}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images?.[0]?.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
        />
        {item.average_rating > 0 && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={11} color={BRAND_COLORS.goldenYellow} />
            <Text style={styles.ratingText}>{item.average_rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{item.condition}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyProducts = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No products available</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!productsLoading && renderEmptyProducts}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {productsLoading && (
        <View style={styles.productsLoadingContainer}>
          <ActivityIndicator size="small" color={BRAND_COLORS.vibrantBlue} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  // Modern Header
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.xl * 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Floating Profile Card
  floatingCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  profileCircle: {
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profilePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  sellerHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sellerName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  typeBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs - 2,
    gap: SPACING.xs - 2,
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  bio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  // Info Cards
  infoCardsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    marginTop: -SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND_COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs - 2,
    borderRadius: BORDER_RADIUS.full,
  },
  countText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  productRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: COLORS.surface,
  },
  productInfo: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.navyBlue,
  },
  conditionBadge: {
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ratingBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
    ...SHADOWS.sm,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  productsLoadingContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
});

export default SellerProfileScreen;
