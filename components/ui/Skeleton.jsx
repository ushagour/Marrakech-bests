import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, shadows, spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';

export function Skeleton({ width = '100%', height = 16, radius = radii.sm, style }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.border }, animated, style]}
    />
  );
}

export function MenuCardSkeleton() {
  const { t } = useLanguage();
  return (
    <View style={styles.card} accessibilityLabel={t('Loading menu item')}>
      <Skeleton height={168} radius={0} />
      <View style={styles.body}>
        <Skeleton width="60%" height={20} />
        <Skeleton height={14} style={styles.line} />
        <Skeleton width="80%" height={14} style={styles.line} />
        <Skeleton width={80} height={20} style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  body: { padding: spacing.md },
  line: { marginTop: spacing.sm },
});
