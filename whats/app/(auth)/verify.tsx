import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const login = useStore(state => state.login);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'otp' | 'profile'>('otp');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (code.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('profile');
      }, 1000);
    } else {
      alert("Enter a 6-digit code");
    }
  };

  const handleFinish = () => {
    if (name.trim().length > 0) {
      login(phone as string, name);
      router.replace('/(tabs)');
    } else {
      alert("Please enter your name");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
        
        {step === 'otp' ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Verifying your number</Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Waiting to automatically detect an SMS sent to +1 {phone}.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: colors.text, borderBottomColor: colors.tint, textAlign: 'center', letterSpacing: 5 }]}
                placeholder="- - - - - -"
                placeholderTextColor={colors.secondaryText}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                autoFocus
              />
            </View>
            <Text style={{ color: colors.secondaryText, marginTop: 20 }}>Enter any 6 digits to verify</Text>

            <View style={{ flex: 1 }} />

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.tint, opacity: code.length === 6 ? 1 : 0.5 }]} 
              onPress={handleVerify}
              disabled={code.length !== 6 || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
             <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Profile info</Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                Please provide your name and an optional profile photo.
              </Text>
            </View>

            <View style={styles.avatarPlaceholder}>
              <Text style={{ color: '#fff', fontSize: 12 }}>ADD PHOTO</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { color: colors.text, borderBottomColor: colors.tint }]}
                placeholder="Type your name here"
                placeholderTextColor={colors.secondaryText}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.tint, opacity: name.trim().length > 0 ? 1 : 0.5 }]} 
              onPress={handleFinish}
              disabled={name.trim().length === 0}
            >
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
          </>
        )}
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
    width: '60%',
  },
  input: {
    flex: 1,
    fontSize: 24,
    paddingBottom: 5,
    borderBottomWidth: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 24,
    marginBottom: 40,
    minWidth: 100,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  }
});
