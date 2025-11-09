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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { messagingService } from '../../services/messagingService';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const MessagesScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const isSeller = user?.role?.toLowerCase() === 'seller';
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const loadThreads = async () => {
      if (isMounted) setLoading(true);
      const result = await messagingService.getThreads();
      if (isMounted) {
        if (result.success) {
          setThreads(result.data.results || result.data || []);
        }
        setLoading(false);
      }
    };

    loadThreads();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    const result = await messagingService.getThreads();
    if (result.success) {
      setThreads(result.data.results || result.data || []);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadThreads();
    setRefreshing(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons 
              name={isSeller ? "storefront-outline" : "chatbubbles-outline"} 
              size={24} 
              color={COLORS.white} 
            />
          </View>
          <View>
            <Text style={styles.greeting}>
              {isSeller ? 'Customer Messages 💼' : 'Messages 💬'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isSeller 
                ? `${threads.length} customer inquiry${threads.length !== 1 ? 'ies' : 'y'}`
                : `${threads.length} conversation${threads.length !== 1 ? 's' : ''}`
              }
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={20} color={BRAND_COLORS.navyBlue} />
        </TouchableOpacity>
      </View>
      
      {/* Role-specific Tabs */}
      <View style={styles.tabsContainer}>
        {isSeller ? (
          // Seller tabs
          <>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.tabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All Inquiries</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
              onPress={() => setActiveTab('unread')}
            >
              <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
              onPress={() => setActiveTab('orders')}
            >
              <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>Orders</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Buyer tabs
          <>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.tabActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
              onPress={() => setActiveTab('unread')}
            >
              <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>Unread</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'archived' && styles.tabActive]}
              onPress={() => setActiveTab('archived')}
            >
              <Text style={[styles.tabText, activeTab === 'archived' && styles.tabTextActive]}>Archived</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );

  const renderThreadItem = ({ item }) => {
    const hasUnread = item.unread_count > 0;
    // Determine the other user based on current user's role
    const otherUser = user?.id === item.buyer?.id ? item.seller : item.buyer;
    const product = item.product || {};

    return (
      <TouchableOpacity
        style={styles.threadCard}
        onPress={() => navigation.navigate('Chat', { threadId: item.id })}
        activeOpacity={0.9}
      >
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={isSeller 
              ? [BRAND_COLORS.goldenYellow, '#FF8C00']
              : [BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]
            }
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {(otherUser?.first_name?.[0] || otherUser?.email?.[0] || 'U').toUpperCase()}
            </Text>
          </LinearGradient>
          {hasUnread && <View style={styles.onlineBadge} />}
        </View>

        {/* Message Content */}
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, hasUnread && styles.unreadText]}>
                {otherUser?.first_name || otherUser?.email || 'User'} {otherUser?.last_name || ''}
              </Text>
              {isSeller && (
                <View style={styles.customerBadge}>
                  <Text style={styles.customerBadgeText}>Customer</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>
              {formatTime(item.last_message_time)}
            </Text>
          </View>

          {product.name && (
            <View style={styles.productTag}>
              <Ionicons 
                name={isSeller ? "storefront" : "pricetag"} 
                size={12} 
                color={isSeller ? BRAND_COLORS.goldenYellow : BRAND_COLORS.vibrantBlue} 
              />
              <Text style={styles.productName} numberOfLines={1}>
                {isSeller ? `Your Product: ${product.name}` : product.name}
              </Text>
              {isSeller && product.price && (
                <Text style={styles.productPrice}>GH₵ {product.price}</Text>
              )}
            </View>
          )}

          <View style={styles.lastMessageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadText]}
              numberOfLines={2}
            >
              {item.last_message || (isSeller ? 'New customer inquiry' : 'No messages yet')}
            </Text>
            {isSeller && hasUnread && (
              <View style={styles.priorityIndicator}>
                <Ionicons name="alert-circle" size={14} color={BRAND_COLORS.goldenYellow} />
                <Text style={styles.priorityText}>Needs Response</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Thumbnail & Unread Badge */}
        <View style={styles.rightSection}>
          {product.images && product.images.length > 0 && (
            <View style={styles.productImageContainer}>
              <Image
                source={{ uri: product.images[0].image }}
                style={styles.productThumbnail}
                resizeMode="cover"
              />
              {isSeller && (
                <View style={styles.sellerBadge}>
                  <Ionicons name="checkmark" size={10} color={COLORS.white} />
                </View>
              )}
            </View>
          )}
          {hasUnread && (
            <View style={[styles.unreadBadge, isSeller && styles.sellerUnreadBadge]}>
              <Text style={styles.unreadCount}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            <Ionicons name="chatbubbles" size={24} color={BRAND_COLORS.goldenYellow} />
            <Text style={[styles.navText, styles.navTextActive]}>Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => isSeller ? navigation.navigate('Profile', { screen: 'AddProduct' }) : navigation.navigate('Cart')}
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
            <Ionicons name="person-outline" size={24} color="rgba(255,255,255,0.7)" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={isSeller 
          ? [BRAND_COLORS.goldenYellow, '#FFE5B4']
          : [BRAND_COLORS.lightBlue, COLORS.white]
        }
        style={styles.emptyIconContainer}
      >
        <Ionicons 
          name={isSeller ? "storefront-outline" : "chatbubbles-outline"} 
          size={64} 
          color={isSeller ? BRAND_COLORS.goldenYellow : BRAND_COLORS.vibrantBlue} 
        />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {isSeller ? 'No customer inquiries yet' : 'No messages yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isSeller 
          ? 'When customers are interested in your products, their messages will appear here'
          : 'Start a conversation with sellers by contacting them from product details'
        }
      </Text>
      
      {isSeller ? (
        <View style={styles.sellerEmptyActions}>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Profile', { screen: 'MyProducts' })}
          >
            <Text style={styles.browseButtonText}>View My Products</Text>
            <Ionicons name="cube-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addProductButton}
            onPress={() => navigation.navigate('Profile', { screen: 'AddProduct' })}
          >
            <Text style={styles.addProductButtonText}>Add New Product</Text>
            <Ionicons name="add-circle-outline" size={18} color={BRAND_COLORS.vibrantBlue} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Products</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
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

  const filteredThreads = threads.filter(thread => {
    if (activeTab === 'unread') return thread.unread_count > 0;
    if (activeTab === 'archived') return thread.archived;
    return true;
  });

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={filteredThreads}
        renderItem={renderThreadItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={filteredThreads.length === 0 ? styles.emptyList : styles.listContent}
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
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
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
  tabsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabActive: {
    backgroundColor: BRAND_COLORS.goldenYellow,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  tabTextActive: {
    color: BRAND_COLORS.navyBlue,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
    gap: SPACING.md,
  },
  emptyList: {
    flex: 1,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  customerBadge: {
    backgroundColor: BRAND_COLORS.lightBlue,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  customerBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  productName: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
    flex: 1,
  },
  productPrice: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.goldenYellow,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  lastMessageRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  priorityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(253, 185, 19, 0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityText: {
    fontSize: FONT_SIZES.xs,
    color: BRAND_COLORS.goldenYellow,
    fontWeight: '600',
  },
  lastMessage: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadText: {
    fontWeight: '600',
    color: COLORS.text,
  },
  rightSection: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  productImageContainer: {
    position: 'relative',
  },
  productThumbnail: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  sellerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: BRAND_COLORS.goldenYellow,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  unreadBadge: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerUnreadBadge: {
    backgroundColor: BRAND_COLORS.goldenYellow,
  },
  unreadCount: {
    fontSize: FONT_SIZES.xs,
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
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  sellerEmptyActions: {
    gap: SPACING.md,
    alignItems: 'center',
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: BRAND_COLORS.vibrantBlue,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.md,
  },
  browseButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: BRAND_COLORS.vibrantBlue,
    ...SHADOWS.sm,
  },
  addProductButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
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
});

export default MessagesScreen;
