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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightGray: '#F8F8F8',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('buyer');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'Invalid credentials');
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
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>
              Login to continue to UniTrade
            </Text>
          </LinearGradient>
        </View>

        {/* Login Form */}
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
          {/* Email */}
          <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={BRAND_COLORS.vibrantBlue}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              cursorColor="#000000"
            />
          </View>

          {/* Password */}
          <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={BRAND_COLORS.vibrantBlue}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              cursorColor="#000000"
            />
          </View>

          {/* User Type Buttons */}
          <View style={styles.userTypeContainer}>
            {['buyer', 'seller'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.userTypeButton,
                  userType === type && styles.userTypeButtonActive,
                ]}
                onPress={() => setUserType(type)}
              >
                <Ionicons
                  name={type === 'buyer' ? 'person' : 'storefront'}
                  size={18}
                  color={userType === type ? '#fff' : BRAND_COLORS.vibrantBlue}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === type && styles.userTypeTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Remember Me */}
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
            <LinearGradient
              colors={[BRAND_COLORS.goldenYellow, '#FFC533']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* Signup */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: 10 }}
          >
            <Text style={styles.signUpText}>
              Don’t have an account?{' '}
              <Text style={styles.signUpLink}>Sign up</Text>
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
  curvedBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    backgroundColor: BRAND_COLORS.navyBlue,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 140,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  inputFocused: {
    backgroundColor: '#EDF2FF',
    borderWidth: 1,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 10 },
  userTypeContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND_COLORS.vibrantBlue,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  userTypeButtonActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  userTypeText: {
    marginLeft: 5,
    color: BRAND_COLORS.vibrantBlue,
    fontWeight: '600',
  },
  userTypeTextActive: { color: '#fff' },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: BRAND_COLORS.vibrantBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: BRAND_COLORS.vibrantBlue },
  rememberMeText: { fontSize: 14, color: '#333' },
  loginButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPasswordText: {
    color: BRAND_COLORS.vibrantBlue,
    textAlign: 'center',
    fontWeight: '500',
  },
  signUpText: { textAlign: 'center', color: '#666' },
  signUpLink: { color: BRAND_COLORS.vibrantBlue, fontWeight: '600' },
});

export default LoginScreen;
