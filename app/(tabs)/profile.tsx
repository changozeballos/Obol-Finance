import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../../constants/Colors';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ONBOARDING_KEY } from '../../constants/keys';
import { router } from 'expo-router';
import { PigAvatar } from '../../components/PigAvatar';

function StatCard({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { streak, totalXp, level, hearts, completedLessons, perfectLessons, language } = useProgressStore();
  const { session } = useAuthStore();

  const achievements = useMemo(() => [
    {
      icon: '🐷',
      label: 'Bienvenido',
      desc: 'Abriste Obol por primera vez',
      earned: true,
    },
    {
      icon: '📖',
      label: 'Primer paso',
      desc: 'Completá 1 lección',
      earned: completedLessons.length >= 1,
    },
    {
      icon: '⭐',
      label: '100 XP',
      desc: 'Primeros 100 XP',
      earned: totalXp >= 100,
    },
    {
      icon: '📚',
      label: 'Estudiante',
      desc: '5 lecciones completadas',
      earned: completedLessons.length >= 5,
    },
    {
      icon: '🎓',
      label: 'Dedicado',
      desc: '15 lecciones completadas',
      earned: completedLessons.length >= 15,
    },
    {
      icon: '🔥',
      label: 'Racha inicial',
      desc: '3 días seguidos',
      earned: streak >= 3,
    },
    {
      icon: '💪',
      label: 'Constante',
      desc: '7 días seguidos',
      earned: streak >= 7,
    },
    {
      icon: '💎',
      label: 'Perfecto',
      desc: '100% en una lección',
      earned: perfectLessons.length >= 1,
    },
    {
      icon: '🌍',
      label: 'Viajero',
      desc: 'Cambió el idioma',
      earned: language !== 'es',
    },
    {
      icon: '🏆',
      label: 'Campeón',
      desc: 'Top 3 en la liga',
      earned: false,
    },
  ], [completedLessons.length, totalXp, streak, perfectLessons.length, language]);

  const displayName = session?.user?.user_metadata?.full_name ?? session?.user?.email?.split('@')[0] ?? 'Usuario';
  const email = session?.user?.email ?? '';
  const xpInLevel = totalXp % 500;
  const levelPct = (xpInLevel / 500) * 100;

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
    Alert.alert(t('profile.logout'), '¿Seguro que querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: doLogout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>{t('profile.title')}</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + info */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={() => router.push('/character')} activeOpacity={0.85}>
            <PigAvatar mood="neutral" size={70} showAccessories />
            <View style={styles.editBadge}>
              <Ionicons name="brush" size={10} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
            <View style={styles.levelRow}>
              <Text style={styles.levelBadge}>{t('profile.level')} {level}</Text>
              <Text style={styles.levelXp}>{xpInLevel}/500 XP</Text>
            </View>
            <View style={styles.levelBar}>
              <View style={[styles.levelFill, { width: `${levelPct}%` }]} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard emoji="🔥" value={streak} label={t('profile.streak')} />
          <StatCard emoji="⭐" value={totalXp.toLocaleString()} label={t('profile.totalXp')} />
          <StatCard emoji="📚" value={completedLessons.length} label={t('profile.lessonsCompleted')} />
          <StatCard emoji="❤️" value={hearts} label="Vidas" />
        </View>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>{t('profile.achievements')}</Text>
        <View style={styles.achievementGrid}>
          {achievements.map((a) => (
            <View key={a.label} style={[styles.achievement, !a.earned && styles.achievementLocked]}>
              <Text style={[styles.achievementIcon, !a.earned && styles.achievementIconLocked]}>{a.icon}</Text>
              <Text style={[styles.achievementLabel, !a.earned && styles.achievementLabelLocked]}>{a.label}</Text>
              <Text style={styles.achievementDesc} numberOfLines={1}>{a.desc}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: Colors.border, ...Shadows.sm },
  heading: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24, color: Colors.text },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, gap: 16 },
  profileCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: Colors.text },
  profileEmail: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted },
  levelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  levelBadge: { fontFamily: 'Baloo2_700Bold', fontSize: 12, color: Colors.primary, backgroundColor: Colors.surfaceMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  levelXp: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: Colors.textMuted },
  levelBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  levelFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  statsGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', gap: 4, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  statEmoji: { fontSize: 24 },
  statVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 22, color: Colors.text },
  statLabel: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: Colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievement: { width: '30%', flex: 1, minWidth: '30%', backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 4, borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  achievementLocked: { backgroundColor: Colors.surfaceMuted, opacity: 0.6 },
  achievementIcon: { fontSize: 26 },
  achievementIconLocked: { opacity: 0.4 },
  achievementLabel: { fontFamily: 'Baloo2_700Bold', fontSize: 11, color: Colors.text, textAlign: 'center' },
  achievementLabelLocked: { color: Colors.textMuted },
  achievementDesc: { fontFamily: 'Baloo2_400Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', marginTop: 8 },
  logoutText: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#DC2626' },
});
