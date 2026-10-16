import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useFeedback } from '../context/FeedbackContext';
import { hapticSuccess } from '../utils/haptics';
import colors from '../config/colors';
import AppButton from '../components/Forms/AppButton';
import Ligne from '../components/ui/Ligne';
import AppTextInput from '../components/Forms/AppTextInput';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { formatPriceMAD } from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, subtotal, tax, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { isGuest } = useAuth();
  const { showToast } = useFeedback();
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');


  
  const handleRemoveItem = (cartId) => {
    removeFromCart(cartId);
  };

  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(cartId, newQuantity);
    } else {
      removeFromCart(cartId);
    }
  };

  const handlePlaceOrder = async () => {
    // Check if user is guest - prevent checkout
    if (isGuest) {
      showToast(t('Register to place an order.'), {
        action: { label: t('Register'), onPress: () => navigation.navigate('Register') },
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      showToast(t('Please enter a delivery address.'), { type: 'error' });
      return;
    }
    if (!phoneNumber.trim()) {
      showToast(t('Please enter a phone number.'), { type: 'error' });
      return;
    }
    if (cartItems.length === 0) {
      showToast(t('Your cart is empty.'), { type: 'error' });
      return;
    }

    // Process order
    setIsProcessing(true);
    try {
      // Simulate API call for order placement
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create order notification
      const orderData = {
        items: cartItems,
        subtotal,
        tax,
        total,
        deliveryAddress,
        phoneNumber,
        specialInstructions,
      };
      await addOrder(orderData);

      hapticSuccess();
      clearCart();
      showToast(t('Order placed · {price}', { price: formatPriceMAD(total) }), { type: 'success' });
      navigation.navigate('Main', { screen: 'Orders' });
    } catch (error) {
      showToast(t('Failed to place order. Please try again.'), { type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.category}</Text>
        {item.extras && item.extras.length > 0 && (
          <Text style={styles.extrasText}>
            {t('Extras')}: {item.extras.map(e => e.label).join(', ')}
          </Text>
        )}
        <Text style={styles.itemPrice}>{formatPriceMAD(item.price)}</Text>
      </View>

      <View style={styles.quantityControl}>
        <TouchableOpacity
          onPress={() => handleQuantityChange(item.cartId, item.quantity - 1)}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => handleQuantityChange(item.cartId, item.quantity + 1)}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalColumn}>
        <Text style={styles.totalPrice}>{formatPriceMAD(item.totalPrice)}</Text>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item.cartId)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title={t('Cart')} onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.secondary5} />
          <Text style={styles.emptyTitle}>{t('Your Cart is Empty')}</Text>
          <Text style={styles.emptyDescription}>{t('Add items to your order to continue')}</Text>
          
          <AppButton
            title={t('Continue Shopping')}
            color="primary2"
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('Checkout')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cart Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Order Items ({count})', { count: cartItems.length })}</Text>
          <Ligne style={{ marginBottom: 12 }} />
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.cartId}
            scrollEnabled={false}
            ItemSeparatorComponent={Ligne}
          />
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Order Summary')}</Text>
          <Ligne style={{ marginBottom: 12 }} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('Subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatPriceMAD(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('Tax (10%)')}</Text>
            <Text style={styles.summaryValue}>{formatPriceMAD(tax)}</Text> 
                     </View>

          <Ligne style={{ marginVertical: 8 }} />

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('Total')}</Text>
            <Text style={styles.totalAmount}>{formatPriceMAD(total)}</Text>
          </View>
        </View>

        {/* Delivery Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Delivery Information')}</Text>
          <Ligne style={{ marginBottom: 12 }} />

          <AppTextInput
            placeholder={t('Delivery Address')}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            editable={!isProcessing}
            inputStyle={{ marginBottom: 12 }}
          />

          <AppTextInput
            placeholder={t('Phone Number')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!isProcessing}
            inputStyle={{ marginBottom: 12 }}
          />

          <AppTextInput
            placeholder={t('Special Instructions (Optional)')}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
            editable={!isProcessing}
          />
        </View>

        {/* Place Order Button */}
        <View style={styles.actionSection}>
          <AppButton
            title={isProcessing ? t('Processing...') : t('Place Order')}
            color="primary2"
            onPress={handlePlaceOrder}
            disabled={isProcessing}
            buttonStyle={styles.placeOrderButton}
          />
          <AppButton
            title={t('Continue Shopping')}
            color="primary1"
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
            disabled={isProcessing}
            buttonStyle={styles.continueButton}
          />
        </View>
      </ScrollView>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.primary2} />
          <Text style={styles.processingText}>{t('Processing your order...')}</Text>
        </View>
      )}
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 12,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: isTablet ? 18 : 16,
    fontFamily: 'Karla-Bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Karla-Bold',
    color: colors.textPrimary,
  },
  itemDescription: {
    fontSize: 12,
    color: colors.secondary5,
    marginTop: 2,
  },
  extrasText: {
    fontSize: 11,
    color: colors.secondary5,
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontFamily: 'Karla-Bold',
    color: colors.secondary1,
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: colors.secondary4,
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontFamily: 'Karla-Bold',
    color: colors.primary1,
  },
  quantityText: {
    fontSize: 12,
    fontFamily: 'Karla-Bold',
    marginHorizontal: 6,
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  totalColumn: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  totalPrice: {
    fontSize: 14,
    fontFamily: 'Karla-Bold',
    color: colors.secondary1,
    marginBottom: 4,
  },
  deleteButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Karla-Medium',
    color: colors.textPrimary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Karla-Bold',
    color: colors.textPrimary,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Karla-Bold',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: 'Karla-Bold',
    color: colors.secondary1,
  },
  actionSection: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  placeOrderButton: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primary2,
    paddingVertical: 12,
  },
  continueButton: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primary1,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Karla-Bold',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.secondary5,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 14,
    color: colors.white,
    fontFamily: 'Karla-Medium',
    marginTop: 12,
  },
});