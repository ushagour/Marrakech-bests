import * as Font from 'expo-font';
import { useState, useEffect } from 'react';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Add your fonts here with custom names






        await Font.loadAsync({
          "Karla-Regular": require("../assets/fonts/Karla-Regular.ttf"),
          "Karla-Medium": require("../assets/fonts/Karla-Medium.ttf"),
          "Karla-Bold": require("../assets/fonts/Karla-Bold.ttf"),
          "MarkaziText-Regular": require("../assets/fonts/MarkaziText-Regular.ttf"),
          "MarkaziText-Medium": require("../assets/fonts/MarkaziText-Medium.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontError(error);
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, fontError };
};
