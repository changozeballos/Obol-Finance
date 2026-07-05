import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Colors } from '../../constants/Colors';
import { shadow, nativeDriver } from '../../constants/platform';
import { useProgressStore } from '../../store/progressStore';
import { PigAvatar } from '../../components/PigAvatar';
import { WorldScene } from '../../components/WorldScene';
import { WorldTransition } from '../../components/WorldTransition';
import { FinishLine } from '../../components/FinishLine';
import { useComputedSections } from '../../hooks/useComputedSections';
import type { Lesson, PathId, Section } from '../../types';

// ─── Background image map (section id → require) ─────────────────────────────
const SECTION_BG: Record<string, any> = {
  base_comun:            require('../../assets/background/bg_fundamentos.png'),
  inflation_prices:      require('../../assets/background/bg_inflation_prices.png'),
  goods_markets_intro:   require('../../assets/background/bg_bienes_mercados.png.png'),
  supply_demand_markets: require('../../assets/background/bg_oferta_demanda.png'),
  macro_indicators:      require('../../assets/background/bg_macroeconomia.png'),
  economic_policy:       require('../../assets/background/bg_politica_economica.png'),
  international_money:   require('../../assets/background/bg_dinero_internacional.png'),
  crises_cycles:         require('../../assets/background/bg_crisis_ciclos.png'),
  personal_budgeting:    require('../../assets/background/bg_presupuesto.png.png'),
  saving_track:          require('../../assets/background/bg_ahorro.png.png'),
  debt_credit:           require('../../assets/background/bg_deuda_credito.png.png'),
  investments_base:      require('../../assets/background/bg_inversiones_base.png.png'),
  capital_markets:       require('../../assets/background/bg_mercado_capitales.png.png'),
  crypto_track:          require('../../assets/background/bg_criptomonedas.png.png'),
  advanced_finance:      require('../../assets/background/bg_finanzas_avanzadas.png.png'),
  myths_busting:         require('../../assets/background/bg_desmitificando.png.png'),
  historia:              require('../../assets/background/bg_historia.png.png'),
};

// ─── Section taglines ─────────────────────────────────────────────────────────
const SECTION_DESC: Record<string, string> = {
  base_comun:            'Donde germinan tus primeras monedas',
  inflation_prices:      'Entendé por qué todo sube de precio',
  goods_markets_intro:   'Los mercados que mueven el mundo',
  supply_demand_markets: 'La danza entre oferta y demanda',
  macro_indicators:      'El pulso que mide la economía',
  economic_policy:       'Las palancas que manejan los gobiernos',
  international_money:   'El dinero no conoce fronteras',
  crises_cycles:         'Cuando la economía tiembla',
  personal_budgeting:    'Tu plata, tus reglas',
  saving_track:          'Ahorrá, invertí y hacé crecer tu chancho',
  debt_credit:           'Usá la deuda a tu favor',
  investments_base:      'Tu primer paso como inversor',
  capital_markets:       'Bolsas, bonos y mercados',
  crypto_track:          'El futuro del dinero digital',
  advanced_finance:      'Finanzas para los que quieren más',
  myths_busting:         'Desarmá las mentiras sobre la plata',
  historia:              'El dinero a través del tiempo',
};

// ─── Constants ───────────────────────────────────────────────────────────────
const NODE_D = 64;
const ZIG = [0, 58, -58, 58, 0, -58, 58, -58]; // fallback

// Offsets (px from center) medidos sobre cada imagen de fondo
const SECTION_ZIGS: Record<string, number[]> = {
  base_comun:            [0, -24, 31],
  inflation_prices:      [44, 5, 22, -62],
  goods_markets_intro:   [19, 2, 92, -35, 12],
  supply_demand_markets: [15, -62, -2],
  macro_indicators:      [47, -76, 75, -15],
  economic_policy:       [-13, 106, -115],
  international_money:   [115, -99, 67, -8],
  crises_cycles:         [-54, 85, 51],
  personal_budgeting:    [-90, 37, 4, -85],
  saving_track:          [-74, 93, -74, -33],
  debt_credit:           [-115, 105, -79, 107],
  investments_base:      [88, 25, -32, -14, 113],
  capital_markets:       [-35, -29, 89, -71],
  crypto_track:          [-6, 103, 111, -34, -138],
  advanced_finance:      [44, 18, 39, -143],
  myths_busting:         [-21, 93, -61, 0],
  historia:              [122, -148, 78, -110],
};

