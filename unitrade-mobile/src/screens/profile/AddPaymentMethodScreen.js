import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { showSuccess, showError } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const [paymentType, setPaymentType] = useState('card'); // 'card' or 'mobile'
  const [loading, setLoading] = useState(false);

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Mobile Money details
  const [mobileProvider, setMobileProvider] = useState('mtn'); // 'mtn', 'vodafone', 'airteltigo'
  const [mobileNumber, setMobileNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [setAsDefault, setSetAsDefault] = useState(false);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const formatMobileNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.substring(0, 10);
  };

  const validateCardDetails = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      showError('Invalid Card', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardName.trim()) {
      showError('Invalid Name', 'Please enter the cardholder name');
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      showError('Invalid Expiry', 'Please enter expiry date (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length < 3) {
      showError('Invalid CVV', 'Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const validateMobileMoneyDetails = () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      showError('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!accountName.trim()) {
      showError('Invalid Name', 'Please enter the account holder name');
      return false;
    }
    return true;
  };

  const handleAddPaymentMethod = async () => {
    if (paymentType === 'card') {
      if (!validateCardDetails()) return;
    } else {
      if (!validateMobileMoneyDetails()) return;
    }

    setLoading(true);

    // Prepare payment data
    const paymentData = {
      payment_type: paymentType,
      is_default: setAsDefault,
    };

    if (paymentType === 'card') {
      paymentData.card_number = cardNumber.replace(/\s/g, '');
      paymentData.card_holder_name = cardName;
      paymentData.expiry_date = expiryDate;
      paymentData.cvv = cvv;
    } else {
      paymentData.provider = mobileProvider;
      paymentData.mobile_number = mobileNumber;
      paymentData.account_name = accountName;
    }

    const result = await userService.addPaymentMethod(paymentData);
    
    if (result.success) {
      showSuccess(
        'Payment Method Added',
        `${paymentType === 'card' ? 'Card' : 'Mobile Money'} added successfully`,
        () => navigation.goBack()
      );
    } else {
      showError('Error', result.error || 'Failed to add payment method');
    }
    
    setLoading(false);
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
          <Text style={styles.greeting}>Add Payment Method 💳</Text>
          <Text style={styles.headerSubtitle}>Choose your payment type</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderPaymentTypeSelector = () => (
    <View style={styles.typeSelector}>
      <TouchableOpacity
        style={[styles.typeCard, paymentType === 'card' && styles.typeCardActive]}
        onPress={() => setPaymentType('card')}
        activeOpacity={0.7}
      >
        <View style={[styles.typeIconContainer, paymentType === 'card' && styles.typeIconActive]}>
          <Ionicons 
            name="card" 
            size={32} 
            color={paymentType === 'card' ? COLORS.white : BRAND_COLORS.vibrantBlue} 
          />
        </View>
        <Text style={[styles.typeTitle, paymentType === 'card' && styles.typeTitleActive]}>
          Card
        </Text>
        <Text style={styles.typeSubtitle}>Credit/Debit Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.typeCard, paymentType === 'mobile' && styles.typeCardActive]}
        onPress={() => setPaymentType('mobile')}
        activeOpacity={0.7}
      >
        <View style={[styles.typeIconContainer, paymentType === 'mobile' && styles.typeIconActive]}>
          <Ionicons 
            name="phone-portrait" 
            size={32} 
            color={paymentType === 'mobile' ? COLORS.white : BRAND_COLORS.vibrantBlue} 
          />
        </View>
        <Text style={[styles.typeTitle, paymentType === 'mobile' && styles.typeTitleActive]}>
          Mobile Money
        </Text>
        <Text style={styles.typeSubtitle}>MTN, Vodafone, AirtelTigo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCardForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Card Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Card Number *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Cardholder Name *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Expiry Date *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>CVV *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="123"
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, '').substring(0, 4))}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderMobileMoneyForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Mobile Money Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Provider *</Text>
        <View style={styles.providerSelector}>
          <TouchableOpacity
            style={[styles.providerChip, mobileProvider === 'mtn' && styles.providerChipActive]}
            onPress={() => setMobileProvider('mtn')}
          >
            <Text style={[styles.providerText, mobileProvider === 'mtn' && styles.providerTextActive]}>
              MTN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerChip, mobileProvider === 'vodafone' && styles.providerChipActive]}
            onPress={() => setMobileProvider('vodafone')}
          >
            <Text style={[styles.providerText, mobileProvider === 'vodafone' && styles.providerTextActive]}>
              Vodafone
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerChip, mobileProvider === 'airteltigo' && styles.providerChipActive]}
            onPress={() => setMobileProvider('airteltigo')}
          >
            <Text style={[styles.providerText, mobileProvider === 'airteltigo' && styles.providerTextActive]}>
              AirtelTigo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Mobile Number *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.prefix}>+233</Text>
          <TextInput
            style={styles.input}
            placeholder="244123456"
            value={mobileNumber}
            onChangeText={(text) => setMobileNumber(formatMobileNumber(text))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Account Holder Name *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={accountName}
            onChangeText={setAccountName}
            autoCapitalize="words"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPaymentTypeSelector()}

        {paymentType === 'card' ? renderCardForm() : renderMobileMoneyForm()}

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => setSetAsDefault(!setAsDefault)}
          activeOpacity={0.7}
        >
          <View style={styles.defaultToggleLeft}>
            <Ionicons 
              name={setAsDefault ? 'checkbox' : 'square-outline'} 
              size={24} 
              color={setAsDefault ? BRAND_COLORS.vibrantBlue : COLORS.textSecondary} 
            />
            <Text style={styles.defaultToggleText}>Set as default payment method</Text>
          </View>
        </TouchableOpacity>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={20} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddPaymentMethod}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
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
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  typeCardActive: {
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeIconActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  typeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  typeTitleActive: {
    color: BRAND_COLORS.vibrantBlue,
  },
  typeSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  prefix: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  providerSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  providerChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  providerChipActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  providerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  providerTextActive: {
    color: COLORS.white,
  },
  defaultToggle: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  defaultToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  defaultToggleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  securityText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default AddPaymentMethodScreen;
