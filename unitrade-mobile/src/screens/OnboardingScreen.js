import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BRAND_COLORS = {
  navyBlue: '#003366',
  vibrantBlue: '#4169E1',
  goldenYellow: '#FDB913',
};

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Welcome to UniTrade',
    description: 'Your campus marketplace for buying and selling products within your university community',
    icon: 'school',
    color: BRAND_COLORS.vibrantBlue,
  },
  {
    id: '2',
    title: 'Buy & Sell Easily',
    description: 'Browse thousands of products from fellow students. List your items in minutes and reach buyers instantly',
    icon: 'cart',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Secure Payments',
    description: 'Shop with confidence using secure payment methods. Choose between Paystack or cash on delivery',
    icon: 'shield-checkmark',
    color: BRAND_COLORS.goldenYellow,
  },
  {
    id: '4',
    title: 'Connect with Sellers',
    description: 'Chat directly with sellers, negotiate prices, and arrange meetups within your campus',
    icon: 'chatbubbles',
    color: '#8B5CF6',
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Bubble animations
  const bubble1 = useRef(new Animated.Value(0)).current;
  const bubble2 = useRef(new Animated.Value(0)).current;
  const bubble3 = useRef(new Animated.Value(0)).current;
  const bubble4 = useRef(new Animated.Value(0)).current;
  const bubble5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate bubbles
    const animateBubble = (bubble, duration, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(bubble, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(bubble, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateBubble(bubble1, 4000, 0);
    animateBubble(bubble2, 5000, 1000);
    animateBubble(bubble3, 6000, 2000);
    animateBubble(bubble4, 5500, 1500);
    animateBubble(bubble5, 4500, 500);
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    // Navigate to Login screen
    navigation.replace('Login');
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.slide}>
      {/* Icon/Logo Container */}
      {index === 0 ? (
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoInCircle}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.iconCircle}>
          <Ionicons name={item.icon} size={80} color={item.color} />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, styles.titleYellow]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {ONBOARDING_DATA.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: COLORS.white,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const getBubbleStyle = (bubble, startPos, endPos) => ({
    transform: [
      {
        translateY: bubble.interpolate({
          inputRange: [0, 1],
          outputRange: [startPos, endPos],
        }),
      },
    ],
    opacity: bubble.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.6, 0.3],
    }),
  });

  return (
    <LinearGradient
      colors={[BRAND_COLORS.navyBlue, BRAND_COLORS.vibrantBlue]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Animated Bubbles */}
      <Animated.View style={[styles.bubble, styles.bubble1, getBubbleStyle(bubble1, height, -100)]} />
      <Animated.View style={[styles.bubble, styles.bubble2, getBubbleStyle(bubble2, height, -150)]} />
      <Animated.View style={[styles.bubble, styles.bubble3, getBubbleStyle(bubble3, height, -120)]} />
      <Animated.View style={[styles.bubble, styles.bubble4, getBubbleStyle(bubble4, height, -180)]} />
      <Animated.View style={[styles.bubble, styles.bubble5, getBubbleStyle(bubble5, height, -100)]} />

      {/* Skip Button */}
      {currentIndex < ONBOARDING_DATA.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
      />

      {/* Dots Indicator */}
      {renderDots()}

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: currentIndex - 1,
                animated: true,
              });
            }}
          >
            <Ionicons name="arrow-back" size={24} color={BRAND_COLORS.vibrantBlue} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, currentIndex === 0 && styles.nextButtonFullWidth]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <View style={styles.nextButtonWhite}>
            <Text style={styles.nextButtonText}>
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={BRAND_COLORS.vibrantBlue} />
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Bubble styles
  bubble: {
    position: 'absolute',
    borderRadius: 9999,
  },
  bubble1: {
    width: 80,
    height: 80,
    left: 30,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bubble2: {
    width: 120,
    height: 120,
    right: 50,
    bottom: 0,
    backgroundColor: 'rgba(253, 185, 19, 0.2)', // Light yellow
  },
  bubble3: {
    width: 60,
    height: 60,
    left: width * 0.7,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  bubble4: {
    width: 100,
    height: 100,
    left: width * 0.2,
    bottom: 0,
    backgroundColor: 'rgba(253, 185, 19, 0.15)', // Light yellow
  },
  bubble5: {
    width: 70,
    height: 70,
    right: 100,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  logoInCircle: {
    width: 240,
    height: 150,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  titleYellow: {
    color: BRAND_COLORS.goldenYellow,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  nextButtonFullWidth: {
    marginLeft: 0,
  },
  nextButtonWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  nextButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: BRAND_COLORS.vibrantBlue,
  },
});

export default OnboardingScreen;
