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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { productService } from '../../services/productService';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError, showDestructiveConfirm } from '../../utils/alert';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const STATUS_CONFIG = {
  active: { color: COLORS.success, label: 'Active', icon: 'checkmark-circle' },
  sold: { color: COLORS.warning, label: 'Sold', icon: 'cash' },
  suspended: { color: COLORS.error, label: 'Suspended', icon: 'ban' },
  hidden: { color: COLORS.textSecondary, label: 'Hidden', icon: 'eye-off' },
};

const MyProductsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (isMounted) setLoading(true);
      const result = await productService.getProducts({ seller: user?.id });
      if (isMounted) {
        if (result.success) {
          setProducts(result.data.results || result.data || []);
        }
        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const params = user?.id ? { seller: user.id } : {};
    const result = await productService.getProducts(params);
    if (result.success) {
      setProducts(result.data.results || result.data || []);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
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
          setProducts((prev) => prev.filter((p) => p.id !== productId));
          showSuccess('Deleted', 'Product deleted successfully');
        } else {
          showError('Error', 'Failed to delete product');
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
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Products</Text>
          <Text style={styles.headerSubtitle}>Manage your listings</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <View style={styles.addButtonContainer}>
            <Ionicons name="add" size={24} color={BRAND_COLORS.navyBlue} />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderProductCard = ({ item }) => {
    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: item.images?.[0]?.image || 'https://via.placeholder.com/150',
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Ionicons name={statusConfig.icon} size={12} color={COLORS.white} />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
          
          {/* Gradient overlay for better text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
        </TouchableOpacity>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>GH₵ {parseFloat(item.price).toFixed(2)}</Text>
          
          <View style={styles.productMeta}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="eye-outline" size={14} color={BRAND_COLORS.vibrantBlue} />
              </View>
              <Text style={styles.metaText}>{item.views || 0} views</Text>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="cube-outline" size={14} color={BRAND_COLORS.vibrantBlue} />
              </View>
              <Text style={styles.metaText}>{item.stock} left</Text>
            </View>
          </View>

          <View style={styles.conditionContainer}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{item.condition || 'Good'}</Text>
            </View>
            <Text style={styles.createdDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[BRAND_COLORS.lightBlue, COLORS.white]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="create-outline" size={18} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.editButtonText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteProduct(item.id, item.name)}
            activeOpacity={0.7}
          >
            <View style={styles.deleteButtonContainer}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={[BRAND_COLORS.lightBlue, COLORS.white]}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="storefront-outline" size={80} color={BRAND_COLORS.vibrantBlue} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>Start Your Store</Text>
      <Text style={styles.emptySubtitle}>
        You haven't listed any products yet.{'\n'}
        Add your first product to start selling on UniTrade!
      </Text>
      
      <View style={styles.emptyFeatures}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="camera-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <Text style={styles.featureText}>Upload photos</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="pricetag-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <Text style={styles.featureText}>Set your price</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="people-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <Text style={styles.featureText}>Reach students</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addProductButton}
        onPress={() => navigation.navigate('AddProduct')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addProductGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
          <Text style={styles.addProductText}>Add Your First Product</Text>
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
      
      {/* Stats Section */}
      {products.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{products.filter(p => p.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{products.reduce((sum, p) => sum + (p.views || 0), 0)}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
        </View>
      )}

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={products.length > 0 ? styles.productRow : null}
        contentContainerStyle={
          products.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.vibrantBlue]}
            tintColor={BRAND_COLORS.vibrantBlue}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  addButton: {
    padding: SPACING.xs,
  },
  addButtonContainer: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
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
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
    marginBottom: SPACING.sm,
  },
  productImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    backgroundColor: COLORS.surface,
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
    height: '30%',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    ...SHADOWS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '700',
  },
  productInfo: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    minHeight: 40,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: SPACING.sm,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  conditionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  conditionBadge: {
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  conditionText: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  createdDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flex: 1,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  editButton: {
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  editButtonText: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  deleteButton: {},
  deleteButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
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
  emptyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  addProductButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  addProductGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  addProductText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default MyProductsScreen;
