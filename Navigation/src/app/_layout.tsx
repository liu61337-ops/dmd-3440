import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

/**
 * Expo Router root layout. The actual navigation patterns (bottom tabs and
 * drawer) are defined in src/navigation/ and mounted by src/app/index.tsx.
 * The Stack here just hosts that single route with no chrome of its own.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
