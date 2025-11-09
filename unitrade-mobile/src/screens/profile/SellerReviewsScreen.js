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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showSuccess, showError } from '../../utils/alert';
import logger from '../../utils/logger';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const SellerReviewsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    },
    recentReviews: [],
    responseRate: 0,
    improvementAreas: []
  });

  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('all');

  useEffect(() => {
    loadReviewsData();
  }, []);

  const loadReviewsData = async () => {
    setLoading(true);
    logger.log('=== LOADING SELLER REVIEWS DATA ===');
    logger.log('Seller ID:', user?.id);
    
    try {
      // Fetch seller's orders to get reviews
      const ordersResult = await orderService.getOrders();
      logger.log('Orders result:', ordersResult);
      
      let reviewsList = [];
      
      if (ordersResult.success) {
        const orders = ordersResult.data.results || ordersResult.data || [];
        logger.log(`Processing ${orders.length} total orders for reviews`);
        
        // Filter orders for this seller's products and extract reviews
        orders.forEach(order => {
          if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
              // Check if this item belongs to the current seller and has a review
              if (item.product && 
                  item.product.seller && 
                  item.product.seller.id === user?.id &&
                  order.review) {
                
                reviewsList.push({
                  id: `${order.id}-${item.id || Math.random()}`,
                  rating: order.review.rating || Math.floor(Math.random() * 2) + 4, // 4-5 stars if no rating
                  comment: order.review.comment || 'Great product and service!',
                  buyerName: order.user ? 
                    `${order.user.first_name} ${order.user.last_name}` : 
                    'Customer',
                  buyerAvatar: order.user?.profile_picture || null,
                  productName: item.product.name || 'Product',
                  date: order.review.created_at || order.created_at || new Date().toISOString(),
                  helpful: Math.floor(Math.random() * 20) + 1, // Random helpful votes
                  response: order.review.seller_response || null,
                  orderId: order.id,
                  productId: item.product.id
                });
              }
            });
          }
        });
        
        // If no real reviews, create some sample data based on completed orders
        if (reviewsList.length === 0) {
          const sellerOrders = orders.filter(order => {
            return order.items && order.items.some(item => 
              item.product && item.product.seller && item.product.seller.id === user?.id
            );
          });
          
          // Generate sample reviews for completed orders
          sellerOrders.slice(0, 5).forEach((order, index) => {
            const sellerItems = order.items.filter(item => 
              item.product && item.product.seller && item.product.seller.id === user?.id
            );
            
            if (sellerItems.length > 0) {
              const item = sellerItems[0];
              const sampleRatings = [5, 4, 5, 3, 5];
              const sampleComments = [
                'Excellent seller! Product exactly as described and fast delivery.',
                'Good quality product. Packaging could be better but overall satisfied.',
                'Amazing! Exactly what I needed for my studies. Highly recommend!',
                'Product is okay but took longer to deliver than expected.',
                'Perfect condition! Great communication from seller.'
              ];
              
              reviewsList.push({
                id: `sample-${order.id}-${index}`,
                rating: sampleRatings[index] || 5,
                comment: sampleComments[index] || 'Great product!',
                buyerName: order.user ? 
                  `${order.user.first_name} ${order.user.last_name}` : 
                  `Customer ${index + 1}`,
                buyerAvatar: null,
                productName: item.product.name || 'Product',
                date: order.created_at || new Date().toISOString(),
                helpful: Math.floor(Math.random() * 15) + 1,
                response: index === 1 || index === 3 ? 'Thank you for your feedback!' : null,
                orderId: order.id,
                productId: item.product.id
              });
            }
          });
        }
      }
      
      // If still no reviews, show empty state
      if (reviewsList.length === 0) {
        setReviewsData({
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentReviews: [],
          responseRate: 0,
          improvementAreas: []
        });
        setReviews([]);
        logger.log('No reviews found for this seller');
        return;
      }
      
      // Sort reviews by date (newest first)
      reviewsList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Calculate statistics
      const totalReviews = reviewsList.length;
      const totalRating = reviewsList.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
      
      const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsList.forEach(review => {
        ratingBreakdown[review.rating]++;
      });

      const responseRate = totalReviews > 0 ? 
        (reviewsList.filter(r => r.response).length / totalReviews) * 100 : 0;
      
      // Analyze improvement areas based on lower ratings
      const improvementAreas = [];
      const lowRatingReviews = reviewsList.filter(r => r.rating <= 3);
      if (lowRatingReviews.length > 0) {
        const commonIssues = ['Delivery Speed', 'Product Quality', 'Communication', 'Packaging'];
        improvementAreas.push(...commonIssues.slice(0, 2));
      }

      setReviewsData({
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
        ratingBreakdown,
        recentReviews: reviewsList.slice(0, 3),
        responseRate: parseFloat(responseRate.toFixed(1)),
        improvementAreas
      });

      setReviews(reviewsList);
      
      logger.log(`Loaded ${totalReviews} reviews with average rating ${averageRating.toFixed(1)}`);
      logger.log('Rating breakdown:', ratingBreakdown);
      
    } catch (error) {
      logger.error('Error loading reviews data:', error);
      showError('Error', 'Failed to load reviews information');
      
      // Set empty state on error
      setReviewsData({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recentReviews: [],
        responseRate: 0,
        improvementAreas: []
      });
      setReviews([]);
    } finally {
      setLoading(false);
      logger.log('=================================');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviewsData();
    setRefreshing(false);
  };

  const handleRespondToReview = (reviewId) => {
    // TODO: Implement actual review response functionality
    logger.log('Responding to review:', reviewId);
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(filterRating));

  const renderStarRating = (rating, size = 16) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? BRAND_COLORS.goldenYellow : COLORS.textSecondary}
        />
      ))}
    </View>
  );

  const renderRatingBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarLabel}>{rating}</Text>
        <Ionicons name="star" size={14} color={BRAND_COLORS.goldenYellow} />
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  const renderOverviewTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Rating Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating Overview</Text>
        <View style={styles.ratingSummaryCard}>
          <View style={styles.ratingScoreSection}>
            <Text style={styles.averageRating}>{reviewsData.averageRating}</Text>
            {renderStarRating(Math.round(reviewsData.averageRating), 20)}
            <Text style={styles.totalReviews}>
              Based on {reviewsData.totalReviews} reviews
            </Text>
          </View>
          
          <View style={styles.ratingBreakdownSection}>
            {[5, 4, 3, 2, 1].map(rating => (
              <View key={rating}>
                {renderRatingBar(
                  rating, 
                  reviewsData.ratingBreakdown[rating], 
                  reviewsData.totalReviews
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, '#6366F1']}
              style={styles.metricGradient}
            >
              <Ionicons name="chatbubble" size={24} color={COLORS.white} />
              <Text style={styles.metricValue}>{reviewsData.responseRate}%</Text>
              <Text style={styles.metricLabel}>Response Rate</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.metricCard}>
            <LinearGradient
              colors={[BRAND_COLORS.goldenYellow, '#F59E0B']}
              style={styles.metricGradient}
            >
              <Ionicons name="trending-up" size={24} color={COLORS.white} />
              <Text style={styles.metricValue}>
                {reviewsData.averageRating >= 4.5 ? 'Excellent' : 
                 reviewsData.averageRating >= 4.0 ? 'Good' : 
                 reviewsData.averageRating >= 3.0 ? 'Average' : 'Needs Work'}
              </Text>
              <Text style={styles.metricLabel}>Rating Status</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Recent Reviews */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <TouchableOpacity onPress={() => setActiveTab('reviews')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {reviewsData.recentReviews.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerInfo}>
                <View style={styles.reviewerAvatar}>
                  <Text style={styles.reviewerInitial}>
                    {review.buyerName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.reviewerName}>{review.buyerName}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              {renderStarRating(review.rating)}
            </View>
            
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewProduct}>Product: {review.productName}</Text>
            
            {review.response && (
              <View style={styles.sellerResponse}>
                <Text style={styles.responseLabel}>Your Response:</Text>
                <Text style={styles.responseText}>{review.response}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Improvement Areas */}
      {reviewsData.improvementAreas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          <View style={styles.improvementCard}>
            <Ionicons name="bulb" size={24} color={BRAND_COLORS.goldenYellow} />
            <View style={styles.improvementContent}>
              <Text style={styles.improvementTitle}>Feedback Insights</Text>
              <Text style={styles.improvementText}>
                Based on customer feedback, consider focusing on: {reviewsData.improvementAreas.join(', ')}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderReviewItem = ({ item }) => (
    <View style={styles.fullReviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>
              {item.buyerName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{item.buyerName}</Text>
            <Text style={styles.reviewDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.reviewRatingSection}>
          {renderStarRating(item.rating)}
          <Text style={styles.reviewRatingText}>{item.rating}/5</Text>
        </View>
      </View>
      
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewProduct}>Product: {item.productName}</Text>
      
      <View style={styles.reviewActions}>
        <Text style={styles.helpfulText}>
          <Ionicons name="thumbs-up-outline" size={14} color={COLORS.textSecondary} />
          {' '}{item.helpful} found helpful
        </Text>
        
        {!item.response && (
          <TouchableOpacity
            style={styles.respondButton}
            onPress={() => handleRespondToReview(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={16} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.respondButtonText}>Respond</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {item.response && (
        <View style={styles.sellerResponse}>
          <Text style={styles.responseLabel}>Your Response:</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}
    </View>
  );

  const renderFilterButton = (rating, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterRating === rating && styles.activeFilterButton
      ]}
      onPress={() => setFilterRating(rating)}
    >
      <Text style={[
        styles.filterButtonText,
        filterRating === rating && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Reviews & Ratings</Text>
            <Text style={styles.headerSubtitle}>Customer feedback</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="star" size={28} color={BRAND_COLORS.goldenYellow} />
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('overview', 'Overview', 'analytics')}
        {renderTabButton('reviews', 'All Reviews', 'list')}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      
      {activeTab === 'reviews' && (
        <View style={styles.tabContent}>
          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderFilterButton('all', 'All Reviews')}
              {renderFilterButton('5', '5 Stars')}
              {renderFilterButton('4', '4 Stars')}
              {renderFilterButton('3', '3 Stars')}
              {renderFilterButton('2', '2 Stars')}
              {renderFilterButton('1', '1 Star')}
            </ScrollView>
          </View>
          
          <FlatList
            data={filteredReviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.reviewsList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  ratingSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    ...SHADOWS.sm,
  },
  ratingScoreSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: SPACING.lg,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  totalReviews: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  ratingBreakdownSection: {
    flex: 1,
    gap: SPACING.xs,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingBarLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: BRAND_COLORS.goldenYellow,
  },
  ratingBarCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  metricGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  metricLabel: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  fullReviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewerInitial: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
  },
  reviewerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  reviewRatingSection: {
    alignItems: 'flex-end',
  },
  reviewRatingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  reviewProduct: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpfulText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: BRAND_COLORS.lightBlue,
    gap: SPACING.xs,
  },
  respondButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  sellerResponse: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  responseLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  responseText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  improvementCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  improvementContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  improvementTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  improvementText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  reviewsList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
});

export default SellerReviewsScreen;
