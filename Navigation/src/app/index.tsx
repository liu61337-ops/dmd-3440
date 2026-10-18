/**
 * Root route of the app (Expo Router entry).
 *
 * Expo Router SDK 58 vendors its own navigation core (it is no longer built
 * on @react-navigation/*), so it does NOT provide the NavigationContainer
 * that createBottomTabNavigator / createDrawerNavigator expect. We therefore
 * mount our own independent <NavigationContainer> here and nest the demo
 * navigator inside it.
 *
 * DEMO SWITCHER: instead of a settings screen, this route holds a tiny piece
 * of state and mounts EITHER the bottom-tab navigator OR the drawer
 * navigator as the app's root. Press "Try drawer →" / "← Try tabs" in the
 * header to flip between the two patterns live.
 */

import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { DrawerNavigator } from '@/navigation/drawer-navigator';
import { TabNavigator } from '@/navigation/tab-navigator';
import type { NavigationPattern } from '@/navigation/types';
import { CartProvider } from '@/state/cart-context';

export default function RootSwitcherScreen() {
  const colorScheme = useColorScheme();
  const [pattern, setPattern] = useState<NavigationPattern>('tabs');

  const switchPattern = () => setPattern((current) => (current === 'tabs' ? 'drawer' : 'tabs'));

  return (
    // React Navigation v7 supports nesting containers directly — no
    // `independent` prop needed (it was removed in v7).
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <CartProvider>
        {pattern === 'tabs' ? (
          <TabNavigator onSwitchPattern={switchPattern} />
        ) : (
          <DrawerNavigator onSwitchPattern={switchPattern} />
        )}
      </CartProvider>
    </NavigationContainer>
  );
}
