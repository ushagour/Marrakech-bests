import * as React from 'react';

import SplashScreen from './screens/SplashScreen';
import AppNavigator from './navigation/AppNavigator';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts } from './hooks/useFonts';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider, useLanguage } from './context/LanguageContext';


export default function App() {
  const { fontsLoaded } = useFonts();

  if (!fontsLoaded) {
    // Show splash while loading fonts
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <SplashScreen />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isRTL } = useLanguage();

  return (
      <GestureHandlerRootView style={[{ flex: 1 }, { direction: isRTL ? 'rtl' : 'ltr' }]}>
        <StatusBar style="dark" />
        <AuthProvider>
          <OrderProvider>
            <CartProvider>
              <FeedbackProvider>
                <SQLiteProvider databaseName="little_lemon.db">
                  <AppNavigator />
                </SQLiteProvider>
              </FeedbackProvider>
            </CartProvider>
          </OrderProvider>
        </AuthProvider>
      </GestureHandlerRootView>
  );
}
