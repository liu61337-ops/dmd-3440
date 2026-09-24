import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

const STATUS_MAP = {
  submitted: { label: 'Submitted', bg: colors.primaryMuted, fg: colors.primary },
  under_review: { label: 'Under review', bg: colors.amberMuted, fg: colors.amber },
  resolved: { label: 'Resolved', bg: colors.surfaceMuted, fg: colors.inkMuted },
};

export default function StatusChip({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.submitted;
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '700' },
});
