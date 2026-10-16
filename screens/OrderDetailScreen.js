import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../components/ui/ScreenHeader';
import OrderStepper from '../components/ui/OrderStepper';
import AppButton from '../components/Forms/AppButton';
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import { useFeedback } from '../context/FeedbackContext';
import { formatPriceMAD } from '../utils/currency';
import { getImageUrl } from '../api/getImageUrl';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { colors, layout, radii, shadows, spacing, typography } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

const Section = ({ title, delay = 0, children }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(300)} style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    {children}
  </Animated.View>
);

const SummaryRow = ({ label, value, strong }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, strong && styles.strong]}>{label}</Text>
    <Text style={[styles.summaryValue, strong && styles.strong]}>{value}</Text>
  </View>
);

const OrderDetailScreen = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { orders, markOrderAsRead, updateOrderStatus } = useOrders();
  const { addToCart } = useCart();
  const { showToast } = useFeedback();
  const { language, t } = useLanguage();
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA';
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (order && !order.read) markOrderAsRead(order.id);
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('Order')} onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>{t('This order could not be found.')}</Text>
      </View>
    );
  }

  const date = new Date(order.date);

  const handleCancel = () => {
    Alert.alert(t('Cancel order'), t('Are you sure you want to cancel this order?'), [
      { text: t('Keep order'), style: 'cancel' },
      {
        text: t('Cancel order'),
        style: 'destructive',
        onPress: async () => {
          const ok = await updateOrderStatus(order.id, 'cancelled');
          showToast(ok ? t('Order cancelled.') : t('Could not cancel the order.'), { type: ok ? 'success' : 'error' });
        },
      },
    ]);
  };

  const handleReorder = async () => {
    for (const item of order.items) {
      await addToCart(item, item.extras || [], item.quantity || 1);
    }
    hapticSuccess();
    showToast(t('Items added to your cart.'), {
      type: 'success',
      action: { label: t('View cart'), onPress: () => navigation.navigate('Checkout') },
    });
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      showToast(t('Select a rating first.'), { type: 'error' });
      return;
    }
    hapticSuccess();
    setHasReviewed(true);
    showToast(t('Thanks for your feedback!'), { type: 'success' });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Order details')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Section title={t('Status')}>
          <OrderStepper status={order.status} />
          <Text style={styles.meta}>
            {t('Placed {date} at {time}', { date: date.toLocaleDateString(locale), time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })}
          </Text>
        </Section>

        <Section title={t('Items')} delay={60}>
          {order.items.map((item, i) => (
            <View key={`${item.id}-${i}`} style={styles.item}>
              <Image
                source={item.image ? { uri: getImageUrl(item.image) } : undefined}
                style={styles.itemImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              <View style={styles.flex}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {t('Qty {quantity}', { quantity: item.quantity })}
                  {item.extras?.length ? ` · ${item.extras.map((e) => e.label).join(', ')}` : ''}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{formatPriceMAD(item.totalPrice ?? item.price * item.quantity)}</Text>
            </View>
          ))}
        </Section>

        {order.deliveryAddress ? (
          <Section title={t('Delivery')} delay={120}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.brand} />
              <Text style={styles.infoText}>{order.deliveryAddress}</Text>
            </View>
            {order.phoneNumber ? (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={colors.brand} />
                <Text style={styles.infoText}>{order.phoneNumber}</Text>
              </View>
            ) : null}
            {order.specialInstructions ? (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={20} color={colors.brand} />
                <Text style={styles.infoText}>{order.specialInstructions}</Text>
              </View>
            ) : null}
          </Section>
        ) : null}

        <Section title={t('Summary')} delay={180}>
          <SummaryRow label={t('Subtotal')} value={formatPriceMAD(order.subtotal ?? order.total)} />
          {order.tax ? <SummaryRow label={t('Tax')} value={formatPriceMAD(order.tax)} /> : null}
          <SummaryRow label={t('Total')} value={formatPriceMAD(order.total)} strong />
        </Section>

        {order.status === 'delivered' ? (
          <Section title={t(hasReviewed ? 'Your review' : 'Rate your order')} delay={240}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  disabled={hasReviewed}
                  onPress={() => {
                    hapticLight();
                    setRating(star);
                  }}
                  style={styles.star}
                  accessibilityRole="button"
                  accessibilityLabel={t('{count} stars', { count: star })}
                >
                  <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color="#F5A623" />
                </Pressable>
              ))}
            </View>
            {!hasReviewed ? (
              <>
                <TextInput
                  style={styles.reviewInput}
                  placeholder={t('Share your experience (optional)')}
                  placeholderTextColor={colors.textSubtle}
                  multiline
                  value={review}
                  onChangeText={setReview}
                  textAlignVertical="top"
                />
                <AppButton variant="primary" title={t('Submit review')} onPress={handleSubmitReview} />
              </>
            ) : review ? (
              <Text style={styles.itemMeta}>{review}</Text>
            ) : null}
          </Section>
        ) : null}

        {order.status === 'delivered' ? (
          <AppButton variant="secondary" title={t('Reorder')} onPress={handleReorder} icon={<MaterialIcons name="replay" size={20} color={colors.brand} />} />
        ) : null}

        {order.status === 'placed' ? (
          <AppButton variant="text" title={t('Cancel order')} onPress={handleCancel} textStyle={styles.cancelText} />
        ) : null}
      </ScrollView>
    </View>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  notFound: { ...typography.body, color: colors.textMuted, padding: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  meta: { ...typography.small, color: colors.textMuted, marginTop: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  itemImage: { width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.border },
  itemName: { ...typography.bodyStrong, color: colors.text },
  itemMeta: { ...typography.small, color: colors.textMuted },
  itemPrice: { ...typography.bodyStrong, color: colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  infoText: { ...typography.body, color: colors.text, flex: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.body, color: colors.text },
  strong: { ...typography.title, color: colors.text },
  stars: { flexDirection: 'row', marginBottom: spacing.sm },
  star: { width: layout.touchTarget, height: layout.touchTarget, alignItems: 'center', justifyContent: 'center' },
  reviewInput: {
    minHeight: 96,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...typography.body,
    color: colors.text,
  },
  cancelText: { color: colors.textMuted, ...typography.small },
});
