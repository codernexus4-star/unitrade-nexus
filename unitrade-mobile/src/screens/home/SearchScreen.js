import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from '../../constants/config';
import { productService } from '../../services/productService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const searchProducts = async () => {
      if (isMounted) setLoading(true);
      const filters = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        condition: selectedCondition || undefined,
        min_price: priceRange.min || undefined,
        max_price: priceRange.max || undefined,
        ordering: sortBy === 'price_low' ? 'price' : sortBy === 'price_high' ? '-price' : '-created_at',
      };
      
      const result = await productService.searchProducts(searchQuery, filters);
      if (isMounted) {
        if (result.success) {
          setProducts(result.data.results || result.data || []);
        }
        setLoading(false);
      }
    };

    if (searchQuery.length > 0) {
      searchProducts();
    }

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedCondition, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('');
    setPriceRange({ min: '', max: '' });
    setSortBy('recent');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={BRAND_COLORS.vibrantBlue} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="options-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
      >
        <TouchableOpacity 
          style={[styles.sortChip, sortBy === 'recent' && styles.sortChipActive]}
          onPress={() => setSortBy('recent')}
        >
          <Text style={[styles.sortChipText, sortBy === 'recent' && styles.sortChipTextActive]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortChip, sortBy === 'price_low' && styles.sortChipActive]}
          onPress={() => setSortBy('price_low')}
        >
          <Text style={[styles.sortChipText, sortBy === 'price_low' && styles.sortChipTextActive]}>
            Price: Low to High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortChip, sortBy === 'price_high' && styles.sortChipActive]}
          onPress={() => setSortBy('price_high')}
        >
          <Text style={[styles.sortChipText, sortBy === 'price_high' && styles.sortChipTextActive]}>
            Price: High to Low
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        {/* Categories */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === 'All' && styles.categoryChipActive]}
              onPress={() => setSelectedCategory('All')}
            >
              <Text style={[styles.categoryText, selectedCategory === 'All' && styles.categoryTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {PRODUCT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Condition */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Condition</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedCondition === '' && styles.categoryChipActive]}
              onPress={() => setSelectedCondition('')}
            >
              <Text style={[styles.categoryText, selectedCondition === '' && styles.categoryTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {PRODUCT_CONDITIONS.map((condition) => (
              <TouchableOpacity
                key={condition.value}
                style={[styles.categoryChip, selectedCondition === condition.value && styles.categoryChipActive]}
                onPress={() => setSelectedCondition(condition.value)}
              >
                <Text style={[styles.categoryText, selectedCondition === condition.value && styles.categoryTextActive]}>
                  {condition.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Range */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Price Range (GH₵)</Text>
          <View style={styles.priceRangeContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={priceRange.min}
              onChangeText={(text) => setPriceRange({ ...priceRange, min: text })}
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={priceRange.max}
              onChangeText={(text) => setPriceRange({ ...priceRange, max: text })}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.filterActions}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={searchProducts}>
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.applyButtonGradient}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{
            uri: item.images?.[0]?.image || 'https://via.placeholder.com/150',
          }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.wishlistButton}>
          <Ionicons name="heart-outline" size={20} color={COLORS.white} />
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>GH₵ {item.price}</Text>
        <View style={styles.productMeta}>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{item.condition || 'Good'}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={BRAND_COLORS.goldenYellow} />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[BRAND_COLORS.lightBlue, COLORS.white]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="search-outline" size={64} color={BRAND_COLORS.vibrantBlue} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No products found' : 'Start searching'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try adjusting your filters or search terms'
          : 'Search for products by name, category, or description'}
      </Text>
      {searchQuery && (
        <TouchableOpacity
          style={styles.clearSearchButton}
          onPress={clearFilters}
        >
          <Text style={styles.clearSearchText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilterBar()}
      {renderFilters()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={6}
          updateCellsBatchingPeriod={50}
        />
      )}
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
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: BRAND_COLORS.lightBlue,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  quickFilters: {
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortChipActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
    ...SHADOWS.sm,
  },
  sortChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: COLORS.white,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  filterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceSeparator: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  clearButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  applyButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
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
    ...SHADOWS.md,
    marginBottom: SPACING.sm,
  },
  productImageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    position: 'relative',
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
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: SPACING.md,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.sm,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conditionBadge: {
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.sm,
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
    gap: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.xxl,
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
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  clearSearchButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  clearSearchText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SearchScreen;
