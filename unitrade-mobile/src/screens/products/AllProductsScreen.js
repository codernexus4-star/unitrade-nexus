import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError } from '../../utils/alert';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const AllProductsScreen = () => {
  const navigation = useNavigation();
  const { getCartCount, cartItems, addToCart } = useCart();
  const { user } = useAuth();
  const isSeller = user?.role?.toLowerCase() === 'seller';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest'); // newest, price_low, price_high, popular, school
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolDropdownVisible, setSchoolDropdownVisible] = useState(false);
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    loadUniversities();
    loadProducts();
    loadWishlist();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [sortBy, selectedSchool]);

  const loadUniversities = async () => {
    const result = await userService.getUniversities();
    if (result.success) {
      const universityList = result.data.results || result.data || [];
      // Extract university names from the response
      const universityNames = universityList.map(uni => uni.name);
      setUniversities(universityNames);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    const params = { ordering: getSortParam() };
    
    // Add school filter if selected
    if (selectedSchool) {
      params.seller__university = selectedSchool;
    }
    
    const result = await productService.getProducts(params);
    if (result.success) {
      setProducts(result.data.results || result.data || []);
    }
    setLoading(false);
  };

  const loadWishlist = async () => {
    const result = await userService.getWishlist();
    if (result.success) {
      const ids = new Set(
        (result.data.results || result.data || []).map((item) => item.product.id)
      );
      setWishlistIds(ids);
    }
  };

  const getSortParam = () => {
    switch (sortBy) {
      case 'price_low':
        return 'price';
      case 'price_high':
        return '-price';
      case 'popular':
        return '-views';
      case 'newest':
      default:
        return '-created_at';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUniversities(),
      loadProducts(),
      loadWishlist(),
    ]);
    setRefreshing(false);
  };

  const toggleWishlist = async (productId, event) => {
    event?.stopPropagation();
    const isCurrentlyWishlisted = wishlistIds.has(productId);

    if (isCurrentlyWishlisted) {
      const result = await userService.removeFromWishlist(productId);
      if (result.success) {
        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        showSuccess('Removed', 'Removed from wishlist');
      }
    } else {
      const result = await userService.addToWishlist(productId);
      if (result.success) {
        setWishlistIds((prev) => new Set([...prev, productId]));
        showSuccess('Added', 'Added to wishlist');
      }
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>All Products</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderSortBar = () => (
    <View style={styles.filterSection}>
      {/* Sort Options */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortOptions}
        >
          {[
            { key: 'newest', label: 'Newest', icon: 'time-outline' },
            { key: 'price_low', label: 'Price ↑', icon: 'arrow-up' },
            { key: 'price_high', label: 'Price ↓', icon: 'arrow-down' },
            { key: 'popular', label: 'Popular', icon: 'flame-outline' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionActive,
              ]}
              onPress={() => setSortBy(option.key)}
            >
              <Ionicons
                name={option.icon}
                size={14}
                color={sortBy === option.key ? COLORS.white : BRAND_COLORS.vibrantBlue}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.key && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* School Filter */}
      <View style={styles.schoolFilterBar}>
        <Text style={styles.sortLabel}>Filter by School:</Text>
        <TouchableOpacity
          style={styles.schoolDropdownButton}
          onPress={() => setSchoolDropdownVisible(!schoolDropdownVisible)}
        >
          <Ionicons name="school-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.schoolDropdownText}>
            {selectedSchool || 'All Schools'}
          </Text>
          <Ionicons 
            name={schoolDropdownVisible ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={BRAND_COLORS.vibrantBlue} 
          />
        </TouchableOpacity>
        {selectedSchool && (
          <TouchableOpacity
            style={styles.clearSchoolButton}
            onPress={() => setSelectedSchool(null)}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* School Dropdown */}
      {schoolDropdownVisible && (
        <View style={styles.schoolDropdown}>
          <ScrollView style={styles.schoolList} nestedScrollEnabled>
            {universities.length === 0 ? (
              <View style={styles.emptySchoolList}>
                <ActivityIndicator size="small" color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.emptySchoolText}>Loading universities...</Text>
              </View>
            ) : (
              universities.map((university) => (
                <TouchableOpacity
                  key={university}
                  style={[
                    styles.schoolOption,
                    selectedSchool === university && styles.schoolOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedSchool(university);
                    setSchoolDropdownVisible(false);
                  }}
                >
                  <Ionicons 
                    name={selectedSchool === university ? "radio-button-on" : "radio-button-off"} 
                    size={20} 
                    color={selectedSchool === university ? BRAND_COLORS.vibrantBlue : COLORS.textSecondary} 
                  />
                  <Text
                    style={[
                      styles.schoolOptionText,
                      selectedSchool === university && styles.schoolOptionTextActive,
                    ]}
                    numberOfLines={2}
                  >
                    {university}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderProductCard = ({ item }) => {
    const isWishlisted = wishlistIds.has(item.id);

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          style={styles.productImageContainer}
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
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
          onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
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
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[BRAND_COLORS.lightBlue, COLORS.white]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="cube-outline" size={64} color={BRAND_COLORS.vibrantBlue} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>
        Check back later for new products
      </Text>
    </View>
  );

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
            onPress={() => navigation.navigate('HomeMain')}
          >
            <Ionicons name="home-outline" size={24} color="rgba(255,255,255,0.7)" />
            <Text style={styles.navText}>Home</Text>
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
            onPress={() => navigation.navigate(isSeller ? 'AddProduct' : 'Cart')}
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

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
        {renderFloatingNav()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSortBar()}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={
          products.length === 0 ? styles.emptyList : styles.listContent
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
      />
      {renderFloatingNav()}
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
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sortBar: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sortLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: BRAND_COLORS.lightBlue,
    gap: 4,
  },
  sortOptionActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  sortOptionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  schoolFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  schoolDropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  schoolDropdownText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  clearSchoolButton: {
    padding: SPACING.xs,
  },
  schoolDropdown: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    maxHeight: 300,
  },
  schoolList: {
    maxHeight: 300,
  },
  schoolOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  schoolOptionActive: {
    backgroundColor: BRAND_COLORS.lightBlue,
  },
  schoolOptionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  schoolOptionTextActive: {
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  emptySchoolList: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptySchoolText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
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

export default AllProductsScreen;
