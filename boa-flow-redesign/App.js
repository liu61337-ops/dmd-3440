import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './src/theme';
import { AppProvider } from './src/AppContext';

import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import ConfirmDisputeScreen from './src/screens/ConfirmDisputeScreen';
import SelectReasonScreen from './src/screens/SelectReasonScreen';
import AdditionalDetailsScreen from './src/screens/AdditionalDetailsScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ConfirmationScreen from './src/screens/ConfirmationScreen';
import DisputesListScreen from './src/screens/DisputesListScreen';
import DisputeDetailScreen from './src/screens/DisputeDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="TransactionDetail"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
            <Stack.Screen name="ConfirmDispute" component={ConfirmDisputeScreen} />
            <Stack.Screen name="SelectReason" component={SelectReasonScreen} />
            <Stack.Screen name="AdditionalDetails" component={AdditionalDetailsScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
            <Stack.Screen name="DisputesList" component={DisputesListScreen} />
            <Stack.Screen name="DisputeDetail" component={DisputeDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
