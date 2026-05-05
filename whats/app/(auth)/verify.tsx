import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Stack } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const verifyOtp = useStore(state => state.verifyOtp);
  const updateProfile = useStore(state => state.updateProfile);
  const currentUser = useStore(state => state.currentUser);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'otp' | 'profile'>('otp');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length === 6) {
      setLoading(true);
      const success = await verifyOtp(email as string, code);
      setLoading(false);
      
      if (success) {
        // useStore updated currentUser. Check if name is set.
        // We need to wait for state update or check the return value.
        // verifyOtp returns true if success.
        // Let's check the store's currentUser after state update.
        // But Zustand updates are immediate in the next render.
        // I'll check the name from the current state (which will be updated).
        // Actually, let's just transition to profile if needed.
        setStep('profile'); 
      } else {
        alert("Invalid code. Please try again.");
      }
    } else {
      alert("Enter a 6-digit code");
    }
  };

  const handleFinish = async () => {
    if (name.trim().length > 0) {
      setLoading(true);
      try {
        await updateProfile(name, '', 'Hey there! I am using WhatsApp.');
        router.replace('/(tabs)');
      } catch (error) {
        alert("Failed to update profile.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter your name");
    }
  };

  // If we already have a name after verification, we can skip the profile step
  React.useEffect(() => {
    if (step === 'profile' && currentUser?.name) {
      router.replace('/(tabs)');
    }
  }, [step, currentUser]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
        
        {step === 'otp' ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Verifying your email</Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                A verification code has been sent to {email}.
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

            <View style={{ flex: 1 }} />

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.tint, opacity: code.length === 6 && !loading ? 1 : 0.5 }]} 
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
              <Ionicons name="camera" size={30} color="#fff" />
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
              style={[styles.button, { backgroundColor: colors.tint, opacity: name.trim().length > 0 && !loading ? 1 : 0.5 }]} 
              onPress={handleFinish}
              disabled={name.trim().length === 0 || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Finish</Text>}
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
    minWidth: 120,
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
