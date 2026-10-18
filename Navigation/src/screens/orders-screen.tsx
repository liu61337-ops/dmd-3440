/**
 * Orders screen — shows past orders. In the demo, placing an order from the
 * Cart screen jumps here, which shows cross-screen navigation working in
 * both the tab and drawer patterns.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type Order = {
  id: string;
  items: string;
  time: string;
  status: 'Picked up' | 'Brewing';
};

const PAST_ORDERS: Order[] = [
  { id: '1042', items: 'Flat White, Butter Croissant', time: 'Today, 8:14 AM', status: 'Picked up' },
  { id: '1039', items: 'Cold Brew', time: 'Yesterday, 3:02 PM', status: 'Picked up' },
  { id: '1035', items: 'Matcha Latte, Basque Cheesecake', time: 'Mon, 11:47 AM', status: 'Picked up' },
];

export default function OrdersScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.listContent}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
          Tap an order to reorder — or just admire your caffeine history.
        </ThemedText>
        {PAST_ORDERS.map((order) => (
          <ThemedView key={order.id} type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="smallBold">Order #{order.id}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {order.status}
              </ThemedText>
            </View>
            <ThemedText type="small">{order.items}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {order.time}
            </ThemedText>
          </ThemedView>
        ))}
      </View>
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
  caption: {
    marginBottom: Spacing.one,
  },
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
