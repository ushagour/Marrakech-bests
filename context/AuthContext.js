import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const PROFILE_KEY = '@littlelemon_profile';
  const ONBOARDING_KEY = '@marrakech_bests_onboarding_complete';
  const [user, setUser] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from AsyncStorage on mount
  useEffect(() => {
 

    loadUser();
  }, []);



     const loadUser = async () => {
      try {
        const [json, onboardingComplete] = await Promise.all([
          AsyncStorage.getItem(PROFILE_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);

        if (json) {
          const data = JSON.parse(json);
          setUser(data);
        }
        setHasSeenOnboarding(onboardingComplete === 'true');
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
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setUser(nextUser);
      setHasSeenOnboarding(true);
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

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
      return true;
    } catch (e) {
      return false;
    }
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
      return await completeOnboarding(userData);
    } catch (e) {
      // Error saving user to storage
      return false;
    }
  };

  const SignUp = async (userData) => {  

    try {
      return await completeOnboarding(userData);
    }
    catch (e) {
      // Error saving user to storage
      return false;
    }
  };






  const value = {
    user,
    isLoading,
    hasSeenOnboarding,
    markOnboardingComplete,
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
