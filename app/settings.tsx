import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../constants/Colors';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { ONBOARDING_KEY } from '../constants/keys';
import { setupDailyReminder, cancelDailyReminder } from '../lib/notifications';
import type { Language } from '../types';

const NOTIF_PERM_KEY = '@obol_notif_v1';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇦🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  rightElement,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? '#DC2626' : Colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ?? (
        onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} /> : null
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function SettingsScreen() {
  const { i18n } = useTranslation();
  const { language, setLanguage, streak, totalXp, level } = useProgressStore();
  const { session } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_PERM_KEY).then((val) => {
      setNotificationsEnabled(val === 'granted');
    });
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await setupDailyReminder();
      // Re-read actual state in case permission was denied by OS
      const actual = await AsyncStorage.getItem(NOTIF_PERM_KEY);
      setNotificationsEnabled(actual === 'granted');
    } else {
      await cancelDailyReminder();
      await AsyncStorage.setItem(NOTIF_PERM_KEY, 'denied');
    }
  };

  const displayName =
    session?.user?.user_metadata?.full_name ??
    session?.user?.email?.split('@')[0] ??
    'Usuario';
  const email = session?.user?.email ?? '';

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  const doLogout = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    router.replace('/(auth)');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Cerrar sesión?')) doLogout();
      return;
    }
    Alert.alert('Cerrar sesión', '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: doLogout },
    ]);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Account card */}
        <View style={styles.accountCard}>
          <View style={styles.accountAvatar}>
            <Text style={styles.accountAvatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.accountName}>{displayName}</Text>
            {email ? <Text style={styles.accountEmail}>{email}</Text> : null}
            <View style={styles.accountBadgeRow}>
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>Nivel {level}</Text>
              </View>
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>🔥 {streak}</Text>
              </View>
              <View style={styles.accountBadge}>
                <Text style={styles.accountBadgeText}>⭐ {totalXp.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Idioma */}
        <SectionHeader title="Idioma" />
        <View style={styles.card}>
          {LANGUAGES.map((lang, i) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langRow,
                i < LANGUAGES.length - 1 && styles.langRowBorder,
                language === lang.code && styles.langRowActive,
              ]}
              onPress={() => changeLanguage(lang.code)}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.langLabel,
                  language === lang.code && styles.langLabelActive,
                ]}
              >
                {lang.label}
              </Text>
              {language === lang.code && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferencias */}
        <SectionHeader title="Preferencias" />
        <View style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            label="Notificaciones"
            subtitle="Recordatorios de práctica diaria"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notificationsEnabled ? Colors.primary : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Mi personaje */}
        <SectionHeader title="Personaje" />
        <View style={styles.card}>
          <SettingsRow
            icon="color-palette-outline"
            label="Personalizar mi chanchito"
            subtitle="Accesorios, colores y más"
            onPress={() => router.push('/character')}
          />
        </View>

        {/* Información */}
        <SectionHeader title="Información" />
        <View style={styles.card}>
          <SettingsRow
            icon="information-circle-outline"
            label="Versión"
            subtitle="1.0.0"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            label="Términos de uso"
            onPress={() => router.push('/legal/terms')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Política de privacidad"
            onPress={() => router.push('/legal/privacy')}
          />
        </View>

        {/* Cuenta */}
        <SectionHeader title="Cuenta" />
        <View style={styles.card}>
          <SettingsRow
            icon="log-out-outline"
            label="Cerrar sesión"
            onPress={handleLogout}
            danger
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: Colors.text },
  scroll: { padding: 16, gap: 8, paddingBottom: 40 },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 8,
    ...Shadows.sm,
  },
  accountAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24,
    color: '#fff',
  },
  accountName: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: Colors.text },
  accountEmail: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted },
  accountBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  accountBadge: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  accountBadgeText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 11,
    color: Colors.primary,
  },
  sectionTitle: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#FEE2E2' },
  rowLabel: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: Colors.text },
  rowLabelDanger: { color: '#DC2626' },
  rowSubtitle: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  langRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  langRowActive: { backgroundColor: Colors.surfaceMuted },
  langFlag: { fontSize: 22 },
  langLabel: { flex: 1, fontFamily: 'Baloo2_700Bold', fontSize: 14, color: Colors.textMuted },
  langLabelActive: { color: Colors.primary },
});
