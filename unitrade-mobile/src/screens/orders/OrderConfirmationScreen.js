import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightGreen: '#D1FAE5',
};

const OrderConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, orderNumber, totalAmount } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Success icon animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Slide up content
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleViewOrder = () => {
    navigation.navigate('Profile', {
      screen: 'OrderDetail',
      params: { orderId },
    });
  };

  const handleContinueShopping = () => {
    navigation.navigate('Home', { screen: 'HomeMain' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order Placed!</Text>
        </View>
      </LinearGradient>

      {/* Success Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIconGradient}
          >
            <Ionicons name="checkmark" size={64} color={COLORS.white} />
          </LinearGradient>
          
          {/* Animated rings */}
          <Animated.View
            style={[
              styles.successRing,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.successRing2,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1.4],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successMessage}>
            Your order has been placed successfully
          </Text>

          {/* Order Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number</Text>
              <Text style={styles.detailValue}>#{orderNumber || orderId}</Text>
            </View>
            {totalAmount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.detailValueAmount}>{formatPrice(totalAmount)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="information-circle" size={20} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.infoText}>
                You will receive a confirmation message shortly
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewOrder}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="receipt-outline" size={20} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>View Order Details</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContinueShopping}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={24} color={BRAND_COLORS.goldenYellow} />
              <Text style={styles.infoItemText}>Track your order status</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="chatbubble-outline" size={24} color={BRAND_COLORS.goldenYellow} />
              <Text style={styles.infoItemText}>Contact seller anytime</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={24} color={BRAND_COLORS.goldenYellow} />
              <Text style={styles.infoItemText}>Secure payment processed</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
  },
  // Success Icon Styles
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  successRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  successRing2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  // Message Styles
  messageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  // Details Card Styles
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailValueAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: BRAND_COLORS.goldenYellow,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightGreen,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  // Button Styles
  buttonsContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: BRAND_COLORS.vibrantBlue,
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  // Additional Info Styles
  additionalInfo: {
    width: '100%',
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  infoItemText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
});

export default OrderConfirmationScreen;
