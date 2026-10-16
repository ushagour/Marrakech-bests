import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, radii, shadows, spacing, typography } from '../../config/theme';

export function SettingsGroup({ title, children }) {
  return (
    <View style={styles.group}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

export function SettingsRow({ icon, label, value, onPress, switchValue, onSwitchChange, last = false, destructive = false, loading = false }) {
  const isSwitch = typeof switchValue === 'boolean';
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      accessibilityRole={isSwitch ? 'switch' : onPress ? 'button' : undefined}
      accessibilityLabel={label}
      style={[styles.row, !last && styles.rowDivider]}
    >
      {icon ? <Ionicons name={icon} size={22} color={destructive ? colors.danger : colors.brand} /> : null}
      <Text style={[styles.label, destructive && { color: colors.danger }]}>{label}</Text>
      {value ? <Text style={styles.value}>{loading ? 'Working…' : value}</Text> : null}
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ true: colors.brand, false: colors.border }}
          thumbColor={colors.surface}
        />
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.lg },
  groupTitle: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  groupCard: { backgroundColor: colors.surface, borderRadius: radii.lg, ...shadows.sm, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.touchTarget + spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { ...typography.body, color: colors.text, flex: 1 },
  value: { ...typography.small, color: colors.textMuted },
});
