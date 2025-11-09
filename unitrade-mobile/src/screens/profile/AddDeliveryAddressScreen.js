import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { showSuccess, showError } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Northern',
  'Upper East',
  'Upper West',
  'Volta',
  'Bono',
  'Bono East',
  'Ahafo',
  'Savannah',
  'North East',
  'Oti',
  'Western North',
];

const ADDRESS_TYPES = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'hostel', icon: 'business', label: 'Hostel' },
  { id: 'work', icon: 'briefcase', label: 'Work' },
  { id: 'other', icon: 'location', label: 'Other' },
];

const AddDeliveryAddressScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [addressType, setAddressType] = useState('home');
  const [customLabel, setCustomLabel] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('Greater Accra');
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.substring(0, 10);
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      showError('Invalid Name', 'Please enter your full name');
      return false;
    }
    if (!phoneNumber || phoneNumber.length !== 10) {
      showError('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return false;
    }
    if (!address.trim()) {
      showError('Invalid Address', 'Please enter your delivery address');
      return false;
    }
    if (!city.trim()) {
      showError('Invalid City', 'Please enter your city');
      return false;
    }
    if (addressType === 'other' && !customLabel.trim()) {
      showError('Invalid Label', 'Please enter a label for this address');
      return false;
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Prepare address data
    const addressData = {
      address_type: addressType,
      label: addressType === 'other' ? customLabel : ADDRESS_TYPES.find(t => t.id === addressType)?.label,
      full_name: fullName,
      phone_number: phoneNumber,
      street_address: address,
      landmark: landmark || '',
      city: city,
      region: region,
      is_default: setAsDefault,
    };

    const result = await userService.addDeliveryAddress(addressData);
    
    if (result.success) {
      showSuccess(
        'Address Added',
        'Delivery address added successfully',
        () => navigation.goBack()
      );
    } else {
      showError('Error', result.error || 'Failed to add delivery address');
    }
    
    setLoading(false);
  };

  const getAddressLabel = () => {
    if (addressType === 'other') return customLabel || 'Other';
    return ADDRESS_TYPES.find(t => t.id === addressType)?.label || 'Address';
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
          <Text style={styles.greeting}>Add Delivery Address 📍</Text>
          <Text style={styles.headerSubtitle}>Enter your delivery details</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderAddressTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Address Type</Text>
      <View style={styles.typeGrid}>
        {ADDRESS_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              addressType === type.id && styles.typeCardActive,
            ]}
            onPress={() => setAddressType(type.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.typeIconContainer,
              addressType === type.id && styles.typeIconActive,
            ]}>
              <Ionicons
                name={type.icon}
                size={24}
                color={addressType === type.id ? COLORS.white : BRAND_COLORS.vibrantBlue}
              />
            </View>
            <Text style={[
              styles.typeLabel,
              addressType === type.id && styles.typeLabelActive,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {addressType === 'other' && (
        <View style={styles.customLabelContainer}>
          <TextInput
            style={styles.customLabelInput}
            placeholder="Enter custom label (e.g., Friend's Place)"
            value={customLabel}
            onChangeText={setCustomLabel}
          />
        </View>
      )}
    </View>
  );

  const renderContactDetails = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Contact Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.prefix}>+233</Text>
          <TextInput
            style={styles.input}
            placeholder="244123456"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>
    </View>
  );

  const renderAddressDetails = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Address Details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Street Address *</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="home-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="House number, street name"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Landmark (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="navigate-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Near a notable place"
            value={landmark}
            onChangeText={setLandmark}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>City *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Accra"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={[styles.inputContainer, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Region *</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowRegionPicker(!showRegionPicker)}
          >
            <Ionicons name="map-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.pickerText}>{region}</Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {showRegionPicker && (
        <View style={styles.regionPicker}>
          <ScrollView style={styles.regionList} nestedScrollEnabled>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.regionItem,
                  region === r && styles.regionItemActive,
                ]}
                onPress={() => {
                  setRegion(r);
                  setShowRegionPicker(false);
                }}
              >
                <Text style={[
                  styles.regionText,
                  region === r && styles.regionTextActive,
                ]}>
                  {r}
                </Text>
                {region === r && (
                  <Ionicons name="checkmark" size={20} color={BRAND_COLORS.vibrantBlue} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderAddressTypeSelector()}
        {renderContactDetails()}
        {renderAddressDetails()}

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.defaultToggle}
          onPress={() => setSetAsDefault(!setAsDefault)}
          activeOpacity={0.7}
        >
          <View style={styles.defaultToggleLeft}>
            <Ionicons
              name={setAsDefault ? 'checkbox' : 'square-outline'}
              size={24}
              color={setAsDefault ? BRAND_COLORS.vibrantBlue : COLORS.textSecondary}
            />
            <Text style={styles.defaultToggleText}>Set as default delivery address</Text>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.infoText}>
            Make sure your address is accurate for smooth delivery
          </Text>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleAddAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <LinearGradient
              colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Delivery Address</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
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
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  typeCardActive: {
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_COLORS.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeIconActive: {
    backgroundColor: BRAND_COLORS.vibrantBlue,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  typeLabelActive: {
    color: BRAND_COLORS.vibrantBlue,
  },
  customLabelContainer: {
    marginTop: SPACING.md,
  },
  customLabelInput: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  prefix: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  regionPicker: {
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  regionList: {
    maxHeight: 200,
  },
  regionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  regionItemActive: {
    backgroundColor: BRAND_COLORS.lightBlue,
  },
  regionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  regionTextActive: {
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  defaultToggle: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  defaultToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  defaultToggleText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  footer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default AddDeliveryAddressScreen;
