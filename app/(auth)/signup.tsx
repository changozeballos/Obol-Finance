import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { shadow } from '../../constants/platform';
import { supabase } from '../../lib/supabase';
import { ONBOARDING_KEY } from '../../constants/keys';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'Ingresá tu nombre (mínimo 2 caracteres)';
    if (!EMAIL_RE.test(email.trim())) return 'Ingresá un email válido';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/(tabs)');
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColors = ['#ccc', '#EF4444', '#F59E0B', '#16A34A'];
  const strengthLabels = ['', 'Débil', 'Media', 'Fuerte'];

  return (
    <LinearGradient colors={['#4F46E5', '#7C3AED', '#6D28D9']} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.logo}>🪙</Text>
            <Text style={styles.title}>{t('auth.signupTitle')}</Text>
            <Text style={styles.sub}>Gratis para siempre</Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.name')}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(v) => { setName(v); setError(''); }}
                  placeholder="Juan García"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(''); }}
                  placeholder="tu@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.password')}</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                  autoComplete="new-password"
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength ? strengthColors[strength] : Colors.border }]} />
                  ))}
                  <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>{strengthLabels[strength]}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, (!name || !email || !password || loading) && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={!name || !email || !password || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>{t('auth.signupCta')}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.btnSocial} onPress={() => {}}>
              <Text style={styles.socialIcon}>🌐</Text>
              <Text style={styles.btnSocialText}>{t('auth.googleCta')}</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity style={[styles.btnSocial, styles.btnApple]} onPress={() => {}}>
                <Ionicons name="logo-apple" size={18} color="#fff" />
                <Text style={[styles.btnSocialText, { color: '#fff' }]}>{t('auth.appleCta')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.switchRow} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.switchText}>{t('auth.hasAccount')} </Text>
            <Text style={styles.switchLink}>{t('auth.loginCta')}</Text>
          </TouchableOpacity>
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
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 44, marginBottom: 6 },
  title: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 26, color: '#fff', textAlign: 'center' },
  sub: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: '#A5B4FC', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 24, gap: 16, ...shadow(8, 24, '#000', 0.12, 8) },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12 },
  errorText: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: '#DC2626', flex: 1 },
  field: { gap: 6 },
  label: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: Colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontFamily: 'Baloo2_400Regular', fontSize: 15, color: Colors.text, paddingVertical: 13 },
  eyeBtn: { padding: 4 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, width: 44, textAlign: 'right' },
  btnPrimary: { backgroundColor: '#16A34A', paddingVertical: 15, borderRadius: 18, alignItems: 'center', ...shadow(6, 12, '#16A34A', 0.35, 6) },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: Colors.textMuted },
  btnSocial: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 18, borderWidth: 2, borderColor: Colors.border, backgroundColor: '#fff' },
  btnApple: { backgroundColor: '#000', borderColor: '#000' },
  socialIcon: { fontSize: 18 },
  btnSocialText: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: Colors.text },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  switchText: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: '#C7D2FE' },
  switchLink: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff' },
});
