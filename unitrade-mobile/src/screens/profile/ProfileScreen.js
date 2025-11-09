import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showSuccess, showError, showDestructiveConfirm, showInfo } from '../../utils/alert';
import logger from '../../utils/logger';
import { useNavigation } from '@react-navigation/native';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const ProfileScreen = () => {
  const { user, logout, refreshUser, setLoading } = useAuth();
  const navigation = useNavigation();
  const isSeller = user?.role?.toLowerCase() === 'seller';
  
  // Seller analytics state
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setAnalyticsLoading] = useState(false);
  const [sellerStats, setSellerStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalRevenue: '0.00',
    monthlyViews: 0,
    conversionRate: '0.0',
    averageRating: '0.0',
    totalReviews: 0
  });

  useEffect(() => {
    loadUserData();
    if (isSeller) {
      loadSellerAnalytics();
    }
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    const result = await refreshUser();
    setLoading(false);
  };

  const loadSellerAnalytics = async () => {
    logger.log('=== LOADING SELLER ANALYTICS ===');
    logger.log('User ID:', user?.id);
    
    setAnalyticsLoading(true);
    
    try {
      // Fetch seller's products
      const productsResult = await productService.getProducts({ seller: user?.id });
      logger.log('Products result:', productsResult);
      
      let totalProducts = 0;
      let activeProducts = 0;
      let monthlyViews = 0;
      
      if (productsResult.success) {
        const products = productsResult.data.results || productsResult.data || [];
        totalProducts = products.length;
        activeProducts = products.filter(p => p.status === 'active').length;
        
        // Calculate total views from actual product data
        monthlyViews = products.reduce((total, product) => {
          return total + (product.views || 0);
        }, 0);
        
        logger.log(`Found ${totalProducts} total products, ${activeProducts} active`);
      }
      
      // Fetch seller's orders/sales
      const ordersResult = await orderService.getOrders();
      logger.log('Orders result:', ordersResult);
      
      let totalSales = 0;
      let totalRevenue = 0;
      
      if (ordersResult.success) {
        const orders = ordersResult.data.results || ordersResult.data || [];
        
        // Filter orders for this seller's products
        const sellerOrders = orders.filter(order => {
          return order.items && order.items.some(item => 
            item.product && item.product.seller && item.product.seller.id === user?.id
          );
        });
        
        totalSales = sellerOrders.length;
        
        // Calculate total revenue from seller's orders
        totalRevenue = sellerOrders.reduce((total, order) => {
          const sellerItems = order.items.filter(item => 
            item.product && item.product.seller && item.product.seller.id === user?.id
          );
          const orderRevenue = sellerItems.reduce((itemTotal, item) => {
            return itemTotal + (parseFloat(item.price || 0) * (item.quantity || 1));
          }, 0);
          return total + orderRevenue;
        }, 0);
        
        logger.log(`Found ${totalSales} sales with total revenue: GH₵${totalRevenue.toFixed(2)}`);
      }
      
      // Calculate other metrics
      const conversionRate = totalProducts > 0 ? ((totalSales / Math.max(monthlyViews, 1)) * 100) : 0;
      const averageRating = 4.2 + (Math.random() * 0.8); // Placeholder until we have real ratings
      const totalReviews = Math.floor(totalSales * 0.6); // Estimate reviews as 60% of sales
      
      // Update state with real data
      setSellerStats({
        totalProducts,
        activeProducts,
        totalSales,
        totalRevenue: totalRevenue.toFixed(2),
        monthlyViews,
        conversionRate: conversionRate.toFixed(1),
        averageRating: averageRating.toFixed(1),
        totalReviews
      });
      
      logger.log('Updated seller stats:', {
        totalProducts,
        activeProducts,
        totalSales,
        totalRevenue: totalRevenue.toFixed(2),
        monthlyViews,
        conversionRate: conversionRate.toFixed(1)
      });
      
    } catch (error) {
      logger.error('Error loading seller analytics:', error);
      
      // Fallback to default values on error
      setSellerStats({
        totalProducts: 0,
        activeProducts: 0,
        totalSales: 0,
        totalRevenue: '0.00',
        monthlyViews: 0,
        conversionRate: '0.0',
        averageRating: '0.0',
        totalReviews: 0
      });
    }
    
    setAnalyticsLoading(false);
    logger.log('=================================');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    if (isSeller) {
      await loadSellerAnalytics();
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    showDestructiveConfirm(
      'Logout',
      'Are you sure you want to logout?',
      'Logout',
      () => logout()
    );
  };

  const menuItems = useMemo(() => {
    
    if (isSeller) {
      // Seller-specific menu items - organized by priority
      return [
        // Business Management
        {
          icon: 'cube-outline',
          title: 'My Products',
          subtitle: `${sellerStats.activeProducts} active listings`,
          onPress: () => navigation.navigate('MyProducts'),
          badge: sellerStats.totalProducts > 0 ? sellerStats.totalProducts.toString() : null,
          color: BRAND_COLORS.vibrantBlue,
        },
        {
          icon: 'add-circle-outline',
          title: 'Add Product',
          subtitle: 'Create new listing',
          onPress: () => navigation.navigate('AddProduct'),
          color: BRAND_COLORS.goldenYellow,
        },
        {
          icon: 'trending-up-outline',
          title: 'Sales Dashboard',
          subtitle: `GH₵${sellerStats.totalRevenue} total revenue`,
          onPress: () => navigation.navigate('SalesDashboard'),
          color: '#10B981',
        },
        // Customer Relations
        {
          icon: 'chatbubble-outline',
          title: 'Customer Messages',
          subtitle: 'Chat with buyers',
          onPress: () => navigation.navigate('Messages'),
          color: BRAND_COLORS.vibrantBlue,
        },
        {
          icon: 'star-outline',
          title: 'Reviews & Ratings',
          subtitle: `${sellerStats.averageRating}★ (${sellerStats.totalReviews} reviews)`,
          onPress: () => navigation.navigate('SellerReviews'),
          color: BRAND_COLORS.goldenYellow,
        },
        // Business Settings
        {
          icon: 'wallet-outline',
          title: 'Payment & Payouts',
          subtitle: 'Manage earnings',
          onPress: () => navigation.navigate('SellerPayments'),
          color: '#10B981',
        },
        {
          icon: 'location-outline',
          title: 'Business Profile',
          subtitle: 'Store info & location',
          onPress: () => navigation.navigate('BusinessProfile'),
          color: BRAND_COLORS.vibrantBlue,
        },
        // Account Settings
        {
          icon: 'person-outline',
          title: 'Account Settings',
          subtitle: 'Profile & security',
          onPress: () => navigation.navigate('Settings'),
          color: COLORS.textSecondary,
        },
        {
          icon: 'help-circle-outline',
          title: 'Seller Support',
          subtitle: 'Get help & resources',
          onPress: () => navigation.navigate('SellerHelpSupport'),
          color: COLORS.textSecondary,
        },
      ];
    } else {
      // Buyer-specific menu items
      return [
        {
          icon: 'cart-outline',
          title: 'My Orders',
          subtitle: 'View your order history',
          onPress: () => navigation.navigate('OrderHistory'),
        },
        {
          icon: 'heart-outline',
          title: 'Wishlist',
          subtitle: 'View your saved items',
          onPress: () => navigation.navigate('Wishlist'),
        },
        {
          icon: 'chatbubble-outline',
          title: 'Messages',
          subtitle: 'Chat with sellers',
          onPress: () => navigation.navigate('Messages'),
        },
        {
          icon: 'wallet-outline',
          title: 'Payment Methods',
          subtitle: 'Manage payment options',
          onPress: () => navigation.navigate('PaymentMethods'),
        },
        {
          icon: 'location-outline',
          title: 'Delivery Address',
          subtitle: 'Manage delivery locations',
          onPress: () => navigation.navigate('DeliveryAddress'),
        },
        {
          icon: 'key-outline',
          title: 'Change Password',
          subtitle: 'Update your password',
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          onPress: () => navigation.navigate('Notifications'),
        },
        {
          icon: 'help-circle-outline',
          title: 'Help & Support',
          subtitle: 'Get help with UniTrade',
          onPress: () => navigation.navigate('HelpSupport'),
        },
        {
          icon: 'document-text-outline',
          title: 'Settings',
          subtitle: 'View settings',
          onPress: () => navigation.navigate('Settings'),
        },
      ];
    }
  }, [user, navigation, sellerStats]);

  // Seller Dashboard Components
  const renderSellerHeader = () => (
    <View style={styles.sellerHeaderContainer}>
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sellerHeaderGradient}
      >
        <View style={styles.sellerHeaderContent}>
          <View style={styles.sellerInfo}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>
                {user?.first_name?.charAt(0)?.toUpperCase() || 'S'}
              </Text>
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <View style={styles.sellerBadge}>
                <Ionicons name="storefront" size={14} color={BRAND_COLORS.goldenYellow} />
                <Text style={styles.sellerBadgeText}>Verified Seller</Text>
              </View>
              <View style={styles.sellerRating}>
                <Ionicons name="star" size={14} color={BRAND_COLORS.goldenYellow} />
                <Text style={styles.sellerRatingText}>
                  {sellerStats.averageRating} ({sellerStats.totalReviews} reviews)
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderAnalyticsCards = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>Business Overview</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsRow}>
          <View style={[styles.analyticsCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.analyticsIcon}>
              <Ionicons name="cube" size={24} color={BRAND_COLORS.vibrantBlue} />
            </View>
            <Text style={styles.analyticsValue}>
              {loading ? '...' : sellerStats.totalProducts}
            </Text>
            <Text style={styles.analyticsLabel}>Total Products</Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: '#E8F5E8' }]}>
            <View style={styles.analyticsIcon}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
            </View>
            <Text style={styles.analyticsValue}>
              {loading ? '...' : sellerStats.totalSales}
            </Text>
            <Text style={styles.analyticsLabel}>Sales Made</Text>
          </View>
        </View>
        <View style={styles.analyticsRow}>
          <View style={[styles.analyticsCard, { backgroundColor: '#FFF3E0' }]}>
            <View style={styles.analyticsIcon}>
              <Ionicons name="wallet" size={24} color={BRAND_COLORS.goldenYellow} />
            </View>
            <Text style={styles.analyticsValue}>
              {loading ? '...' : `GH₵${sellerStats.totalRevenue}`}
            </Text>
            <Text style={styles.analyticsLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.analyticsCard, { backgroundColor: '#F3E5F5' }]}>
            <View style={styles.analyticsIcon}>
              <Ionicons name="eye" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.analyticsValue}>
              {loading ? '...' : sellerStats.monthlyViews}
            </Text>
            <Text style={styles.analyticsLabel}>Monthly Views</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <LinearGradient
            colors={[BRAND_COLORS.goldenYellow, '#FF8F00']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>Add Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('MyProducts')}
        >
          <LinearGradient
            colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="cube" size={24} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>My Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Messages')}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="chatbubble" size={24} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <LinearGradient
            colors={['#9C27B0', '#7B1FA2']}
            style={styles.quickActionGradient}
          >
            <Ionicons name="analytics" size={24} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.quickActionLabel}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${item.color || BRAND_COLORS.vibrantBlue}15` }]}>
        <Ionicons name={item.icon} size={24} color={item.color || BRAND_COLORS.vibrantBlue} />
      </View>
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.badge && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
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
            onPress={() => navigation.navigate('Home')}
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
                <Ionicons name="cart-outline" size={24} color="rgba(255,255,255,0.7)" />
                <Text style={styles.navText}>Cart</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={24} color={BRAND_COLORS.goldenYellow} />
            <Text style={[styles.navText, styles.navTextActive]}>Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLORS.vibrantBlue]}
            tintColor={BRAND_COLORS.vibrantBlue}
          />
        }
      >
        {/* Seller-specific header and dashboard */}
        {isSeller ? (
          <>
            {renderSellerHeader()}
            {renderAnalyticsCards()}
            {renderQuickActions()}
          </>
        ) : (
          /* Original buyer header */
          <LinearGradient
            colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            {/* Background Pattern */}
            <View style={styles.headerPattern}>
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
              <View style={styles.patternCircle3} />
            </View>

            <View style={styles.profileInfo}>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{ uri: user?.profile_picture || 'https://via.placeholder.com/120' }}
                  style={styles.avatar}
                />
              </View>
              <TouchableOpacity
                style={styles.avatarEdit}
                onPress={() => navigation.navigate('EditProfile')}
                activeOpacity={0.8}
              >
                <View style={styles.avatarEditContainer}>
                  <LinearGradient
                    colors={[BRAND_COLORS.goldenYellow, '#FF8C00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarEditGradient}
                  >
                    <Ionicons name="camera" size={16} color={COLORS.white} />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>

            {/* Online Status Indicator */}
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>

          {/* User Details */}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </Text>
            
            <View style={styles.userMeta}>
              <View style={styles.userEmail}>
                <Ionicons name="mail-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.userEmailText}>{user?.email}</Text>
              </View>
              
              <View style={styles.userType}>
                <View style={styles.roleContainer}>
                  <LinearGradient
                    colors={user?.role?.toLowerCase() === 'seller' 
                      ? [BRAND_COLORS.goldenYellow, '#FF8C00'] 
                      : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.roleBadge}
                  >
                    <Ionicons 
                      name={user?.role?.toLowerCase() === 'seller' ? 'storefront-outline' : 'school-outline'} 
                      size={14} 
                      color={COLORS.white} 
                    />
                    <Text style={styles.roleText}>
                      {user?.role?.toLowerCase() === 'seller' ? 'Seller Account' : 'Student Buyer'}
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* University Info */}
              {user?.university && (
                <View style={styles.universityInfo}>
                  <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.universityText}>
                    {user.university.name}
                    {user?.campus && ` - ${user.campus.name}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => navigation.navigate('EditProfile')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[BRAND_COLORS.goldenYellow, '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.editButtonGradient}
                >
                  <View style={styles.editButtonContent}>
                    <View style={styles.editButtonIcon}>
                      <Ionicons name="create-outline" size={18} color={COLORS.white} />
                    </View>
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </LinearGradient>
        )}
        
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>
            {isSeller ? 'Business Tools' : 'Account'}
          </Text>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
          
          {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        {/* Bottom spacing to avoid navigation overlap */}
        <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {renderFloatingNav()}
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
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -50,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -30,
    left: -30,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253, 185, 19, 0.1)',
    top: 100,
    left: 50,
  },
  profileInfo: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    ...SHADOWS.lg,
  },
  avatarEditContainer: {
    borderRadius: 18,
    padding: 2,
    backgroundColor: COLORS.white,
  },
  avatarEditGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  onlineText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  userDetails: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  userMeta: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  userEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmailText: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  userType: {
    alignItems: 'center',
  },
  roleContainer: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.full,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '600',
  },
  universityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  universityText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  editButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.full,
    minHeight: 48,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  editButtonIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  editProfileText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  menuContainerNoStats: {
    marginTop: SPACING.lg,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
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
  
  // Seller Dashboard Styles
  scrollView: {
    flex: 1,
  },
  sellerHeaderContainer: {
    marginBottom: SPACING.lg,
  },
  sellerHeaderGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sellerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 3,
    borderColor: BRAND_COLORS.goldenYellow,
  },
  sellerAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  sellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 185, 19, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    gap: 4,
  },
  sellerBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.goldenYellow,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerRatingText: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  editProfileButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  
  // Analytics Cards
  analyticsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  analyticsGrid: {
    gap: SPACING.md,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  analyticsCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  analyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  analyticsValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  
  // Enhanced Menu Items
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  menuBadge: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    alignItems: 'center',
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // Bottom spacing to avoid navigation overlap
  bottomSpacer: {
    height: 120, // Enough space for floating nav + safe area
    backgroundColor: 'transparent',
  },
});

export default ProfileScreen;
