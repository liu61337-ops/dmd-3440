/**
 * Cart screen — shows what was added on the Menu screen.
 * The "Place order" button navigates to the Orders screen, demonstrating
 * navigation BETWEEN sibling routes in both the tab and drawer patterns.
 */

import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RootParamList } from '@/navigation/types';
import { useCart } from '@/state/cart-context';

export default function CartScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootParamList>>();
  const { items, total, removeItem, clearCart } = useCart();

  const placeOrder = () => {
    clearCart();
    navigation.navigate('Orders');
  };

  if (items.length === 0) {
    return (
      <ThemedView style={styles.emptyState}>
        <ThemedText type="subtitle">🛒</ThemedText>
        <ThemedText type="smallBold">Your cart is empty</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Head to the Menu tab and tap + on something delicious.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        {items.map((line) => (
          <Pressable
            key={line.lineId}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${line.name}`}
            onPress={() => removeItem(line.lineId)}
            style={({ pressed }) => [styles.line, pressed && { opacity: 0.7 }]}>
            <ThemedText style={styles.lineName}>{line.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ${line.price.toFixed(2)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              ✕
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ThemedText type="smallBold">Total</ThemedText>
        <ThemedText type="smallBold">${total.toFixed(2)}</ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={placeOrder}
        style={({ pressed }) => [styles.orderButton, { backgroundColor: theme.text }, pressed && { opacity: 0.8 }]}>
        <ThemedText type="smallBold" themeColor="background">
          Place order
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  lineName: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8884',
  },
  orderButton: {
    margin: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
});
