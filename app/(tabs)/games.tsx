import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { PigAvatar } from '../../components/PigAvatar';

const GAMES = [
  {
    id: 'trivia_financiera',
    title: 'Trivia Financiera',
    description: '30+ preguntas sobre economía y finanzas · Timer · Sistema de rachas',
    icon: '🧠',
    color: '#8B5CF6',
    deep: '#4C1D95',
    badge: 'NUEVO',
    route: '/game/trivia',
  },
  {
    id: 'precio_correcto',
    title: '¿Cuánto cuesta?',
    description: 'Adiviná el precio real de productos argentinos con el slider',
    icon: '🏷️',
    color: '#F59E0B',
    deep: '#92400E',
    badge: 'NUEVO',
    route: '/game/precio-correcto',
  },
  {
    id: 'inflacion_run',
    title: 'Inflación Run',
    description: 'Protegé $100.000 durante 12 meses eligiendo dónde invertir',
    icon: '📉',
    color: '#EF4444',
    deep: '#7F1D1D',
    badge: 'NUEVO',
    route: '/game/inflacion-run',
  },
  {
    id: 'mercado_virtual',
    title: 'Mercado Virtual',
    description: 'Operá acciones y bonos argentinos durante 20 días',
    icon: '📈',
    color: '#10B981',
    deep: '#064E3B',
    badge: 'NUEVO',
    route: '/game/mercado',
  },
  {
    id: 'presupuesto_challenge',
    title: 'Desafío Presupuesto',
    description: 'Distribuí el sueldo, enfrentá imprevistos y maximizá tu ahorro',
    icon: '💼',
    color: '#3B82F6',
    deep: '#1E3A8A',
    badge: 'NUEVO',
    route: '/game/presupuesto',
  },
];

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Juegos</Text>
        <Text style={styles.subheading}>Aprendé jugando</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero pig */}
        <View style={styles.heroWrap}>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroBanner}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroPigCircle}>
                <PigAvatar mood="celebrating" size={70} overrideBg="transparent" />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>5 minijuegos</Text>
                <Text style={styles.heroDesc}>
                  Economía y finanzas personales{'\n'}aprendidas jugando
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionLabel}>Disponibles ahora</Text>

        <View style={styles.gamesList}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              activeOpacity={0.85}
              onPress={() => router.push(game.route as any)}
            >
              <LinearGradient
                colors={[game.color + '22', game.color + '08'] as any}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.gameCardGradient}
              >
                <View style={[styles.gameIconWrap, { backgroundColor: game.color + '28', borderColor: game.color + '44' }]}>
                  <Text style={styles.gameIcon}>{game.icon}</Text>
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDesc}>{game.description}</Text>
                </View>
                <View style={[styles.gameBadge, { backgroundColor: game.color + '22', borderColor: game.color + '55' }]}>
                  <Text style={[styles.gameBadgeText, { color: game.color }]}>{game.badge}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heading: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24, color: Colors.text },
  subheading: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: Colors.textMuted, marginTop: 1 },

  scroll: { padding: 16, paddingBottom: 48, gap: 16 },

  // Hero
  heroWrap: { borderRadius: 24, overflow: 'hidden' },
  heroBanner: { padding: 20 },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroPigCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontFamily: 'Baloo2_800ExtraBold', fontSize: 22, color: '#fff',
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontFamily: 'Baloo2_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)',
    lineHeight: 19, marginTop: 4,
  },

  sectionLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 11, color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
  },

  gamesList: { gap: 12 },
  gameCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border },
  gameCardGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 14,
  },
  gameIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  gameIcon: { fontSize: 26 },
  gameInfo: { flex: 1, gap: 3 },
  gameTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: Colors.text },
  gameDesc: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  gameBadge: {
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  gameBadgeText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 8.5, letterSpacing: 0.5 },

  footer: {
    alignItems: 'center', paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  footerText: {
    fontFamily: 'Baloo2_400Regular', fontSize: 13,
    color: Colors.textMuted, textAlign: 'center', lineHeight: 20,
  },
});
