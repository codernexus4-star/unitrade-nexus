import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { showError, showSuccess } from '../../utils/alert';
import { userService } from '../../services/userService';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightBlue: '#E3F2FD',
};

const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    // Validation
    if (!password.trim()) {
      showError('Error', 'Please enter your password to confirm');
      return;
    }

    if (confirmText !== 'DELETE') {
      showError('Error', 'Please type DELETE to confirm account deletion');
      return;
    }

    // Show final confirmation
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              // Call API to delete the account
              const result = await userService.deleteAccount(password);
              
              if (result.success) {
                showSuccess('Account Deleted', 'Your account has been permanently deleted');
                
                // Logout after 2 seconds
                setTimeout(() => {
                  logout();
                }, 2000);
              } else {
                showError('Error', result.message || 'Failed to delete account. Please check your password.');
                setDeleting(false);
              }
            } catch (error) {
              console.error('Delete account error:', error);
              showError('Error', 'Failed to delete account. Please try again.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.error, '#C62828']}
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
          <Text style={styles.greeting}>Delete Account ⚠️</Text>
          <Text style={styles.headerSubtitle}>This action is permanent</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="warning" size={32} color={COLORS.error} />
          </View>
          <Text style={styles.warningTitle}>Warning: Account Deletion</Text>
          <Text style={styles.warningText}>
            Deleting your account is permanent and cannot be undone. You will lose:
          </Text>
          <View style={styles.lossItems}>
            {[
              'All your product listings',
              'Order history and transactions',
              'Messages and conversations',
              'Wishlist and saved items',
              'Profile and reviews',
              'All account data',
            ].map((item, index) => (
              <View key={index} style={styles.lossItem}>
                <Ionicons name="close-circle" size={18} color={COLORS.error} />
                <Text style={styles.lossItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Alternative Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consider These Alternatives</Text>
          
          <TouchableOpacity
            style={styles.alternativeCard}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <Ionicons name="key-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <View style={styles.alternativeText}>
              <Text style={styles.alternativeTitle}>Change Password</Text>
              <Text style={styles.alternativeSubtitle}>Secure your account with a new password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.alternativeCard}
            onPress={() => navigation.navigate('PrivacySecurity')}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <View style={styles.alternativeText}>
              <Text style={styles.alternativeTitle}>Privacy Settings</Text>
              <Text style={styles.alternativeSubtitle}>Adjust your privacy preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.alternativeCard}
            onPress={() => navigation.navigate('HelpSupport')}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={24} color={BRAND_COLORS.vibrantBlue} />
            <View style={styles.alternativeText}>
              <Text style={styles.alternativeTitle}>Get Help</Text>
              <Text style={styles.alternativeSubtitle}>Contact support for assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Delete Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confirm Account Deletion</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reason for Leaving (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Help us improve by telling us why you're leaving..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Type <Text style={styles.deleteText}>DELETE</Text> to confirm *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Type DELETE"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="trash" size={22} color={COLORS.white} />
          )}
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Deleting Account...' : 'Delete Account Permanently'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Keep My Account</Text>
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
  warningCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: '#FFCDD2',
    ...SHADOWS.md,
  },
  warningIconContainer: {
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  warningTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  lossItems: {
    gap: SPACING.sm,
  },
  lossItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lossItemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: BRAND_COLORS.lightBlue,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  alternativeText: {
    flex: 1,
  },
  alternativeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  alternativeSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  deleteText: {
    color: COLORS.error,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: BRAND_COLORS.vibrantBlue,
    ...SHADOWS.md,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: BRAND_COLORS.vibrantBlue,
  },
});

export default DeleteAccountScreen;
