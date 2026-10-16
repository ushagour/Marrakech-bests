import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';

export const ORDER_STEPS = ['Placed', 'Preparing', 'On the way', 'Delivered'];

const STATUS_TO_STEP = { placed: 0, preparing: 1, ready: 2, delivered: 3 };

export function statusToStep(status) {
  return STATUS_TO_STEP[status] ?? 0;
}

export default function OrderStepper({ status, compact = false }) {
  const { t } = useLanguage();
  const cancelled = status === 'cancelled';
  const current = statusToStep(status);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(cancelled ? 0 : current / (ORDER_STEPS.length - 1), { duration: 600 });
  }, [current, cancelled, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  if (cancelled) {
    return (
      <View style={styles.cancelled}>
        <Ionicons name="close-circle" size={18} color={colors.danger} />
        <Text style={styles.cancelledText}>{t('Order cancelled')}</Text>
      </View>
    );
  }

  const dot = compact ? 16 : 24;

  return (
    <View accessibilityRole="progressbar" accessibilityLabel={t('Order status: {status}', { status: t(ORDER_STEPS[current]) })}>
      <View style={styles.track}>
        <View style={[styles.rail, { top: dot / 2 - 2 }]}>
          <Animated.View style={[styles.railFill, fillStyle]} />
        </View>
        {ORDER_STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <View key={label} style={styles.step}>
              <View
                style={[
                  styles.dot,
                  { width: dot, height: dot, borderRadius: dot / 2 },
                  (done || active) && styles.dotOn,
                  active && styles.dotActive,
                ]}
              >
                {done || (active && current === ORDER_STEPS.length - 1) ? (
                  <Ionicons name="checkmark" size={dot - 8} color={colors.textOnBrand} />
                ) : null}
              </View>
              <Text style={[styles.label, (done || active) && styles.labelOn, compact && styles.labelCompact]} numberOfLines={1}>
                {t(label)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', justifyContent: 'space-between' },
  rail: {
    position: 'absolute',
    left: '12.5%',
    right: '12.5%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  railFill: { height: 4, borderRadius: 2, backgroundColor: colors.brand },
  step: { flex: 1, alignItems: 'center' },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  dotActive: { borderColor: colors.accent, borderWidth: 3 },
  label: { ...typography.caption, color: colors.textSubtle, marginTop: spacing.xs, textAlign: 'center' },
  labelCompact: { fontSize: 11 },
  labelOn: { color: colors.text, fontFamily: 'Karla-Bold' },
  cancelled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
  },
  cancelledText: { ...typography.small, fontFamily: 'Karla-Bold', color: colors.danger },
});
