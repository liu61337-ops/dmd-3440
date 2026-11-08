import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { Screen, Card } from '../components/Layout';
import { PrimaryButton, TextLink } from '../components/Buttons';
import { colors, spacing, type } from '../theme';
import { AppContext } from '../AppContext';

export default function ConfirmationScreen({ navigation, route }) {
  const { referenceNumber } = route.params;
  const { resetForm } = useContext(AppContext);

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.check}>
          <Text style={{ fontSize: 30 }}>✓</Text>
        </View>

        <Text style={[type.display, { textAlign: 'center', marginTop: spacing.lg }]}>
          Dispute submitted
        </Text>
        <Text style={[type.bodyMuted, { textAlign: 'center', marginTop: 6 }]}>
          You'll hear back within 10 business days.
        </Text>

        <Card style={{ marginTop: spacing.xl }}>
          <Row label="Reference number" value={referenceNumber} />
          <Row label="Status" value="Submitted" />
        </Card>
      </View>

      <PrimaryButton
        label="View dispute status"
        onPress={() => {
          resetForm();
          navigation.navigate('DisputesList');
        }}
      />
      <View style={{ height: spacing.sm }} />
      <TextLink
        label="Back to accounts"
        onPress={() => {
          resetForm();
          navigation.navigate('TransactionDetail');
        }}
      />
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={type.bodyMuted}>{label}</Text>
      <Text style={[type.body, { fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

const styles = {
  check: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
