import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/Home';
import OrdersScreen from '../screens/OrdersScreen';
import DetailScreen from '../screens/DetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ChangePassword from '../screens/Auth/ChangePassword';
import FloatingCartButton from '../components/ui/FloatingCartButton';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { navigationRef } from './navigationRef';
import { colors, layout, typography } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: ['restaurant', 'restaurant-outline'],
  Orders: ['receipt', 'receipt-outline'],
  Profile: ['person', 'person-outline'],
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useOrders();
  const { t } = useLanguage();

  return (
    <View style={styles.flex}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textSubtle,
          tabBarLabelStyle: typography.caption,
          tabBarStyle: {
            height: layout.tabBarHeight + insets.bottom,
            paddingBottom: insets.bottom,
            paddingTop: 4,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          tabBarBadgeStyle: { backgroundColor: colors.peach, color: colors.text },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={24} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('Menu'), tabBarLabel: t('Menu') }} />
        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ title: t('Orders'), tabBarLabel: t('Orders'), tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('Profile'), tabBarLabel: t('Profile') }} />
      </Tab.Navigator>
      <FloatingCartButton />
    </View>
  );
}

export default function AppNavigator() {
  const { isUserOnboarded, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isUserOnboarded ? 'Main' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Details" component={DetailScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
