import React from 'react';
import { View, Text } from 'react-native';
import { Screen, ScreenHeader, Card, Divider } from '../components/Layout';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { spacing, type } from '../theme';
import { transaction } from '../data/mockData';

export default function ConfirmDisputeScreen({ navigation }) {
  return (
    <Screen scroll={false}>
      <ScreenHeader title="Confirm dispute" />

      <Card>
        <Text style={type.body}>You're about to dispute:</Text>
        <Divider />
        <Text style={type.title}>{transaction.merchant}</Text>
        <Text style={[type.amountLarge, { marginTop: 4 }]}>
          ${transaction.amount.toFixed(2)}
        </Text>
        <Text style={[type.bodyMuted, { marginTop: 2 }]}>{transaction.date}</Text>
      </Card>

      <View style={{ flex: 1 }} />

      <View style={{ gap: spacing.sm }}>
        <PrimaryButton
          label="Yes, continue"
          onPress={() => navigation.navigate('SelectReason')}
        />
        <SecondaryButton label="Cancel" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}