const PATH_META: Record<string, {
  name: string; accent: string; deep: string;
  skyTop: string; skyMid: string; skyBot: string;
  pig: 'happy' | 'motivated' | 'celebrating' | 'thinking';
}> = {
  fundamentos:    { name: 'Fundamentos',    accent: '#F59E0B', deep: '#B45309', skyTop: '#FFFBEB', skyMid: '#FEF3C7', skyBot: '#FDE68A', pig: 'celebrating' },
  economia:       { name: 'Economía',       accent: '#3B82F6', deep: '#1D4ED8', skyTop: '#EFF6FF', skyMid: '#DBEAFE', skyBot: '#BFDBFE', pig: 'thinking'   },
  finanzas:       { name: 'Finanzas',       accent: '#10B981', deep: '#065F46', skyTop: '#ECFDF5', skyMid: '#D1FAE5', skyBot: '#A7F3D0', pig: 'happy'      },
  desmitificando: { name: 'Desmitificando', accent: '#8B5CF6', deep: '#5B21B6', skyTop: '#F5F3FF', skyMid: '#EDE9FE', skyBot: '#DDD6FE', pig: 'motivated'  },
};

const WORLD_PATTERNS: Record<string, string> = {
  fundamentos:    'radial-gradient(circle, rgba(255,255,255,.11) 1px, transparent 1px)',
  economia:       'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)',
  finanzas:       'radial-gradient(ellipse, rgba(255,255,255,.09) 1px, transparent 1px)',
  desmitificando: 'radial-gradient(circle, rgba(255,255,255,.13) 1px, transparent 1px)',
};

// ─── TopBar ──────────────────────────────────────────────────────────────────
function TopBar() {
  const { streak, hearts, totalXp } = useProgressStore();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (streak > 0) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.22, duration: 700, useNativeDriver: nativeDriver }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: nativeDriver }),
      ])).start();
    }
  }, [streak]);

  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.pill}>
        <Animated.Text style={{ transform: [{ scale: pulse }], fontSize: 16 }}>🔥</Animated.Text>
        <Text style={[styles.pillVal, { color: Colors.streak }]}>{streak}</Text>
      </TouchableOpacity>

      <View style={styles.heartsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[{ fontSize: 15 }, i > hearts && { opacity: 0.22 }]}>❤️</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.pill}>
        <Text style={{ fontSize: 16 }}>⭐</Text>
        <Text style={styles.pillVal}>{totalXp.toLocaleString()}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── SectionHeader (WorldHeader) ─────────────────────────────────────────────
const PIG_OVERFLOW = 44; // px que el pig sobresale por encima de la card

function CardContent({ sec, meta, isFirstInWorld, done, total, pct, t }: any) {
  return (
    <>
      <Text style={styles.watermark}>{sec.icon}</Text>
      <LinearGradient
        colors={['rgba(255,255,255,0.28)', 'transparent'] as any}
        start={{ x: 0.8, y: 0 }} end={{ x: 0.2, y: 0.8 }}
        style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}
      />
      <View style={styles.chipRow}>
        <View style={styles.pathChip}>
          <Text style={styles.pathChipText}>{meta.name.toUpperCase()}</Text>
        </View>
        <View style={styles.progressChip}>
          <Text style={styles.progressChipText}>{done}/{total} lecciones</Text>
        </View>
      </View>
      <Text style={styles.headerTitle} numberOfLines={2}>{t(sec.titleKey)}</Text>
      {isFirstInWorld && SECTION_DESC[sec.id] && (
        <Text style={styles.headerSubtitle} numberOfLines={2}>{SECTION_DESC[sec.id]}</Text>
      )}
      <View style={styles.progressBarBg}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.55)'] as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${pct || 3}%` as any }]}
        />
      </View>
    </>
  );
}

