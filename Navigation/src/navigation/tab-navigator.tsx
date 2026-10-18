/**
 * PATTERN 1 — Bottom Tab Navigation (createBottomTabNavigator)
 *
 * Four core screens sit in a persistent bottom bar: Menu, Cart, Orders,
 * Profile. Best for this app because ordering is the core loop and every
 * step deserves one-tap, thumb-reachable access.
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/hooks/use-theme';

import CartScreen from '@/screens/cart-screen';
import MenuScreen from '@/screens/menu-screen';
import OrdersScreen from '@/screens/orders-screen';
import ProfileScreen from '@/screens/profile-screen';
import { PatternSwitchButton } from './pattern-switch-button';
import type { RootParamList } from './types';

const Tab = createBottomTabNavigator<RootParamList>();

/** Ionicon name for each route — kept in a map so screenOptions stays tidy. */
const TAB_ICONS: Record<keyof RootParamList, keyof typeof Ionicons.glyphMap> = {
  Menu: 'cafe',
  Cart: 'cart',
  Orders: 'receipt',
  Profile: 'person',
  About: 'information-circle',
};

type Props = {
  /** Demo toggle: swaps the whole root navigator to the drawer pattern. */
  onSwitchPattern: () => void;
};

export function TabNavigator({ onSwitchPattern }: Props) {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name] : (`${TAB_ICONS[route.name]}-outline` as keyof typeof Ionicons.glyphMap)}
            size={size}
            color={color}
          />
        ),
        // Header-right button flips between the two navigation patterns.
        headerRight: () => <PatternSwitchButton label="Try drawer →" onPress={onSwitchPattern} />,
      })}>
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu', headerTitle: 'Brew & Board' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
