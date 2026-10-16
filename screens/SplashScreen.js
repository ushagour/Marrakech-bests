import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const SplashScreen = ({ onGetStarted = () => {} }) => {
  const { t } = useLanguage();
  return (
   <ImageBackground
        blurRadius={15}
        style={styles.background}
        source={require("../assets/Hero.png")}
      >
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={require("../assets/Logo.png")} />
        </View>
        <View style={styles.splashContainer}>
          <Text style={styles.copyrightText}>{t('V1.0 Copyright © 2025')}</Text>
        </View>
      </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonsContainer: {
    padding: 40,
    width: "100%",
  },

  logoContainer: {
    position: "absolute",
    top: 70,
    alignItems: "center",

  },
  tagline: {
    fontSize: 25,
    color: "white",
    fontFamily: "Arial",
    fontStyle: "bold",
    fontWeight: "600",
    paddingVertical: 20,
  },
  splashContainer: {
    position: 'absolute',
    bottom: 20, // Adjust based on the layout
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});