import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { showSuccess, showError, showInfo } from '../../utils/alert';
import logger from '../../utils/logger';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const BusinessProfileScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessDescription: '',
    businessCategory: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    businessHours: '',
    businessLogo: null,
    businessBanner: null,
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      whatsapp: '',
    },
    businessType: 'individual', // individual, registered_business
    businessRegistration: '',
    taxId: '',
    mobileMoneyDetails: {
      primaryProvider: '', // MTN, Vodafone
      primaryNumber: '',
      primaryAccountName: '',
      secondaryProvider: '', // Optional backup
      secondaryNumber: '',
      secondaryAccountName: '',
    },
  });

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    // TODO: Load business profile from API
    logger.log('Loading business profile for user:', user?.id);
    
    // Simulate loading existing data
    setBusinessData(prev => ({
      ...prev,
      businessName: user?.first_name ? `${user.first_name}'s Store` : 'My Business',
      businessEmail: user?.email || '',
      businessPhone: user?.phone || '',
    }));
  };

  const handleImagePicker = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showError('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'logo' ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBusinessData(prev => ({
          ...prev,
          [type === 'logo' ? 'businessLogo' : 'businessBanner']: result.assets[0].uri
        }));
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      showError('Error', 'Failed to select image');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // TODO: Save business profile to API
      logger.log('Saving business profile:', businessData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Success', 'Business profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      logger.error('Error saving business profile:', error);
      showError('Error', 'Failed to update business profile');
    } finally {
      setLoading(false);
    }
  };

  const businessCategories = [
    'Electronics & Gadgets',
    'Books & Stationery',
    'Fashion & Clothing',
    'Sports & Recreation',
    'Food & Beverages',
    'Health & Beauty',
    'Home & Living',
    'Services',
    'Other'
  ];

  const mobileMoneyProviders = [
    { value: 'MTN', label: 'MTN Mobile Money', color: '#FFCC00' },
    { value: 'Vodafone', label: 'Vodafone Cash', color: '#E60000' },
    { value: 'AirtelTigo', label: 'AirtelTigo Money', color: '#ED1C24' }
  ];

  const businessTypes = [
    { value: 'individual', label: 'Individual Seller' },
    { value: 'registered_business', label: 'Registered Business' }
  ];

  const renderImageUpload = (type, title, aspectText) => (
    <View style={styles.imageUploadSection}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <TouchableOpacity
        style={styles.imageUploadContainer}
        onPress={() => handleImagePicker(type)}
      >
        {businessData[type === 'logo' ? 'businessLogo' : 'businessBanner'] ? (
          <Image
            source={{ uri: businessData[type === 'logo' ? 'businessLogo' : 'businessBanner'] }}
            style={[styles.uploadedImage, type === 'logo' ? styles.logoImage : styles.bannerImage]}
          />
        ) : (
          <View style={[styles.imagePlaceholder, type === 'logo' ? styles.logoPlaceholder : styles.bannerPlaceholder]}>
            <Ionicons name="camera-outline" size={32} color={COLORS.textSecondary} />
            <Text style={styles.imagePlaceholderText}>Upload {title}</Text>
            <Text style={styles.imageAspectText}>{aspectText}</Text>
          </View>
        )}
        <View style={styles.imageEditButton}>
          <Ionicons name="create-outline" size={16} color={COLORS.white} />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderInput = (label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderPicker = (label, value, onSelect, options) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => {
          Alert.alert(
            label,
            'Select an option',
            options.map(option => ({
              text: typeof option === 'string' ? option : option.label,
              onPress: () => onSelect(typeof option === 'string' ? option : option.value)
            })).concat([{ text: 'Cancel', style: 'cancel' }])
          );
        }}
      >
        <Text style={[styles.pickerText, !value && styles.pickerPlaceholder]}>
          {value || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
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
            <Text style={styles.headerTitle}>Business Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your store information</Text>
          </View>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Business Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Branding</Text>
          {renderImageUpload('logo', 'Business Logo', 'Square (1:1 ratio)')}
          {renderImageUpload('banner', 'Store Banner', 'Wide (16:9 ratio)')}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          {renderInput(
            'Business Name',
            businessData.businessName,
            (text) => setBusinessData(prev => ({ ...prev, businessName: text })),
            'Enter your business name'
          )}
          
          {renderInput(
            'Business Description',
            businessData.businessDescription,
            (text) => setBusinessData(prev => ({ ...prev, businessDescription: text })),
            'Describe what your business offers...',
            true
          )}
          
          {renderPicker(
            'Business Category',
            businessData.businessCategory,
            (value) => setBusinessData(prev => ({ ...prev, businessCategory: value })),
            businessCategories
          )}
          
          {renderPicker(
            'Business Type',
            businessTypes.find(t => t.value === businessData.businessType)?.label || '',
            (value) => setBusinessData(prev => ({ ...prev, businessType: value })),
            businessTypes
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {renderInput(
            'Business Phone',
            businessData.businessPhone,
            (text) => setBusinessData(prev => ({ ...prev, businessPhone: text })),
            '+233 XX XXX XXXX',
            false,
            'phone-pad'
          )}
          
          {renderInput(
            'Business Email',
            businessData.businessEmail,
            (text) => setBusinessData(prev => ({ ...prev, businessEmail: text })),
            'business@example.com',
            false,
            'email-address'
          )}
          
          {renderInput(
            'Business Address',
            businessData.businessAddress,
            (text) => setBusinessData(prev => ({ ...prev, businessAddress: text })),
            'Enter your business address',
            true
          )}
          
          {renderInput(
            'Business Hours',
            businessData.businessHours,
            (text) => setBusinessData(prev => ({ ...prev, businessHours: text })),
            'e.g., Mon-Fri 9AM-5PM, Sat 9AM-2PM'
          )}
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media Links</Text>
          
          {renderInput(
            'Facebook',
            businessData.socialMedia.facebook,
            (text) => setBusinessData(prev => ({ 
              ...prev, 
              socialMedia: { ...prev.socialMedia, facebook: text }
            })),
            'https://facebook.com/yourbusiness'
          )}
          
          {renderInput(
            'Instagram',
            businessData.socialMedia.instagram,
            (text) => setBusinessData(prev => ({ 
              ...prev, 
              socialMedia: { ...prev.socialMedia, instagram: text }
            })),
            'https://instagram.com/yourbusiness'
          )}
          
          {renderInput(
            'WhatsApp Business',
            businessData.socialMedia.whatsapp,
            (text) => setBusinessData(prev => ({ 
              ...prev, 
              socialMedia: { ...prev.socialMedia, whatsapp: text }
            })),
            '+233 XX XXX XXXX',
            false,
            'phone-pad'
          )}
        </View>

        {/* Business Registration (for registered businesses) */}
        {businessData.businessType === 'registered_business' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Registration</Text>
            
            {renderInput(
              'Business Registration Number',
              businessData.businessRegistration,
              (text) => setBusinessData(prev => ({ ...prev, businessRegistration: text })),
              'Enter registration number'
            )}
            
            {renderInput(
              'Tax Identification Number',
              businessData.taxId,
              (text) => setBusinessData(prev => ({ ...prev, taxId: text })),
              'Enter TIN'
            )}
          </View>
        )}

        {/* Mobile Money Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile Money Information</Text>
          <Text style={styles.sectionSubtitle}>
            Add your mobile money details to receive payments from sales
          </Text>
          
          {/* Primary Mobile Money Account */}
          <View style={styles.mobileMoneyGroup}>
            <Text style={styles.mobileMoneyGroupTitle}>Primary Account</Text>
            
            {renderPicker(
              'Mobile Money Provider',
              mobileMoneyProviders.find(p => p.value === businessData.mobileMoneyDetails.primaryProvider)?.label || '',
              (value) => setBusinessData(prev => ({ 
                ...prev, 
                mobileMoneyDetails: { ...prev.mobileMoneyDetails, primaryProvider: value }
              })),
              mobileMoneyProviders
            )}
            
            {renderInput(
              'Mobile Money Number',
              businessData.mobileMoneyDetails.primaryNumber,
              (text) => setBusinessData(prev => ({ 
                ...prev, 
                mobileMoneyDetails: { ...prev.mobileMoneyDetails, primaryNumber: text }
              })),
              '0XX XXX XXXX',
              false,
              'phone-pad'
            )}
            
            {renderInput(
              'Account Name',
              businessData.mobileMoneyDetails.primaryAccountName,
              (text) => setBusinessData(prev => ({ 
                ...prev, 
                mobileMoneyDetails: { ...prev.mobileMoneyDetails, primaryAccountName: text }
              })),
              'Name registered on mobile money account'
            )}
          </View>

          {/* Secondary Mobile Money Account (Optional) */}
          <View style={styles.mobileMoneyGroup}>
            <Text style={styles.mobileMoneyGroupTitle}>
              Backup Account <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            
            {renderPicker(
              'Secondary Provider',
              mobileMoneyProviders.find(p => p.value === businessData.mobileMoneyDetails.secondaryProvider)?.label || '',
              (value) => setBusinessData(prev => ({ 
                ...prev, 
                mobileMoneyDetails: { ...prev.mobileMoneyDetails, secondaryProvider: value }
              })),
              mobileMoneyProviders
            )}
            
            {businessData.mobileMoneyDetails.secondaryProvider && (
              <>
                {renderInput(
                  'Secondary Mobile Number',
                  businessData.mobileMoneyDetails.secondaryNumber,
                  (text) => setBusinessData(prev => ({ 
                    ...prev, 
                    mobileMoneyDetails: { ...prev.mobileMoneyDetails, secondaryNumber: text }
                  })),
                  '0XX XXX XXXX',
                  false,
                  'phone-pad'
                )}
                
                {renderInput(
                  'Secondary Account Name',
                  businessData.mobileMoneyDetails.secondaryAccountName,
                  (text) => setBusinessData(prev => ({ 
                    ...prev, 
                    mobileMoneyDetails: { ...prev.mobileMoneyDetails, secondaryAccountName: text }
                  })),
                  'Name on secondary account'
                )}
              </>
            )}
          </View>

          {/* Mobile Money Info Card */}
          <View style={styles.mobileMoneyInfoCard}>
            <View style={styles.mobileMoneyInfoIcon}>
              <Ionicons name="phone-portrait" size={20} color={BRAND_COLORS.vibrantBlue} />
            </View>
            <View style={styles.mobileMoneyInfoContent}>
              <Text style={styles.mobileMoneyInfoTitle}>Secure Payments</Text>
              <Text style={styles.mobileMoneyInfoText}>
                Your mobile money details are encrypted and only used for processing payments from your sales.
              </Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={24} color={BRAND_COLORS.vibrantBlue} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Business Profile Benefits</Text>
              <Text style={styles.infoText}>
                Complete your business profile to build trust with customers, 
                appear in business searches, and access advanced seller features.
              </Text>
            </View>
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
    paddingBottom: SPACING.lg,
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
  saveButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
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
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  imageUploadSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  imageUploadContainer: {
    position: 'relative',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  logoPlaceholder: {
    height: 120,
    aspectRatio: 1,
  },
  bannerPlaceholder: {
    height: 120,
    aspectRatio: 16/9,
  },
  uploadedImage: {
    borderRadius: BORDER_RADIUS.lg,
  },
  logoImage: {
    height: 120,
    aspectRatio: 1,
  },
  bannerImage: {
    height: 120,
    aspectRatio: 16/9,
  },
  imagePlaceholderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  imageAspectText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imageEditButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: BRAND_COLORS.vibrantBlue,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  pickerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  pickerPlaceholder: {
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    ...SHADOWS.sm,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  
  // Mobile Money Styles
  mobileMoneyGroup: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  mobileMoneyGroupTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  optionalText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  mobileMoneyInfoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
  },
  mobileMoneyInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mobileMoneyInfoContent: {
    flex: 1,
  },
  mobileMoneyInfoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  mobileMoneyInfoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

export default BusinessProfileScreen;
