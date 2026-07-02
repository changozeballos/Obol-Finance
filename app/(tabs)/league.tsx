import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Shadows } from '../../constants/Colors';
import { useProgressStore } from '../../store/progressStore';

const MOCK_LEAGUE = [
  { name: 'Lucas M.', xp: 2840, streak: 14, avatar: '🧑' },
  { name: 'María G.', xp: 2610, streak: 9, avatar: '👩' },
  { name: 'Tú', xp: 0, streak: 0, avatar: '🐷', isUser: true },
  { name: 'Carlos P.', xp: 1920, streak: 5, avatar: '🧔' },
  { name: 'Sofía R.', xp: 1750, streak: 7, avatar: '👧' },
  { name: 'Diego F.', xp: 1540, streak: 3, avatar: '🧑‍💼' },
  { name: 'Ana L.', xp: 1320, streak: 11, avatar: '👩‍🎓' },
  { name: 'Pablo K.', xp: 980, streak: 2, avatar: '🧑‍💻' },
  { name: 'Julia S.', xp: 750, streak: 4, avatar: '👩‍🎤' },
  { name: 'Tomás B.', xp: 540, streak: 1, avatar: '🧑‍🏫' },
];

const LEAGUE_COLORS = ['#F59E0B', '#94A3B8', '#B45309'];
const TROPHY_EMOJIS = ['🥇', '🥈', '🥉'];

export default function LeagueScreen() {
  const { t } = useTranslation();
  const { totalXp, streak } = useProgressStore();

  const leaderboard = MOCK_LEAGUE.map((entry) =>
    entry.isUser ? { ...entry, xp: totalXp, streak } : entry
  ).sort((a, b) => b.xp - a.xp);

  const userRank = leaderboard.findIndex((e) => e.isUser) + 1;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Liga Bronce</Text>
        <View style={styles.leagueIcon}>
          <Text style={styles.leagueEmoji}>🏆</Text>
        </View>
      </View>

      <View style={styles.podiumWrap}>
        <View style={styles.podiumCard}>
          {leaderboard.slice(0, 3).map((entry, i) => (
            <View key={entry.name} style={[styles.podiumEntry, i === 0 && styles.podiumFirst]}>
              <Text style={[styles.podiumTrophy, { color: LEAGUE_COLORS[i] }]}>{TROPHY_EMOJIS[i]}</Text>
              <Text style={styles.podiumAvatar}>{entry.avatar}</Text>
              <Text style={[styles.podiumName, entry.isUser && styles.nameUser]} numberOfLines={1}>{entry.name}</Text>
              <Text style={styles.podiumXp}>{entry.xp.toLocaleString()} XP</Text>
            </View>
          ))}
        </View>
        {userRank > 0 && (
          <Text style={styles.userRank}>Tu posición: #{userRank}</Text>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {leaderboard.map((entry, i) => (
          <View
            key={entry.name}
            style={[
              styles.row,
              entry.isUser && styles.rowUser,
              i < 3 && styles.rowTop,
            ]}
          >
            <Text style={[styles.rank, i < 3 && { color: LEAGUE_COLORS[i] }]}>{i + 1}</Text>
            <Text style={styles.avatar}>{entry.avatar}</Text>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowName, entry.isUser && styles.nameUser]}>{entry.name}</Text>
              <Text style={styles.rowStreak}>🔥 {entry.streak} días</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowXp}>{entry.xp.toLocaleString()}</Text>
              <Text style={styles.rowXpLabel}>XP</Text>
            </View>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: Colors.border, ...Shadows.sm },
  heading: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24, color: Colors.text },
  leagueIcon: { backgroundColor: '#FEF3C7', borderRadius: 16, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FDE68A' },
  leagueEmoji: { fontSize: 22 },
  podiumWrap: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 2, borderBottomColor: Colors.border },
  podiumCard: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 8 },
  podiumEntry: { alignItems: 'center', gap: 4, flex: 1 },
  podiumFirst: { marginTop: -8 },
  podiumTrophy: { fontSize: 22 },
  podiumAvatar: { fontSize: 30, backgroundColor: Colors.background, borderRadius: 24, width: 48, height: 48, textAlign: 'center', lineHeight: 48 },
  podiumName: { fontFamily: 'Baloo2_700Bold', fontSize: 12, color: Colors.text, textAlign: 'center' },
  podiumXp: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: Colors.textMuted },
  nameUser: { color: Colors.primary },
  userRank: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  scroll: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 8, gap: 12, borderWidth: 2, borderColor: Colors.border },
  rowUser: { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  rowTop: { borderColor: Colors.border },
  rank: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: Colors.textMuted, width: 28, textAlign: 'center' },
  avatar: { fontSize: 26 },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: Colors.text },
  rowStreak: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted },
  rowRight: { alignItems: 'flex-end' },
  rowXp: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: Colors.text },
  rowXpLabel: { fontFamily: 'Baloo2_400Regular', fontSize: 10, color: Colors.textMuted },
});
