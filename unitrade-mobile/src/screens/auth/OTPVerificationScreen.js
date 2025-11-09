import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/authService';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightGray: '#F8F8F8',
};

const OTPVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    const result = await authService.verifyOTP(email, otp);
    setIsLoading(false);

    if (result.success) {
      // Navigate to basic info registration
      navigation.navigate('RegisterDetails', { email, verified: true });
    } else {
      Alert.alert('Error', result.message || 'Invalid verification code');
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    const result = await authService.sendOTP(email);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Verification code sent!');
    } else {
      Alert.alert('Error', result.message || 'Failed to resend code');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Curved Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerBlob} />
            <View style={styles.headerRing} />
            <Animated.Image
              source={require('../../../assets/logo.png')}
              style={[styles.logo, { transform: [{ scale: logoAnim }] }]}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Verify Email</Text>
            <Text style={styles.headerSubtitle}>
              Check your inbox
            </Text>
          </LinearGradient>
        </View>

        {/* Verification Form */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={48} color={BRAND_COLORS.vibrantBlue} />
          </View>
          
          <Text style={styles.formTitle}>Enter Verification Code</Text>
          <Text style={styles.formSubtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* OTP Input */}
          <View style={[styles.inputContainer, otpFocused && styles.inputFocused]}>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#888"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              onFocus={() => setOtpFocused(true)}
              onBlur={() => setOtpFocused(false)}
              cursorColor="#000000"
              editable={!isLoading}
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity onPress={handleVerifyOTP} disabled={isLoading}>
            <LinearGradient
              colors={[BRAND_COLORS.goldenYellow, '#FFC533']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.verifyButton, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Link */}
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={isLoading}
            style={styles.resendContainer}
          >
            <Text style={styles.resendText}>
              Didn't receive code?{' '}
              <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  headerContainer: {
    backgroundColor: BRAND_COLORS.navyBlue,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 140,
    overflow: 'hidden',
  },
  gradientHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 140,
    position: 'relative',
  },
  headerBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    backgroundColor: 'rgba(253, 185, 19, 0.15)',
    borderRadius: 110,
    top: -60,
    right: -60,
    pointerEvents: 'none',
  },
  headerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    bottom: -30,
    left: 20,
    pointerEvents: 'none',
  },
  logo: { width: 100, height: 100, marginBottom: 10 },
  headerTitle: {
    fontSize: 28,
    color: BRAND_COLORS.goldenYellow,
    fontWeight: 'bold',
  },
  headerSubtitle: { color: '#f5f5f5', fontSize: 14 },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    marginTop: -35,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLORS.navyBlue,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputFocused: {
    backgroundColor: '#EDF2FF',
    borderWidth: 1,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  input: {
    padding: 16,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 12,
    fontWeight: '600',
    color: '#333',
  },
  verifyButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;
