import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { userService } from '../../services/userService';
import { useNavigation } from '@react-navigation/native';
import { showSuccess, showError, showDestructiveConfirm } from '../../utils/alert';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const WishlistScreen = () => {
  const navigation = useNavigation();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      if (isMounted) setLoading(true);
      const result = await userService.getWishlist();
      if (isMounted) {
        if (result.success) {
          setWishlistItems(result.data.results || result.data || []);
        }
        setLoading(false);
      }
    };

    loadWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    const result = await userService.getWishlist();
    if (result.success) {
      setWishlistItems(result.data.results || result.data || []);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishlist();
    setRefreshing(false);
  };

  const removeFromWishlist = async (productId, productName) => {
    showDestructiveConfirm(
      'Remove from Wishlist',
      `Remove "${productName}" from your wishlist?`,
      'Remove',
      async () => {
        const result = await userService.removeFromWishlist(productId);
        if (result.success) {
          setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId));
          showSuccess('Removed', 'Item removed from wishlist');
        } else {
          showError('Error', 'Failed to remove item from wishlist');
        }
      }
    );
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.greeting}>My Wishlist ❤️</Text>
          <Text style={styles.headerSubtitle}>
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderWishlistItem = ({ item }) => {
    const product = item.product;

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        >
          <Image
            source={{
              uri: product.images?.[0]?.image || 'https://via.placeholder.com/150',
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromWishlist(product.id, product.name)}
          >
            <Ionicons name="heart" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.productInfo}
          onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
        >
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>GH₵ {product.price}</Text>
          <View style={styles.productMeta}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{product.condition || 'Good'}</Text>
            </View>
            {product.stock > 0 ? (
              <Text style={styles.inStock}>In Stock</Text>
            ) : (
              <Text style={styles.outOfStock}>Out of Stock</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => {
            // TODO: Add to cart functionality
            showSuccess('Added to Cart', `${product.name} added to cart`);
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
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[BRAND_COLORS.lightBlue, COLORS.white]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="heart-outline" size={64} color={BRAND_COLORS.vibrantBlue} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
      <Text style={styles.emptySubtitle}>
        Save items you love to your wishlist and shop them later
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <LinearGradient
          colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shopButtonGradient}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={
          wishlistItems.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.vibrantBlue]}
          />
        }
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
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
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyList: {
    flex: 1,
  },
  productRow: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  productImageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.xs,
    ...SHADOWS.sm,
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    minHeight: 32,
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
    fontWeight: '500',
  },
  inStock: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '500',
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
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 2,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  shopButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  shopButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default WishlistScreen;
