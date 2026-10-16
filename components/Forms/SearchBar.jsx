import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radii, spacing, typography } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function SearchBar({ value, onChangeText, placeholder }) {
  const { t } = useLanguage();
  const searchLabel = placeholder || t('Search the menu');
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={searchLabel}
        placeholderTextColor={colors.textSubtle}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={searchLabel}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel={t('Clear search')}
        >
          <Ionicons name="close-circle" size={20} color={colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: layout.touchTarget,
    paddingLeft: spacing.md,
    gap: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, height: layout.touchTarget, ...typography.body, color: colors.text },
  clear: { width: layout.touchTarget, height: layout.touchTarget, alignItems: 'center', justifyContent: 'center' },
});
