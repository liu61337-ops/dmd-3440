import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { Screen, ScreenHeader, Card, Divider } from '../components/Layout';
import { PrimaryButton } from '../components/Buttons';
import StatusChip from '../components/StatusChip';
import { spacing, type } from '../theme';
import { AppContext } from '../AppContext';

export default function DisputeDetailScreen({ route }) {
  const { disputeId } = route.params;
  const { disputes, resolveDispute } = useContext(AppContext);
  const item = disputes.find((d) => d.id === disputeId);

  if (!item) {
    return (
      <Screen>
        <Text style={type.body}>Dispute not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title={`Dispute ${item.id}`} />

      <Card>
        <Text style={type.title}>{item.merchant}</Text>
        <Text style={type.bodyMuted}>
          ${item.amount.toFixed(2)} · {item.date}
        </Text>

        <Divider />

        <Row label="Status" value={<StatusChip status={item.status} />} />
        <Row label="Reason" value={<Text style={type.body}>{item.reason}</Text>} />
        {item.outcome ? (
          <Row label="Outcome" value={<Text style={type.body}>{item.outcome}</Text>} />
        ) : null}
      </Card>

      {item.status !== 'resolved' ? (
        <>
          <Text style={[type.bodyMuted, { marginVertical: spacing.lg }]}>
            We'll notify you here as soon as this dispute is resolved — no need to check back or
            call.
          </Text>
          {/* Demo-only: stands in for the bank resolving the dispute on
              its own timeline and notifying the user automatically. */}
          <PrimaryButton
            label="Simulate: mark as resolved"
            onPress={() => resolveDispute(item.id)}
          />
        </>
      ) : (
        <Text style={[type.bodyMuted, { marginTop: spacing.lg }]}>
          This dispute is closed. No further action needed.
        </Text>
      )}
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
      }}
    >
      <Text style={type.bodyMuted}>{label}</Text>
      {value}
    </View>
  );
}
