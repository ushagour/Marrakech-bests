import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MaskedTextInput } from 'react-native-mask-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AppButton from '../components/Forms/AppButton';
import TextField from '../components/Forms/TextField';
import IsAuthWrapper from '../components/ui/IsAuthWrapper';
import { SettingsGroup, SettingsRow } from '../components/ui/SettingsRow';
import { useAuth } from '../hooks/useAuth';
import { useFeedback } from '../context/FeedbackContext';
import { syncMenuDatabase } from '../database/queries';
import getEnvVars from '../config/environment';
import { navigationRef } from '../navigation/navigationRef';
import { colors, layout, radii, shadows, spacing, typography } from '../config/theme';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';

const PREF_KEYS = [
  ['prefOrderStatus', 'Order status changes'],
  ['prefPasswordChanges', 'Password changes'],
  ['prefSpecialOffers', 'Special offers'],
  ['prefNewsletter', 'Newsletter'],
];

function LanguageRow() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <SettingsRow
      icon="language-outline"
      label={t('Language')}
      value={t(LANGUAGES.find(({ code }) => code === language)?.label || 'English')}
      onPress={() => Alert.alert(t('Choose language'), undefined, LANGUAGES.map(({ code, label }) => ({
        text: t(label),
        onPress: () => setLanguage(code),
      })))}
    />
  );
}

const fromUser = (user) => ({
  firstName: user?.firstName || '',
  lastName: user?.lastName || '',
  email: user?.email || '',
  phone: user?.phone || '',
  avatar: user?.avatar || null,
  prefOrderStatus: Boolean(user?.prefOrderStatus),
  prefPasswordChanges: Boolean(user?.prefPasswordChanges),
  prefSpecialOffers: Boolean(user?.prefSpecialOffers),
  prefNewsletter: Boolean(user?.prefNewsletter),
});

