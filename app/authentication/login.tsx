import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin() {
    //TODO: hook up to Supabase auth
    router.replace('/(tabs)/camera');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🏆</Text>
          <Text style={styles.appName}>Log In</Text>
          <Text style={styles.tagline}>Enter your email and password to log in</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Google button */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
              <Text style={styles.eyeEmoji}>{showPassword ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rememberRow}>
            <View style={styles.checkbox} />
            <Text style={styles.rememberText}>Remember me</Text>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },

  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: '900', color: Colors.primary, marginBottom: 6 },
  tagline: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16,
    elevation: 8, gap: 14,
  },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingVertical: 14, gap: 10,
  },
  googleIcon: {
    fontSize: 18, fontWeight: '800',
    color: '#4285F4',
  },
  googleText: { fontSize: 15, fontWeight: '600', color: Colors.text },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, color: Colors.textMuted },

  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.text,
  },
  passwordRow: {
    flexDirection: 'row',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.text,
  },
  eyeBtn: { paddingHorizontal: 12 },
  eyeEmoji: { fontSize: 18 },

  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  rememberText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  forgotBtn: {},
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  loginBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: Colors.textSecondary },
  signupLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
