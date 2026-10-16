import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const CART_KEY = '@littlelemon_cart';
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const json = await AsyncStorage.getItem(CART_KEY);
      if (json) {
        const data = JSON.parse(json);
        setCartItems(data);
      }
    } catch (e) {
      // Error loading cart from storage
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (item, extras = [], quantity = 1) => {
    try {
      const newItem = {
        ...item,
        cartId: `${item.id}_${Date.now()}`, // Unique cart item ID
        quantity,
        extras, // Array of selected extras with prices
        totalPrice: (parseFloat(item.price) + (extras?.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0) || 0)) * quantity,
      };

      const updatedCart = [...cartItems, newItem];
      setCartItems(updatedCart);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
      return true;
    } catch (e) {
      // Error adding to cart
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartId) => {
    try {
      const updatedCart = cartItems.filter(item => item.cartId !== cartId);
      setCartItems(updatedCart);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
      return true;
    } catch (e) {
      // Error removing from cart
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (cartId, quantity) => {
    try {
      const updatedCart = cartItems.map(item =>
        item.cartId === cartId
          ? {
              ...item,
              quantity,
              totalPrice: ((parseFloat(item.price) || 0) + (item.extras?.reduce((sum, e) => sum + (parseFloat(e.price) || 0), 0) || 0)) * quantity,
            }
          : item
      );
      setCartItems(updatedCart);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
      return true;
    } catch (e) {
      // Error updating quantity
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setCartItems([]);
      await AsyncStorage.setItem(CART_KEY, JSON.stringify([]));
      return true;
    } catch (e) {
      // Error clearing cart
      return false;
    }
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total =subtotal + tax;

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
