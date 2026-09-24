import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { Screen, ScreenHeader, Card, Divider } from '../components/Layout';
import { PrimaryButton, TextLink } from '../components/Buttons';
import StepProgress from '../components/StepProgress';
import { spacing, type } from '../theme';
import { transaction } from '../data/mockData';
import { AppContext } from '../AppContext';

export default function ReviewScreen({ navigation }) {
  const { reasonLabel, notes, submitDispute } = useContext(AppContext);

  function handleSubmit() {
    const referenceNumber = submitDispute();
    navigation.navigate('Confirmation', { referenceNumber });
  }

  return (
    <Screen>
      <ScreenHeader title="Review your dispute" />
      <StepProgress step={3} total={3} />

      <Card>
        <SectionHeader label="TRANSACTION" onEdit={() => navigation.navigate('TransactionDetail')} />
        <Text style={type.title}>{transaction.merchant}</Text>
        <Text style={type.bodyMuted}>
          ${transaction.amount.toFixed(2)} · {transaction.date}
        </Text>

        <Divider />

        <SectionHeader label="REASON" onEdit={() => navigation.navigate('SelectReason')} />
        <Text style={type.body}>{reasonLabel}</Text>

        <Divider />

        <SectionHeader label="NOTES" onEdit={() => navigation.navigate('AdditionalDetails')} />
        <Text style={type.body}>{notes ? notes : 'No notes added'}</Text>
      </Card>

      <View style={{ height: spacing.xl }} />
      <PrimaryButton label="Submit dispute" onPress={handleSubmit} />
    </Screen>
  );
}

function SectionHeader({ label, onEdit }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
      <Text style={type.label}>{label}</Text>
      <TextLink label="Edit" onPress={onEdit} />
    </View>
  );
}
