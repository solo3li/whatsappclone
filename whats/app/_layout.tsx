import { Stack, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

import { View, ActivityIndicator } from 'react-native';

function useProtectedRoute(isAuthenticated: boolean, isAuthLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady || isAuthLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isAuthLoading, segments, isNavigationReady]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const isAuthLoading = useStore((state) => state.isAuthLoading);
  const loadStoredAuth = useStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useProtectedRoute(isAuthenticated, isAuthLoading);

  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

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
        <Stack.Screen name="contacts" options={{ title: 'Select Contact' }} />
        <Stack.Screen name="chat/[id]" options={{ title: '' }} />
        <Stack.Screen name="call/[id]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Profile' }} />
      </Stack>
    </>
  );
}
