import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useFeedback } from '../context/FeedbackContext';
import { hapticSuccess } from '../utils/haptics';
import colors from '../config/colors';
import { getImageUrl } from '../api/getImageUrl';
import AppButton from '../components/Forms/AppButton';
import Ligne from '../components/ui/Ligne';
import AppCheckbox from '../components/Forms/AppCheckbox';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import IsAuthWrapper from '../components/ui/IsAuthWrapper';
import { formatPriceMAD } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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
    // Expect either { item } or individual fields
    return params.item || {
      id: params.id,
      name: params.name,
      description: params.description,
      price:params.price,
      category: params.category,
      image: params.image,
      rating: params.rating,
      prepareTime: params.prepareTime,
      available: params.available,
      tags: params.tags,
    };
  }, [route]);



   
   
  const extrasOptions = [
    { id: 1, label: t('Extra Cheese'), price: 1.00 },
    { id: 2, label: t('Spicy Sauce'), price: 0.50 },
    { id: 3, label: t('Gluten Free'), price: 1.50 }
  ];



  
  const basePrice = parseFloat(item.price) || 0;
  const extrasPrice = selectedExtras.reduce((sum, extra) => sum + parseFloat(extra.price || 0), 0);
  const subtotal = basePrice + extrasPrice;
  const TOTAL = subtotal * parseFloat(quantity || 1);  
  

  const heroUrl = item?.image ? getImageUrl(item.image) : null;
  const validUrl = heroUrl && (heroUrl.startsWith('http://') || heroUrl.startsWith('https://'));

  // Check if user is authenticated (not a guest and has completed onboarding)
  const isAuthenticated = user && !user.isGuest && user.isUserOnboarded;

  return (
    <View style={styles.container}>
      <ScreenHeader title={item?.name ?? t('Menu item')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero image */}
        <View style={styles.heroWrap}>
          {!validUrl || !imageError ? (
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
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
                accessible={true}
                accessibilityLabel={`${item?.name ?? 'Menu'} image`}
              />
              {imageError && (
                <View style={styles.imageFallback}>
                  <MaterialIcons name="image-not-supported" size={28} color={colors.primary1} />
                  <Text style={styles.fallbackText}>{t('Image unavailable')}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.imageFallback}>
              <MaterialIcons name="no-photography" size={28} color={colors.primary1} />
              <Text style={styles.fallbackText}>{t('No image available')}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item?.name ?? t('Menu Item')}</Text>
            {item?.rating && (
              <View style={styles.ratingBadge}>
                <MaterialIcons name="star" size={18} color="#FFB81C" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>

          {/* Availability Status */}
          {item?.available === false && (
            <View style={styles.unavailableBanner}>
              <MaterialIcons name="error-outline" size={18} color="#C41E3A" />
              <Text style={styles.unavailableText}>{t('Currently Out of Stock')}</Text>
            </View>
          )}

          {/* Tags */}
          {item?.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={[styles.tagChip, styles[`tag_${tag}`]]}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Price and Prepare Time */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('Price')}</Text>
            <Text style={styles.price}>{formatPriceMAD(item?.price || 0)}</Text>
          </View>

          {item?.prepareTime && (
            <View style={styles.prepareTimeRow}>
              <MaterialIcons name="schedule" size={18} color={colors.primary1} />
              <Text style={styles.prepareTimeLabel}>{t('Prepare Time: ')}</Text>
              <Text style={styles.prepareTimeValue}>{item.prepareTime}</Text>
            </View>
          )}

          {item?.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}

        </View>
 

          {/* Authentication Check - Show login prompt if not authenticated */}
          {!isAuthenticated ? (
         <IsAuthWrapper navigation={navigation} />
          ) : (
          <View style={styles.metaRows}>
          <View style={styles.detailContainer}>

            {extrasOptions.map((extra, index) => (
              <React.Fragment key={extra.id}>
                {index > 0 && <Ligne />}
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8}}>
                  <Text style={[styles.SmallText]}>{extra.label}</Text>
                  
                  <AppCheckbox 
                    checked={selectedExtras.some(e => e.id === extra.id)}
                    label={formatPriceMAD(extra.price)}
                    onChange={(isSelected) => {

                      if (isSelected) {
                        
                        setSelectedExtras([...selectedExtras, extra]);
                      } else {
                        setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
                      }
                    }}
                  />
                </View>
              </React.Fragment>
            ))}
                    {/* Quantity Control */}
        <View style={styles.quantitySection}>
          <Text style={styles.SmallText}>{t('Quantity')}</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.quantityButton}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.quantityButton}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Ligne style={{ marginVertical: 16 }} />

            <View style={styles.TotalRow}  >
                  <Text style={[styles.SmallText]}>{t('TOTAL')}</Text>
                  <Text style={[styles.price]}>{formatPriceMAD(TOTAL)}</Text>
           </View>
          </View>


              
        <View style={styles.metaRow}>
          <AppButton 
            title={isAdding ? t('Adding to Cart...') : t('Add to Cart for {price}', { price: formatPriceMAD(TOTAL) })}
            color="primary2"
            buttonStyle={{width: "80%",alignItems: "center",fontFamily: "Karla-Bold"}}
            disabled={isAdding}
            onPress={async () => {
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
            }}
          />
        </View> 
        </View> 
          )}

      </ScrollView>
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary4 },
  scroll: { paddingBottom: 24 },
  heroWrap: {
    width: '100%',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 24 : 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
    color: '#333',
    fontFamily: 'Karla-Bold',
  },
  unavailableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  unavailableText: {
    fontSize: 14,
    color: '#C41E3A',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Karla-Bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tag_vegetarian: {
    backgroundColor: '#E8F5E9',
  },
  tag_healthy: {
    backgroundColor: '#E3F2FD',
  },
  tag_fresh: {
    backgroundColor: '#FCE4EC',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Karla-Bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Karla-Regular',
  },
  prepareTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  prepareTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Karla-Regular',
  },
  prepareTimeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary1,
    fontFamily: 'Karla-Bold',
  },
  heroImage: {
    width: isTablet ? Math.min(700, width - 48) : width - 32,
    height: isTablet ? 320 : 220,
    borderRadius: 12,
    resizeMode: 'cover',
    backgroundColor: '#F5F5F5',
  },
  loadingSpinner: {
    position: 'absolute',
    zIndex: 10,
  },
  imageFallback: {
    width: isTablet ? Math.min(700, width - 48) : width - 32,
    height: isTablet ? 320 : 220,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: { fontSize: 12, color: '#888', marginTop: 6 },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: isTablet ? 24 : 20, fontFamily: 'Karla-Bold', color: colors.textPrimary },
  metaRows: { backgroundColor: colors.white, marginTop: 16, paddingTop: 12 },
  metaRow: {  paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center',justifyContent: 'center',marginTop: 12 },
  TotalRow: {  paddingHorizontal: 16,  flexDirection: 'row', alignItems: 'center',justifyContent: 'center',marginTop: 8 
,flexDirection: "row", justifyContent: "space-between", marginBottom: 8
  },
  tag: { backgroundColor: colors.secondary2, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16 },
  price: { color: colors.secondary1, fontFamily: 'Karla-Bold', fontSize: isTablet ? 18 : 16 },
  description: { color: colors.black, marginTop: 12, lineHeight: 20, fontFamily: 'Karla-Regular' },
  footerButton: { display: 'flex', alignItems: 'center', marginTop: 24 , paddingHorizontal: 16, marginBottom: 12  },
  logo: {
    width: 20,
    height: 20, 
    margin: 8,          
  },
  SmallText: {  fontSize: 14, color: colors.textPrimary, marginRight: 4, fontFamily: 'Karla-Medium' },
  textBold: { fontSize: 14, color: colors.textPrimary, fontFamily: 'Karla-Bold' },
  quantitySection: {
    paddingHorizontal: 18,
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary4,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontFamily: 'Karla-Bold',
    color: colors.primary1,
  },
  quantityValue: {
    fontSize: 14,
    fontFamily: 'Karla-Bold',
    marginHorizontal: 12,
    color: colors.textPrimary,
    minWidth: 30,
    textAlign: 'center',
  },
    detailContainer: {
      backgroundColor: colors.white,
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.secondary3,
    },
});