/**
 * PATTERN 2 — Drawer / Hamburger Navigation (createDrawerNavigator)
 *
 * The same four core screens, plus an extra "About" screen that the drawer
 * can tuck away (a key advantage of drawers: secondary destinations don't
 * consume tab-bar space). Opened by the hamburger button or an edge swipe.
 */

import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from '@/hooks/use-theme';

import AboutScreen from '@/screens/about-screen';
import CartScreen from '@/screens/cart-screen';
import MenuScreen from '@/screens/menu-screen';
import OrdersScreen from '@/screens/orders-screen';
import ProfileScreen from '@/screens/profile-screen';
import { PatternSwitchButton } from './pattern-switch-button';
import type { RootParamList } from './types';

const Drawer = createDrawerNavigator<RootParamList>();

const DRAWER_ICONS: Record<keyof RootParamList, keyof typeof Ionicons.glyphMap> = {
  Menu: 'cafe',
  Cart: 'cart',
  Orders: 'receipt',
  Profile: 'person',
  About: 'information-circle',
};

type Props = {
  /** Demo toggle: swaps the whole root navigator to the tab pattern. */
  onSwitchPattern: () => void;
};

export function DrawerNavigator({ onSwitchPattern }: Props) {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        drawerActiveTintColor: theme.text,
        drawerInactiveTintColor: theme.textSecondary,
        drawerIcon: ({ color, size, focused }) => (
          // `focused` picks the filled variant when the route is active.
          <Ionicons
            name={
              focused
                ? DRAWER_ICONS[route.name]
                : (`${DRAWER_ICONS[route.name]}-outline` as keyof typeof Ionicons.glyphMap)
            }
            size={size}
            color={color}
          />
        ),
        // Header-right button flips between the two navigation patterns.
        headerRight: () => <PatternSwitchButton label="← Try tabs" onPress={onSwitchPattern} />,
      })}>
      <Drawer.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: 'Menu', headerTitle: 'Brew & Board' }}
      />
      <Drawer.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Drawer.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      {/* Secondary destination — only reachable from the drawer. */}
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
    </Drawer.Navigator>
  );
}
