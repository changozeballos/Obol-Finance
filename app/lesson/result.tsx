import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/Colors';
import { textShadow, nativeDriver } from '../../constants/platform';
import { useProgressStore } from '../../store/progressStore';

const PIG_CELEBRATING = require('../../assets/characters/festejando.png');
const PIG_MOTIVATING = require('../../assets/characters/motivado.png');
const PIG_NEUTRAL = require('../../assets/characters/neutral.png');

function Star({ delay, size }: { delay: number; size: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: nativeDriver }),
    ]).start();
  }, []);
  return (
    <Animated.Text
      style={{
        fontSize: size,
        transform: [
          { scale: anim },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] }) },
        ],
        opacity: anim,
      }}
    >
      ⭐
    </Animated.Text>
  );
}

function XpCounter({ value }: { value: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: nativeDriver }).start();
  }, []);
  return (
    <Animated.Text style={[styles.xpValue, { transform: [{ scale: scaleAnim }] }]}>
      +{value}
    </Animated.Text>
  );
}

export default function ResultScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ lessonId: string; correct: string; total: string; xp: string; color: string }>();

  const correct = parseInt(params.correct ?? '0');
  const total = parseInt(params.total ?? '1');
  const xp = parseInt(params.xp ?? '0');
  const color = params.color ?? Colors.primary;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const { streak } = useProgressStore();

  const pigImage = accuracy === 100 ? PIG_CELEBRATING : accuracy >= 60 ? PIG_MOTIVATING : PIG_NEUTRAL;

  const titleKey =
    accuracy === 100 ? 'result.perfect' :
    accuracy >= 80 ? 'result.great' :
    accuracy >= 60 ? 'result.good' :
    'result.keep_going';

  const bgColors: [string, string, string] =
    accuracy === 100
      ? ['#4F46E5', '#7C3AED', '#6D28D9']
      : accuracy >= 60
      ? [color, color + 'dd', color + 'aa']
      : ['#6B7280', '#4B5563', '#374151'];

  const pigAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pigAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: nativeDriver }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, delay: 300, useNativeDriver: nativeDriver }),
      Animated.spring(cardAnim, { toValue: 0, tension: 55, friction: 8, useNativeDriver: nativeDriver }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={bgColors} style={styles.container}>
      {/* Stars row for perfect */}
      {accuracy === 100 && (
        <View style={styles.starsRow}>
          <Star delay={200} size={28} />
          <Star delay={0} size={40} />
          <Star delay={200} size={28} />
        </View>
      )}

      {/* Pig */}
      <Animated.View style={[styles.pigWrap, { transform: [{ scale: pigAnim }] }]}>
        <Image source={pigImage} style={styles.pig} resizeMode="contain" />
      </Animated.View>

      <Text style={styles.title}>{t(titleKey)}</Text>

      {/* Stats card */}
      <Animated.View
        style={[
          styles.card,
          { opacity: cardOpacity, transform: [{ translateY: cardAnim }] },
        ]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNum}>{correct}/{total}</Text>
            <Text style={styles.statLabel}>Respuestas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNum}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statLabel}>{t('result.newStreak')}</Text>
          </View>
        </View>

        <View style={styles.xpRow}>
          <View style={[styles.xpBadge, { backgroundColor: color }]}>
            <Text style={styles.xpLabel}>{t('result.xpEarned')}</Text>
            <XpCounter value={xp} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: color }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.continueBtnText}>{t('result.continue')}</Text>
        </TouchableOpacity>

        {accuracy < 60 && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.replace(`/lesson/${params.lessonId}`)}
          >
            <Text style={styles.retryBtnText}>{t('result.retry')}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pigWrap: { marginBottom: 12 },
  pig: { width: 160, height: 160 },
  title: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 30, color: '#fff', textAlign: 'center', marginBottom: 20, ...textShadow(2, 8, '#00000033') },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    gap: 20,
    ...Shadows.lg,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statNum: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 22, color: Colors.text },
  statLabel: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  statDivider: { width: 1, height: 48, backgroundColor: Colors.border },
  xpRow: { alignItems: 'center' },
  xpBadge: { borderRadius: 20, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', gap: 2, minWidth: 140 },
  xpLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 12, color: '#ffffffcc', letterSpacing: 0.5, textTransform: 'uppercase' },
  xpValue: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 36, color: '#fff' },
  continueBtn: { paddingVertical: 16, borderRadius: 20, alignItems: 'center', ...Shadows.md },
  continueBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 17, color: '#fff' },
  retryBtn: { paddingVertical: 14, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  retryBtnText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: Colors.text },
});
