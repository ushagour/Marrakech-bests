# Navigation Workflow

## Overview
The Marrakech Bites app uses a unified stack navigation system that handles both authentication and main application screens in a single navigator. The navigation dynamically switches based on the user's authentication state.

## Architecture

### Navigation Structure
```
AppNavigator (Single Stack)
├── Authentication Screens
│   ├── Onboarding
│   ├── Login
│   └── Register
└── Main App Screens
    ├── Home
    ├── Profile
    ├── ChangePassword
    ├── Details
    └── Checkout
```

### Key Components

#### 1. **AppNavigator.jsx**
- Single unified stack navigator
- Dynamically sets `initialRouteName` based on `isUserOnboarded` state
- All screens are available in one place
- Removes complexity of managing separate navigators

#### 2. **AuthContext.js**
Manages user authentication state:
- `user` - Current user object (null if logged out)
- `isUserOnboarded` - Boolean flag indicating if user is authenticated
- `isLoading` - Loading state during app initialization
- `isGuest` - Flag for guest users
- Provides methods: `login()`, `SignUp()`, `logout()`, `completeOnboarding()`

#### 3. **useAuth Hook**
Provides access to auth context methods and state throughout the app.

---

## Navigation Flow

### 1. **App Launch**
```
App Loads
↓
Check AsyncStorage for saved user
↓
isLoading = true
↓
Show SplashScreen
↓
isLoading = false
↓
Check isUserOnboarded
```

### 2. **Authentication Flow (New User)**
```
Onboarding Screen
↓
User can:
├─ → Login Screen → Enter credentials → completeOnboarding()
├─ → Register Screen → Create account → SignUp()
└─ → Continue as Guest (createGuestUser())
↓
isUserOnboarded = true
↓
Navigate to Home Screen
```

### 3. **Authenticated User Flow**
```
isUserOnboarded = true
↓
initialRouteName = 'Home'
↓
Available Screens:
├─ Home (Browse menu, view orders)
├─ Details (Product details)
├─ Checkout (Order summary)
├─ Profile (Edit profile, preferences)
│   ├─ Change Password
│   └─ Logout (with confirmation)
└─ Navigation prevents access to auth screens (Login, Register, Onboarding)
```

### 4. **Logout Flow (NEW)**
```
User on Profile Screen
↓
Tap "Logout" Button
↓
Confirmation Alert:
├─ "Cancel" → Stay on Profile Screen
└─ "Logout" → Proceed with logout
    ↓
    logout() called
    ↓
    AsyncStorage cleared
    ↓
    user = null
    ↓
    isUserOnboarded = false
    ↓
    App automatically resets to Onboarding Screen
    ↓
    All app screens become inaccessible
```

---

## Key Features

### 1. **Unified Stack Navigation**
**Advantage:** Single source of truth for all routes
- Simple and maintainable
- Avoids complexity of conditional navigator switching
- Automatic reset on auth state change

### 2. **Logout Confirmation**
**Prevents Accidental Logout:**
- Alert dialog appears when logout button is tapped
- Two options: Cancel or Logout
- Only logs out on explicit confirmation

### 3. **Dynamic Initial Route**
```javascript
initialRouteName={isUserOnboarded ? 'Home' : 'Onboarding'}
```
- If `isUserOnboarded = true` → Start at Home
- If `isUserOnboarded = false` → Start at Onboarding

### 4. **SplashScreen During Load**
- Shows while app checks AsyncStorage for saved user
- Prevents flashing of wrong screens
- Better UX during app startup

---

## State Management

### User State Persistence
```
User Logs In / Signs Up
↓
completeOnboarding() or SignUp() called
↓
User data saved to AsyncStorage
↓
isUserOnboarded = true
↓
User data persists across app restarts
```

### User State Clear
```
User Logs Out
↓
logout() called
↓
AsyncStorage cleared
↓
user = null
↓
isUserOnboarded = false
↓
App resets to Onboarding Screen
↓
User must log in again on next launch
```

---

## Screen Details

| Screen | Route Name | When Accessible | Purpose |
|--------|-----------|-----------------|---------|
| Onboarding | `Onboarding` | Before login | First-time user experience |
| Login | `Login` | Before login | User authentication |
| Register | `Register` | Before login | Account creation |
| Home | `Home` | After login | Browse menu items |
| Details | `Details` | After login | View product details |
| Checkout | `Checkout` | After login | Review & complete order |
| Profile | `Profile` | After login | Edit profile & logout |
| ChangePassword | `ChangePassword` | After login | Change account password |

---

## Error Handling

### Navigation Error Prevention
- ✅ No attempts to navigate to non-existent routes
- ✅ All screens properly defined in single stack
- ✅ Dynamic initial route prevents invalid starting states

### Auth Error Handling
- Failed login shows alert with error message
- Failed logout shows alert with error message
- Confirmation dialog prevents accidental logout

---

## Workflow Summary

1. **Load** → Check auth state
2. **Unregistered** → Show Onboarding, Login, Register
3. **Registered** → Show Home and all app screens
4. **Logout Confirmation** → Prevent accidental logout
5. **After Logout** → Reset to Onboarding, clear all user data
6. **Restart App** → Check AsyncStorage, restore session or start fresh

---

## Files Involved

- `navigation/AppNavigator.jsx` - Main navigation logic
- `context/AuthContext.js` - Authentication state management
- `hooks/useAuth.js` - Auth hook for accessing context
- `screens/ProfileScreen.js` - Contains logout confirmation
- All other screens access navigation via `navigation` prop

---

## Best Practices

✅ **Always use logout confirmation** to prevent accidental account logout
✅ **Let auth state changes trigger navigation** instead of manual resets
✅ **Clear AsyncStorage on logout** to prevent unauthorized access
✅ **Show loading state** during auth checks
✅ **Handle all error cases** with user-friendly alerts
