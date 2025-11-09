import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/theme';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/orders/CartScreen';
import CheckoutScreen from '../screens/orders/CheckoutScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import OrderConfirmationScreen from '../screens/orders/OrderConfirmationScreen';
import PaymentScreen from '../screens/orders/PaymentScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import RateProductScreen from '../screens/products/RateProductScreen';
import SellerProfileScreen from '../screens/profile/SellerProfileScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import WishlistScreen from '../screens/profile/WishlistScreen';
import MyProductsScreen from '../screens/products/MyProductsScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import EditProductScreen from '../screens/products/EditProductScreen';
import AllProductsScreen from '../screens/products/AllProductsScreen';
import SellerProductDetailScreen from '../screens/products/SellerProductDetailScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/legal/TermsOfServiceScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/profile/AddPaymentMethodScreen';
import DeliveryAddressScreen from '../screens/profile/DeliveryAddressScreen';
import AddDeliveryAddressScreen from '../screens/profile/AddDeliveryAddressScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import SellerHelpSupportScreen from '../screens/profile/SellerHelpSupportScreen';
import BusinessProfileScreen from '../screens/profile/BusinessProfileScreen';
import SellerPaymentsScreen from '../screens/profile/SellerPaymentsScreen';
import SellerReviewsScreen from '../screens/profile/SellerReviewsScreen';
import SalesDashboardScreen from '../screens/profile/SalesDashboardScreen';
import PrivacySecurityScreen from '../screens/profile/PrivacySecurityScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';

const Stack = createStackNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AllProducts" 
      component={AllProductsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SellerProductDetail" 
      component={SellerProductDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SellerProfile" 
      component={SellerProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="RateProduct" 
      component={RateProductScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Cart" 
      component={CartScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Checkout" 
      component={CheckoutScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Payment" 
      component={PaymentScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="OrderConfirmation" 
      component={OrderConfirmationScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Messages Stack
const MessagesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MessagesMain" 
      component={MessagesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Wishlist" 
      component={WishlistScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MyProducts" 
      component={MyProductsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddProduct" 
      component={AddProductScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditProduct" 
      component={EditProductScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="OrderHistory" 
      component={OrderHistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacyPolicy" 
      component={PrivacyPolicyScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TermsOfService" 
      component={TermsOfServiceScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddPaymentMethod" 
      component={AddPaymentMethodScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="DeliveryAddress" 
      component={DeliveryAddressScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddDeliveryAddress" 
      component={AddDeliveryAddressScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="HelpSupport" 
      component={HelpSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SellerHelpSupport" 
      component={SellerHelpSupportScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="BusinessProfile" 
      component={BusinessProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SellerPayments" 
      component={SellerPaymentsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SellerReviews" 
      component={SellerReviewsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="SalesDashboard" 
      component={SalesDashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PrivacySecurity" 
      component={PrivacySecurityScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Language" 
      component={LanguageScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="About" 
      component={AboutScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="DeleteAccount" 
      component={DeleteAccountScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeStack} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Messages" component={MessagesStack} />
      <Stack.Screen name="Profile" component={ProfileStack} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
