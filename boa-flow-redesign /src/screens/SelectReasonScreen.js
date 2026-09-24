import React, { useContext, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Screen, ScreenHeader } from '../components/Layout';
import { PrimaryButton } from '../components/Buttons';
import StepProgress from '../components/StepProgress';
import { colors, radius, spacing, type } from '../theme';
import { disputeReasons } from '../data/mockData';
import { AppContext } from '../AppContext';

export default function SelectReasonScreen({ navigation }) {
  const { reasonId, setReasonId, setReasonLabel } = useContext(AppContext);
  const [selected, setSelected] = useState(reasonId);

  function handleContinue() {
    const reason = disputeReasons.find((r) => r.id === selected);
    setReasonId(selected);
    setReasonLabel(reason.label);
    navigation.navigate('AdditionalDetails');
  }

  return (
    <Screen>
      <ScreenHeader title="Why are you disputing this?" />
      <StepProgress step={1} total={3} />

      <View style={{ gap: spacing.sm }}>
        {disputeReasons.map((reason) => {
          const active = selected === reason.id;
          return (
            <Pressable
              key={reason.id}
              onPress={() => setSelected(reason.id)}
              style={[
                styles.option,
                active && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
              ]}
            >
              <View style={[styles.radio, active && styles.radioActive]}>
                {active ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={type.body}>{reason.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Continue" onPress={handleContinue} disabled={!selected} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
