import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const requestOtp = useStore(state => state.requestOtp);
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (email.includes('@') && email.includes('.')) {
      setLoading(true);
      try {
        await requestOtp(email);
        router.push({ pathname: '/(auth)/verify', params: { email } });
      } catch (error) {
        alert("Failed to send OTP. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a valid email address");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Enter your email address</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            WhatsApp will need to verify your account.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: colors.text, borderBottomColor: colors.tint }]}
            placeholder="email@example.com"
            placeholderTextColor={colors.secondaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            autoFocus
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.tint, opacity: email.length > 5 && !loading ? 1 : 0.5 }]} 
          onPress={handleNext}
          disabled={email.length <= 5 || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  input: {
    flex: 1,
    fontSize: 20,
    paddingBottom: 5,
    borderBottomWidth: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 24,
    marginBottom: 40,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
