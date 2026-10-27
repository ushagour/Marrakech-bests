import { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import colors from '../config/colors';
import AppButton from '../components/Forms/AppButton';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../context/FeedbackContext';
import { useLanguage } from '../context/LanguageContext';

const OnboardingScreen = ({ navigation }) => {
  const { createGuestUser, markOnboardingComplete } = useAuth();
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const floatProgress = useSharedValue(0);
  const logoMotionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -8 * floatProgress.value },
      { rotate: `${2 * floatProgress.value - 1}deg` },
    ],
  }));

  useEffect(() => {
    floatProgress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    return () => cancelAnimation(floatProgress);
  }, [floatProgress]);

  const handleExploreMenu = async () => {
    const saved = await markOnboardingComplete();
    createGuestUser();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    if (!saved) {
      showToast(t('Could not save onboarding. You may see this screen again.'), { type: 'error' });
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(650)} style={styles.wrapper}>
          <Animated.View style={[styles.logoMotion, logoMotionStyle]}>
            <Image
              source={require('../assets/small_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(180).duration(500)} style={styles.title}>
            {t('Welcome to Marrakech Bites')}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={styles.subtitle}>
            {t('Discover bold Moroccan-inspired street food, made for sharing and enjoying anywhere.')}
          </Animated.Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(500)} style={styles.buttonsContainer}>
          <AppButton
            title={t('Explore the menu')}
            onPress={handleExploreMenu}
            color="primary1"
            buttonStyle={styles.button}
            textStyle={styles.buttonText}
          />
          <Text style={styles.signInNote}>
            {t('You can sign in when you are ready to place an order.')}
          </Text>
        </Animated.View>
      </View>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 3.2,
  },
  logoMotion: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
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
  signInNote: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
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