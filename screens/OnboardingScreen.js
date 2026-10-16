import { StyleSheet, Text, View, Image } from 'react-native';
import colors from '../config/colors';
import { ScrollView } from 'react-native-gesture-handler';
import AppButton from '../components/Forms/AppButton';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';

const OnboardingScreen = ({ navigation }) => {
  const { createGuestUser } = useAuth();
  const { t } = useLanguage();

  const handleContinueAsGuest = () => {
    createGuestUser();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };


  return (
    <View style={styles.container}>
      {/* <Hero /> */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.wrapper}>
          <Image
            source={require('../assets/small_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            {t('Discover bold Moroccan-inspired street food, made for sharing and enjoying anywhere.')}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <AppButton
            title={t('Login')}
            onPress={() => navigation.navigate('Login')}
            color="primary1"
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
          />

          <AppButton
            title={t('Sign Up')}
            onPress={() => navigation.navigate('Register')}
            color="primary2"
            buttonStyle={styles.button}
          />

          <AppButton
           onPress={handleContinueAsGuest}
              title={t('Continue as Guest')}
              textStyle={styles.guestButtonText}
              buttonStyle={styles.guestButton}
            color=""

          />
        </View>
      </ScrollView>
      <View style={styles.copyright}>
        <Text style={styles.copyrightText}>{t('© 2026 Marrakech Bites. All rights reserved.')}</Text>
      </View>
    </View>
  );
};

export default OnboardingScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 3.2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 6,
    marginTop: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    width: '100%',
    marginTop: 12,
    borderRadius: 6,
    borderWidth: 1,
    fontFamily: 'Karla-Bold',
    borderColor: colors.primary1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: colors.primary1,
    fontSize: 16,
    fontWeight: '600',
  },
  copyright: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  copyrightText: {
    color: colors.textPrimary,
    fontSize: 12,
    textAlign: 'center',
  },
});