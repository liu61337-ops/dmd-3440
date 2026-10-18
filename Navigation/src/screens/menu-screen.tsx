/**
 * Menu screen — the app's home. Shared by BOTH navigators (tabs and drawer),
 * so it has no header of its own; the navigator provides the header.
 */

import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MENU_ITEMS, type MenuItem } from '@/constants/menu';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/state/cart-context';

function MenuRow({ item }: { item: MenuItem }) {
  const theme = useTheme();
  const { addItem } = useCart();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
      <View style={styles.cardBody}>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.description}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          ${item.price.toFixed(2)}
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add ${item.name} to cart`}
        onPress={() => addItem({ name: item.name, price: item.price })}
        style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7, backgroundColor: theme.backgroundSelected }]}>
        <Ionicons name="add" size={22} color={theme.text} />
      </Pressable>
    </ThemedView>
  );
}

export default function MenuScreen() {
  return (
    <FlatList
      data={MENU_ITEMS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.header}>
          <ThemedText type="subtitle">Good morning ☀️</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Tap + to add a drink or bite to your order.
          </ThemedText>
        </View>
      }
      renderItem={({ item }) => <MenuRow item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: Spacing.three,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  emoji: {
    fontSize: 32,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
