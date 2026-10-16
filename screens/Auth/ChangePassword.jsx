import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextField from '../../components/Forms/TextField';
import AppButton from '../../components/Forms/AppButton';
import { useFeedback } from '../../context/FeedbackContext';
import { colors, spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';

const ChangePassword = ({ navigation }) => {
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({});

  const errors = {
    current: current.length < 6 ? t('At least 6 characters.') : null,
    next: next.length < 8 ? t('At least 8 characters.') : null,
    confirm: confirm !== next ? t('Passwords do not match.') : null,
  };
  const valid = !Object.values(errors).some(Boolean);
  const shown = (k) => (touched[k] ? errors[k] : null);
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = () => {
    if (!valid) {
      setTouched({ current: true, next: true, confirm: true });
      showToast(t('Please fix the highlighted fields.'), { type: 'error' });
      return;
    }
    // Simulated: no backend call exists for password changes.
    showToast(t('Password changed.'), { type: 'success' });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={t('Change password')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label={t('Current password')} value={current} onChangeText={setCurrent} onBlur={touch('current')} error={shown('current')} secureTextEntry />
        <TextField label={t('New password')} value={next} onChangeText={setNext} onBlur={touch('next')} error={shown('next')} secureTextEntry />
        <TextField label={t('Confirm new password')} value={confirm} onChangeText={setConfirm} onBlur={touch('confirm')} error={shown('confirm')} secureTextEntry />
        <View>
          <AppButton variant="primary" title={t('Update password')} onPress={submit} />
          <AppButton variant="text" title={t('Cancel')} onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
});
