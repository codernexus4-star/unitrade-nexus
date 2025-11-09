import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { showError, showSuccess } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { total } = route.params || { total: 0 };
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      showError('Error', 'Please enter a delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      showError('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        delivery_address: deliveryAddress,
        phone_number: phoneNumber,
        notes: notes,
        payment_method: paymentMethod,
      };

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        const orderId = result.data.id;
        const orderNumber = result.data.order_number || orderId;

        if (paymentMethod === 'paystack') {
          // Initialize payment for Paystack
          const paymentResult = await orderService.initializePayment(
            total,
            user?.email,
            orderId
          );

          if (paymentResult.success) {
            // Navigate to PaymentScreen with Paystack URL
            navigation.navigate('Payment', {
              paymentUrl: paymentResult.data.authorization_url,
              reference: paymentResult.data.reference,
              orderId,
              orderNumber,
              totalAmount: total,
            });
          } else {
            showError('Error', 'Failed to initialize payment');
          }
        } else {
          // Cash on delivery - go directly to confirmation
          navigation.replace('OrderConfirmation', {
            orderId,
            orderNumber,
            totalAmount: total,
          });
        }
      } else {
        showError('Error', result.error || 'Failed to place order');
      }
    } catch (error) {
      showError('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.headerTitle}>Checkout 🛍️</Text>
          <Text style={styles.headerSubtitle}>Complete your order</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderDeliverySection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={24} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Delivery Address *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your delivery address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0244123456"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Delivery Notes (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Any special instructions?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="card" size={24} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <Text style={styles.sectionTitle}>Payment Method</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'paystack' && styles.paymentOptionActive,
        ]}
        onPress={() => setPaymentMethod('paystack')}
        activeOpacity={0.7}
      >
        <View style={styles.paymentOptionContent}>
          <View style={[
            styles.paymentIconContainer,
            paymentMethod === 'paystack' && styles.paymentIconContainerActive
          ]}>
            <Ionicons
              name="card-outline"
              size={28}
              color={
                paymentMethod === 'paystack'
                  ? BRAND_COLORS.vibrantBlue
                  : COLORS.textSecondary
              }
            />
          </View>
          <View style={styles.paymentOptionText}>
            <Text
              style={[
                styles.paymentOptionTitle,
                paymentMethod === 'paystack' && styles.paymentOptionTitleActive,
              ]}
            >
              Paystack
            </Text>
            <Text style={styles.paymentOptionSubtitle}>
              Pay with card, mobile money, or bank transfer
            </Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          paymentMethod === 'paystack' && styles.radioButtonActive
        ]}>
          {paymentMethod === 'paystack' && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          paymentMethod === 'cash' && styles.paymentOptionActive,
        ]}
        onPress={() => setPaymentMethod('cash')}
        activeOpacity={0.7}
      >
        <View style={styles.paymentOptionContent}>
          <View style={[
            styles.paymentIconContainer,
            paymentMethod === 'cash' && styles.paymentIconContainerActive
          ]}>
            <Ionicons
              name="cash-outline"
              size={28}
              color={
                paymentMethod === 'cash'
                  ? BRAND_COLORS.vibrantBlue
                  : COLORS.textSecondary
              }
            />
          </View>
          <View style={styles.paymentOptionText}>
            <Text
              style={[
                styles.paymentOptionTitle,
                paymentMethod === 'cash' && styles.paymentOptionTitleActive,
              ]}
            >
              Cash on Delivery
            </Text>
            <Text style={styles.paymentOptionSubtitle}>
              Pay when you receive your order
            </Text>
          </View>
        </View>
        <View style={[
          styles.radioButton,
          paymentMethod === 'cash' && styles.radioButtonActive
        ]}>
          {paymentMethod === 'cash' && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>

      {/* Save Payment Method Checkbox */}
      {paymentMethod === 'paystack' && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setSavePaymentMethod(!savePaymentMethod)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            savePaymentMethod && styles.checkboxActive
          ]}>
            {savePaymentMethod && (
              <Ionicons name="checkmark" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>Save this payment method for future orders</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrderSummary = () => {
    const subtotal = total - 20;
    const deliveryFee = 20;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="receipt" size={24} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <Text style={styles.sectionTitle}>Order Summary</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>GH₵ {subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>GH₵ {deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>GH₵ {total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderDeliverySection()}
        {renderPaymentSection()}
        {renderOrderSummary()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeOrderButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: {
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
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  paymentOptionActive: {
    borderColor: BRAND_COLORS.vibrantBlue,
    backgroundColor: BRAND_COLORS.lightBlue,
    ...SHADOWS.sm,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  paymentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconContainerActive: {
    backgroundColor: COLORS.white,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentOptionTitleActive: {
    color: BRAND_COLORS.vibrantBlue,
  },
  paymentOptionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  checkboxActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
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
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  placeOrderButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  placeOrderButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default CheckoutScreen;
