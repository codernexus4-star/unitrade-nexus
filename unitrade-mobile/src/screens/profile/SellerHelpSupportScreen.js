import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import logger from '../../utils/logger';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
// Removed unused alert imports

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const SellerHelpSupportScreen = () => {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleContactSupport = () => {
    // TODO: Implement actual contact support functionality
    logger.log('Opening contact support');
  };

  const handleOpenGuide = (url) => {
    // TODO: Implement actual guide opening functionality
    logger.log('Opening guide:', url);
  };

  const sellerFAQs = [
    {
      id: 'getting-started',
      title: 'Getting Started as a Seller',
      icon: 'rocket-outline',
      color: BRAND_COLORS.vibrantBlue,
      questions: [
        {
          q: 'How do I create my first product listing?',
          a: 'Go to Profile > Add Product. Fill in all required details including title, description, price, and upload clear photos. Make sure to select the correct category and condition.'
        },
        {
          q: 'What makes a good product listing?',
          a: 'Use clear, high-quality photos from multiple angles. Write detailed descriptions including dimensions, condition, and any flaws. Price competitively by checking similar items.'
        },
        {
          q: 'How long does it take for my product to go live?',
          a: 'Most products are approved within 24 hours. You\'ll receive a notification once approved. Products may be rejected if they violate our policies.'
        }
      ]
    },
    {
      id: 'selling-tips',
      title: 'Selling Tips & Best Practices',
      icon: 'bulb-outline',
      color: BRAND_COLORS.goldenYellow,
      questions: [
        {
          q: 'How can I increase my sales?',
          a: 'Post high-quality photos, respond quickly to messages, offer competitive prices, and maintain good seller ratings. Update your listings regularly.'
        },
        {
          q: 'What should I do when I receive an order?',
          a: 'Confirm the order immediately, communicate with the buyer about pickup/delivery details, and ensure the item is ready as described.'
        },
        {
          q: 'How do I handle difficult buyers?',
          a: 'Stay professional, communicate clearly, and document all interactions. If issues persist, contact our support team for assistance.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Earnings',
      icon: 'wallet-outline',
      color: '#10B981',
      questions: [
        {
          q: 'How do I get paid for my sales?',
          a: 'Payments are processed through Mobile Money or bank transfer. Set up your payment method in Profile > Payment & Payouts.'
        },
        {
          q: 'When do I receive payment?',
          a: 'Payments are released 24 hours after successful delivery confirmation. This protects both buyers and sellers.'
        },
        {
          q: 'Are there any selling fees?',
          a: 'UniTrade charges a small commission on successful sales. Check our fee structure in the seller agreement.'
        }
      ]
    },
    {
      id: 'policies',
      title: 'Policies & Guidelines',
      icon: 'document-text-outline',
      color: '#9C27B0',
      questions: [
        {
          q: 'What items are prohibited on UniTrade?',
          a: 'Prohibited items include counterfeit goods, illegal substances, weapons, and items violating university policies. Check our full prohibited items list.'
        },
        {
          q: 'What happens if my listing is removed?',
          a: 'You\'ll receive an email explaining the reason. You can appeal the decision or modify your listing to comply with our policies.'
        },
        {
          q: 'How do I report a problem buyer?',
          a: 'Use the report function in your messages or contact support with order details and screenshots of the issue.'
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Seller Guidelines',
      subtitle: 'Complete selling rules & policies',
      icon: 'book-outline',
      color: BRAND_COLORS.vibrantBlue,
      onPress: () => handleOpenGuide('seller-guidelines')
    },
    {
      title: 'Video Tutorials',
      subtitle: 'Learn with step-by-step videos',
      icon: 'play-circle-outline',
      color: BRAND_COLORS.goldenYellow,
      onPress: () => handleOpenGuide('video-tutorials')
    },
    {
      title: 'Seller Community',
      subtitle: 'Connect with other sellers',
      icon: 'people-outline',
      color: '#10B981',
      onPress: () => handleOpenGuide('seller-community')
    },
    {
      title: 'Contact Support',
      subtitle: 'Get help from our team',
      icon: 'headset-outline',
      color: '#9C27B0',
      onPress: handleContactSupport
    }
  ];

  const renderFAQSection = (section) => (
    <View key={section.id} style={styles.faqSection}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={() => toggleSection(section.id)}
      >
        <View style={styles.faqHeaderContent}>
          <View style={[styles.faqIcon, { backgroundColor: `${section.color}15` }]}>
            <Ionicons name={section.icon} size={24} color={section.color} />
          </View>
          <Text style={styles.faqTitle}>{section.title}</Text>
        </View>
        <Ionicons
          name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>

      {expandedSection === section.id && (
        <View style={styles.faqContent}>
          {section.questions.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Text style={styles.faqAnswer}>{item.a}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderQuickAction = (action, index) => (
    <TouchableOpacity
      key={index}
      style={styles.quickActionCard}
      onPress={action.onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
        <Ionicons name={action.icon} size={28} color={action.color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Seller Support</Text>
            <Text style={styles.headerSubtitle}>Get help with selling on UniTrade</Text>
          </View>
          
          <View style={styles.headerIcon}>
            <Ionicons name="storefront" size={28} color={BRAND_COLORS.goldenYellow} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => renderQuickAction(action, index))}
          </View>
        </View>

        {/* FAQ Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {sellerFAQs.map(renderFAQSection)}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <LinearGradient
              colors={[BRAND_COLORS.goldenYellow, '#FF8F00']}
              style={styles.contactGradient}
            >
              <View style={styles.contactContent}>
                <Ionicons name="headset" size={32} color={COLORS.white} />
                <Text style={styles.contactTitle}>Still Need Help?</Text>
                <Text style={styles.contactSubtitle}>
                  Our seller support team is here to help you succeed
                </Text>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleContactSupport}
                >
                  <Text style={styles.contactButtonText}>Contact Seller Support</Text>
                  <Ionicons name="arrow-forward" size={16} color={BRAND_COLORS.goldenYellow} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(253, 185, 19, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    gap: SPACING.sm,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  faqSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  faqHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  faqTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  faqContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqQuestion: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  contactGradient: {
    padding: SPACING.xl,
  },
  contactContent: {
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  contactSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: BRAND_COLORS.goldenYellow,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default SellerHelpSupportScreen;
