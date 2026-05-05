import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = () => {
    if (phoneNumber.length > 5) {
      router.push({ pathname: '/(auth)/verify', params: { phone: phoneNumber } });
    } else {
      alert("Please enter a valid phone number");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Enter your phone number</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            WhatsApp will need to verify your account.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.prefix, { color: colors.text }]}>+1</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderBottomColor: colors.tint }]}
            placeholder="phone number"
            placeholderTextColor={colors.secondaryText}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoFocus
          />
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.tint, opacity: phoneNumber.length > 5 ? 1 : 0.5 }]} 
          onPress={handleNext}
          disabled={phoneNumber.length <= 5}
        >
          <Text style={styles.buttonText}>Next</Text>
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
  prefix: {
    fontSize: 20,
    marginRight: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
