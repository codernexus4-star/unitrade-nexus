import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
};

const APP_VERSION = '1.0.0';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setPushNotifications(parsed.pushNotifications ?? true);
        setEmailNotifications(parsed.emailNotifications ?? true);
        setOrderUpdates(parsed.orderUpdates ?? true);
        setPromotions(parsed.promotions ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const currentSettings = await AsyncStorage.getItem('notificationSettings');
      const parsed = currentSettings ? JSON.parse(currentSettings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(parsed));
      showSuccess('Settings Saved', 'Your notification preferences have been updated');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleToggle = (key, setter) => async (value) => {
    setter(value);
    await saveSettings(key, value);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Settings</Text>
      <View style={styles.headerSpacer} />
    </LinearGradient>
  );

  const renderSection = (title) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderToggleItem = (icon, title, subtitle, value, onValueChange) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: BRAND_COLORS.vibrantBlue }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  const renderNavigationItem = (icon, title, subtitle, onPress, iconColor) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={20}
            color={iconColor || BRAND_COLORS.vibrantBlue}
          />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        {renderSection('Notifications')}
        <View style={styles.section}>
          {renderToggleItem(
            'notifications',
            'Push Notifications',
            'Receive push notifications',
            pushNotifications,
            handleToggle('pushNotifications', setPushNotifications)
          )}
          {renderToggleItem(
            'mail',
            'Email Notifications',
            'Receive email updates',
            emailNotifications,
            handleToggle('emailNotifications', setEmailNotifications)
          )}
          {renderToggleItem(
            'cart',
            'Order Updates',
            'Get notified about order status',
            orderUpdates,
            handleToggle('orderUpdates', setOrderUpdates)
          )}
          {renderToggleItem(
            'pricetag',
            'Promotions & Offers',
            'Receive promotional messages',
            promotions,
            handleToggle('promotions', setPromotions)
          )}
        </View>

        {/* Account Section */}
        {renderSection('Account')}
        <View style={styles.section}>
          {renderNavigationItem(
            'person',
            'Edit Profile',
            'Update your personal information',
            () => navigation.navigate('EditProfile')
          )}
          {renderNavigationItem(
            'lock-closed',
            'Change Password',
            'Update your password',
            () => navigation.navigate('ChangePassword')
          )}
          {renderNavigationItem(
            'shield-checkmark',
            'Privacy & Security',
            'Manage your privacy settings',
            () => navigation.navigate('PrivacySecurity')
          )}
        </View>

        {/* App Section */}
        {renderSection('App')}
        <View style={styles.section}>
          {renderNavigationItem(
            'language',
            'Language',
            'English',
            () => navigation.navigate('Language')
          )}
          {renderNavigationItem(
            'help-circle',
            'Help & Support',
            'Get help or contact us',
            () => navigation.navigate('HelpSupport')
          )}
          {renderNavigationItem(
            'document-text',
            'Terms & Conditions',
            'Read our terms of service',
            () => navigation.navigate('TermsOfService')
          )}
          {renderNavigationItem(
            'shield',
            'Privacy Policy',
            'Read our privacy policy',
            () => navigation.navigate('PrivacyPolicy')
          )}
        </View>

        {/* About Section */}
        {renderSection('About')}
        <View style={styles.section}>
          {renderNavigationItem(
            'information-circle',
            'About UniTrade',
            'Learn more about us',
            () => navigation.navigate('About')
          )}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="code-slash" size={20} color={BRAND_COLORS.vibrantBlue} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingSubtitle}>{APP_VERSION}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default SettingsScreen;
