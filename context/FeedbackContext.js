import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutUp,
  SlideInDown,
  SlideOutDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography, layout } from '../config/theme';
import { getImageUrl } from '../api/getImageUrl';
import { formatPriceMAD } from '../utils/currency';
import { navigateTo } from '../navigation/navigationRef';
import AppButton from '../components/Forms/AppButton';
import { useLanguage } from './LanguageContext';

const FeedbackContext = createContext(null);

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within a FeedbackProvider');
  return ctx;
};

const TOAST_ICONS = {
  success: { name: 'checkmark-circle', color: colors.success },
  error: { name: 'alert-circle', color: colors.danger },
  info: { name: 'information-circle', color: colors.info },
};

function Toast({ toast, onDismiss }) {
  const insets = useSafeAreaInsets();
  const icon = TOAST_ICONS[toast.type] || TOAST_ICONS.info;

  return (
    <Animated.View
      key={toast.id}
      entering={FadeInUp.duration(220)}
      exiting={FadeOutUp.duration(180)}
      style={[styles.toastWrap, { top: insets.top + spacing.sm }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onDismiss}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.toast}
      >
        <Ionicons name={icon.name} size={22} color={icon.color} />
        <Text style={styles.toastText} numberOfLines={3}>
          {toast.message}
        </Text>
        {toast.action ? (
          <Pressable
            onPress={() => {
              onDismiss();
              toast.action.onPress();
            }}
            hitSlop={8}
            style={styles.toastAction}
            accessibilityRole="button"
          >
            <Text style={styles.toastActionText}>{toast.action.label}</Text>
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

function AddedToCartSheet({ data, onClose }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const imageUrl = data.item?.image ? getImageUrl(data.item.image) : null;

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 800) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(160)}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={t('Dismiss')}
        />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.springify().damping(18)}
        exiting={SlideOutDown.duration(180)}
        style={styles.sheetPosition}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sheet, dragStyle, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.sheetTitle}>{t('Added to cart')}</Text>
            </View>

            <View style={styles.sheetItem}>
              <Image
                source={imageUrl ? { uri: imageUrl } : undefined}
                style={styles.sheetImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              <View style={styles.sheetItemInfo}>
                <Text style={styles.sheetItemName} numberOfLines={2}>
                  {data.item?.name}
                </Text>
                <Text style={styles.sheetItemMeta}>
                  {t('Qty {quantity} · {price}', { quantity: data.quantity, price: formatPriceMAD(data.total) })}
                </Text>
              </View>
            </View>

            <AppButton
              variant="primary"
              title={t('View cart')}
              onPress={() => {
                onClose();
                navigateTo('Checkout');
              }}
            />
            <AppButton variant="text" title={t('Keep browsing')} onPress={onClose} />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(null);
  const timer = useRef(null);

  const dismissToast = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback((message, options = {}) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, type: options.type || 'info', action: options.action });
    timer.current = setTimeout(() => setToast(null), options.duration || 3000);
  }, []);

  const showAddedToCart = useCallback((item, quantity = 1, total = 0) => {
    setSheet({ item, quantity, total });
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(
    () => ({ showToast, showAddedToCart }),
    [showToast, showAddedToCart]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {sheet ? <AddedToCartSheet data={sheet} onClose={closeSheet} /> : null}
      {toast ? <Toast toast={toast} onDismiss={dismissToast} /> : null}
    </FeedbackContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget,
    maxWidth: 520,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  toastText: { ...typography.small, color: colors.text, flexShrink: 1 },
  toastAction: { minHeight: layout.touchTarget, justifyContent: 'center', paddingLeft: spacing.sm },
  toastActionText: { ...typography.bodyStrong, color: colors.brand },
  sheetPosition: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    ...shadows.lg,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sheetTitle: { ...typography.h2, color: colors.text },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  sheetImage: { width: 64, height: 64, borderRadius: radii.sm, backgroundColor: colors.border },
  sheetItemInfo: { flex: 1 },
  sheetItemName: { ...typography.bodyStrong, color: colors.text },
  sheetItemMeta: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
});
