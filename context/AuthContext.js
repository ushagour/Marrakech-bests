import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const PROFILE_KEY = '@littlelemon_profile';
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from AsyncStorage on mount
  useEffect(() => {
 

    loadUser();
  }, []);



     const loadUser = async () => {
      try {
        const json = await AsyncStorage.getItem(PROFILE_KEY);

        
        if (json) {
          const data = JSON.parse(json);
          setUser(data);
        }
      } catch (e) {
        // Error loading user from storage
      } finally {
        setIsLoading(false);
      }
    };

    
  // Update user profile in AsyncStorage and state (only for registered users, not guests)
  const updateUser = async (userData) => {
    // Don't save guest users to AsyncStorage
    if (userData?.isGuest) {
      setUser(userData);
      return true;
    }
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (e) {
      // Error saving user to storage
      return false;
    }
  };

  // Complete onboarding: merge provided profile data and set isUserOnboarded=true
  const completeOnboarding = async (profileData) => {
    try {
      const nextUser = {
        ...(user || {}),
        ...(profileData || {}),
        isUserOnboarded: true,
        isGuest: false, // Mark as registered user, not guest
      };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      return true;
    } catch (e) {
      // Error completing onboarding
      return false;
    }
  };

  // Create a guest user without saving to AsyncStorage
  const createGuestUser = () => {
    const guestUser = {
      isGuest: true,
      isUserOnboarded: false,
    };
    setUser(guestUser);
  };

  // Clear user (logout)
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
      setUser(null);
      return true;
    } catch (e) {
      // Error clearing user
      return false;
    }
  };



  const login = async (userData) => {
    try {
      await completeOnboarding(userData);
      return true;
    } catch (e) {
      // Error saving user to storage
      return false;
    }
  };

  const SignUp = async (userData) => {  

    try {
      await completeOnboarding(userData);
      return true;
    }
    catch (e) {
      // Error saving user to storage
      return false;
    }
  };






  const value = {
    user,
    isLoading,
    login,
    SignUp,
    updateUser,
    completeOnboarding,
    isUserOnboarded: Boolean(user?.isUserOnboarded),
    isGuest: Boolean(user?.isGuest),
    createGuestUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
