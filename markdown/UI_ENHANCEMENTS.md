# Menu Item UI Enhancements

This document describes the new menu data fields and their UI implementation.

## New Menu Data Fields

### 1. **Rating** (Number)
- **Example:** `4.7`
- **UI Implementation:**
  - Displayed as a badge next to the item name
  - Shows a golden star icon with the rating number
  - Background color: Light yellow (`#FFF8DC`)
  - Only shown if rating exists

**Visual:** ⭐ 4.7 (gold star badge)

---

### 2. **Prepare Time** (String)
- **Example:** `"10 mins"`
- **UI Implementation:**
  - Displayed in the footer row next to the price
  - Clock icon (`schedule`) with the time text
  - Background: Light gray pill/chip (`#F5F5F5`)
  - Helps users know how long to wait

**Visual:** [clock icon] 10 mins

---

### 3. **Available** (Boolean)
- **Example:** `true` or `false`
- **UI Implementation:**
  - If `false`: Shows red "Out of Stock" badge below the description
  - Background: Light red (`#FFE5E5`)
  - Text color: Red (`#C41E3A`)
  - Only displayed when item is unavailable
  - Item card remains interactive but clearly marked

**Visual (when unavailable):** Out of Stock [red badge]

---

### 4. **Tags** (Array of Strings)
- **Example:** `["vegetarian", "healthy", "fresh"]`
- **UI Implementation:**
  - Displayed as colorful pills/chips below the description
  - Each tag has a unique color scheme:
    - **vegetarian**: Green background (`#E8F5E9`)
    - **healthy**: Blue background (`#E3F2FD`)
    - **fresh**: Pink background (`#FCE4EC`)
  - Tags are flexible and wrap to multiple lines if needed
  - Small font (11px) for compact display
  - Only shown if tags exist

**Visual:**
```
[vegetarian] [healthy] [fresh]
```

---

## Card Layout Structure

```
┌─────────────────────────────────────┐
│ Name                          ⭐4.7 │  <- Title with rating badge
│ Out of Stock                        │  <- Availability badge (if unavailable)
│ Description text here...            │
│ [vegetarian] [healthy] [fresh]      │  <- Tags
│ 49.99 MAD          [📅] 10 mins     │  <- Price and prepare time
├─────────────────────────────────────┤
│      [Image]                        │
└─────────────────────────────────────┘
```

---

## Database Schema Update

The menu table now includes these new columns:

```sql
CREATE TABLE menu (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  price REAL,
  category TEXT,
  image TEXT,
  rating REAL,          -- NEW
  prepareTime TEXT,     -- NEW
  available INTEGER,    -- NEW (1 = true, 0 = false)
  tags TEXT             -- NEW (stored as JSON string)
)
```

---

## Example Menu Item

```javascript
{
  id: 1,
  name: "Greek Salad",
  description: "Fresh vegetables with feta cheese",
  price: 9.99,
  category: "Starters",
  image: "greek-salad.jpg",
  rating: 4.7,
  prepareTime: "10 mins",
  available: true,
  tags: ["vegetarian", "healthy", "fresh"]
}
```

---

## Implementation Details

### Color Scheme
- **Rating:** Gold/amber (`#FFB81C`)
- **Vegetarian tag:** Green (`#2E7D32`)
- **Healthy tag:** Blue (`#1565C0`)
- **Fresh tag:** Pink (`#C2185B`)
- **Out of Stock:** Red (`#C41E3A`)

### Icons Used
- Rating: `MaterialIcons` → `"star"`
- Prepare Time: `MaterialIcons` → `"schedule"`

### Font Sizes
- Title: 16px (bold)
- Rating text: 12px (bold)
- Description: 13px
- Tags: 11px (bold)
- Prepare Time: 12px
- Price: 16px (bold)

---

## Responsive Design

The card layout is responsive:
- **Mobile:** Compact with smaller font sizes and spacing
- **Tablet:** Slightly larger with 90x90 images instead of 70x70

---

## Future Enhancement Ideas

1. Add clickable tags to filter menu by tag
2. Implement "Favorite" rating system separate from dish rating
3. Add sorting by "Most Popular" (highest rating)
4. Show estimated price for delivery time (longer = cheaper delivery)
5. Add allergen tags in addition to dietary tags
6. Create a "New" badge for recently added items
7. Add promotional badges (e.g., "20% Off", "Bestseller")
