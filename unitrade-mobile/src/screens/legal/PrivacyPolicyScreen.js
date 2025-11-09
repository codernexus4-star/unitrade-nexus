import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
};

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

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
      <Text style={styles.headerTitle}>Privacy Policy</Text>
      <View style={styles.headerSpacer} />
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: November 3, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to UniTrade ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.subTitle}>2.1 Personal Information</Text>
          <Text style={styles.paragraph}>
            When you register for an account, we collect:
            {'\n'}• Full name
            {'\n'}• Email address
            {'\n'}• Phone number
            {'\n'}• University and campus information
            {'\n'}• Student level (if applicable)
            {'\n'}• Profile picture (optional)
          </Text>

          <Text style={styles.subTitle}>2.2 Product Information</Text>
          <Text style={styles.paragraph}>
            When you list products for sale:
            {'\n'}• Product images
            {'\n'}• Product descriptions
            {'\n'}• Pricing information
            {'\n'}• Product condition and category
          </Text>

          <Text style={styles.subTitle}>2.3 Transaction Information</Text>
          <Text style={styles.paragraph}>
            When you make purchases:
            {'\n'}• Order history
            {'\n'}• Payment information (processed securely through Paystack)
            {'\n'}• Delivery addresses
            {'\n'}• Communication with sellers
          </Text>

          <Text style={styles.subTitle}>2.4 Usage Information</Text>
          <Text style={styles.paragraph}>
            We automatically collect:
            {'\n'}• Device information (model, OS version)
            {'\n'}• App usage statistics
            {'\n'}• IP address
            {'\n'}• Log data and crash reports
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:
            {'\n'}• Provide and maintain our services
            {'\n'}• Process your transactions
            {'\n'}• Send you notifications about orders and messages
            {'\n'}• Improve our app and user experience
            {'\n'}• Prevent fraud and ensure security
            {'\n'}• Comply with legal obligations
            {'\n'}• Send promotional communications (with your consent)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information with:
            {'\n'}• Other users (sellers/buyers) to facilitate transactions
            {'\n'}• Payment processors (Paystack) to process payments
            {'\n'}• Service providers who assist our operations
            {'\n'}• Law enforcement when required by law
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your information:
            {'\n'}• Encrypted data transmission (HTTPS/TLS)
            {'\n'}• Secure authentication with JWT tokens
            {'\n'}• Regular security audits
            {'\n'}• Access controls and monitoring
            {'\n\n'}However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
            {'\n'}• Access your personal information
            {'\n'}• Correct inaccurate information
            {'\n'}• Delete your account and data
            {'\n'}• Opt-out of marketing communications
            {'\n'}• Export your data
            {'\n\n'}To exercise these rights, contact us at privacy@unitrade.com
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, fraud prevention, and dispute resolution.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is intended for users 18 years and older. We do not knowingly collect information from children under 18. If you believe we have collected information from a child, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email. Continued use of the app after changes constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us:
            {'\n\n'}Email: privacy@unitrade.com
            {'\n'}Support: support@unitrade.com
            {'\n'}Address: [Your University Address]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Data Deletion</Text>
          <Text style={styles.paragraph}>
            To request deletion of your account and all associated data:
            {'\n'}1. Go to Settings → Account
            {'\n'}2. Select "Delete Account"
            {'\n'}3. Confirm your request
            {'\n\n'}Alternatively, email us at privacy@unitrade.com with your account details. We will process deletion requests within 30 days.
          </Text>
        </View>

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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: SPACING.lg,
  },
  lastUpdated: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.sm,
  },
  subTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  paragraph: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default PrivacyPolicyScreen;
