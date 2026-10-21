import React, { useMemo, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, ActivityIndicator,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useFeedback } from '../context/FeedbackContext';
import { hapticSuccess } from '../utils/haptics';
import colors from '../config/colors';
import { getImageUrl } from '../api/getImageUrl';
import AppButton from '../components/Forms/AppButton';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import IsAuthWrapper from '../components/ui/IsAuthWrapper';
import { formatPriceMAD } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Fallbacks used when the API does not send these fields yet
const DEFAULT_DELIVERY_TIME = '25-35 min';
const DEFAULT_DELIVERY_FEE = 15;
const FREE_DELIVERY_FROM = 150;

const TAG_COLORS = {
  vegetarian: { bg: '#E6F4EA', fg: '#1E6B3A' },
  healthy: { bg: '#E3F0FB', fg: '#1F5E96' },
  fresh: { bg: '#FCE8EF', fg: '#9B2C57' },
  spicy: { bg: '#FDE9E4', fg: '#B23A1E' },
};

const asArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.split(',').map((s) => s.trim());
  return [];
};

const InfoTile = ({ icon, label, value }) => (
  <View style={styles.infoTile}>
    <MaterialIcons name={icon} size={20} color={colors.primary1} />
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    <Text style={styles.infoLabel} numberOfLines={1}>{label}</Text>
  </View>
);

