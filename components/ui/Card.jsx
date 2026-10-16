import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, layout, radii, shadows, spacing, typography } from '../../config/theme';
import { getImageUrl } from '../../api/getImageUrl';
import { formatPriceMAD } from '../../utils/currency';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useFeedback } from '../../context/FeedbackContext';
import { hapticSuccess, hapticWarning } from '../../utils/haptics';
import { Skeleton } from './Skeleton';
import { useLanguage } from '../../context/LanguageContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Card = React.memo(({ item, index = 0 }) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast, showAddedToCart } = useFeedback();
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const scale = useSharedValue(1);
  const addScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const addStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));

  const unavailable = item.available === false;
  const canOrder = Boolean(user && !user.isGuest && user.isUserOnboarded);

  const handleQuickAdd = async () => {
    if (unavailable) return;
    if (!canOrder) {
      hapticWarning();
      showToast(t('Sign in to add items to your cart.'), {
        type: 'info',
        action: { label: t('Sign in'), onPress: () => navigation.navigate('Login') },
      });
      return;
    }
    addScale.value = withSpring(0.8, { damping: 6 }, () => {
      addScale.value = withSpring(1);
    });
    const ok = await addToCart(item, [], 1);
    if (ok) {
      hapticSuccess();
      showAddedToCart(item, 1, parseFloat(item.price) || 0);
    } else {
      showToast(t('Could not add the item. Please try again.'), { type: 'error' });
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(300)}>
      <AnimatedPressable
        style={[styles.card, cardStyle]}
        onPress={() => navigation.navigate('Details', { item })}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 20 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20 });
        }}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${formatPriceMAD(item.price)}`}
        testID={`card-${item.name}`}
      >
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            recyclingKey={item.id}
            onLoadEnd={() => setLoaded(true)}
            accessibilityLabel={`${item.name} photo`}
          />
          {!loaded ? <Skeleton height="100%" radius={0} style={StyleSheet.absoluteFill} /> : null}

          {item.rating ? (
            <View style={styles.rating}>
              <MaterialIcons name="star" size={14} color="#F5A623" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          ) : null}

          {unavailable ? (
            <View style={styles.soldOut}>
              <Text style={styles.soldOutText}>{t('Out of stock')}</Text>
            </View>
          ) : (
            <AnimatedPressable
              onPress={handleQuickAdd}
              style={[styles.addButton, addStyle]}
              accessibilityRole="button"
              accessibilityLabel={t('Add {name} to cart', { name: item.name })}
            >
              <MaterialIcons name="add" size={28} color={colors.text} />
            </AnimatedPressable>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.price}>{formatPriceMAD(item.price)}</Text>
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          {item.prepareTime ? (
            <View style={styles.meta}>
              <MaterialIcons name="schedule" size={14} color={colors.textSubtle} />
              <Text style={styles.metaText}>{item.prepareTime}</Text>
            </View>
          ) : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageWrap: { height: 168, backgroundColor: colors.border },
  image: { width: '100%', height: '100%' },
  rating: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  ratingText: { ...typography.caption, color: colors.text },
  addButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: layout.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    ...shadows.md,
  },
  soldOut: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
  },
  soldOutText: { ...typography.caption, color: colors.danger },
  body: { padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.title, color: colors.text, flex: 1 },
  price: { ...typography.title, color: colors.peach },
  description: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  metaText: { ...typography.caption, color: colors.textSubtle },
});
