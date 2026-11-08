import React, { useContext } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Screen, ScreenHeader } from '../components/Layout';
import StatusChip from '../components/StatusChip';
import { colors, radius, spacing, type } from '../theme';
import { AppContext } from '../AppContext';

export default function DisputesListScreen({ navigation }) {
  const { disputes } = useContext(AppContext);

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Disputes" subtitle="Everything you've disputed, in one place." />

      <FlatList
        data={disputes}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('DisputeDetail', { disputeId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{item.merchant}</Text>
              <Text style={type.bodyMuted}>
                ${item.amount.toFixed(2)} · {item.date}
              </Text>
            </View>
            <StatusChip status={item.status} />
          </Pressable>
        )}
        ListEmptyComponent={<Text style={type.bodyMuted}>No disputes yet.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
