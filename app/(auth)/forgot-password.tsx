import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { shadow } from '../../constants/platform';
import { supabase } from '../../lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Ingresá un email válido');
      return;
    }
    setLoading(true);
    setError('');
    // Supabase returns success even if the email doesn't exist — no info leak
    await supabase.auth.resetPasswordForEmail(trimmed);
    setLoading(false);
    setSent(true);
  };

  return (
    <LinearGradient colors={['#4F46E5', '#7C3AED', '#6D28D9']} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.logo}>🔑</Text>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.sub}>
              Te enviamos un enlace para restablecer tu contraseña
            </Text>
          </View>

          {sent ? (
            <View style={styles.card}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={56} color="#16A34A" />
              </View>
              <Text style={styles.successTitle}>¡Listo!</Text>
              <Text style={styles.successDesc}>
                Si el email existe en Obol, vas a recibir un enlace en los próximos minutos.
                Revisá tu carpeta de spam también.
              </Text>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={styles.btnPrimaryText}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputRow}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={Colors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setError(''); }}
                    placeholder="tu@email.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="send"
                    onSubmitEditing={handleReset}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, (!email || loading) && styles.btnDisabled]}
                onPress={handleReset}
                disabled={!email || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Enviar enlace</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  header: { alignItems: 'center', marginBottom: 28, gap: 8 },
  logo: { fontSize: 44 },
  title: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 26, color: '#fff', textAlign: 'center' },
  sub: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    color: '#A5B4FC',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    gap: 16,
    ...shadow(8, 24, '#000', 0.12, 8),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: '#DC2626', flex: 1 },
  field: { gap: 6 },
  label: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: Colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontFamily: 'Baloo2_400Regular',
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 13,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    ...shadow(6, 12, Colors.primary, 0.35, 6),
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  successIcon: { alignItems: 'center', paddingTop: 8 },
  successTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    color: Colors.text,
    textAlign: 'center',
  },
  successDesc: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
