# Navigation — DMD 3440 Assignment

A coffee-shop ordering app ("Brew & Board") built with **Expo + React Native** that implements **two navigation patterns** for the same set of screens using `@react-navigation`:

| Pattern | Library | Where |
| --- | --- | --- |
| 1. Bottom Tab Bar | `@react-navigation/bottom-tabs` | `src/navigation/tab-navigator.tsx` |
| 2. Drawer / Hamburger | `@react-navigation/drawer` | `src/navigation/drawer-navigator.tsx` |

## Running the app

```bash
npm install
npx expo start
```

Then open in **Expo Go** (scan the QR code) or press `i` / `a` for a simulator.

## Switching between the two patterns

The app's root route (`src/app/index.tsx`) is a temporary **demo switcher**: it mounts either the tab navigator or the drawer navigator based on local state.

- In the **tab** version, press **"Try drawer →"** in the header.
- In the **drawer** version, press **"← Try tabs"** in the header (or open the hamburger menu / swipe from the left edge).

The alternative — hard-coding one navigator as the root export — also works: each pattern is a self-contained component (`<TabNavigator />` / `<DrawerNavigator />`), so you can swap which one `src/app/index.tsx` renders.

## Project structure

```
src/
  app/                    # Expo Router entry (thin shell)
    _layout.tsx           # Root Stack hosting the single switcher route
    index.tsx             # Demo switcher: mounts tabs OR drawer
  navigation/             # ★ All React Navigation code lives here
    types.ts              # Shared RootParamList for both patterns
    tab-navigator.tsx     # PATTERN 1: createBottomTabNavigator
    drawer-navigator.tsx  # PATTERN 2: createDrawerNavigator
    pattern-switch-button.tsx  # Temporary demo toggle in the header
  screens/                # Screens shared by BOTH patterns
    menu-screen.tsx       # Home / menu list (tap + to add to cart)
    cart-screen.tsx       # Cart; "Place order" navigates to Orders
    orders-screen.tsx     # Past orders
    profile-screen.tsx    # Account / settings-style rows
    about-screen.tsx      # Drawer-only secondary destination
  state/
    cart-context.tsx      # Tiny in-memory cart (no persistence, on purpose)
  constants/menu.ts       # Static menu data
  components/, hooks/     # ThemedText, ThemedView, useTheme, etc.
```

## Design notes (for the video demo)

- **Tabs** make the core ordering loop (Menu → Cart → Orders) one tap away at all times — great for frequently used, peer-level destinations, and comfortably thumb-reachable.
- **Drawer** keeps the same screens but tucks an extra **About** page into the menu without spending tab-bar space — better for secondary destinations, at the cost of an extra gesture for the core loop.
- For this app, **tabs feel more intuitive** for daily ordering; the drawer is the better home for low-frequency pages like About/Help.
