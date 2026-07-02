import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgressStore } from '../store/progressStore';
import { shadow } from '../constants/platform';

const PATHS = [
  { id: 'fundamentos',    label: 'Fundamentos',    icon: '🌱', color: '#F59E0B' },
  { id: 'economia',       label: 'Economía',       icon: '🏪', color: '#3B82F6' },
  { id: 'finanzas',       label: 'Finanzas',       icon: '🐷', color: '#10B981' },
  { id: 'desmitificando', label: 'Desmitificando', icon: '🔍', color: '#8B5CF6' },
];

export function FinishLine() {
  const { streak, totalXp, level } = useProgressStore();

  return (
    <View>
      {/* Top checkered stripe */}
      <View style={styles.stripeTop} />

      <LinearGradient
        colors={['#0F0A2A', '#1E1B4B', '#312E81', '#4338CA', '#1E1B4B']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.card}
      >
        {/* Trophy block */}
        <View style={styles.trophyBox}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.trophyTitle}>MAESTRO FINANCIERO</Text>
          <Text style={styles.trophySubtitle}>CERTIFICADO DE CONOCIMIENTO</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'RACHA', value: `${streak}d` },
            { label: 'XP TOTAL', value: totalXp.toLocaleString() },
            { label: 'NIVEL', value: `${level}` },
            { label: 'MUNDOS', value: '4' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quote */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "La educación financiera no es sobre tener dinero, es sobre entender cómo funciona el mundo."
          </Text>
          <Text style={styles.quoteAuthor}>— Obol 🐷</Text>
        </View>

        {/* Path badges */}
        <View style={styles.badgeRow}>
          {PATHS.map((p) => (
            <View key={p.id} style={[styles.badge, { backgroundColor: p.color + '28', borderColor: p.color + '55' }]}>
              <Text style={{ fontSize: 13 }}>{p.icon}</Text>
              <Text style={[styles.badgeLabel, { color: p.color }]}>{p.label}</Text>
              <Text style={[styles.badgeCheck, { color: p.color }]}>✓</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>🚀 COMPARTIR MI LOGRO</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* Bottom checkered stripe */}
      <View style={styles.stripeBottom} />
    </View>
  );
}

const CHECKER = {
  backgroundImage: undefined as any,
};

const styles = StyleSheet.create({
  stripeTop: {
    height: 10,
    backgroundColor: '#F59E0B',
    ...shadow(2, 12, '#F59E0B', 0.4, 4),
  },
  stripeBottom: {
    height: 8,
    backgroundColor: '#1E1B4B',
  },
  card: {
    padding: 28,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 20,
  },
  trophyBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 4,
  },
  trophy: { fontSize: 68, textAlign: 'center' },
  trophyTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#FDE68A',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  trophySubtitle: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
  },
  statValue: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: '#F59E0B',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  quoteBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  quoteText: {
    fontFamily: 'Baloo2_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 10,
    color: '#F59E0B',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeLabel: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  badgeCheck: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 11,
  },
  cta: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...shadow(5, 0, '#92400E', 0.5, 6),
  },
  ctaGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
