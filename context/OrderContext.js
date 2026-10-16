import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OrderContext = createContext();

// No backend: status is simulated from the order's age (seconds).
const STAGES = [['delivered', 180], ['ready', 90], ['preparing', 30]];

const simulatedStatus = (order) => {
  if (order.status === 'cancelled' || order.status === 'delivered') return order.status;
  const age = (Date.now() - new Date(order.date).getTime()) / 1000;
  const stage = STAGES.find(([, after]) => age >= after);
  return stage ? stage[0] : 'placed';
};

export const OrderProvider = ({ children }) => {
  const ORDERS_KEY = '@littlelemon_orders';
  const [orders, setOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load orders from AsyncStorage on mount
  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const advance = () => {
      setOrders((current) => {
        const next = current.map((o) => {
          const status = simulatedStatus(o);
          return status === o.status ? o : { ...o, status, read: false };
        });
        if (next.every((o, i) => o === current[i])) return current;
        AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    };
    advance();
    const id = setInterval(advance, 10000);
    return () => clearInterval(id);
  }, [isLoading]);

  // Update unread count whenever orders change
  useEffect(() => {
    const unread = orders.filter(order => !order.read).length;
    setUnreadCount(unread);
  }, [orders]);

  const loadOrders = async () => {
    try {
      const json = await AsyncStorage.getItem(ORDERS_KEY);
      if (json) {
        const data = JSON.parse(json);
        setOrders(data);
      }
    } catch (e) {
      // Error loading orders from storage
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new order
  const addOrder = async (orderDetails) => {
    try {
      const newOrder = {
        id: `order_${Date.now()}`,
        ...orderDetails,
        date: new Date().toISOString(),
        status: 'placed',
        read: false, // Mark as unread notification
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
      return newOrder;
    } catch (e) {
      // Error adding order
      return null;
    }
  };

  // Mark order as read
  const markOrderAsRead = async (orderId) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, read: true } : order
      );
      setOrders(updatedOrders);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
      return true;
    } catch (e) {
      // Error marking order as read
      return false;
    }
  };

  // Mark all orders as read
  const markAllAsRead = async () => {
    try {
      const updatedOrders = orders.map(order => ({ ...order, read: true }));
      setOrders(updatedOrders);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
      return true;
    } catch (e) {
      // Error marking all orders as read
      return false;
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
      return true;
    } catch (e) {
      // Error updating order status
      return false;
    }
  };

  // Get all orders
  const getOrders = () => orders;

  // Get unread orders
  const getUnreadOrders = () => orders.filter(order => !order.read);

  const value = {
    orders,
    unreadCount,
    isLoading,
    addOrder,
    markOrderAsRead,
    markAllAsRead,
    updateOrderStatus,
    getOrders,
    getUnreadOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
