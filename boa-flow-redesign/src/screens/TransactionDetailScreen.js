import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, Card, Divider } from '../components/Layout';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { colors, spacing, type } from '../theme';
import { transaction } from '../data/mockData';
import { AppContext } from '../AppContext';

export default function TransactionDetailScreen({ navigation }) {
  const { resetForm } = useContext(AppContext);

  return (
    <Screen>
      <ScreenHeader title="Transaction" subtitle={transaction.account} />

      <Card>
        <Text style={type.label}>MERCHANT</Text>
        <Text style={[type.title, { marginTop: 4, marginBottom: spacing.md }]}>
          {transaction.merchant}
        </Text>

        <Text style={type.amountLarge}>-${transaction.amount.toFixed(2)}</Text>
        <Text style={[type.bodyMuted, { marginTop: 2 }]}>{transaction.date}</Text>

        <Divider />

        <Row label="Status" value="Posted" />
        <Row label="Account" value={transaction.account} />
      </Card>

      <View style={{ height: spacing.lg }} />

      <View style={styles.disputeBlock}>
        <Text style={[type.body, { marginBottom: spacing.md }]}>
          Don't recognize this charge, or think something's wrong with it?
        </Text>
        <PrimaryButton
          label="Dispute this charge"
          tone="alert"
          onPress={() => {
            resetForm();
            navigation.navigate('ConfirmDispute');
          }}
        />
      </View>

      <View style={{ height: spacing.lg }} />
      <SecondaryButton
        label="View my disputes"
        onPress={() => navigation.navigate('DisputesList')}
      />
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={type.bodyMuted}>{label}</Text>
      <Text style={type.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  disputeBlock: { backgroundColor: colors.alertMuted, borderRadius: 14, padding: spacing.lg },
});