function SectionHeader({ sec, isFirstInWorld, bgImage }: { sec: Section; isFirstInWorld: boolean; bgImage?: any }) {
  const { t } = useTranslation();
  const meta = PATH_META[sec.pathId] ?? PATH_META.fundamentos;
  const done  = sec.lessons.filter((l) => l.status === 'completed').length;
  const total = sec.lessons.length;
  const pct   = total > 0 ? (done / total) * 100 : 0;

  const spinAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 9000, useNativeDriver: nativeDriver })
    ).start();
  }, []);
  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.headerWrap, { marginTop: isFirstInWorld ? 24 : 16 }]}>
      {/* World intro ribbon */}
      {isFirstInWorld && (
        <View style={styles.ribbon}>
          <LinearGradient colors={['transparent', meta.accent + 'AA'] as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ribbonLine} />
          <Text style={[styles.ribbonText, { color: meta.accent }]}>✦ {meta.name.toUpperCase()} ✦</Text>
          <LinearGradient colors={[meta.accent + 'AA', 'transparent'] as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ribbonLine} />
        </View>
      )}

      {/* Pig overflow — flota sobre la card */}
      <View style={[styles.pigOverflowWrap, { pointerEvents: 'none' }]}>
        <Animated.View style={[styles.medallionRing, { transform: [{ rotate }] }]}>
          <LinearGradient
            colors={[meta.accent, 'rgba(255,255,255,0.75)', meta.accent, 'rgba(255,255,255,0.5)', meta.accent] as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 50 }}
          />
        </Animated.View>
        <View style={[styles.medallionInner, shadow(4, 10, meta.deep, 0.22, 6)]}>
          <PigAvatar mood={meta.pig} size={68} overrideBg="transparent" />
        </View>
      </View>

      {/* Card */}
      <View style={[styles.headerCard, shadow(8, 20, sec.color, 0.25, 8), { marginTop: PIG_OVERFLOW }]}>
        {bgImage ? (
          <ImageBackground
            source={bgImage}
            style={styles.headerGradient}
            imageStyle={{ borderRadius: 22 }}
            resizeMode="cover"
          >
            {/* Color tint overlay for readability */}
            <LinearGradient
              colors={[sec.color + 'BB', meta.deep + 'DD'] as any}
              start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1.1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <CardContent sec={sec} meta={meta} isFirstInWorld={isFirstInWorld} done={done} total={total} pct={pct} t={t} />
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[sec.color, meta.deep] as [string, string]}
            start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1.1 }}
            style={styles.headerGradient}
          >
            <CardContent sec={sec} meta={meta} isFirstInWorld={isFirstInWorld} done={done} total={total} pct={pct} t={t} />
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

