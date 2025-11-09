import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import { useNavigation } from '@react-navigation/native';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const ORDER_STATUS_CONFIG = {
  pending: { color: '#F59E0B', icon: 'time', label: 'Pending' },
  processing: { color: '#3B82F6', icon: 'sync', label: 'Processing' },
  shipped: { color: '#8B5CF6', icon: 'airplane', label: 'Shipped' },
  delivered: { color: '#10B981', icon: 'checkmark-circle', label: 'Delivered' },
  completed: { color: '#10B981', icon: 'checkmark-done', label: 'Completed' },
  cancelled: { color: '#EF4444', icon: 'close-circle', label: 'Cancelled' },
};

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (isMounted) setLoading(true);
      const result = await orderService.getOrders();
      if (isMounted) {
        if (result.success) {
          setOrders(result.data.results || result.data || []);
        }
        setLoading(false);
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const result = await orderService.getOrders();
    if (result.success) {
      setOrders(result.data.results || result.data || []);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter((order) => order.status === filter);
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
          <Text style={styles.greeting}>My Orders 📦</Text>
          <Text style={styles.headerSubtitle}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
        onPress={() => setFilter('all')}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
        onPress={() => setFilter('pending')}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
          Pending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'delivered' && styles.filterChipActive]}
        onPress={() => setFilter('delivered')}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, filter === 'delivered' && styles.filterTextActive]}>
          Delivered
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'cancelled' && styles.filterChipActive]}
        onPress={() => setFilter('cancelled')}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
          Cancelled
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderItem = ({ item }) => {
    const statusConfig = ORDER_STATUS_CONFIG[item.status] || ORDER_STATUS_CONFIG.pending;
    const itemCount = item.items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Ionicons name={statusConfig.icon} size={14} color={COLORS.white} />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          {item.items && item.items.length > 0 && (
            <View style={styles.orderItems}>
              {item.items.slice(0, 3).map((orderItem, index) => (
                <Image
                  key={index}
                  source={{
                    uri: orderItem.product?.images?.[0]?.image || 'https://via.placeholder.com/60',
                  }}
                  style={styles.productThumbnail}
                  resizeMode="cover"
                />
              ))}
              {itemCount > 3 && (
                <View style={styles.moreItems}>
                  <Text style={styles.moreItemsText}>+{itemCount - 3}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.orderInfo}>
            <View style={styles.orderInfoRow}>
              <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.orderInfoText}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <View style={styles.orderInfoRow}>
              <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.orderInfoText}>GH₵ {item.total_amount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color={BRAND_COLORS.vibrantBlue} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[BRAND_COLORS.lightBlue, COLORS.white]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="receipt-outline" size={64} color={BRAND_COLORS.vibrantBlue} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all'
          ? 'Start shopping to see your orders here'
          : `No ${filter} orders found`}
      </Text>
      {filter === 'all' && (
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
      )}
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

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          filteredOrders.length === 0 ? styles.emptyList : styles.listContent
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
        maxToRenderPerBatch={8}
        windowSize={8}
        initialNumToRender={5}
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#F8F9FA',
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...SHADOWS.sm,
  },
  filterChipActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: SPACING.lg,
  },
  emptyList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  orderBody: {
    marginBottom: SPACING.md,
  },
  orderItems: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  productThumbnail: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  moreItems: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  orderInfo: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  orderInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
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
});

export default OrderHistoryScreen;
