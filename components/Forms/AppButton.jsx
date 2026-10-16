import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import colors from '../../config/colors';
import { colors as tokens, layout, radii, spacing, typography } from '../../config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANTS = {
  primary: {
    container: { backgroundColor: tokens.brand },
    text: { color: tokens.textOnBrand },
    spinner: tokens.textOnBrand,
  },
  secondary: {
    container: { backgroundColor: tokens.surface, borderWidth: 1.5, borderColor: tokens.brand },
    text: { color: tokens.brand },
    spinner: tokens.brand,
  },
  accent: {
    container: { backgroundColor: tokens.accent },
    text: { color: tokens.text },
    spinner: tokens.text,
  },
  danger: {
    container: { backgroundColor: tokens.danger },
    text: { color: tokens.textOnBrand },
    spinner: tokens.textOnBrand,
  },
  text: {
    container: { backgroundColor: 'transparent' },
    text: { color: tokens.brand },
    spinner: tokens.brand,
  },
};

/**
 * `variant` ("primary" | "secondary" | "accent" | "danger" | "text") opts into the
 * theme-based design: full width, 48dp tall. Without it the legacy `color` prop applies.
 */
function AppButton({
  title,
  children,
  onPress,
  color = 'primary1',
  variant,
  loading = false,
  icon,
  buttonStyle,
  textStyle,
  disabled = false,
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;
  const v = variant ? VARIANTS[variant] : null;

  return (
    <AnimatedPressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 });
      }}
      style={[
        v ? styles.variantButton : styles.button,
        v ? v.container : { backgroundColor: colors[color] },
        buttonStyle,
        isDisabled ? styles.buttonDisabled : null,
        animatedStyle,
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={v ? v.spinner : colors.white} />
      ) : children ? (
        <View>{children}</View>
      ) : (
        <View style={styles.row}>
          {icon}
          <Text style={[v ? styles.variantText : styles.text, v ? v.text : null, textStyle]}>{title}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.black,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  button: {
    marginTop: 24,
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  variantButton: {
    minHeight: layout.touchTarget,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  variantText: { ...typography.button },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  buttonDisabled: { opacity: 0.5 },
});

export default AppButton;
