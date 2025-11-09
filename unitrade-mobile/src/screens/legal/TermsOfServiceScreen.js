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

const TermsOfServiceScreen = () => {
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
      <Text style={styles.headerTitle}>Terms of Service</Text>
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
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using UniTrade ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be:
            {'\n'}• At least 18 years of age
            {'\n'}• Currently enrolled in a participating university
            {'\n'}• Able to form legally binding contracts
            {'\n\n'}By using the App, you represent and warrant that you meet these eligibility requirements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Account Registration</Text>
          <Text style={styles.paragraph}>
            To use certain features, you must register for an account. You agree to:
            {'\n'}• Provide accurate, current, and complete information
            {'\n'}• Maintain and update your information
            {'\n'}• Keep your password secure and confidential
            {'\n'}• Notify us immediately of any unauthorized access
            {'\n'}• Be responsible for all activities under your account
            {'\n\n'}We reserve the right to suspend or terminate accounts that violate these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree NOT to:
            {'\n'}• Post false, misleading, or fraudulent listings
            {'\n'}• Sell prohibited or illegal items
            {'\n'}• Harass, threaten, or abuse other users
            {'\n'}• Impersonate any person or entity
            {'\n'}• Violate any laws or regulations
            {'\n'}• Spam or send unsolicited messages
            {'\n'}• Attempt to hack or disrupt the App
            {'\n'}• Use automated tools or bots
            {'\n'}• Collect user data without permission
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Product Listings</Text>
          <Text style={styles.subTitle}>5.1 Seller Responsibilities</Text>
          <Text style={styles.paragraph}>
            As a seller, you must:
            {'\n'}• Provide accurate product descriptions
            {'\n'}• Use genuine product images
            {'\n'}• Set fair and honest prices
            {'\n'}• Fulfill orders promptly
            {'\n'}• Respond to buyer inquiries
            {'\n'}• Comply with all applicable laws
          </Text>

          <Text style={styles.subTitle}>5.2 Prohibited Items</Text>
          <Text style={styles.paragraph}>
            You may NOT sell:
            {'\n'}• Illegal drugs or substances
            {'\n'}• Weapons or explosives
            {'\n'}• Stolen goods
            {'\n'}• Counterfeit items
            {'\n'}• Adult content or services
            {'\n'}• Live animals
            {'\n'}• Hazardous materials
            {'\n'}• Items that violate intellectual property rights
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Transactions and Payments</Text>
          <Text style={styles.paragraph}>
            • All payments are processed through Paystack, our secure payment provider
            {'\n'}• We are not responsible for payment processing issues
            {'\n'}• Buyers and sellers are responsible for completing transactions
            {'\n'}• We may charge service fees (currently waived for students)
            {'\n'}• Refunds are subject to our refund policy
            {'\n'}• Cash on delivery transactions are at users' own risk
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Fees and Charges</Text>
          <Text style={styles.paragraph}>
            • UniTrade currently does not charge listing or transaction fees for students
            {'\n'}• Payment processing fees may apply (charged by Paystack)
            {'\n'}• We reserve the right to introduce fees with 30 days notice
            {'\n'}• All fees are non-refundable unless otherwise stated
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            • The App and its content are owned by UniTrade
            {'\n'}• You retain ownership of your product listings and content
            {'\n'}• By posting content, you grant us a license to use, display, and distribute it
            {'\n'}• You may not use our trademarks without permission
            {'\n'}• You must respect the intellectual property rights of others
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Disputes and Resolution</Text>
          <Text style={styles.paragraph}>
            • UniTrade is a platform connecting buyers and sellers
            {'\n'}• We are not a party to transactions between users
            {'\n'}• Users are responsible for resolving disputes directly
            {'\n'}• We may provide assistance but are not obligated to intervene
            {'\n'}• We reserve the right to suspend users involved in disputes
            {'\n'}• Unresolved disputes may be subject to arbitration
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Disclaimers</Text>
          <Text style={styles.paragraph}>
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE:
            {'\n'}• Uninterrupted or error-free service
            {'\n'}• Accuracy of product listings
            {'\n'}• Quality or safety of products
            {'\n'}• Conduct of other users
            {'\n'}• Security of transactions
            {'\n\n'}USE THE APP AT YOUR OWN RISK.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, UNITRADE SHALL NOT BE LIABLE FOR:
            {'\n'}• Indirect, incidental, or consequential damages
            {'\n'}• Loss of profits, data, or goodwill
            {'\n'}• Damages arising from user transactions
            {'\n'}• Damages exceeding the amount paid to us (if any)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold UniTrade harmless from any claims, damages, or expenses arising from:
            {'\n'}• Your use of the App
            {'\n'}• Your violation of these Terms
            {'\n'}• Your violation of any rights of others
            {'\n'}• Your product listings or transactions
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of the App is subject to our Privacy Policy. By using the App, you consent to our collection and use of your information as described in the Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Termination</Text>
          <Text style={styles.paragraph}>
            We may suspend or terminate your account at any time for:
            {'\n'}• Violation of these Terms
            {'\n'}• Fraudulent or illegal activity
            {'\n'}• Abuse of other users
            {'\n'}• Any reason at our discretion
            {'\n\n'}You may delete your account at any time through the Settings page.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. We will notify you of significant changes through the App or via email. Continued use after changes constitutes acceptance of the updated Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of Ghana. Any disputes shall be resolved in the courts of Ghana.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>17. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms, contact us:
            {'\n\n'}Email: legal@unitrade.com
            {'\n'}Support: support@unitrade.com
            {'\n'}Address: [Your University Address]
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>18. Severability</Text>
          <Text style={styles.paragraph}>
            If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>19. Entire Agreement</Text>
          <Text style={styles.paragraph}>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and UniTrade regarding the use of the App.
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

export default TermsOfServiceScreen;
