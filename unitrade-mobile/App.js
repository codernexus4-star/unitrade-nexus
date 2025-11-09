import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { CustomAlertComponent } from './src/components/CustomAlert';
import ErrorBoundary from './src/components/ErrorBoundary';

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  if (isSplashVisible) {
    return <SplashScreen onFinish={() => setIsSplashVisible(false)} />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </CartProvider>
        <CustomAlertComponent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
