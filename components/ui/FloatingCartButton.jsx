import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../hooks/useCart';
import { colors, layout, shadows, spacing, typography } from '../../config/theme';
import { navigateTo } from '../../navigation/navigationRef';
import { useLanguage } from '../../context/LanguageContext';

const SIZE = 56;

export default function FloatingCartButton() {
  const { cartItems } = useCart();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const count = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const bump = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      bump.value = withSequence(withSpring(1.3, { damping: 6 }), withSpring(1));
    }
  }, [count, bump]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

  if (count === 0) return null;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(14)}
      exiting={ZoomOut.duration(150)}
      style={[styles.wrap, { bottom: insets.bottom + layout.tabBarHeight + spacing.md }]}
    >
      <Pressable
        onPress={() => navigateTo('Checkout')}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={t('View cart, {count} items', { count })}
      >
        <Ionicons name="cart" size={26} color={colors.textOnBrand} />
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: spacing.md },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    ...shadows.lg,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    paddingHorizontal: spacing.xs,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: { ...typography.caption, color: colors.text, fontFamily: 'Karla-Bold' },
});
