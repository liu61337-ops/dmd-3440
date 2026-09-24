import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

// Used only on the screens that are genuinely steps in one sequence
// (Confirm -> Reason -> Details -> Review). Not used elsewhere in the
// app, since a step marker only means something when the content is
// actually an ordered process.
export default function StepProgress({ step, total = 4 }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < step;
        return (
          <View
            key={i}
            style={[
              styles.dash,
              { backgroundColor: filled ? colors.primary : colors.surfaceMuted },
            ]}
          />
        );
      })}
      <Text style={styles.text}>
        Step {step} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  dash: { flex: 1, height: 4, borderRadius: 2, marginRight: 6 },
  text: { marginLeft: 6, fontSize: 12, color: colors.inkMuted, fontWeight: '600' },
});
