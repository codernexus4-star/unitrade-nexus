import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import { showDestructiveConfirm } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, updateQuantity: updateCartQuantity, removeFromCart, getCartTotal } = useCart();
  
  // Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate summary on mount
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUpdateQuantity = (itemId, change) => {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateCartQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    showDestructiveConfirm(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      'Remove',
      () => {
        removeFromCart(itemId);
      }
    );
  };

  const calculateSubtotal = () => {
    return getCartTotal();
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
          <Text style={styles.greeting}>Shopping Cart 🛒</Text>
          <Text style={styles.headerSubtitle}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={20} color={BRAND_COLORS.navyBlue} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.images?.[0]?.image || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <View style={styles.itemHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.sellerTag}>
          <Ionicons name="person-circle-outline" size={14} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.sellerName}>{item.seller?.name || 'Seller'}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>GH₵ {item.price}</Text>
          <Text style={styles.itemTotal}>
            Total: GH₵ {(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, -1)}
          >
            <Ionicons name="remove" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.id, 1)}
          >
            <Ionicons name="add" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[BRAND_COLORS.lightBlue, COLORS.white]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="cart-outline" size={64} color={BRAND_COLORS.vibrantBlue} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add items to your cart to get started
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

  const renderSummary = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = deliveryMethod === 'delivery' ? 20 : 0; // No fee for pickup
    const discount = subtotal > 500 ? subtotal * 0.05 : 0; // 5% discount for orders over 500
    const total = subtotal + deliveryFee - discount;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <Animated.View 
        style={[
          styles.summaryContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
            style={styles.summaryCard}
          >
            {/* Header with icon */}
            <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <LinearGradient
                colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryIconGradient}
              >
                <Ionicons name="receipt-outline" size={24} color={COLORS.white} />
              </LinearGradient>
            </View>
            <View style={styles.summaryHeaderText}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <Text style={styles.summarySubtitle}>{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</Text>
            </View>
          </View>

          {/* Delivery Method Selection */}
          <View style={styles.deliveryMethodContainer}>
            <Text style={styles.deliveryMethodLabel}>Delivery Method</Text>
            <View style={styles.deliveryMethodOptions}>
              {/* Delivery Option */}
              <TouchableOpacity
                style={[
                  styles.deliveryMethodOption,
                  deliveryMethod === 'delivery' && styles.deliveryMethodOptionActive
                ]}
                onPress={() => setDeliveryMethod('delivery')}
                activeOpacity={0.7}
              >
                <View style={styles.deliveryMethodIconContainer}>
                  <LinearGradient
                    colors={deliveryMethod === 'delivery' 
                      ? [BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]
                      : [BRAND_COLORS.lightBlue, BRAND_COLORS.lightBlue]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.deliveryMethodIconGradient}
                  >
                    <Ionicons 
                      name="bicycle" 
                      size={24} 
                      color={deliveryMethod === 'delivery' ? COLORS.white : BRAND_COLORS.vibrantBlue} 
                    />
                  </LinearGradient>
                </View>
                <View style={styles.deliveryMethodText}>
                  <Text style={[
                    styles.deliveryMethodTitle,
                    deliveryMethod === 'delivery' && styles.deliveryMethodTitleActive
                  ]}>
                    Delivery
                  </Text>
                  <Text style={styles.deliveryMethodDesc}>
                    Delivered to you
                  </Text>
                  <Text style={styles.deliveryMethodFee}>
                    GH₵ 20.00
                  </Text>
                </View>
                {deliveryMethod === 'delivery' && (
                  <View style={styles.deliveryMethodCheck}>
                    <Ionicons name="checkmark-circle" size={24} color={BRAND_COLORS.vibrantBlue} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Pickup Option */}
              <TouchableOpacity
                style={[
                  styles.deliveryMethodOption,
                  deliveryMethod === 'pickup' && styles.deliveryMethodOptionActive
                ]}
                onPress={() => setDeliveryMethod('pickup')}
                activeOpacity={0.7}
              >
                <View style={styles.deliveryMethodIconContainer}>
                  <LinearGradient
                    colors={deliveryMethod === 'pickup' 
                      ? [BRAND_COLORS.goldenYellow, '#FF8C00']
                      : [BRAND_COLORS.lightBlue, BRAND_COLORS.lightBlue]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.deliveryMethodIconGradient}
                  >
                    <Ionicons 
                      name="walk" 
                      size={24} 
                      color={deliveryMethod === 'pickup' ? COLORS.white : BRAND_COLORS.vibrantBlue} 
                    />
                  </LinearGradient>
                </View>
                <View style={styles.deliveryMethodText}>
                  <Text style={[
                    styles.deliveryMethodTitle,
                    deliveryMethod === 'pickup' && styles.deliveryMethodTitleActive
                  ]}>
                    Pickup
                  </Text>
                  <Text style={styles.deliveryMethodDesc}>
                    Pick up yourself
                  </Text>
                  <Text style={[styles.deliveryMethodFee, styles.deliveryMethodFreeText]}>
                    FREE
                  </Text>
                </View>
                {deliveryMethod === 'pickup' && (
                  <View style={styles.deliveryMethodCheck}>
                    <Ionicons name="checkmark-circle" size={24} color={BRAND_COLORS.goldenYellow} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Breakdown */}
          <View style={styles.breakdownContainer}>
            {/* Subtotal */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryRowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="pricetag-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
                </View>
                <Text style={styles.summaryLabel}>Subtotal</Text>
              </View>
              <Text style={styles.summaryValue}>GH₵ {subtotal.toFixed(2)}</Text>
            </View>

            {/* Delivery Fee */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryRowLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="bicycle-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
                </View>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
              </View>
              <Text style={styles.summaryValue}>GH₵ {deliveryFee.toFixed(2)}</Text>
            </View>

            {/* Discount (if applicable) */}
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <View style={[styles.iconCircle, styles.discountCircle]}>
                    <Ionicons name="gift-outline" size={16} color={BRAND_COLORS.goldenYellow} />
                  </View>
                  <Text style={styles.discountLabel}>Discount (5%)</Text>
                </View>
                <Text style={styles.discountValue}>-GH₵ {discount.toFixed(2)}</Text>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <View style={styles.totalLeft}>
                <View style={styles.totalIconContainer}>
                  <LinearGradient
                    colors={[BRAND_COLORS.goldenYellow, '#FF8C00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.totalIconGradient}
                  >
                    <Ionicons name="cash-outline" size={20} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <Text style={styles.totalLabel}>Total Amount</Text>
              </View>
              <Text style={styles.totalValue}>GH₵ {total.toFixed(2)}</Text>
            </View>

            {/* Savings badge */}
            {discount > 0 && (
              <View style={styles.savingsBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.savingsText}>You saved GH₵ {discount.toFixed(2)}!</Text>
              </View>
            )}
          </View>
          </LinearGradient>

          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout', { total, deliveryMethod })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkoutButtonGradient}
            >
              <View style={styles.checkoutButtonContent}>
                <View style={styles.checkoutButtonLeft}>
                  <Ionicons name="shield-checkmark" size={22} color={COLORS.white} />
                  <Text style={styles.checkoutButtonText}>Secure Checkout</Text>
                </View>
                <View style={styles.checkoutButtonRight}>
                  <Text style={styles.checkoutButtonAmount}>GH₵ {total.toFixed(2)}</Text>
                  <Ionicons name="arrow-forward-circle" size={24} color={BRAND_COLORS.goldenYellow} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={styles.flatListContainer}
          />
          {renderSummary()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  flatListContainer: {
    flex: 1,
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
  searchButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 480, // Extra padding to prevent overlap with summary
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  sellerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  sellerName: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: BRAND_COLORS.navyBlue,
  },
  itemTotal: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  quantityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 0,
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
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '65%', // Limit summary height to 65% of screen
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    ...SHADOWS.lg,
    elevation: 10,
  },
  summaryCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryIconContainer: {
    marginRight: SPACING.md,
  },
  summaryIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  summaryHeaderText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  deliveryMethodContainer: {
    marginBottom: SPACING.md,
  },
  deliveryMethodLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  deliveryMethodOptions: {
    gap: SPACING.sm,
  },
  deliveryMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  deliveryMethodOptionActive: {
    borderColor: BRAND_COLORS.vibrantBlue,
    backgroundColor: BRAND_COLORS.lightBlue,
  },
  deliveryMethodIconContainer: {
    marginRight: SPACING.md,
  },
  deliveryMethodIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryMethodText: {
    flex: 1,
  },
  deliveryMethodTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  deliveryMethodTitleActive: {
    color: BRAND_COLORS.vibrantBlue,
  },
  deliveryMethodDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  deliveryMethodFee: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  deliveryMethodFreeText: {
    color: '#10B981',
  },
  deliveryMethodCheck: {
    marginLeft: SPACING.sm,
  },
  breakdownContainer: {
    gap: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountCircle: {
    backgroundColor: '#FEF3C7',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  discountLabel: {
    fontSize: FONT_SIZES.md,
    color: BRAND_COLORS.goldenYellow,
    fontWeight: '600',
  },
  discountValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#10B981',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: BRAND_COLORS.lightBlue,
    marginHorizontal: SPACING.xs,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  totalIconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  totalIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: BRAND_COLORS.navyBlue,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#10B981',
  },
  checkoutButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  checkoutButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkoutButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  checkoutButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkoutButtonAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.white,
  },
});

export default CartScreen;
