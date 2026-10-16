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
const NAME_RE = /^[\p{L}\s]+$/u;

const RegisterScreen = ({ navigation }) => {
  const { completeOnboarding } = useAuth();
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const lastRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const touch = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const errors = {
    firstName: !NAME_RE.test(form.firstName.trim()) ? t('Letters and spaces only.') : null,
    email: !EMAIL_RE.test(form.email) ? t('Enter a valid email address.') : null,
    password: form.password.length < 6 ? t('At least 6 characters.') : null,
    confirm: form.confirm !== form.password ? t('Passwords do not match.') : null,
  };
  const valid = !Object.values(errors).some(Boolean);
  const shown = (key) => (touched[key] ? errors[key] : null);

  const handleRegister = async () => {
    if (!valid) {
      setTouched({ firstName: true, email: true, password: true, confirm: true });
      showToast(t('Please fix the highlighted fields.'), { type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const success = await completeOnboarding({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      });
      if (success) {
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        showToast(t('Failed to register. Please try again.'), { type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('Create account')} subtitle={t('It takes less than a minute.')}>
      <TextField
        label={t('First name')}
        value={form.firstName}
        onChangeText={set('firstName')}
        onBlur={touch('firstName')}
        error={shown('firstName')}
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        onSubmitEditing={() => lastRef.current?.focus()}
      />
      <TextField
        ref={lastRef}
        label={t('Last name (optional)')}
        value={form.lastName}
        onChangeText={set('lastName')}
        autoComplete="family-name"
        textContentType="familyName"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        label={t('Email')}
        value={form.email}
        onChangeText={set('email')}
        onBlur={touch('email')}
        error={shown('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label={t('Password')}
        value={form.password}
        onChangeText={set('password')}
        onBlur={touch('password')}
        error={shown('password')}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        ref={confirmRef}
        label={t('Confirm password')}
        value={form.confirm}
        onChangeText={set('confirm')}
        onBlur={touch('confirm')}
        error={shown('confirm')}
        secureTextEntry
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleRegister}
      />

      <AppButton variant="primary" title={t('Sign up')} onPress={handleRegister} loading={submitting} />

      <View style={styles.secondary}>
        <AppButton variant="secondary" title={t('I already have an account')} onPress={() => navigation.navigate('Login')} />
        <AppButton variant="text" title={t('Continue as guest')} onPress={() => navigation.navigate('Onboarding')} />
      </View>
    </AuthLayout>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  secondary: { marginTop: spacing.md },
});
