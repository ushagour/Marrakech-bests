# Marrakech Bites

A small React Native demo app for a restaurant-style onboarding and profile flow. The app shows a compact header, onboarding screen, profile editing (with masked phone input), and a reusable button component.


## screen shots


![auth](./markdown/screenshots/screen1.png)


## Scenario 

![Logo](./markdown/screenshots/scenario1.png)



## Features

- Onboarding with form validation (name + email) and Next button in the footer
- Profile screen with editable fields: First name, Family name, Email, Phone (US mask)
- Avatar with initials fallback when no image is uploaded
- Notification preferences (checkboxes)
- Persistent profile saved to device using AsyncStorage
- Reusable `AppButton` component for consistent buttons across screens
- **SQLite Integration**: Menu data persisted locally for fast offline access
- **Cold-start Optimization**: Loads from local DB on subsequent app launches, fetches remote API only when needed
- **Debounced Search**: Search queries are debounced by 500ms to minimize database hits while typing, improving performance and UX

## Debounced Search Feature

The app implements a performance-optimized search feature that minimizes database queries and unnecessary re-renders while users type. When a user enters text in the search field, the search operation is **debounced** for 500 milliseconds — meaning the database query only executes after the user pauses typing for half a second.

**How It Works:**

1. User types in the search input field → `query` state updates instantly (provides immediate visual feedback).
2. A custom `useDebounce` hook delays the actual search value (`debouncedQuery`) by 500ms.
3. Every keystroke resets the 500ms timer; if the user pauses, the timer completes.
4. Once 500ms elapses without typing, `debouncedQuery` updates and triggers a search effect.
5. The `useEffect` runs `searchItemsByText(db, debouncedQuery)` to query the SQLite database.
6. Results are mapped to UI format and displayed in the menu list.
7. If the search field is empty, all items are reloaded.

**Benefits:**

- **Performance**: Reduces database queries from ~1 per keystroke to ~1 per word (e.g., typing "salad" = 1 query instead of 5).
- **Smooth UI**: Input responds instantly; search happens after the user finishes typing.
- **Battery & Network Efficient**: Fewer queries mean less CPU and I/O on the device.
- **Better UX**: Avoids flickering results while typing and shows final results only once.

**Technical Implementation:**