const DeliveryRow = ({ icon, title, subtitle, value, valueStyle, last }) => (
  <View style={[styles.deliveryRow, !last && styles.rowDivider]}>
    <View style={styles.deliveryIcon}>
      <MaterialIcons name={icon} size={20} color={colors.primary1} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
    </View>
    {value ? <Text style={[styles.rowValue, valueStyle]}>{value}</Text> : null}
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const DetailScreen = ({ navigation, route }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast, showAddedToCart } = useFeedback();
  const { t } = useLanguage();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const item = useMemo(() => {
    const params = route?.params || {};
    return params.item || {
      id: params.id,
      name: params.name,
      description: params.description,
      price: params.price,
      category: params.category,
      image: params.image,
      rating: params.rating,
      prepareTime: params.prepareTime,
      available: params.available,
      tags: params.tags,
      calories: params.calories,
      servings: params.servings,
      ingredients: params.ingredients,
      allergens: params.allergens,
      deliveryTime: params.deliveryTime,
      deliveryFee: params.deliveryFee,
      reviewsCount: params.reviewsCount,
    };
  }, [route]);

  // Prices are in MAD
  const extrasOptions = [
    { id: 1, label: t('Extra Cheese'), price: 10 },
    { id: 2, label: t('Spicy Sauce'), price: 5 },
    { id: 3, label: t('Gluten Free'), price: 15 },
  ];

  const basePrice = parseFloat(item.price) || 0;
  const extrasPrice = selectedExtras.reduce((sum, e) => sum + parseFloat(e.price || 0), 0);
  const unitPrice = basePrice + extrasPrice;
  const TOTAL = unitPrice * (parseInt(quantity, 10) || 1);

  const deliveryFee = item?.deliveryFee != null ? parseFloat(item.deliveryFee) : DEFAULT_DELIVERY_FEE;
  const deliveryTime = item?.deliveryTime || DEFAULT_DELIVERY_TIME;
  const isFreeDelivery = deliveryFee === 0 || TOTAL >= FREE_DELIVERY_FROM;
  const remainingForFree = Math.max(0, FREE_DELIVERY_FROM - TOTAL);

  const tags = asArray(item?.tags);
  const ingredients = asArray(item?.ingredients);
  const allergens = asArray(item?.allergens);

  const heroUrl = item?.image ? getImageUrl(item.image) : null;
  const validUrl = heroUrl && (heroUrl.startsWith('http://') || heroUrl.startsWith('https://'));
  const showImage = validUrl && !imageError;

  const isAuthenticated = user && !user.isGuest && user.isUserOnboarded;
  const unavailable = item?.available === false;

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id) ? prev.filter((e) => e.id !== extra.id) : [...prev, extra]
    );
  };

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const success = await addToCart(item, selectedExtras, quantity);
      if (success) {
        hapticSuccess();
        showAddedToCart(item, quantity, TOTAL);
      } else {
        showToast(t('Failed to add item to cart.'), { type: 'error' });
      }
    } catch (error) {
      showToast(t('An unexpected error occurred.'), { type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={item?.name ?? t('Menu item')} onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[styles.scroll, isAuthenticated && { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          {showImage ? (
            <>
              {imageLoading && (
                <ActivityIndicator size="small" color={colors.primary2} style={styles.loadingSpinner} />
              )}
              <Image
                source={{ uri: heroUrl }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                onLoad={() => setImageLoading(false)}
                onError={() => { setImageLoading(false); setImageError(true); }}
                accessible
                accessibilityLabel={`${item?.name ?? 'Menu'} image`}
              />
              {item?.rating ? (
                <View style={styles.ratingOverlay}>
                  <MaterialIcons name="star" size={16} color="#FFB81C" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  {item?.reviewsCount ? (
                    <Text style={styles.reviewsText}>({item.reviewsCount})</Text>
                  ) : null}
                </View>
              ) : null}
              {unavailable && (
                <View style={styles.soldOutOverlay}>
                  <Text style={styles.soldOutText}>{t('Currently Out of Stock')}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.imageFallback}>
              <MaterialIcons name="no-photography" size={28} color={colors.primary1} />
              <Text style={styles.fallbackText}>
                {imageError ? t('Image unavailable') : t('No image available')}
              </Text>
            </View>
          )}
        </View>

        {/* Title, tags, description */}
        <View style={styles.content}>
          <Text style={styles.title}>{item?.name ?? t('Menu Item')}</Text>

          <View style={styles.priceLine}>
            <Text style={styles.price}>{formatPriceMAD(item?.price || 0)}</Text>
            {item?.category ? <Text style={styles.category}>{item.category}</Text> : null}
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => {
                const c = TAG_COLORS[String(tag).toLowerCase()] || { bg: '#EEF0EF', fg: '#444' };
                return (
                  <View key={`${tag}-${index}`} style={[styles.tagChip, { backgroundColor: c.bg }]}>
                    <Text style={[styles.tagText, { color: c.fg }]}>{tag}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {item?.description ? <Text style={styles.description}>{item.description}</Text> : null}
        </View>

        {/* Quick facts */}
        <View style={styles.infoRow}>
          <InfoTile icon="schedule" label={t('Preparation')} value={item?.prepareTime || '—'} />
          <View style={styles.infoSep} />
          <InfoTile
            icon="local-fire-department"
            label={t('Calories')}
            value={item?.calories ? `${item.calories} kcal` : '—'}
          />
          <View style={styles.infoSep} />
          <InfoTile
            icon="restaurant"
            label={t('Serves')}
            value={item?.servings ? `${item.servings}` : '1'}
          />
        </View>

        {/* Delivery */}
        <Section title={t('Delivery')}>
          <View style={styles.card}>
            <DeliveryRow
              icon="delivery-dining"
              title={t('Estimated delivery')}
              subtitle={t('Prepared fresh, then delivered to your door')}
              value={deliveryTime}
            />
            <DeliveryRow
              icon="payments"
              title={t('Delivery fee')}
              subtitle={
                isFreeDelivery
                  ? null
                  : t('Free delivery from {amount}', { amount: formatPriceMAD(FREE_DELIVERY_FROM) })
              }
              value={isFreeDelivery ? t('Free') : formatPriceMAD(deliveryFee)}
              valueStyle={isFreeDelivery ? styles.freeValue : null}
              last={isFreeDelivery || remainingForFree <= 0}
            />
            {!isFreeDelivery && remainingForFree > 0 && (
              <View style={styles.freeHint}>
                <MaterialIcons name="local-offer" size={16} color={colors.primary1} />
                <Text style={styles.freeHintText}>
                  {t('Add {amount} more to get free delivery', { amount: formatPriceMAD(remainingForFree) })}
                </Text>
              </View>
            )}
          </View>
        </Section>

        {/* Ingredients & allergens */}
        {(ingredients.length > 0 || allergens.length > 0) && (
          <Section title={t('About this dish')}>
            <View style={styles.card}>
              {ingredients.length > 0 && (
                <View style={allergens.length > 0 ? styles.rowDivider : null}>
                  <Text style={styles.rowTitle}>{t('Ingredients')}</Text>
                  <View style={styles.pillWrap}>
                    {ingredients.map((ing, i) => (
                      <View key={`${ing}-${i}`} style={styles.pill}>
                        <Text style={styles.pillText}>{ing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {allergens.length > 0 && (
                <View style={{ paddingTop: ingredients.length > 0 ? 12 : 0 }}>
                  <View style={styles.allergenHeader}>
                    <MaterialIcons name="warning-amber" size={16} color="#B26A00" />
                    <Text style={[styles.rowTitle, { marginLeft: 6 }]}>{t('Allergens')}</Text>
                  </View>
                  <View style={styles.pillWrap}>
                    {allergens.map((a, i) => (
                      <View key={`${a}-${i}`} style={[styles.pill, styles.allergenPill]}>
                        <Text style={[styles.pillText, { color: '#8A5300' }]}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* Customise */}
        {!isAuthenticated ? (
          <View style={{ marginTop: 20 }}>
            <IsAuthWrapper navigation={navigation} />
          </View>
        ) : (
          <Section title={t('Customize your order')}>
            <View style={styles.card}>
              {extrasOptions.map((extra, index) => {
                const checked = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <TouchableOpacity
                    key={extra.id}
                    activeOpacity={0.7}
                    onPress={() => toggleExtra(extra)}
                    style={[styles.extraRow, index > 0 && styles.rowDividerTop]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                      {checked && <MaterialIcons name="check" size={16} color="#FFF" />}
                    </View>
                    <Text style={styles.extraLabel}>{extra.label}</Text>
                    <Text style={styles.extraPrice}>+ {formatPriceMAD(extra.price)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      {isAuthenticated && (
        <View style={styles.bottomBar}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('TOTAL')}
              {selectedExtras.length > 0 ? `  ·  ${selectedExtras.length} extra` : ''}
            </Text>
            <Text style={styles.summaryTotal}>{formatPriceMAD(TOTAL)}</Text>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.stepperBtn}
                accessibilityLabel={t('Decrease quantity')}
              >
                <MaterialIcons name="remove" size={20} color={colors.primary1} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.stepperBtn}
                accessibilityLabel={t('Increase quantity')}
              >
                <MaterialIcons name="add" size={20} color={colors.primary1} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <AppButton
                title={isAdding ? t('Adding to Cart...') : t('Add to Cart')}
                color="primary2"
                buttonStyle={{ width: '100%', alignItems: 'center', fontFamily: 'Karla-Bold' }}
                disabled={isAdding || unavailable}
                onPress={handleAdd}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DetailScreen;

const CARD_RADIUS = 14;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary4 },
  scroll: { paddingBottom: 32 },

  // Hero
  heroWrap: {
    width: '100%',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 24 : 16,
  },
  heroImage: {
    width: isTablet ? Math.min(700, width - 48) : width - 32,
    height: isTablet ? 320 : 230,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  loadingSpinner: { position: 'absolute', zIndex: 10 },
  imageFallback: {
    width: isTablet ? Math.min(700, width - 48) : width - 32,
    height: isTablet ? 320 : 230,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: { fontSize: 12, color: '#888', marginTop: 6, fontFamily: 'Karla-Regular' },
  ratingOverlay: {
    position: 'absolute',
    right: isTablet ? 36 : 28,
    bottom: isTablet ? 36 : 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: { fontSize: 14, marginLeft: 4, color: '#222', fontFamily: 'Karla-Bold' },
  reviewsText: { fontSize: 12, marginLeft: 4, color: '#777', fontFamily: 'Karla-Regular' },
  soldOutOverlay: {
    position: 'absolute',
    left: isTablet ? 36 : 28,
    top: isTablet ? 36 : 28,
    backgroundColor: '#C41E3A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldOutText: { color: '#FFF', fontSize: 12, fontFamily: 'Karla-Bold' },

  // Title block
  content: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: isTablet ? 26 : 24, fontFamily: 'Karla-Bold', color: colors.textPrimary },
  priceLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  price: { color: colors.secondary1, fontFamily: 'Karla-Bold', fontSize: isTablet ? 20 : 18 },
  category: {
    marginLeft: 10,
    fontSize: 13,
    color: '#777',
    fontFamily: 'Karla-Regular',
    textTransform: 'capitalize',
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 12, fontFamily: 'Karla-Bold', textTransform: 'capitalize' },
  description: {
    color: '#3A3A3A',
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Karla-Regular',
  },

  // Quick facts
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.secondary3,
  },
  infoTile: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  infoValue: { marginTop: 6, fontSize: 14, color: colors.textPrimary, fontFamily: 'Karla-Bold' },
  infoLabel: { marginTop: 2, fontSize: 12, color: '#777', fontFamily: 'Karla-Regular' },
  infoSep: { width: 1, height: 36, backgroundColor: colors.secondary3 },

  // Sections / cards
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, color: colors.textPrimary, fontFamily: 'Karla-Bold', marginBottom: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.secondary3,
    padding: 16,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#ECECEC', paddingBottom: 12 },
  rowDividerTop: { borderTopWidth: 1, borderTopColor: '#ECECEC' },
  rowTitle: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Karla-Bold' },
  rowSubtitle: { fontSize: 12, color: '#777', marginTop: 2, fontFamily: 'Karla-Regular' },
  rowValue: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Karla-Bold', marginLeft: 8 },
  freeValue: { color: '#1E8A4C' },

  // Delivery
  deliveryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  deliveryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondary4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  freeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary4,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  freeHintText: { flex: 1, marginLeft: 8, fontSize: 13, color: colors.textPrimary, fontFamily: 'Karla-Medium' },

  // Ingredients
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingBottom: 2 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F2F4F3',
  },
  pillText: { fontSize: 13, color: '#333', fontFamily: 'Karla-Medium', textTransform: 'capitalize' },
  allergenHeader: { flexDirection: 'row', alignItems: 'center' },
  allergenPill: { backgroundColor: '#FFF3DC' },

  // Extras
  extraRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#B8BEBB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  checkboxOn: { backgroundColor: colors.primary1, borderColor: colors.primary1 },
  extraLabel: { flex: 1, fontSize: 15, color: colors.textPrimary, fontFamily: 'Karla-Medium' },
  extraPrice: { fontSize: 14, color: '#555', fontFamily: 'Karla-Bold' },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.secondary3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 13, color: '#666', fontFamily: 'Karla-Medium' },
  summaryTotal: { fontSize: 20, color: colors.secondary1, fontFamily: 'Karla-Bold' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary4,
    borderRadius: 12,
  },
  stepperBtn: { width: 44, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepperValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Karla-Bold',
  },
});