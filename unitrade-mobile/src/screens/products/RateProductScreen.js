import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { productService } from '../../services/productService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showError, showSuccess } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
};

const RateProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId, orderId, productName, productImage } = route.params || {};

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      showError('Rating Required', 'Please select a star rating');
      return;
    }

    if (!review.trim()) {
      showError('Review Required', 'Please write a review');
      return;
    }

    setLoading(true);

    try {
      const result = await productService.rateProduct(productId, {
        rating,
        review: review.trim(),
        order_id: orderId,
      });

      if (result.success) {
        showSuccess(
          'Thank You!',
          'Your review has been submitted successfully',
          () => navigation.goBack()
        );
      } else {
        showError('Error', result.error || 'Failed to submit review');
      }
    } catch (error) {
      showError('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={48}
              color={star <= rating ? BRAND_COLORS.goldenYellow : COLORS.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Product</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info */}
        {(productName || productImage) && (
          <View style={styles.productCard}>
            {productImage && (
              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            {productName && (
              <Text style={styles.productName} numberOfLines={2}>
                {productName}
              </Text>
            )}
          </View>
        )}

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How would you rate this product?</Text>
          {renderStars()}
          <Text style={styles.ratingLabel}>{getRatingLabel()}</Text>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Write your review</Text>
          <Text style={styles.sectionSubtitle}>
            Share your experience with other buyers
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us what you think about this product..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={review}
              onChangeText={setReview}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{review.length}/500</Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color={BRAND_COLORS.goldenYellow} />
            <Text style={styles.tipTitle}>Tips for a great review:</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Be specific about what you liked or disliked</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Mention product quality and seller service</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.tipText}>Keep it honest and helpful for others</Text>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmitRating}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <LinearGradient
              colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  closeButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  // Product Card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  productName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  // Rating Section
  ratingSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: BRAND_COLORS.goldenYellow,
    marginTop: SPACING.sm,
  },
  // Review Section
  reviewSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    position: 'relative',
  },
  reviewInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  characterCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  // Tips Section
  tipsSection: {
    backgroundColor: '#FFF9E6',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FFE4A3',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tipTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Footer
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default RateProductScreen;
