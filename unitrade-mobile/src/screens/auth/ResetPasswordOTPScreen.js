import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const BRAND_COLORS = {
  vibrantBlue: '#4169E1',
  lightBlue: '#E3F2FD',
};

const ResetPasswordOTPScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    const result = await authService.verifyPasswordResetOTP(email, otp);
    setIsLoading(false);

    if (result.success) {
      // Navigate to new password screen
      navigation.navigate('ResetPassword', { email, otp });
    } else {
      Alert.alert('Error', result.message || 'Invalid verification code');
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    const result = await authService.sendPasswordResetOTP(email);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Verification code sent!');
    } else {
      Alert.alert('Error', result.message || 'Failed to resend code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Content - Centered Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={60} color={COLORS.white} />
          </View>

          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}{email}
          </Text>

          {/* OTP Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={BRAND_COLORS.vibrantBlue} />
            ) : (
              <Text style={styles.buttonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend Link */}
          <TouchableOpacity 
            onPress={handleResendOTP} 
            disabled={isLoading}
            style={styles.resendContainer}
          >
            <Text style={styles.resendText}>
              Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  backText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
    borderRadius: 20,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.xxl,
    textAlign: 'center',
    letterSpacing: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: BRAND_COLORS.vibrantBlue,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  resendContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  resendLink: {
    color: COLORS.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ResetPasswordOTPScreen;
