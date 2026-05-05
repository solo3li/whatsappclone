import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ title: '' }} />
      </Stack>
    </>
  );
}