// ─── LessonNode ──────────────────────────────────────────────────────────────
function LessonNode({
  lesson, sec, index, isActive, zig,
}: {
  lesson: Lesson; sec: Section; index: number; isActive: boolean; zig: number[];
}) {
  const { t } = useTranslation();
  const xOff = zig[index] ?? zig[index % zig.length];
  const bubbleLeft = xOff >= 0;

  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const spinAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (lesson.status === 'available') {
      Animated.loop(Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 900, useNativeDriver: nativeDriver }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 900, useNativeDriver: nativeDriver }),
      ])).start();
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 22000, useNativeDriver: nativeDriver })
      ).start();
    }
  }, [lesson.status]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 650, useNativeDriver: nativeDriver }),
        Animated.timing(bounceAnim, { toValue: 0,  duration: 650, useNativeDriver: nativeDriver }),
      ])).start();
    }
  }, [isActive]);

  const spinDeg = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const isDone    = lesson.status === 'completed';
  const isLocked  = lesson.status === 'locked';
  const isCurrent = lesson.status === 'available';

  let nodeBg   = '#FFFFFF';
  let nodeDeep = '#C7D2FE';
  if (isDone)    { nodeBg = sec.color; nodeDeep = (PATH_META[sec.pathId]?.deep ?? '#999'); }
  if (isCurrent) { nodeBg = '#4F46E5'; nodeDeep = '#3730A3'; }
  if (isLocked)  { nodeBg = '#F1F5F9'; nodeDeep = '#CBD5E1'; }

  const isActiveNode = isDone || isCurrent;
  const nodeBoxShadow = isActiveNode
    ? shadow(6, 0, '#000', 0.4, 5, 3)
    : shadow(6, 2, '#000', 0.18, 5, 3);

  return (
    <View style={[styles.nodeRow, { transform: [{ translateX: xOff }] }]}>

      {/* Bubble LEFT */}
      {isActive && bubbleLeft && (
        <Animated.View style={[styles.bubbleAbs, styles.bubbleOnLeft, { transform: [{ translateY: bounceAnim }] }]}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>¡Empezá! 🚀</Text>
            <View style={styles.bubbleTailR} />
          </View>
          <View style={{ marginTop: 2 }}>
            <PigAvatar mood="motivated" size={48} />
          </View>
        </Animated.View>
      )}

      {/* Node */}
      <View style={styles.nodeCol}>
        {/* Dashed ring for current lesson */}
        {isCurrent && (
          <Animated.View style={[styles.spinRing, { transform: [{ rotate: spinDeg }] }]} />
        )}

        <TouchableOpacity
          onPress={() => !isLocked && router.push(`/lesson/${lesson.id}`)}
          activeOpacity={isLocked ? 1 : 0.82}
        >
          <Animated.View
            style={[
              styles.node,
              {
                backgroundColor: nodeBg,
                borderColor: isLocked ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.62)',
                ...nodeBoxShadow,
              },
              isCurrent && { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={{ fontSize: isDone ? 22 : 26 }}>
              {isLocked ? '🔒' : isDone ? '✓' : lesson.icon}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Label chip */}
        <View style={[styles.labelChip, isLocked && styles.labelChipLocked]}>
          <Text
            style={[styles.labelText, {
              color: isLocked ? '#6B7AB8' : isDone ? sec.color : isCurrent ? '#4F46E5' : '#1E1B4B',
            }]}
            numberOfLines={2}
          >
            {t(lesson.titleKey)}
          </Text>
        </View>
      </View>

      {/* Bubble RIGHT */}
      {isActive && !bubbleLeft && (
        <Animated.View style={[styles.bubbleAbs, styles.bubbleOnRight, { transform: [{ translateY: bounceAnim }] }]}>
          <View style={[styles.bubble]}>
            <View style={styles.bubbleTailL} />
            <Text style={styles.bubbleText}>¡Empezá! 🚀</Text>
          </View>
          <View style={{ marginTop: 2 }}>
            <PigAvatar mood="motivated" size={48} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─── SectionsDrawer ───────────────────────────────────────────────────────────
function SectionsDrawer({
  visible, onClose, sections, onJump,
}: {
  visible: boolean;
  onClose: () => void;
  sections: Section[];
  onJump: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.drawerOverlay} onPress={onClose} />
      <View style={styles.drawer}>
        <View style={styles.drawerHandle} />
        <Text style={styles.drawerTitle}>Secciones</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {sections.map((sec) => {
            const done  = sec.lessons.filter((l) => l.status === 'completed').length;
            const total = sec.lessons.length;
            const allLocked = sec.lessons.every((l) => l.status === 'locked');
            return (
              <TouchableOpacity
                key={sec.id}
                style={[styles.drawerItem, allLocked && styles.drawerItemLocked]}
                onPress={() => { onJump(sec.id); onClose(); }}
                activeOpacity={0.75}
              >
                <View style={[styles.drawerDot, { backgroundColor: sec.color }]}>
                  <Text style={{ fontSize: 16 }}>{sec.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerItemText, allLocked && { color: Colors.textMuted }]} numberOfLines={1}>
                    {t(sec.titleKey)}
                  </Text>
                  <Text style={styles.drawerItemSub}>{done}/{total} lecciones</Text>
                </View>
                {done === total && total > 0 && <Text style={{ fontSize: 16 }}>✅</Text>}
                {allLocked && <Text style={{ fontSize: 14, opacity: 0.4 }}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── HomeScreen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { t } = useTranslation();
  const sections = useComputedSections();
  const scrollRef = useRef<ScrollView>(null);
  const sectionYRefs = useRef<Record<string, number>>({});
  const [drawerVisible, setDrawerVisible] = useState(false);

  let firstAvailableId: string | null = null;
  for (const s of sections) {
    const a = s.lessons.find((l) => l.status === 'available');
    if (a) { firstAvailableId = a.id; break; }
  }

  const jumpToSection = (secId: string) => {
    const y = sectionYRefs.current[secId];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: y - 8, animated: true });
  };

  // Track which path each section belongs to, to detect world changes
  const withMeta = sections.map((sec, i) => ({
    sec,
    isFirstInWorld: i === 0 || sections[i - 1].pathId !== sec.pathId,
    showTransition: i > 0 && sections[i - 1].pathId !== sec.pathId,
  }));

  return (
    <View style={styles.root}>
      <TopBar />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero greeting */}
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#4c1d95']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          {/* Stars decoration */}
          <Text style={styles.heroStar1}>✦</Text>
          <Text style={styles.heroStar2}>✦</Text>
          <Text style={styles.heroStar3}>✦</Text>

          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingTitle}>Hola 👋</Text>
              <Text style={styles.greetingSubtitle}>Seguí aprendiendo donde lo dejaste</Text>
            </View>
            <PigAvatar mood="happy" size={56} overrideBg="rgba(255,255,255,0.12)" />
          </View>

          {/* Daily challenge */}
          <TouchableOpacity activeOpacity={0.9} style={styles.dailyCard}>
            <View style={styles.dailyIconBox}>
              <Text style={{ fontSize: 24 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyTitle}>Desafío del día</Text>
              <Text style={styles.dailyDesc}>Completá 2 lecciones · mantenés la racha</Text>
              <View style={styles.dailyBarBg}>
                <View style={[styles.dailyBarFill, { width: '40%' }]} />
              </View>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+50 XP</Text>
            </View>
          </TouchableOpacity>

          {/* Ver Secciones button */}
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setDrawerVisible(true)} activeOpacity={0.85}>
              <LinearGradient
                colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verBtn}
              >
                <Text style={styles.verBtnIcon}>☰</Text>
                <Text style={styles.verBtnText}>Ver Secciones</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Sections */}
        {withMeta.map(({ sec, isFirstInWorld, showTransition }) => {
          const meta = PATH_META[sec.pathId] ?? PATH_META.fundamentos;
          const sectionZig = SECTION_ZIGS[sec.id] ?? ZIG;
          return (
            <View
              key={sec.id}
              onLayout={(e) => { sectionYRefs.current[sec.id] = e.nativeEvent.layout.y; }}
            >
              {showTransition && <WorldTransition pathId={sec.pathId} />}

              <LinearGradient
                colors={[meta.skyTop, meta.skyMid, meta.skyBot] as [string, string, string]}
                style={styles.sectionBg}
              >
                <WorldScene pathId={sec.pathId} />
                <View style={{ position: 'relative', zIndex: 1 }}>
                  <SectionHeader sec={sec} isFirstInWorld={isFirstInWorld} bgImage={SECTION_BG[sec.id]} />
                  <View style={styles.lessonPath}>
                    {sec.lessons.map((lesson, li) => (
                      <View key={lesson.id}>
                        <LessonNode
                          lesson={lesson}
                          sec={sec}
                          index={li}
                          isActive={lesson.id === firstAvailableId}
                          zig={sectionZig}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          );
        })}

        <FinishLine />
      </ScrollView>

      <SectionsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        sections={sections}
        onJump={jumpToSection}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f1a' },

  // TopBar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    ...shadow(2, 6, Colors.primary, 0.08, 3),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 15, color: Colors.text },
  heartsRow: { flexDirection: 'row', gap: 2 },

  scrollContent: { paddingBottom: 0 },

  // Hero banner
  heroBanner: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
    overflow: 'hidden',
  },
  heroStar1: { position: 'absolute', top: 14, left: 24,  fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  heroStar2: { position: 'absolute', top: 28, right: 40, fontSize: 8,  color: 'rgba(255,255,255,0.2)' },
  heroStar3: { position: 'absolute', top: 8,  right: 80, fontSize: 16, color: 'rgba(255,255,255,0.15)' },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Greeting inside hero
  greetingTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 22, color: '#fff' },
  greetingSubtitle: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Daily challenge
  dailyCard: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dailyIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#F59E0B',
    alignItems: 'center', justifyContent: 'center',
  },
  dailyTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 14, color: '#fff' },
  dailyDesc: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  dailyBarBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, marginTop: 6, overflow: 'hidden' },
  dailyBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 99 },
  xpBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 12,
    ...shadow(3, 0, '#B45309', 0.55, 3),
  },
  xpBadgeText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#fff' },

  // Ver Secciones
  verBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 99,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  verBtnIcon: { fontSize: 14, color: '#fff' },
  verBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#fff', letterSpacing: 0.3 },

  // Section background
  sectionBg: { width: '100%', paddingBottom: 40, overflow: 'hidden', position: 'relative', minHeight: 220 },

  // WorldHeader
  headerWrap: { marginHorizontal: 14, marginBottom: 4, position: 'relative' },
  ribbon: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  ribbonLine: { flex: 1, height: 1.5, borderRadius: 99 },
  ribbonText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },

  // Pig que flota sobre la card
  pigOverflowWrap: {
    position: 'absolute', top: 0, left: 0, right: 0,
    alignItems: 'center', zIndex: 10,
    height: PIG_OVERFLOW * 2,
  },
  medallionRing: {
    position: 'absolute', top: 0, width: 100, height: 100, borderRadius: 50, overflow: 'hidden',
  },
  medallionInner: {
    marginTop: 4,
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.97)',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    zIndex: 2,
  },

  headerCard: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: PIG_OVERFLOW + 10,
    paddingHorizontal: 18,
    paddingBottom: 16,
    position: 'relative', overflow: 'hidden',
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute', right: -14, bottom: -22,
    fontSize: 120, opacity: 0.07, lineHeight: 130,
  },

  // Section text — centrado
  chipRow: { flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  pathChip: {
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 99,
    paddingHorizontal: 11, paddingVertical: 4,
  },
  pathChipText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 9, color: 'rgba(255,255,255,0.95)', letterSpacing: 1, textTransform: 'uppercase' },
  progressChip: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  progressChipText: { fontFamily: 'Baloo2_700Bold', fontSize: 9, color: 'rgba(255,255,255,0.9)' },
  headerTitle: {
    fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: '#fff',
    lineHeight: 24, letterSpacing: -0.3, marginBottom: 4, textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.72)',
    lineHeight: 15, marginBottom: 6, textAlign: 'center',
  },
  progressBarBg: {
    height: 6, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 99,
    overflow: 'hidden', marginTop: 10, width: '100%',
  },
  progressBarFill: { height: '100%', borderRadius: 99 },

  // Lesson path
  lessonPath: { paddingVertical: 8, paddingBottom: 16 },

  // Node row
  nodeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 4,
    position: 'relative',
  },
  nodeCol: { alignItems: 'center', gap: 6, position: 'relative' },

  // Spin ring
  spinRing: {
    position: 'absolute',
    width: NODE_D + 22,
    height: NODE_D + 22,
    borderRadius: (NODE_D + 22) / 2,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: '#818CF8',
    opacity: 0.6,
    top: -(22 / 2),
    left: -(22 / 2),
    zIndex: 0,
  },

  // Node circle
  node: {
    width: NODE_D,
    height: NODE_D,
    borderRadius: NODE_D / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    zIndex: 1,
  },

  // Label chip
  labelChip: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    paddingHorizontal: 9, paddingVertical: 3,
    maxWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    ...shadow(3, 4, '#000', 0.12, 2),
  },
  labelChipLocked: { backgroundColor: 'rgba(255,255,255,0.55)' },
  labelText: {
    fontFamily: 'Baloo2_800ExtraBold', fontSize: 9, letterSpacing: 0.2,
    textAlign: 'center', textTransform: 'uppercase', lineHeight: 13,
  },

  // Bubble
  bubbleAbs: { position: 'absolute', alignItems: 'center', gap: 4, top: 4, zIndex: 10 },
  bubbleOnLeft:  { right: NODE_D / 2 + 52 },
  bubbleOnRight: { left:  NODE_D / 2 + 52 },
  bubble: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 13, paddingVertical: 7,
    borderRadius: 14, position: 'relative',
    ...shadow(4, 0, '#3730A3', 0.6, 4),
  },
  bubbleText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 11, color: '#fff' },
  bubbleTailR: {
    position: 'absolute', right: -5, top: '50%' as any, marginTop: -5,
    width: 10, height: 10, backgroundColor: '#4F46E5', transform: [{ rotate: '45deg' }],
  },
  bubbleTailL: {
    position: 'absolute', left: -5, top: '50%' as any, marginTop: -5,
    width: 10, height: 10, backgroundColor: '#4F46E5', transform: [{ rotate: '45deg' }],
  },

  // Sections drawer
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '80%',
    ...shadow(-4, 20, '#000', 0.15, 20),
  },
  drawerHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  drawerTitle: {
    fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: Colors.text,
    marginBottom: 12, textAlign: 'center',
  },
  drawerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  drawerItemLocked: { opacity: 0.55 },
  drawerDot: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  drawerItemText: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: Colors.text },
  drawerItemSub: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: Colors.textMuted, marginTop: 1 },
});