const ProfileScreen = ({ navigation }) => {
  const { user, updateUser, logout, isGuest } = useAuth();
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(fromUser(user));
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setProfile(fromUser(user));
  }, [user]);

  const original = useMemo(() => fromUser(user), [user]);
  const dirty = JSON.stringify(original) !== JSON.stringify(profile);
  const phoneRaw = (profile.phone || '').replace(/\D/g, '');
  const phoneError = phoneRaw.length > 0 && phoneRaw.length !== 12;
  const initials = `${(profile.firstName[0] || '').toUpperCase()}${(profile.lastName[0] || '').toUpperCase()}`;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  const update = (key) => (value) => setProfile((p) => ({ ...p, [key]: value }));

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast(t('Allow photo access to choose a picture.'), { type: 'error' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled && result.assets?.length) {
        update('avatar')(result.assets[0].uri);
      }
    } catch {
      showToast(t('Failed to pick image.'), { type: 'error' });
    }
  };

  const onAvatarPress = () => {
    if (!profile.avatar) return pickImage();
    Alert.alert(t('Profile picture'), undefined, [
      { text: t('Choose new photo'), onPress: pickImage },
      { text: t('Remove photo'), style: 'destructive', onPress: () => update('avatar')(null) },
      { text: t('Cancel'), style: 'cancel' },
    ]);
  };

  const save = async () => {
    setSaving(true);
    try {
      const ok = await updateUser({ ...profile, isUserOnboarded: user?.isUserOnboarded === true });
      showToast(ok ? t('Profile updated.') : t('Unable to save your profile.'), { type: ok ? 'success' : 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('Log out'), t('Are you sure you want to log out?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Log out'),
        style: 'destructive',
        onPress: async () => {
          const ok = await logout();
          if (ok) {
            navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          } else {
            showToast(t('Failed to log out. Please try again.'), { type: 'error' });
          }
        },
      },
    ]);
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await syncMenuDatabase(db, getEnvVars.API_URL);
      if (result.success) {
        showToast(t('Menu synced · {count} items.', { count: result.count }), { type: 'success' });
        navigation.navigate('Home');
      } else {
        showToast(result.error || t('Sync failed.'), { type: 'error' });
      }
    } catch (e) {
      showToast(t('Failed to sync the menu.'), { type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  if (isGuest) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, styles.pad]}>{t('Profile')}</Text>
        <IsAuthWrapper navigation={navigation} />
        <View style={styles.pad}>
          <SettingsGroup title={t('Settings')}>
            <LanguageRow />
          </SettingsGroup>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: layout.tabBarHeight + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={styles.identity}>
          <Pressable onPress={onAvatarPress} accessibilityRole="button" accessibilityLabel={t('Change profile picture')}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                {initials ? (
                  <Text style={styles.initials}>{initials}</Text>
                ) : (
                  <Ionicons name="person" size={40} color={colors.brand} />
                )}
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color={colors.textOnBrand} />
            </View>
          </Pressable>
          <Text style={styles.name}>{fullName || t('Your profile')}</Text>
          {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <SettingsGroup title={t('Personal details')}>
            <View style={styles.form}>
              <TextField label={t('First name')} value={profile.firstName} onChangeText={update('firstName')} />
              <TextField label={t('Last name')} value={profile.lastName} onChangeText={update('lastName')} />
              <TextField
                label={t('Email')}
                value={profile.email}
                onChangeText={update('email')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View>
                <Text style={styles.fieldLabel}>{t('Phone')}</Text>
                <View style={[styles.phoneField, phoneError && styles.phoneError]}>
                  <MaskedTextInput
                    mask="+212 [6-9]99 999-9999"
                    value={profile.phone}
                    onChangeText={update('phone')}
                    placeholder="+212 600 000-0000"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="phone-pad"
                    style={styles.phoneInput}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{t('Enter a valid Moroccan number (+212 and 9 digits).')}</Text> : null}
              </View>

              {dirty ? (
                <Animated.View entering={FadeInDown.duration(200)}>
                  <AppButton
                    variant="primary"
                    title={t('Save changes')}
                    onPress={save}
                    loading={saving}
                    disabled={phoneError}
                  />
                  <AppButton variant="text" title={t('Discard')} onPress={() => setProfile(original)} />
                </Animated.View>
              ) : null}
            </View>
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(300)}>
          <SettingsGroup title={t('Email notifications')}>
            {PREF_KEYS.map(([key, label], i) => (
              <SettingsRow
                key={key}
                label={t(label)}
                switchValue={profile[key]}
                onSwitchChange={update(key)}
                last={i === PREF_KEYS.length - 1}
              />
            ))}
          </SettingsGroup>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <SettingsGroup title={t('Settings')}>
            <LanguageRow />
            <SettingsRow icon="lock-closed-outline" label={t('Change password')} onPress={() => navigation.getParent()?.navigate('ChangePassword')} />
            <SettingsRow
              icon="sync-outline"
              label={t('Sync database')}
              value={syncing ? t('Working…') : undefined}
              onPress={handleSync}
              last
            />
          </SettingsGroup>
        </Animated.View>

        <AppButton variant="text" title={t('Log out')} onPress={handleLogout} textStyle={styles.logoutText} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pad: { paddingHorizontal: spacing.md },
  content: { paddingHorizontal: spacing.md },
  title: { ...typography.h1, color: colors.text },
  identity: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  initials: { ...typography.h1, color: colors.brand },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: { ...typography.h2, color: colors.text, marginTop: spacing.md },
  email: { ...typography.small, color: colors.textMuted },
  form: { padding: spacing.md },
  fieldLabel: { ...typography.small, fontFamily: 'Karla-Bold', color: colors.text, marginBottom: spacing.xs },
  phoneField: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  phoneError: { borderColor: colors.danger },
  phoneInput: { ...typography.body, color: colors.text, minHeight: layout.touchTarget },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  logoutText: { color: colors.textMuted, ...typography.small },
});
