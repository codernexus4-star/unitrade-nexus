import React, { useState } from 'react';
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
import logger from '../../utils/logger';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
// Removed unused alert imports

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'Browse products, add items to cart, proceed to checkout, fill in delivery details, and complete payment.',
    },
    {
      id: 2,
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, mobile money (MTN, Vodafone, AirtelTigo), and cash on delivery.',
    },
    {
      id: 3,
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 1-3 business days within campus. Off-campus deliveries may take 3-5 business days.',
    },
    {
      id: 4,
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order within 1 hour of placement. Go to My Orders and select Cancel Order.',
    },
    {
      id: 5,
      question: 'How do I return an item?',
      answer: 'Contact the seller within 7 days of delivery. Ensure the item is unused and in original packaging.',
    },
    {
      id: 6,
      question: 'How do I become a seller?',
      answer: 'Go to Profile > Settings and switch to Seller account. Complete your seller profile and start listing products.',
    },
  ];

  const contactOptions = [
    {
      id: 1,
      icon: 'mail',
      title: 'Email Us',
      subtitle: 'support@unitrade.com',
      action: () => Linking.openURL('mailto:support@unitrade.com'),
    },
    {
      id: 2,
      icon: 'call',
      title: 'Call Us',
      subtitle: '+233 24 123 4567',
      action: () => Linking.openURL('tel:+233241234567'),
    },
    {
      id: 3,
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us',
      action: () => Linking.openURL('https://wa.me/233241234567'),
    },
    {
      id: 4,
      icon: 'chatbubbles',
      title: 'Live Chat',
      subtitle: 'Available 24/7',
      action: () => logger.log('Opening live chat'),
    },
  ];

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
          <Text style={styles.greeting}>Help & Support 🆘</Text>
          <Text style={styles.headerSubtitle}>We're here to help</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderFaqItem = (faq) => {
    const isExpanded = expandedFaq === faq.id;
    
    return (
      <TouchableOpacity
        key={faq.id}
        style={styles.faqCard}
        onPress={() => setExpandedFaq(isExpanded ? null : faq.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{faq.question}</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={BRAND_COLORS.vibrantBlue} 
          />
        </View>
        {isExpanded && (
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderContactOption = (option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.contactCard}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={styles.contactIconContainer}>
        <Ionicons name={option.icon} size={24} color={BRAND_COLORS.vibrantBlue} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{option.title}</Text>
        <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
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
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="receipt-outline" size={32} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.quickActionText}>Track Order</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => logger.log('Opening report issue')}
          >
            <Ionicons name="flag-outline" size={32} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => logger.log('Opening feedback')}
          >
            <Ionicons name="star-outline" size={32} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.quickActionText}>Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map(renderFaqItem)}
        </View>

        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactOptions.map(renderContactOption)}
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="document-text-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.resourceText}>User Guide</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.resourceText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="reader-outline" size={20} color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.resourceText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
  },
  quickActionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  resourcesCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  resourcesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  resourceText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
});

export default HelpSupportScreen;
