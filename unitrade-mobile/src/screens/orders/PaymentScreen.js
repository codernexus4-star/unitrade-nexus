import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { orderService } from '../../services/orderService';
import { useNavigation, useRoute } from '@react-navigation/native';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
};

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentUrl, orderId, orderNumber, totalAmount, reference } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const webViewRef = useRef(null);

  const handleNavigationStateChange = async (navState) => {
    const { url } = navState;
    
    // Check if payment was successful (Paystack redirects to callback URL)
    if (url.includes('/payment/callback') || url.includes('success') || url.includes('trxref')) {
      setVerifying(true);
      
      // Extract reference from URL if available
      let paymentReference = reference;
      if (url.includes('trxref=')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        paymentReference = urlParams.get('trxref') || urlParams.get('reference') || reference;
      }

      // Verify payment with backend
      const result = await orderService.verifyPayment(paymentReference);
      
      setVerifying(false);

      if (result.success) {
        // Payment successful
        navigation.replace('OrderConfirmation', {
          orderId,
          orderNumber,
          totalAmount,
        });
      } else {
        // Payment verification failed
        Alert.alert(
          'Payment Verification Failed',
          'We could not verify your payment. Please contact support.',
          [
            {
              text: 'Try Again',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('Profile', { screen: 'OrderHistory' }),
            },
          ]
        );
      }
    }

    // Check if payment was cancelled
    if (url.includes('cancel') || url.includes('cancelled')) {
      Alert.alert(
        'Payment Cancelled',
        'Your payment was cancelled. Would you like to try again?',
        [
          {
            text: 'Try Again',
            onPress: () => webViewRef.current?.reload(),
          },
          {
            text: 'Go Back',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleWebViewError = () => {
    setLoading(false);
    Alert.alert(
      'Connection Error',
      'Failed to load payment page. Please check your internet connection.',
      [
        {
          text: 'Retry',
          onPress: () => {
            setLoading(true);
            webViewRef.current?.reload();
          },
        },
        {
          text: 'Cancel',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ]
    );
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        {
          text: 'No, Continue',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
      ]
    );
  };

  if (!paymentUrl) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Payment URL Not Found</Text>
        <Text style={styles.errorMessage}>
          Unable to initialize payment. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="lock-closed" size={20} color={COLORS.white} />
          <Text style={styles.headerTitle}>Secure Payment</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Payment Info */}
      <View style={styles.paymentInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="card" size={20} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.infoText}>Powered by Paystack</Text>
        </View>
        {totalAmount && (
          <Text style={styles.amountText}>
            ₦{parseFloat(totalAmount).toLocaleString('en-NG', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        )}
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
        
        {verifying && (
          <View style={styles.verifyingOverlay}>
            <View style={styles.verifyingCard}>
              <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
              <Text style={styles.verifyingText}>Verifying payment...</Text>
              <Text style={styles.verifyingSubtext}>Please wait</Text>
            </View>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleWebViewError}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={styles.webView}
        />
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
        <Text style={styles.securityText}>
          Your payment is secured with 256-bit SSL encryption
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 44,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#F0F9FF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  amountText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: BRAND_COLORS.goldenYellow,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  verifyingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  verifyingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  verifyingSubtext: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  securityText: {
    fontSize: FONT_SIZES.xs,
    color: '#059669',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  errorButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderRadius: BORDER_RADIUS.md,
  },
  errorButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default PaymentScreen;
