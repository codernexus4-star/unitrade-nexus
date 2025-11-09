import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '100';

const AboutScreen = () => {
  const navigation = useNavigation();

  const handleOpenLink = (url) => {
    Linking.openURL(url);
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
          <Text style={styles.greeting}>About UniTrade 📱</Text>
          <Text style={styles.headerSubtitle}>Learn more about us</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderInfoItem = (icon, label, value) => (
    <View style={styles.infoItem}>
      <View style={styles.infoLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderLinkItem = (icon, title, onPress) => (
    <TouchableOpacity
      style={styles.linkItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.linkLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={BRAND_COLORS.vibrantBlue} />
        </View>
        <Text style={styles.linkTitle}>{title}</Text>
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
        {/* Logo and Description */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="storefront" size={48} color={COLORS.white} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>UniTrade</Text>
          <Text style={styles.tagline}>Your Campus Marketplace</Text>
          <Text style={styles.description}>
            UniTrade is a marketplace connecting university students to buy and sell products within their campus community. Browse thousands of items, list products instantly, and connect with fellow students safely.
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.sectionTitle}>App Information</Text>
          </View>

          {renderInfoItem('code-slash', 'Version', `${APP_VERSION} (${BUILD_NUMBER})`)}
          {renderInfoItem('calendar-outline', 'Release Date', 'November 2025')}
          {renderInfoItem('business-outline', 'Developer', 'UniTrade Team')}
          {renderInfoItem('globe-outline', 'Region', 'Ghana & West Africa')}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.sectionTitle}>Key Features</Text>
          </View>

          <View style={styles.featuresList}>
            {[
              'Browse products from fellow students',
              'List items for sale instantly',
              'Secure in-app messaging',
              'Campus-specific marketplace',
              'Multiple payment options',
              'Order tracking & notifications',
              'Wishlist & favorites',
              'Seller ratings & reviews',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.vibrantBlue} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.sectionTitle}>Quick Links</Text>
          </View>

          {renderLinkItem(
            'globe',
            'Visit Website',
            () => handleOpenLink('https://unitrade.com')
          )}
          {renderLinkItem(
            'shield-checkmark',
            'Privacy Policy',
            () => navigation.navigate('PrivacyPolicy')
          )}
          {renderLinkItem(
            'document-text',
            'Terms of Service',
            () => navigation.navigate('TermsOfService')
          )}
          {renderLinkItem(
            'help-circle',
            'Help & Support',
            () => navigation.navigate('HelpSupport')
          )}
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://facebook.com/unitrade')}
            >
              <Ionicons name="logo-facebook" size={24} color={BRAND_COLORS.vibrantBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://twitter.com/unitrade')}
            >
              <Ionicons name="logo-twitter" size={24} color={BRAND_COLORS.vibrantBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://instagram.com/unitrade')}
            >
              <Ionicons name="logo-instagram" size={24} color={BRAND_COLORS.vibrantBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://linkedin.com/company/unitrade')}
            >
              <Ionicons name="logo-linkedin" size={24} color={BRAND_COLORS.vibrantBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 UniTrade. All rights reserved.{'\n'}
          Made with ❤️ for university students
        </Text>
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
  logoSection: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  infoLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  featuresList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  featureText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  socialSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  socialTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  copyright: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
});

export default AboutScreen;
