import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View, Text, Button } from 'react-native';

export default function MenuScreen() {
  const router = useRouter();
  return (
    <View>
       <Text>Choose an option below:</Text>
        <Button title="<-- Back" onPress={() => router.back()} />
    </View>
  );
}