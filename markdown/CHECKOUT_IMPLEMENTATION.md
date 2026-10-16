# Checkout Screen Implementation Guide

## Overview
A complete checkout system has been implemented for the Marrakech Bites app, allowing users to add items to a cart and complete orders with delivery information.

## Files Created/Modified

### New Files Created:
1. **context/CartContext.js** - Cart state management with persistence
2. **hooks/useCart.js** - Custom hook for accessing cart context

### Files Modified:
1. **screens/DetailScreen.js** - Added "Add to Cart" functionality
2. **screens/CheckoutScreen.js** - Complete checkout UI with order summary
3. **navigation/AppNavigator.jsx** - Added Checkout route
4. **App.js** - Added CartProvider wrapper
5. **components/Header.jsx** - Added title prop support
6. **components/Forms/AppTextInput.jsx** - Added multiline and inputStyle support

## Features

### Cart Management (CartContext.js)
- **Add to Cart**: Add items with selected extras and quantity
- **Remove from Cart**: Delete items from cart
- **Update Quantity**: Modify item quantities
- **Clear Cart**: Empty entire cart
- **Persistence**: Cart data saved to AsyncStorage
- **Calculations**: Automatic subtotal, tax (10%), and total calculations

### Detail Screen
- **Extras Selection**: Users can select multiple extras (Extra Cheese, Spicy Sauce, Gluten Free)
- **Quantity Control**: Increase/decrease quantity with +/- buttons
- **Real-time Pricing**: Total price updates as extras and quantity change
- **Add to Cart Button**: Shows total price and loading state
- **Navigation**: Options to continue shopping or go to checkout

### Checkout Screen
- **Empty Cart View**: Shows when cart is empty with option to continue shopping
- **Cart Items List**: 
  - Item name, category, and price
  - Selected extras display
  - Quantity controls
  - Delete button for each item
- **Order Summary**:
  - Subtotal calculation
  - 10% tax calculation
  - Total amount
- **Delivery Information**:
  - Delivery address input
  - Phone number input
  - Special instructions (optional)
- **Order Processing**:
  - Form validation
  - Loading state during processing
  - Success alert with order confirmation
  - Auto-clear cart on successful order
  - Navigation back to home

## Usage

### Adding Items to Cart:
1. User navigates to item detail page
2. Selects desired extras
3. Adjusts quantity
4. Clicks "Add to Cart"
5. Receives success alert with options to continue shopping or checkout

### Completing Checkout:
1. User reviews cart items and quantities
2. Enters delivery address and phone number
3. (Optional) Adds special instructions
4. Clicks "Place Order"
5. System validates inputs
6. Shows processing indicator
7. Displays success alert
8. Clears cart and returns to home

## Data Structure

### Cart Item Structure:
```javascript
{
  id: number,
  name: string,
  description: string,
  price: number,
  category: string,
  image: string,
  cartId: string,           // Unique identifier (id_timestamp)
  quantity: number,
  extras: [
    {
      id: number,
      label: string,
      price: number
    }
  ],
  totalPrice: number        // (price + extras) * quantity
}
```

### Cart Context Values:
```javascript
{
  cartItems: array,         // Array of cart items
  isLoading: boolean,       // Loading state during initialization
  addToCart: function,      // Add item to cart
  removeFromCart: function, // Remove item by cartId
  updateQuantity: function, // Update item quantity
  clearCart: function,      // Clear entire cart
  subtotal: number,         // Sum of all items
  tax: number,              // 10% of subtotal
  total: number             // subtotal + tax
}
```

## Styling
- Uses existing color scheme from config/colors.js
- Responsive design for both phones and tablets
- Consistent with app's Karla font family
- Dark charcoal text (primary1) for main content
- Ochre (primary2) for buttons
- Light beige (secondary4) for backgrounds

## Navigation Flow
```
Detail Screen (item selected)
    ↓ (Add to Cart button)
    ↓
Checkout Screen
    ↓ (Place Order)
    ↓
Home Screen (cart cleared)
```

## Future Enhancements
- Payment integration
- Order history tracking
- Delivery time estimation
- Promo code support
- User address saved addresses
- Order status tracking
