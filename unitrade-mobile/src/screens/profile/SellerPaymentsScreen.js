import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showSuccess, showError, showInfo, showDestructiveConfirm } from '../../utils/alert';
import logger from '../../utils/logger';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const SellerPaymentsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, payouts
  
  const [paymentData, setPaymentData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayouts: 0,
    thisMonthEarnings: 0,
    lastPayoutDate: null,
    nextPayoutDate: null,
    mobileMoneyAccount: null,
  });

  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    setLoading(true);
    logger.log('=== LOADING SELLER PAYMENT DATA ===');
    logger.log('Seller ID:', user?.id);
    
    try {
      // Fetch seller's products to calculate earnings
      const productsResult = await productService.getProducts({ seller: user?.id });
      logger.log('Products result:', productsResult);
      
      let totalProducts = 0;
      let productSales = [];
      
      if (productsResult.success) {
        const products = productsResult.data.results || productsResult.data || [];
        totalProducts = products.length;
        logger.log(`Found ${totalProducts} products for seller`);
      }
      
      // Fetch seller's orders/sales
      const ordersResult = await orderService.getOrders();
      logger.log('Orders result:', ordersResult);
      
      let totalEarnings = 0;
      let thisMonthEarnings = 0;
      let availableBalance = 0;
      let pendingPayouts = 0;
      let transactionsList = [];
      let payoutsList = [];
      
      if (ordersResult.success) {
        const orders = ordersResult.data.results || ordersResult.data || [];
        logger.log(`Processing ${orders.length} total orders`);
        
        // Filter orders for this seller's products
        const sellerOrders = orders.filter(order => {
          return order.items && order.items.some(item => 
            item.product && item.product.seller && item.product.seller.id === user?.id
          );
        });
        
        logger.log(`Found ${sellerOrders.length} orders for this seller`);
        
        // Calculate earnings and build transactions
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        sellerOrders.forEach((order, index) => {
          const sellerItems = order.items.filter(item => 
            item.product && item.product.seller && item.product.seller.id === user?.id
          );
          
          sellerItems.forEach(item => {
            const itemTotal = parseFloat(item.price || 0) * (item.quantity || 1);
            totalEarnings += itemTotal;
            
            // Check if this month
            const orderDate = new Date(order.created_at || order.createdAt);
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
              thisMonthEarnings += itemTotal;
            }
            
            // Determine status and balance
            const orderStatus = order.status || 'pending';
            if (orderStatus === 'completed' || orderStatus === 'delivered') {
              availableBalance += itemTotal;
            } else {
              pendingPayouts += itemTotal;
            }
            
            // Create transaction record
            transactionsList.push({
              id: `${order.id}-${item.id || index}`,
              type: 'sale',
              amount: itemTotal,
              description: item.product?.name || 'Product Sale',
              date: order.created_at || order.createdAt || new Date().toISOString(),
              status: orderStatus === 'completed' || orderStatus === 'delivered' ? 'completed' : 'pending',
              buyerName: order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Customer',
              orderId: order.id
            });
          });
        });
        
        logger.log(`Calculated earnings: Total: GH₵${totalEarnings.toFixed(2)}, This Month: GH₵${thisMonthEarnings.toFixed(2)}`);
        logger.log(`Balance: Available: GH₵${availableBalance.toFixed(2)}, Pending: GH₵${pendingPayouts.toFixed(2)}`);
      }
      
      // Sort transactions by date (newest first)
      transactionsList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Mock mobile money account (TODO: Load from business profile)
      const mobileMoneyAccount = {
        provider: 'MTN',
        number: user?.phone || '0244123456',
        name: `${user?.first_name || 'Seller'} ${user?.last_name || 'Account'}`
      };
      
      // Mock payout history (TODO: Load real payout records)
      const mockPayouts = [
        {
          id: 'PO-003',
          amount: Math.min(availableBalance * 0.6, 200),
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
          status: 'completed',
          method: `${mobileMoneyAccount.provider} Mobile Money`,
          accountNumber: mobileMoneyAccount.number
        }
      ].filter(payout => payout.amount > 0);
      
      // Update state with real data
      setPaymentData({
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        availableBalance: parseFloat(availableBalance.toFixed(2)),
        pendingPayouts: parseFloat(pendingPayouts.toFixed(2)),
        thisMonthEarnings: parseFloat(thisMonthEarnings.toFixed(2)),
        lastPayoutDate: mockPayouts.length > 0 ? mockPayouts[0].date : null,
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        mobileMoneyAccount
      });
      
      setTransactions(transactionsList);
      setPayouts(mockPayouts);
      
      logger.log('Payment data loaded successfully');
      
    } catch (error) {
      logger.error('Error loading payment data:', error);
      showError('Error', 'Failed to load payment information');
      
      // Set default values on error
      setPaymentData({
        totalEarnings: 0,
        availableBalance: 0,
        pendingPayouts: 0,
        thisMonthEarnings: 0,
        lastPayoutDate: null,
        nextPayoutDate: null,
        mobileMoneyAccount: null
      });
      setTransactions([]);
      setPayouts([]);
    } finally {
      setLoading(false);
      logger.log('=================================');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentData();
    setRefreshing(false);
  };

  const handleRequestPayout = () => {
    if (paymentData.availableBalance < 50) {
      showInfo(
        'Minimum Payout Amount',
        'You need at least GH₵50.00 in your available balance to request a payout.'
      );
      return;
    }

    showDestructiveConfirm(
      'Request Payout',
      `Request payout of GH₵${paymentData.availableBalance.toFixed(2)} to your mobile money account?`,
      'Request Payout',
      () => {
        // TODO: Process payout request
        showSuccess('Payout Requested', 'Your payout request has been submitted and will be processed within 24 hours.');
      }
    );
  };

  const handleSetupPaymentMethod = () => {
    navigation.navigate('BusinessProfile');
  };

  const renderOverviewTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Earnings Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Earnings Summary</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningsCard}>
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, '#6366F1']}
              style={styles.earningsGradient}
            >
              <Ionicons name="wallet" size={24} color={COLORS.white} />
              <Text style={styles.earningsAmount}>GH₵{paymentData.totalEarnings.toFixed(2)}</Text>
              <Text style={styles.earningsLabel}>Total Earnings</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.earningsCard}>
            <LinearGradient
              colors={[BRAND_COLORS.goldenYellow, '#F59E0B']}
              style={styles.earningsGradient}
            >
              <Ionicons name="cash" size={24} color={COLORS.white} />
              <Text style={styles.earningsAmount}>GH₵{paymentData.availableBalance.toFixed(2)}</Text>
              <Text style={styles.earningsLabel}>Available Balance</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.earningsGrid}>
          <View style={styles.earningsCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.earningsGradient}
            >
              <Ionicons name="trending-up" size={24} color={COLORS.white} />
              <Text style={styles.earningsAmount}>GH₵{paymentData.thisMonthEarnings.toFixed(2)}</Text>
              <Text style={styles.earningsLabel}>This Month</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.earningsCard}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.earningsGradient}
            >
              <Ionicons name="time" size={24} color={COLORS.white} />
              <Text style={styles.earningsAmount}>GH₵{paymentData.pendingPayouts.toFixed(2)}</Text>
              <Text style={styles.earningsLabel}>Pending</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: BRAND_COLORS.vibrantBlue }]}
            onPress={handleRequestPayout}
          >
            <Ionicons name="arrow-down-circle" size={24} color={COLORS.white} />
            <Text style={styles.quickActionText}>Request Payout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: BRAND_COLORS.goldenYellow }]}
            onPress={handleSetupPaymentMethod}
          >
            <Ionicons name="card" size={24} color={COLORS.white} />
            <Text style={styles.quickActionText}>Payment Method</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {paymentData.mobileMoneyAccount ? (
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodIcon}>
              <Ionicons 
                name="phone-portrait" 
                size={24} 
                color={paymentData.mobileMoneyAccount.provider === 'MTN' ? '#FFCC00' : '#E60000'} 
              />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodProvider}>
                {paymentData.mobileMoneyAccount.provider} Mobile Money
              </Text>
              <Text style={styles.paymentMethodNumber}>
                {paymentData.mobileMoneyAccount.number}
              </Text>
              <Text style={styles.paymentMethodName}>
                {paymentData.mobileMoneyAccount.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleSetupPaymentMethod}
            >
              <Ionicons name="create-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.setupPaymentCard}
            onPress={handleSetupPaymentMethod}
          >
            <Ionicons name="add-circle-outline" size={32} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.setupPaymentTitle}>Setup Payment Method</Text>
            <Text style={styles.setupPaymentSubtitle}>
              Add your mobile money account to receive payouts
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payout Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payout Schedule</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>Last Payout</Text>
            <Text style={styles.scheduleValue}>
              {paymentData.lastPayoutDate ? new Date(paymentData.lastPayoutDate).toLocaleDateString() : 'No payouts yet'}
            </Text>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleLabel}>Next Payout</Text>
            <Text style={styles.scheduleValue}>
              {paymentData.nextPayoutDate ? new Date(paymentData.nextPayoutDate).toLocaleDateString() : 'Request payout'}
            </Text>
          </View>
        </View>
        <Text style={styles.scheduleNote}>
          Payouts are processed twice monthly on the 1st and 15th
        </Text>
      </View>
    </ScrollView>
  );

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={[
        styles.transactionIcon,
        { backgroundColor: item.type === 'sale' ? '#E8F5E8' : '#FFF3E0' }
      ]}>
        <Ionicons 
          name={item.type === 'sale' ? 'arrow-up' : 'arrow-down'} 
          size={20} 
          color={item.type === 'sale' ? '#10B981' : BRAND_COLORS.goldenYellow} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionMeta}>
          {item.type === 'sale' ? `Sold to ${item.buyerName}` : `Payout ID: ${item.payoutId}`}
        </Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.transactionAmountText,
          { color: item.type === 'sale' ? '#10B981' : BRAND_COLORS.goldenYellow }
        ]}>
          {item.type === 'sale' ? '+' : ''}GH₵{Math.abs(item.amount).toFixed(2)}
        </Text>
        <View style={[
          styles.transactionStatus,
          { backgroundColor: item.status === 'completed' ? '#E8F5E8' : '#FFF3E0' }
        ]}>
          <Text style={[
            styles.transactionStatusText,
            { color: item.status === 'completed' ? '#10B981' : '#F59E0B' }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPayoutItem = ({ item }) => (
    <View style={styles.payoutItem}>
      <View style={styles.payoutIcon}>
        <Ionicons name="arrow-down-circle" size={24} color={BRAND_COLORS.vibrantBlue} />
      </View>
      <View style={styles.payoutInfo}>
        <Text style={styles.payoutId}>Payout {item.id}</Text>
        <Text style={styles.payoutMethod}>{item.method}</Text>
        <Text style={styles.payoutAccount}>{item.accountNumber}</Text>
        <Text style={styles.payoutDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.payoutAmount}>
        <Text style={styles.payoutAmountText}>GH₵{item.amount.toFixed(2)}</Text>
        <View style={styles.payoutStatusBadge}>
          <Text style={styles.payoutStatusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderTabButton = (tabId, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabId && styles.activeTabButton]}
      onPress={() => setActiveTab(tabId)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tabId ? COLORS.white : COLORS.textSecondary} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tabId && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Payments & Payouts</Text>
            <Text style={styles.headerSubtitle}>Manage your earnings</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="wallet" size={28} color={BRAND_COLORS.goldenYellow} />
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('overview', 'Overview', 'analytics')}
        {renderTabButton('transactions', 'Transactions', 'list')}
        {renderTabButton('payouts', 'Payouts', 'arrow-down-circle')}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      
      {activeTab === 'transactions' && (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          style={styles.tabContent}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {activeTab === 'payouts' && (
        <FlatList
          data={payouts}
          renderItem={renderPayoutItem}
          keyExtractor={(item) => item.id}
          style={styles.tabContent}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  tabButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  activeTabButtonText: {
    color: COLORS.white,
  },
  tabContent: {
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
  earningsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  earningsCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  earningsGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  earningsLabel: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodProvider: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  paymentMethodNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  paymentMethodName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupPaymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  setupPaymentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  setupPaymentSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    ...SHADOWS.sm,
  },
  scheduleItem: {
    flex: 1,
    alignItems: 'center',
  },
  scheduleDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  scheduleLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  scheduleValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  scheduleNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  transactionItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  transactionStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  transactionStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  payoutItem: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  payoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  payoutInfo: {
    flex: 1,
  },
  payoutId: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  payoutMethod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  payoutAccount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  payoutDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  payoutAmount: {
    alignItems: 'flex-end',
  },
  payoutAmountText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: SPACING.xs,
  },
  payoutStatusBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  payoutStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#10B981',
    textTransform: 'capitalize',
  },
});

export default SellerPaymentsScreen;
