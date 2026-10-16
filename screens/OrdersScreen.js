import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrders } from '../hooks/useOrders';
import OrderStepper from '../components/ui/OrderStepper';
import { formatPriceMAD } from '../utils/currency';
import { colors, layout, radii, shadows, spacing, typography } from '../config/theme';
import { useLanguage } from '../context/LanguageContext';

function OrderCard({ order, index, onPress }) {
  const { language, t } = useLanguage();
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-MA';
  const itemCount = order.items.reduce((n, i) => n + (i.quantity || 1), 0);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(300)}>
      <Pressable
        onPress={onPress}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${t('Order from {date}, {price}', { date: new Date(order.date).toLocaleDateString(locale), price: formatPriceMAD(order.total) })}`}
      >
        <View style={styles.cardTop}>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>
              {itemCount} {t(itemCount === 1 ? 'item' : 'items')} · {formatPriceMAD(order.total)}
            </Text>
            <Text style={styles.cardDate}>
              {new Date(order.date).toLocaleDateString(locale)} · {new Date(order.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {!order.read ? <View style={styles.unread} accessibilityLabel={t('New update')} /> : null}
          <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
        </View>
        <OrderStepper status={order.status} compact />
      </Pressable>
    </Animated.View>
  );
}

export default function OrdersScreen({ navigation }) {
  const { orders } = useOrders();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + spacing.md, paddingBottom: layout.tabBarHeight + 96 },
        ]}
        ListHeaderComponent={<Text style={styles.title}>{t('Your orders')}</Text>}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item, index }) => (
          <OrderCard order={item} index={index} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={56} color={colors.textSubtle} />
            <Text style={styles.emptyTitle}>{t('No orders yet')}</Text>
            <Text style={styles.emptyText}>{t('Your orders and their progress will show up here.')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.md },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.title, color: colors.text },
  cardDate: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  unread: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.peach },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
  emptyTitle: { ...typography.h2, color: colors.text },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
