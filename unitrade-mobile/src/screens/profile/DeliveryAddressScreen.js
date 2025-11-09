import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { showInfo, showError, showConfirm } from '../../utils/alert';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const DeliveryAddressScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const result = await userService.getDeliveryAddresses();
      if (result.success) {
        setAddresses(result.data || []);
      } else {
        // If endpoint doesn't exist (404), just show empty state
        console.log('Delivery addresses endpoint not available');
        setAddresses([]);
      }
    } catch (error) {
      console.error('Load addresses error:', error);
      // Don't show error, just show empty state
      setAddresses([]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleDeleteAddress = async (id) => {
    showConfirm(
      'Delete Address',
      'Are you sure you want to delete this address?',
      async () => {
        const result = await userService.deleteDeliveryAddress(id);
        if (result.success) {
          setAddresses(addresses.filter(addr => addr.id !== id));
          showInfo('Success', 'Address deleted');
        } else {
          showError('Error', result.error || 'Failed to delete address');
        }
      }
    );
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
          <Text style={styles.greeting}>Delivery Address 📍</Text>
          <Text style={styles.headerSubtitle}>Manage delivery locations</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  const renderAddress = (address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressNameContainer}>
          <Ionicons name="location" size={20} color={BRAND_COLORS.vibrantBlue} />
          <Text style={styles.addressName}>{address.name}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleDeleteAddress(address.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.addressDetails}>
        <View style={styles.addressRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.addressText}>{address.fullName}</Text>
        </View>
        <View style={styles.addressRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.addressText}>{address.phone}</Text>
        </View>
        <View style={styles.addressRow}>
          <Ionicons name="home-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.addressText}>{address.address}</Text>
        </View>
        <View style={styles.addressRow}>
          <Ionicons name="navigate-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.addressText}>{address.city}, {address.region}</Text>
        </View>
      </View>

      {!address.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => showInfo('Set Default', 'Set as default address')}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[BRAND_COLORS.vibrantBlue]}
            />
          }
        >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="location" size={24} color={BRAND_COLORS.vibrantBlue} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Delivery Locations</Text>
            <Text style={styles.infoText}>
              Add and manage your delivery addresses for faster checkout
            </Text>
          </View>
        </View>

        {/* Addresses List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {addresses.map(renderAddress)}
        </View>

        {/* Add Address Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddDeliveryAddress')}
        >
          <LinearGradient
            colors={[BRAND_COLORS.vibrantBlue, BRAND_COLORS.navyBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </LinearGradient>
        </TouchableOpacity>
        </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: BRAND_COLORS.lightBlue,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
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
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  addressNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addressName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  defaultBadge: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  defaultText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  editButton: {
    padding: SPACING.xs,
  },
  addressDetails: {
    gap: SPACING.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  setDefaultButton: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: BRAND_COLORS.vibrantBlue,
  },
  addButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default DeliveryAddressScreen;
