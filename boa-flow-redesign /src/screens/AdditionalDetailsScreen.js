import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, Card } from '../components/Layout';
import { PrimaryButton, TextLink } from '../components/Buttons';
import StepProgress from '../components/StepProgress';
import { colors, radius, spacing, type } from '../theme';
import { AppContext } from '../AppContext';

export default function AdditionalDetailsScreen({ navigation }) {
  const { notes, setNotes } = useContext(AppContext);
  const [localNotes, setLocalNotes] = useState(notes || '');

  function handleContinue() {
    setNotes(localNotes);
    navigation.navigate('Review');
  }

  return (
    <Screen>
      <ScreenHeader
        title="Add details"
        subtitle="Optional — helps us resolve this faster, but you can skip it."
      />
      <StepProgress step={2} total={3} />

      <Card>
        <Text style={type.label}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Anything else we should know?"
          placeholderTextColor={colors.inkMuted}
          value={localNotes}
          onChangeText={setLocalNotes}
        />
      </Card>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Continue" onPress={handleContinue} />
      <View style={{ height: spacing.sm }} />
      <TextLink label="Skip for now" onPress={handleContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  textArea: {
    marginTop: spacing.sm,
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: 'top',
  },
});
