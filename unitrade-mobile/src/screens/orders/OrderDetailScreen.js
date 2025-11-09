import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import { useNavigation, useRoute } from '@react-navigation/native';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const ORDER_STATUS_CONFIG = {
  pending: { color: '#F59E0B', icon: 'time', label: 'Pending', step: 1 },
  processing: { color: '#3B82F6', icon: 'sync', label: 'Processing', step: 2 },
  shipped: { color: '#8B5CF6', icon: 'airplane', label: 'Shipped', step: 3 },
  delivered: { color: '#10B981', icon: 'checkmark-circle', label: 'Delivered', step: 4 },
  completed: { color: '#10B981', icon: 'checkmark-done', label: 'Completed', step: 4 },
  cancelled: { color: '#EF4444', icon: 'close-circle', label: 'Cancelled', step: 0 },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { color: '#F59E0B', icon: 'time', label: 'Pending' },
  paid: { color: '#10B981', icon: 'checkmark-circle', label: 'Paid' },
  failed: { color: '#EF4444', icon: 'close-circle', label: 'Failed' },
};

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    const result = await orderService.getOrder(orderId);
    if (result.success) {
      setOrder(result.data);
    } else {
      Alert.alert('Error', 'Failed to load order details');
      navigation.goBack();
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleContactSeller = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Info', 'Seller contact not available');
    }
  };

  const handleRateProduct = (productId) => {
    navigation.navigate('RateProduct', { productId, orderId });
  };

  const renderStatusTimeline = () => {
    if (!order) return null;

    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
    const currentStep = statusConfig.step;
    const isCancelled = order.status === 'cancelled';

    const steps = [
      { label: 'Order Placed', icon: 'cart', step: 1 },
      { label: 'Processing', icon: 'sync', step: 2 },
      { label: 'Shipped', icon: 'airplane', step: 3 },
      { label: 'Delivered', icon: 'checkmark-circle', step: 4 },
    ];

    if (isCancelled) {
      return (
        <View style={styles.timelineContainer}>
          <View style={styles.cancelledTimeline}>
            <Ionicons name="close-circle" size={48} color={COLORS.error} />
            <Text style={styles.cancelledText}>Order Cancelled</Text>
            <Text style={styles.cancelledDate}>{formatDate(order.updated_at)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => {
          const isCompleted = step.step <= currentStep;
          const isActive = step.step === currentStep;

          return (
            <View key={index} style={styles.timelineStep}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    isCompleted && styles.timelineIconCompleted,
                    isActive && styles.timelineIconActive,
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={20}
                    color={isCompleted ? COLORS.white : COLORS.textLight}
                  />
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      isCompleted && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineLabel,
                    isCompleted && styles.timelineLabelCompleted,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderOrderItems = () => {
    if (!order || !order.items || order.items.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image
              source={{
                uri: item.product?.images?.[0]?.image || 'https://via.placeholder.com/80',
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product?.name || 'Product'}
              </Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemTotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
              {order.status === 'delivered' && (
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={() => handleRateProduct(item.product?.id)}
                >
                  <Ionicons name="star-outline" size={16} color={BRAND_COLORS.goldenYellow} />
                  <Text style={styles.rateButtonText}>Rate</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderOrderSummary = () => {
    if (!order) return null;

    const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.pending;
    const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Number</Text>
          <Text style={styles.summaryValue}>#{order.id}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Date</Text>
          <Text style={styles.summaryValue}>{formatDate(order.created_at)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Order Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Ionicons name={statusConfig.icon} size={14} color={COLORS.white} />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: paymentConfig.color }]}>
            <Ionicons name={paymentConfig.icon} size={14} color={COLORS.white} />
            <Text style={styles.statusText}>{paymentConfig.label}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>
            {order.payment_method === 'paystack' ? 'Paystack' : 'Cash on Delivery'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(order.total_amount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>{formatPrice(order.total_amount)}</Text>
        </View>
      </View>
    );
  };

  const renderDeliveryInfo = () => {
    if (!order) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryRow}>
            <Ionicons name="location" size={20} color={BRAND_COLORS.vibrantBlue} />
            <View style={styles.deliveryText}>
              <Text style={styles.deliveryLabel}>Delivery Address</Text>
              <Text style={styles.deliveryValue}>{order.delivery_address || 'N/A'}</Text>
            </View>
          </View>
          {order.delivery_phone && (
            <View style={styles.deliveryRow}>
              <Ionicons name="call" size={20} color={BRAND_COLORS.vibrantBlue} />
              <View style={styles.deliveryText}>
                <Text style={styles.deliveryLabel}>Phone Number</Text>
                <Text style={styles.deliveryValue}>{order.delivery_phone}</Text>
              </View>
            </View>
          )}
          {order.delivery_notes && (
            <View style={styles.deliveryRow}>
              <Ionicons name="document-text" size={20} color={BRAND_COLORS.vibrantBlue} />
              <View style={styles.deliveryText}>
                <Text style={styles.deliveryLabel}>Delivery Notes</Text>
                <Text style={styles.deliveryValue}>{order.delivery_notes}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Timeline */}
        {renderStatusTimeline()}

        {/* Order Items */}
        {renderOrderItems()}

        {/* Order Summary */}
        {renderOrderSummary()}

        {/* Delivery Info */}
        {renderDeliveryInfo()}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Contact Seller Button */}
      {order.status !== 'cancelled' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <LinearGradient
              colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactButtonGradient}
            >
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
              <Text style={styles.contactButtonText}>Contact Seller</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerBackButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  backButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Timeline Styles
  timelineContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: '#10B981',
  },
  timelineIconActive: {
    backgroundColor: '#3B82F6',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  timelineLabelCompleted: {
    color: COLORS.text,
    fontWeight: '600',
  },
  cancelledTimeline: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  cancelledText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
  cancelledDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  // Section Styles
  section: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  // Order Items Styles
  orderItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  itemQuantity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: '#FFF9E6',
    borderRadius: BORDER_RADIUS.sm,
  },
  rateButtonText: {
    fontSize: FONT_SIZES.xs,
    color: '#FDB913',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  // Summary Styles
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FDB913',
  },
  // Delivery Info Styles
  deliveryInfo: {
    gap: SPACING.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  deliveryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  deliveryValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  // Footer Styles
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  contactButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default OrderDetailScreen;
