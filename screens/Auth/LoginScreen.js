import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AuthLayout from '../../components/auth/AuthLayout';
import TextField from '../../components/Forms/TextField';
import AppButton from '../../components/Forms/AppButton';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../context/FeedbackContext';
import { spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const passwordRef = useRef(null);

  const emailError = touched.email && !EMAIL_RE.test(email) ? t('Enter a valid email address.') : null;
  const passwordError = touched.password && password.length < 6 ? t('At least 6 characters.') : null;
  const valid = EMAIL_RE.test(email) && password.length >= 6;

  const handleLogin = async () => {
    if (!valid) {
      setTouched({ email: true, password: true });
      showToast(t('Please fix the highlighted fields.'), { type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const success = await login({ email, password });
      if (success) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        showToast(t('Failed to log in. Please try again.'), { type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('Welcome back')} subtitle={t('Log in to order your favourites.')}>
      <TextField
        label={t('Email')}
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder={t('you@example.com')}
      />
      <TextField
        ref={passwordRef}
        label={t('Password')}
        value={password}
        onChangeText={setPassword}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        error={passwordError}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
        placeholder={t('Your password')}
      />

      <AppButton variant="primary" title={t('Log in')} onPress={handleLogin} loading={submitting} />

      <View style={styles.secondary}>
        <AppButton variant="secondary" title={t('Create account')} onPress={() => navigation.navigate('Register')} />
        <AppButton variant="text" title={t('Continue as guest')} onPress={() => navigation.navigate('Onboarding')} />
      </View>
    </AuthLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  secondary: { marginTop: spacing.md },
});
