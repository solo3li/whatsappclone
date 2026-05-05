import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

function useProtectedRoute(isAuthenticated: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isNavigationReady]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const loadStoredAuth = useStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useProtectedRoute(isAuthenticated);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background }
      }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ title: '' }} />
        <Stack.Screen name="call/[id]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Profile' }} />
      </Stack>
    </>
  );
}
