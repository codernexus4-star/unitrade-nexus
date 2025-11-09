import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ModalPicker from '../../components/ModalPicker';
import { authService } from '../../services/authService';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { SELLER_TYPES, STUDENT_LEVELS } from '../../constants/config';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightGray: '#F8F8F8',
};

const RoleDetailsScreen = ({ route, navigation }) => {
  const { email, firstName, lastName, password, phoneNumber, role, sellerType: initialSellerType, university, campus, location } = route.params;
  const [sellerType, setSellerType] = useState(initialSellerType || 'student'); // 'student' or 'professional'
  const [studentId, setStudentId] = useState('');
  const [level, setLevel] = useState('');
  const [program, setProgram] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();

    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleComplete = async () => {
    // Validation based on seller type
    if (sellerType === 'student') {
      if (!studentId || !level || !program) {
        Alert.alert('Error', 'Please fill in all student details');
        return;
      }
    } else {
      if (!businessName || !businessDescription) {
        Alert.alert('Error', 'Please fill in all business details');
        return;
      }
    }

    setIsLoading(true);

    const userData = {
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      phone_number: phoneNumber,
      role,
      university,
      campus,
      location,
      seller_type: sellerType,
      bio,
    };

    // Add seller-specific fields
    if (sellerType === 'student') {
      userData.student_id = studentId;
      userData.level = level;
      userData.program_of_study = program;
    } else {
      userData.business_name = businessName;
      userData.business_description = businessDescription;
    }

    const result = await authService.register(userData);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration completed! You can now login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Error', result.message || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Curved Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerBlob} />
            <View style={styles.headerRing} />
            <Animated.Image
              source={require('../../../assets/logo.png')}
              style={[styles.logo, { transform: [{ scale: logoAnim }] }]}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Seller Details</Text>
            <Text style={styles.headerSubtitle}>
              Final Step - Step 3 of 3
            </Text>
          </LinearGradient>
        </View>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="storefront" size={48} color={BRAND_COLORS.vibrantBlue} />
          </View>
          
          <Text style={styles.formTitle}>Complete Your Profile</Text>
          <Text style={styles.formSubtitle}>
            Tell us more about your business
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '100%' }]} />
          </View>

        {/* Seller Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Seller Type</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                sellerType === 'student' && styles.roleButtonActive,
              ]}
              onPress={() => setSellerType('student')}
              disabled={isLoading}
            >
              <Ionicons
                name="school-outline"
                size={24}
                color={BRAND_COLORS.vibrantBlue}
              />
              <Text
                style={[
                  styles.roleText,
                  sellerType === 'student' && styles.roleTextActive,
                ]}
              >
                Student
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                sellerType === 'professional' && styles.roleButtonActive,
              ]}
              onPress={() => setSellerType('professional')}
              disabled={isLoading}
            >
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={BRAND_COLORS.vibrantBlue}
              />
              <Text
                style={[
                  styles.roleText,
                  sellerType === 'professional' && styles.roleTextActive,
                ]}
              >
                Professional
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Student-specific fields */}
        {sellerType === 'student' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Student ID</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="card-outline" 
                  size={20} 
                  color={COLORS.textSecondary} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Level</Text>
              <TouchableOpacity 
                style={styles.pickerWrapper}
                onPress={() => setShowLevelPicker(true)}
                disabled={isLoading}
              >
                <Ionicons 
                  name="stats-chart-outline" 
                  size={20} 
                  color={BRAND_COLORS.vibrantBlue} 
                  style={styles.inputIcon} 
                />
                <Text style={[styles.pickerText, !level && styles.placeholderText]}>
                  {level ? STUDENT_LEVELS.find(l => l.value === level)?.label : 'Select Level'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Program of Study</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="book-outline" 
                  size={20} 
                  color={COLORS.textSecondary} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  value={program}
                  onChangeText={setProgram}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>
          </>
        )}

        {/* Professional-specific fields */}
        {sellerType === 'professional' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="business-outline" 
                  size={20} 
                  color={COLORS.textSecondary} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your business name"
                  value={businessName}
                  onChangeText={setBusinessName}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Business Description</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe your business..."
                  value={businessDescription}
                  onChangeText={setBusinessDescription}
                  multiline
                  numberOfLines={4}
                  editable={!isLoading}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            </View>
          </>
        )}

        {/* Bio (Optional for both) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio (Optional)</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              editable={!isLoading}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

          {/* Complete Button */}
          <TouchableOpacity onPress={handleComplete} disabled={isLoading}>
            <LinearGradient
              colors={[BRAND_COLORS.goldenYellow, '#FFC533']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.completeButton, isLoading && { opacity: 0.7 }]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.completeButtonText}>Complete Registration</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Level Picker Modal */}
        <ModalPicker
          visible={showLevelPicker}
          onClose={() => setShowLevelPicker(false)}
          onSelect={setLevel}
          options={STUDENT_LEVELS}
          selectedValue={level}
          title="Select Level"
          placeholder="Choose your level"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  headerContainer: {
    backgroundColor: BRAND_COLORS.navyBlue,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 140,
    overflow: 'hidden',
  },
  gradientHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 140,
    position: 'relative',
  },
  headerBlob: {
    position: 'absolute',
    width: 220,
    height: 220,
    backgroundColor: 'rgba(253, 185, 19, 0.15)',
    borderRadius: 110,
    top: -60,
    right: -60,
    pointerEvents: 'none',
  },
  headerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    bottom: -30,
    left: 20,
    pointerEvents: 'none',
  },
  logo: { width: 100, height: 100, marginBottom: 10 },
  headerTitle: {
    fontSize: 28,
    color: BRAND_COLORS.goldenYellow,
    fontWeight: 'bold',
  },
  headerSubtitle: { color: '#f5f5f5', fontSize: 14 },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 25,
    marginTop: -35,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLORS.navyBlue,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: '100%',
    backgroundColor: BRAND_COLORS.goldenYellow,
    borderRadius: 3,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: SPACING.sm,
    color: BRAND_COLORS.vibrantBlue,
  },
  input: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: '#333',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
  },
  pickerText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: BRAND_COLORS.navyBlue,
    paddingVertical: SPACING.sm,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  textAreaWrapper: {
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roleButton: {
    flex: 1,
    backgroundColor: BRAND_COLORS.lightGray,
    borderRadius: 10,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleButtonActive: {
    backgroundColor: BRAND_COLORS.lightBlue,
    borderColor: BRAND_COLORS.vibrantBlue,
  },
  roleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  roleTextActive: {
    color: BRAND_COLORS.vibrantBlue,
  },
  completeButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RoleDetailsScreen;
