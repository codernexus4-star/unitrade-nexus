import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const PrivacySecurityScreen = () => {
  const navigation = useNavigation();
  
  // Privacy Settings State
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  
  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to load from backend first
      const result = await userService.getPrivacySettings();
      if (result.success && result.data) {
        const data = result.data;
        setProfileVisibility(data.profile_visibility ?? true);
        setShowEmail(data.show_email ?? false);
        setShowPhone(data.show_phone ?? false);
        setAllowMessages(data.allow_messages ?? true);
        setTwoFactorAuth(data.two_factor_auth ?? false);
        setLoginAlerts(data.login_alerts ?? true);
        setBiometricAuth(data.biometric_auth ?? false);
      } else {
        // Fallback to local storage
        const settings = await AsyncStorage.getItem('privacySecuritySettings');
        if (settings) {
          const parsed = JSON.parse(settings);
          setProfileVisibility(parsed.profileVisibility ?? true);
          setShowEmail(parsed.showEmail ?? false);
          setShowPhone(parsed.showPhone ?? false);
          setAllowMessages(parsed.allowMessages ?? true);
          setTwoFactorAuth(parsed.twoFactorAuth ?? false);
          setLoginAlerts(parsed.loginAlerts ?? true);
          setBiometricAuth(parsed.biometricAuth ?? false);
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleToggle = (key, setter) => async (value) => {
    setter(value);
    try {
      const currentSettings = await AsyncStorage.getItem('privacySecuritySettings');
      const parsed = currentSettings ? JSON.parse(currentSettings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem('privacySecuritySettings', JSON.stringify(parsed));
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settings = {
        profile_visibility: profileVisibility,
        show_email: showEmail,
        show_phone: showPhone,
        allow_messages: allowMessages,
        two_factor_auth: twoFactorAuth,
        login_alerts: loginAlerts,
        biometric_auth: biometricAuth,
      };
      
      // Save to backend
      const result = await userService.updatePrivacySettings(settings);
      
      if (result.success) {
        // Also save to local storage as backup
        await AsyncStorage.setItem('privacySecuritySettings', JSON.stringify({
          profileVisibility,
          showEmail,
          showPhone,
          allowMessages,
          twoFactorAuth,
          loginAlerts,
          biometricAuth,
        }));
        Alert.alert('Success', 'Your privacy and security settings have been updated');
      } else {
        Alert.alert('Error', result.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Unable to save settings');
    } finally {
      setSaving(false);
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
          <Text style={styles.greeting}>Privacy & Security 🔒</Text>
          <Text style={styles.headerSubtitle}>Manage your privacy settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderToggleItem = (icon, title, subtitle, value, onValueChange) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: BRAND_COLORS.vibrantBlue }}
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );

  const renderNavigationItem = (icon, title, subtitle, onPress) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
          </View>

          {renderToggleItem(
            'person-outline',
            'Profile Visibility',
            'Show your profile to other users',
            profileVisibility,
            handleToggle('profileVisibility', setProfileVisibility)
          )}
          {renderToggleItem(
            'mail-outline',
            'Show Email',
            'Display email on your profile',
            showEmail,
            handleToggle('showEmail', setShowEmail)
          )}
          {renderToggleItem(
            'call-outline',
            'Show Phone Number',
            'Display phone number on your profile',
            showPhone,
            handleToggle('showPhone', setShowPhone)
          )}
          {renderToggleItem(
            'chatbubble-outline',
            'Allow Messages',
            'Let other users send you messages',
            allowMessages,
            handleToggle('allowMessages', setAllowMessages)
          )}
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.sectionTitle}>Security Settings</Text>
          </View>

          {renderToggleItem(
            'shield-outline',
            'Two-Factor Authentication',
            'Add an extra layer of security',
            twoFactorAuth,
            handleToggle('twoFactorAuth', setTwoFactorAuth)
          )}
          {renderToggleItem(
            'notifications-outline',
            'Login Alerts',
            'Get notified of new login attempts',
            loginAlerts,
            handleToggle('loginAlerts', setLoginAlerts)
          )}
          {renderToggleItem(
            'finger-print',
            'Biometric Authentication',
            'Use fingerprint or Face ID to login',
            biometricAuth,
            handleToggle('biometricAuth', setBiometricAuth)
          )}

          {renderNavigationItem(
            'key-outline',
            'Change Password',
            'Update your account password',
            () => navigation.navigate('ChangePassword')
          )}
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
          </View>

          {renderNavigationItem(
            'download-outline',
            'Download My Data',
            'Request a copy of your data',
            () => showSuccess('Request Sent', 'We will email you a copy of your data within 24 hours')
          )}
          {renderNavigationItem(
            'trash-outline',
            'Delete Account',
            'Permanently delete your account',
            () => navigation.navigate('DeleteAccount')
          )}
          {renderNavigationItem(
            'shield',
            'Privacy Policy',
            'Read our privacy policy',
            () => navigation.navigate('PrivacyPolicy')
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
          activeOpacity={0.8}
          disabled={saving}
        >
          <LinearGradient
            colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
            )}
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      
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
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default PrivacySecurityScreen;
