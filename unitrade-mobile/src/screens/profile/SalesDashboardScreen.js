import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showSuccess, showError, showInfo } from '../../utils/alert';
import logger from '../../utils/logger';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const { width } = Dimensions.get('window');

const SalesDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    topProducts: [],
    recentSales: [],
    monthlyData: [],
    performanceMetrics: {
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    }
  });

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    setLoading(true);
    logger.log('=== LOADING SALES DASHBOARD DATA ===');
    logger.log('Seller ID:', user?.id);
    
    try {
      // Fetch seller's products and orders
      const [productsResult, ordersResult] = await Promise.all([
        productService.getProducts({ seller: user?.id }),
        orderService.getOrders()
      ]);
      
      logger.log('Products result:', productsResult);
      logger.log('Orders result:', ordersResult);
      
      let totalRevenue = 0;
      let totalSales = 0;
      let recentSales = [];
      let productSalesMap = new Map();
      let monthlyRevenue = new Map();
      
      if (ordersResult.success) {
        const orders = ordersResult.data.results || ordersResult.data || [];
        
        // Filter orders for this seller
        const sellerOrders = orders.filter(order => {
          return order.items && order.items.some(item => 
            item.product && item.product.seller && item.product.seller.id === user?.id
          );
        });
        
        logger.log(`Found ${sellerOrders.length} orders for seller`);
        
        sellerOrders.forEach(order => {
          const sellerItems = order.items.filter(item => 
            item.product && item.product.seller && item.product.seller.id === user?.id
          );
          
          sellerItems.forEach(item => {
            const itemTotal = parseFloat(item.price || 0) * (item.quantity || 1);
            totalRevenue += itemTotal;
            totalSales += item.quantity || 1;
            
            // Track product sales
            const productId = item.product.id;
            if (productSalesMap.has(productId)) {
              const existing = productSalesMap.get(productId);
              productSalesMap.set(productId, {
                ...existing,
                sales: existing.sales + (item.quantity || 1),
                revenue: existing.revenue + itemTotal
              });
            } else {
              productSalesMap.set(productId, {
                id: productId,
                name: item.product.name,
                sales: item.quantity || 1,
                revenue: itemTotal,
                image: item.product.images?.[0]?.image || null
              });
            }
            
            // Track monthly data
            const orderDate = new Date(order.created_at || order.createdAt);
            const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
            monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + itemTotal);
            
            // Add to recent sales
            recentSales.push({
              id: `${order.id}-${item.id || Math.random()}`,
              productName: item.product.name,
              buyerName: order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Customer',
              amount: itemTotal,
              quantity: item.quantity || 1,
              date: order.created_at || order.createdAt,
              status: order.status || 'pending'
            });
          });
        });
      }
      
      // Sort and get top products
      const topProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Sort recent sales by date
      recentSales.sort((a, b) => new Date(b.date) - new Date(a.date));
      recentSales = recentSales.slice(0, 10);
      
      // Calculate performance metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const thisMonthKey = `${currentYear}-${currentMonth}`;
      const lastMonthKey = `${lastMonthYear}-${lastMonth}`;
      
      const thisMonthRevenue = monthlyRevenue.get(thisMonthKey) || 0;
      const lastMonthRevenue = monthlyRevenue.get(lastMonthKey) || 0;
      const growth = lastMonthRevenue > 0 ? 
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 
        (thisMonthRevenue > 0 ? 100 : 0);
      
      // Get total product views for conversion rate calculation
      let totalViews = 0;
      if (productsResult.success) {
        const products = productsResult.data.results || productsResult.data || [];
        totalViews = products.reduce((total, product) => {
          return total + (product.views || 0);
        }, 0);
      }
      
      // Calculate averages
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;
      
      setSalesData({
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalSales,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        topProducts,
        recentSales,
        monthlyData: Array.from(monthlyRevenue.entries()).map(([key, value]) => ({
          month: key,
          revenue: value
        })),
        performanceMetrics: {
          thisMonth: parseFloat(thisMonthRevenue.toFixed(2)),
          lastMonth: parseFloat(lastMonthRevenue.toFixed(2)),
          growth: parseFloat(growth.toFixed(1))
        }
      });
      
      logger.log(`Sales Summary: Revenue: GH₵${totalRevenue.toFixed(2)}, Sales: ${totalSales}`);
      logger.log(`Top Products: ${topProducts.length}, Recent Sales: ${recentSales.length}`);
      
    } catch (error) {
      logger.error('Error loading sales data:', error);
      showError('Error', 'Failed to load sales dashboard');
    } finally {
      setLoading(false);
      logger.log('=================================');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSalesData();
    setRefreshing(false);
  };

  const renderMetricCard = (title, value, subtitle, icon, color, trend = null) => (
    <View style={styles.metricCard}>
      <LinearGradient
        colors={color}
        style={styles.metricGradient}
      >
        <View style={styles.metricHeader}>
          <Ionicons name={icon} size={24} color={COLORS.white} />
          {trend !== null && trend !== undefined && !isNaN(trend) && (
            <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10B981' : '#EF4444' }]}>
              <Ionicons 
                name={trend > 0 ? 'trending-up' : 'trending-down'} 
                size={12} 
                color={COLORS.white} 
              />
              <Text style={styles.trendText}>{Math.abs(trend).toFixed(1)}%</Text>
            </View>
          )}
        </View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </View>
  );

  const renderTopProduct = (product, index) => (
    <View key={product.id} style={styles.topProductItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productStats}>
          {product.sales} sales • GH₵{product.revenue.toFixed(2)}
        </Text>
      </View>
      <View style={styles.productRevenue}>
        <Text style={styles.revenueAmount}>GH₵{product.revenue.toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderRecentSale = (sale, index) => (
    <View key={sale.id} style={styles.recentSaleItem}>
      <View style={styles.saleInfo}>
        <Text style={styles.saleProduct} numberOfLines={1}>{sale.productName}</Text>
        <Text style={styles.saleBuyer}>Sold to {sale.buyerName}</Text>
        <Text style={styles.saleDate}>
          {new Date(sale.date).toLocaleDateString()} • Qty: {sale.quantity}
        </Text>
      </View>
      <View style={styles.saleAmount}>
        <Text style={styles.saleAmountText}>GH₵{sale.amount.toFixed(2)}</Text>
        <View style={[
          styles.saleStatus,
          { backgroundColor: sale.status === 'completed' ? '#E8F5E8' : '#FFF3E0' }
        ]}>
          <Text style={[
            styles.saleStatusText,
            { color: sale.status === 'completed' ? '#10B981' : '#F59E0B' }
          ]}>
            {sale.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Sales Dashboard</Text>
            <Text style={styles.headerSubtitle}>Track your performance</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={28} color={BRAND_COLORS.goldenYellow} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Total Revenue',
              `GH₵${salesData.totalRevenue.toFixed(2)}`,
              'All time earnings',
              'wallet',
              [BRAND_COLORS.vibrantBlue, '#6366F1'],
              salesData.performanceMetrics.growth
            )}
            {renderMetricCard(
              'Total Sales',
              `${salesData.totalSales}`,
              'Items sold',
              'cube',
              [BRAND_COLORS.goldenYellow, '#F59E0B']
            )}
          </View>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Avg Order Value',
              `GH₵${salesData.averageOrderValue.toFixed(2)}`,
              'Per transaction',
              'trending-up',
              ['#10B981', '#059669']
            )}
            {renderMetricCard(
              'Conversion Rate',
              `${salesData.conversionRate}%`,
              'Views to sales',
              'eye',
              ['#8B5CF6', '#7C3AED']
            )}
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>This Month</Text>
              <Text style={styles.performanceValue}>
                GH₵{salesData.performanceMetrics.thisMonth.toFixed(2)}
              </Text>
            </View>
            <View style={styles.performanceDivider} />
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Last Month</Text>
              <Text style={styles.performanceValue}>
                GH₵{salesData.performanceMetrics.lastMonth.toFixed(2)}
              </Text>
            </View>
            <View style={styles.performanceDivider} />
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Growth</Text>
              <Text style={[
                styles.performanceValue,
                { color: salesData.performanceMetrics.growth >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {salesData.performanceMetrics.growth >= 0 ? '+' : ''}
                {salesData.performanceMetrics.growth.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Products</Text>
          <View style={styles.topProductsContainer}>
            {salesData.topProducts.length > 0 ? (
              salesData.topProducts.map((product, index) => renderTopProduct(product, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No sales data yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Sales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          <View style={styles.recentSalesContainer}>
            {salesData.recentSales.length > 0 ? (
              salesData.recentSales.map((sale, index) => renderRecentSale(sale, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateText}>No recent sales</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <LinearGradient
                colors={[BRAND_COLORS.vibrantBlue, '#6366F1']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="add-circle" size={32} color={COLORS.white} />
                <Text style={styles.quickActionText}>Add Product</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('MyProducts')}
            >
              <LinearGradient
                colors={[BRAND_COLORS.goldenYellow, '#F59E0B']}
                style={styles.quickActionGradient}
              >
                <Ionicons name="cube" size={32} color={COLORS.white} />
                <Text style={styles.quickActionText}>My Products</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
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
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 185, 19, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  metricGradient: {
    padding: SPACING.lg,
    minHeight: 120,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: 2,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  metricValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  metricTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    ...SHADOWS.sm,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  performanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  performanceValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  topProductsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  productStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productRevenue: {
    alignItems: 'flex-end',
  },
  revenueAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
  },
  recentSalesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  recentSaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  saleInfo: {
    flex: 1,
  },
  saleProduct: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  saleBuyer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  saleDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  saleAmount: {
    alignItems: 'flex-end',
  },
  saleAmountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  saleStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  saleStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  quickActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default SalesDashboardScreen;
