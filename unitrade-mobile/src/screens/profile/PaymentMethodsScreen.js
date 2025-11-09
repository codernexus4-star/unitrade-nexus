import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { showInfo, showError, showConfirm } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const result = await userService.getPaymentMethods();
      if (result.success) {
        setPaymentMethods(result.data || []);
      } else {
        // If endpoint doesn't exist (404), just show empty state
        console.log('Payment methods endpoint not available');
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Load payment methods error:', error);
      // Don't show error, just show empty state
      setPaymentMethods([]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentMethods();
    setRefreshing(false);
  };

  const handleDeletePaymentMethod = async (id) => {
    showConfirm(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      async () => {
        const result = await userService.deletePaymentMethod(id);
        if (result.success) {
          setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
          showInfo('Success', 'Payment method deleted');
        } else {
          showError('Error', result.error || 'Failed to delete payment method');
        }
      }
    );
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
          <Text style={styles.greeting}>Payment Methods 💳</Text>
          <Text style={styles.headerSubtitle}>Manage your payment options</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const getPaymentIcon = (type) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'mobile':
        return 'phone-portrait-outline';
      default:
        return 'wallet-outline';
    }
  };

  const renderPaymentMethod = (method) => (
    <View key={method.id} style={styles.paymentCard}>
      <View style={styles.paymentIconContainer}>
        <Ionicons name={getPaymentIcon(method.type)} size={24} color={BRAND_COLORS.vibrantBlue} />
      </View>
      <View style={styles.paymentInfo}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentName}>{method.name}</Text>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.paymentDetails}>
          {method.type === 'card' 
            ? `•••• ${method.last4} • Exp ${method.expiry}`
            : method.number}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => handleDeletePaymentMethod(method.id)}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[BRAND_COLORS.vibrantBlue]}
            />
          }
        >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Secure Payments</Text>
            <Text style={styles.infoText}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>

        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        {/* Add Payment Method Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPaymentMethod')}
        >
          <LinearGradient
            colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Supported Methods */}
        <View style={styles.supportedSection}>
          <Text style={styles.supportedTitle}>Supported Payment Methods</Text>
          <View style={styles.supportedGrid}>
            <View style={styles.supportedItem}>
              <Ionicons name="card" size={32} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.supportedText}>Cards</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="phone-portrait" size={32} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.supportedText}>Mobile Money</Text>
            </View>
            <View style={styles.supportedItem}>
              <Ionicons name="cash" size={32} color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.supportedText}>Cash</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  paymentName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  defaultBadge: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  paymentDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  supportedSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  supportedTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  supportedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  supportedItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  supportedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default PaymentMethodsScreen;
