import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Easing,
  ActivityIndicator,
} from 'react-native';

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const spinner1 = useRef(new Animated.Value(0)).current;
  const spinner2 = useRef(new Animated.Value(0)).current;
  const spinner3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Spinner rotations with different speeds
    Animated.loop(
      Animated.timing(spinner1, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(spinner2, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(spinner3, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spin1 = spinner1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spin2 = spinner2.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const spin3 = spinner3.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Orbital rings around logo */}
      <Animated.View style={[styles.orbitContainer, { opacity: logoOpacity }]}>
        {/* Outer ring - Navy Blue */}
        <Animated.View 
          style={[
            styles.orbitRing,
            styles.outerRing,
            { transform: [{ rotate: spin1 }] }
          ]}
        >
          <View style={[styles.orbitDot, styles.navyDot]} />
        </Animated.View>

        {/* Middle ring - Vibrant Blue */}
        <Animated.View 
          style={[
            styles.orbitRing,
            styles.middleRing,
            { transform: [{ rotate: spin2 }] }
          ]}
        >
          <View style={[styles.orbitDot, styles.blueDot]} />
        </Animated.View>

        {/* Inner ring - Golden Yellow */}
        <Animated.View 
          style={[
            styles.orbitRing,
            styles.innerRing,
            { transform: [{ rotate: spin3 }] }
          ]}
        >
          <View style={[styles.orbitDot, styles.goldenDot]} />
        </Animated.View>
      </Animated.View>

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Version number */}
      <Animated.Text style={[styles.version, { opacity: logoOpacity }]}>
        Version 1.0.0
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitRing: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  outerRing: {
    width: 200,
    height: 200,
  },
  middleRing: {
    width: 160,
    height: 160,
  },
  innerRing: {
    width: 120,
    height: 120,
  },
  orbitDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navyDot: {
    backgroundColor: '#003366',
  },
  blueDot: {
    backgroundColor: '#4169E1',
  },
  goldenDot: {
    backgroundColor: '#FDB913',
  },
  logoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 70,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default SplashScreen;
