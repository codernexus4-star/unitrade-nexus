import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
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
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
  lightGray: '#F8F8F8',
};

const UniversityCampusScreen = ({ route, navigation }) => {
  const { email, firstName, lastName, password, phoneNumber, role, sellerType } = route.params;
  const [universities, setUniversities] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showUniversityPicker, setShowUniversityPicker] = useState(false);
  const [showCampusPicker, setShowCampusPicker] = useState(false);

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

    loadUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      loadCampuses(selectedUniversity);
    }
  }, [selectedUniversity]);

  const loadUniversities = async () => {
    setLoadingData(true);
    const result = await userService.getUniversities();
    if (result.success) {
      setUniversities(result.data || []);
    }
    setLoadingData(false);
  };

  const loadCampuses = async (universityId) => {
    const result = await userService.getCampuses(universityId);
    if (result.success) {
      setCampuses(result.data || []);
    }
  };

  const handleNext = () => {
    if (!selectedUniversity || !selectedCampus) {
      Alert.alert('Error', 'Please select university and campus');
      return;
    }

    // If seller, go to role-specific details
    if (role === 'seller') {
      navigation.navigate('RoleDetails', {
        email,
        firstName,
        lastName,
        password,
        phoneNumber,
        role,
        sellerType,
        university: selectedUniversity,
        campus: selectedCampus,
        location,
      });
    } else {
      // If buyer, complete registration
      completeRegistration();
    }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    const userData = {
      email,
      first_name: firstName,
      last_name: lastName,
      password,
      phone_number: phoneNumber,
      role,
      university: selectedUniversity,
      campus: selectedCampus,
      location,
    };

    const result = await authService.register(userData);
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration completed!', [
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
            <Text style={styles.headerTitle}>Your Institution</Text>
            <Text style={styles.headerSubtitle}>
              Step {role === 'seller' ? '2 of 3' : '2 of 2'}
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
            <Ionicons name="school" size={48} color={BRAND_COLORS.vibrantBlue} />
          </View>
          
          <Text style={styles.formTitle}>University & Campus</Text>
          <Text style={styles.formSubtitle}>
            Select your institution
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: role === 'seller' ? '66%' : '100%' }]} />
          </View>

        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLORS.vibrantBlue} />
            <Text style={styles.loadingText}>Loading universities...</Text>
          </View>
        ) : (
          <>
            {/* University Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>University</Text>
              <TouchableOpacity 
                style={styles.pickerWrapper}
                onPress={() => setShowUniversityPicker(true)}
                disabled={isLoading}
              >
                <Ionicons 
                  name="school-outline" 
                  size={20} 
                  color={BRAND_COLORS.vibrantBlue} 
                  style={styles.inputIcon} 
                />
                <Text style={[styles.pickerText, !selectedUniversity && styles.placeholderText]}>
                  {selectedUniversity ? universities.find(u => u.id === selectedUniversity)?.name : 'Select University'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Campus Selection */}
            {selectedUniversity && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Campus</Text>
                <TouchableOpacity 
                  style={styles.pickerWrapper}
                  onPress={() => setShowCampusPicker(true)}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name="location-outline" 
                    size={20} 
                    color={BRAND_COLORS.vibrantBlue} 
                    style={styles.inputIcon} 
                  />
                  <Text style={[styles.pickerText, !selectedCampus && styles.placeholderText]}>
                    {selectedCampus ? campuses.find(c => c.id === selectedCampus)?.name : 'Select Campus'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Next Button */}
            <TouchableOpacity onPress={handleNext} disabled={isLoading || !selectedUniversity || !selectedCampus}>
              <LinearGradient
                colors={[BRAND_COLORS.goldenYellow, '#FFC533']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.nextButton, (isLoading || !selectedUniversity || !selectedCampus) && { opacity: 0.7 }]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextButtonText}>
                    {role === 'seller' ? 'Next' : 'Complete Registration'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* University Picker Modal */}
        <ModalPicker
          visible={showUniversityPicker}
          onClose={() => setShowUniversityPicker(false)}
          onSelect={(value) => {
            setSelectedUniversity(value);
            setSelectedCampus(''); // Reset campus when university changes
          }}
          options={universities.map(uni => ({ value: uni.id, label: uni.name }))}
          selectedValue={selectedUniversity}
          title="Select University"
          placeholder="Choose your university"
        />

        {/* Campus Picker Modal */}
        <ModalPicker
          visible={showCampusPicker}
          onClose={() => setShowCampusPicker(false)}
          onSelect={setSelectedCampus}
          options={campuses.map(campus => ({ value: campus.id, label: campus.name }))}
          selectedValue={selectedCampus}
          title="Select Campus"
          placeholder="Choose your campus"
        />
      </Animated.View>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: BRAND_COLORS.vibrantBlue,
    fontSize: FONT_SIZES.sm,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: BRAND_COLORS.navyBlue,
    marginBottom: SPACING.xs,
    fontWeight: '600',
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
  inputIcon: {
    marginRight: SPACING.sm,
    color: BRAND_COLORS.vibrantBlue,
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
  nextButton: {
    backgroundColor: BRAND_COLORS.goldenYellow,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UniversityCampusScreen;
