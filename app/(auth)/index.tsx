import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { shadow } from '../../constants/platform';
import { useProgressStore } from '../../store/progressStore';
import { ONBOARDING_KEY } from '../../constants/keys';
import type { Language } from '../../types';
import i18n from '../../i18n';

const { width } = Dimensions.get('window');

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: 'es', flag: '🇦🇷', label: 'ES' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useProgressStore();

  const selectLang = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleGuest = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#4F46E5', '#7C3AED', '#6D28D9']} style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>🪙 Obol</Text>
        <Text style={styles.tagline}>{t('onboarding.tagline')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
        <Image
          source={require('../../assets/characters/neutral-plata.png')}
          style={styles.pig}
          resizeMode="contain"
        />
        <View style={styles.langRow}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langBtn, language === l.code && styles.langBtnActive]}
              onPress={() => selectLang(l.code)}
            >
              <Text style={[styles.langText, language === l.code && styles.langTextActive]}>
                {l.flag} {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.btnPrimaryText}>{t('onboarding.start')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.btnSecondaryText}>{t('onboarding.login')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGuest} onPress={handleGuest}>
          <Text style={styles.btnGuestText}>Continuar como invitado</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    gap: 8,
  },
  logo: { fontSize: 40, fontFamily: 'Baloo2_800ExtraBold', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 18, fontFamily: 'Baloo2_700Bold', color: '#C7D2FE', textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    color: '#A5B4FC',
    textAlign: 'center',
    lineHeight: 20,
  },
  pig: { width: 200, height: 200, marginVertical: 8 },
  langRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff44',
    backgroundColor: '#ffffff11',
  },
  langBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  langText: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: '#fff' },
  langTextActive: { color: '#4F46E5' },
  bottom: { padding: 24, paddingBottom: 48, gap: 12 },
  btnPrimary: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    ...shadow(6, 16, '#16A34A', 0.4, 8),
  },
  btnPrimaryText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff44',
  },
  btnSecondaryText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#C7D2FE' },
  btnGuest: { paddingVertical: 12, alignItems: 'center' },
  btnGuestText: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textDecorationLine: 'underline',
  },
});
