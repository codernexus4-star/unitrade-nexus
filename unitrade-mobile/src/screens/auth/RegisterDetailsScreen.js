import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/authService';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const RegisterDetailsScreen = ({ route, navigation }) => {
  const { email, verified } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer' or 'seller'
  const [sellerType, setSellerType] = useState('student'); // 'student' or 'professional'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    calculatePasswordStrength(password);
  }, [password]);

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 25;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return BRAND_COLORS.error;
    if (passwordStrength < 70) return BRAND_COLORS.warning;
    return BRAND_COLORS.success;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const handleNext = () => {
    // Validation
    if (!firstName || !lastName || !password || !confirmPassword || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    // Navigate to university/campus selection
    navigation.navigate('UniversityCampus', {
      email,
      firstName,
      lastName,
      password,
      phoneNumber,
      role,
      sellerType: role === 'seller' ? sellerType : null,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              style={[styles.logo, { transform: [{ scale: fadeAnim }] }]}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Almost There!</Text>
            <Text style={styles.headerSubtitle}>
              Complete your profile
            </Text>
          </LinearGradient>
        </View>

        {/* Form Card */}
        <Animated.View 
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
            {/* Header Section */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={32} color={BRAND_COLORS.goldenYellow} />
              </View>
              <Text style={styles.title}>Basic Information</Text>
              <Text style={styles.subtitle}>Let's get to know you better</Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressSection}>
              <View style={styles.progressDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.progressText}>Step 1 of 3</Text>
            </View>

            {/* Name Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'firstName' && styles.inputWrapperFocused
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={focusedInput === 'firstName' ? BRAND_COLORS.goldenYellow : 'rgba(255,255,255,0.6)'}
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocusedInput('firstName')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    cursorColor="#000000"
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'lastName' && styles.inputWrapperFocused
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={focusedInput === 'lastName' ? BRAND_COLORS.goldenYellow : 'rgba(255,255,255,0.6)'}
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setFocusedInput('lastName')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    cursorColor="#000000"
                  />
                </View>
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'phone' && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="call-outline" 
                  size={20} 
                  color={focusedInput === 'phone' ? BRAND_COLORS.goldenYellow : 'rgba(255,255,255,0.6)'}
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="+233 XX XXX XXXX"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  cursorColor="#000000"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={focusedInput === 'password' ? BRAND_COLORS.goldenYellow : 'rgba(255,255,255,0.6)'}
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  cursorColor="#000000"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="rgba(255,255,255,0.6)" 
                  />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={styles.strengthBarBackground}>
                    <View 
                      style={[
                        styles.strengthBar,
                        { width: `${passwordStrength}%`, backgroundColor: getPasswordStrengthColor() }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                    {getPasswordStrengthText()}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'confirmPassword' && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={focusedInput === 'confirmPassword' ? BRAND_COLORS.goldenYellow : 'rgba(255,255,255,0.6)'}
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  cursorColor="#000000"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="rgba(255,255,255,0.6)" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>I want to</Text>
              <View style={styles.roleContainerCompact}>
                <TouchableOpacity
                  style={[
                    styles.roleCardCompact,
                    role === 'buyer' && styles.roleCardActive,
                  ]}
                  onPress={() => setRole('buyer')}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="cart"
                    size={24}
                    color={role === 'buyer' ? BRAND_COLORS.goldenYellow : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.roleTitleCompact,
                    role === 'buyer' && styles.roleTitleActive
                  ]}>
                    Buyer
                  </Text>
                  {role === 'buyer' && (
                    <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.goldenYellow} style={styles.checkmarkCompact} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCardCompact,
                    role === 'seller' && styles.roleCardActive,
                  ]}
                  onPress={() => setRole('seller')}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="storefront"
                    size={24}
                    color={role === 'seller' ? BRAND_COLORS.goldenYellow : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.roleTitleCompact,
                    role === 'seller' && styles.roleTitleActive
                  ]}>
                    Seller
                  </Text>
                  {role === 'seller' && (
                    <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.goldenYellow} style={styles.checkmarkCompact} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Seller Type Selection - Only show if seller is selected */}
            {role === 'seller' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Seller Type</Text>
                <View style={styles.roleContainerCompact}>
                  <TouchableOpacity
                    style={[
                      styles.roleCardCompact,
                      sellerType === 'student' && styles.roleCardActive,
                    ]}
                    onPress={() => setSellerType('student')}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="school"
                      size={24}
                      color={sellerType === 'student' ? BRAND_COLORS.goldenYellow : COLORS.textSecondary}
                    />
                    <Text style={[
                      styles.roleTitleCompact,
                      sellerType === 'student' && styles.roleTitleActive
                    ]}>
                      Student
                    </Text>
                    {sellerType === 'student' && (
                      <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.goldenYellow} style={styles.checkmarkCompact} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleCardCompact,
                      sellerType === 'professional' && styles.roleCardActive,
                    ]}
                    onPress={() => setSellerType('professional')}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="briefcase"
                      size={24}
                      color={sellerType === 'professional' ? BRAND_COLORS.goldenYellow : COLORS.textSecondary}
                    />
                    <Text style={[
                      styles.roleTitleCompact,
                      sellerType === 'professional' && styles.roleTitleActive
                    ]}>
                      Professional
                    </Text>
                    {sellerType === 'professional' && (
                      <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.goldenYellow} style={styles.checkmarkCompact} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Next Button */}
            <TouchableOpacity
              style={[styles.nextButton, isLoading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BRAND_COLORS.goldenYellow, '#FFBB00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color={BRAND_COLORS.navyBlue} />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={BRAND_COLORS.navyBlue} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

          <View style={{ height: 20 }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContent: { 
    flexGrow: 1 
  },
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
  logo: { 
    width: 100, 
    height: 100, 
    marginBottom: 10 
  },
  headerTitle: {
    fontSize: 28,
    color: BRAND_COLORS.goldenYellow,
    fontWeight: 'bold',
  },
  headerSubtitle: { 
    color: '#f5f5f5', 
    fontSize: 14 
  },
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
  cardHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: BRAND_COLORS.navyBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    width: 24,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderColor: BRAND_COLORS.goldenYellow,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleContainerCompact: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  roleCardCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    minHeight: 48,
  },
  roleCardActive: {
    backgroundColor: BRAND_COLORS.lightBlue,
    borderColor: BRAND_COLORS.goldenYellow,
  },
  roleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 51, 102, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  roleIconCircleActive: {
    backgroundColor: COLORS.white,
  },
  roleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roleTitleCompact: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  roleTitleActive: {
    color: BRAND_COLORS.navyBlue,
  },
  roleDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  checkmarkCompact: {
    marginLeft: 'auto',
  },
  nextButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: BRAND_COLORS.goldenYellow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  nextButtonText: {
    color: BRAND_COLORS.navyBlue,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default RegisterDetailsScreen;
