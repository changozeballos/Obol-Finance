import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PigAvatar } from '../../components/PigAvatar';
import { nativeDriver, shadow } from '../../constants/platform';

// Productos argentinos con precios reales aproximados (en pesos ARS, 2024)
const PRODUCTS = [
  { name: 'Docena de empanadas (panadería)', hint: 'Empanadas de carne o humita, en panadería del barrio', price: 7500,  unit: 'la docena',  icon: '🥟', category: 'Comida' },
  { name: 'Medialunas (4 unidades)', hint: 'Cuatro medialunas de manteca en una cafetería', price: 2800,  unit: '4 unidades', icon: '🥐', category: 'Comida' },
  { name: 'Café con leche', hint: 'En una cafetería estándar de CABA', price: 2200,  unit: 'por taza',   icon: '☕', category: 'Gastronomía' },
  { name: 'Nafta (1 litro)', hint: 'Nafta súper en una estación YPF', price: 1350,  unit: 'por litro',  icon: '⛽', category: 'Energía' },
  { name: 'Boleto de colectivo (CABA)', hint: 'Tarifa de SUBE para colectivo en la Ciudad de Buenos Aires', price: 850,   unit: 'por viaje',  icon: '🚌', category: 'Transporte' },
  { name: 'Seis latas de gaseosa cola', hint: 'Pack de seis latas de 350ml, marca conocida', price: 4200,  unit: '6 latas',    icon: '🥤', category: 'Bebidas' },
  { name: 'Kilo de asado (costillas)', hint: 'Costillas de cerdo en carnicería barrio', price: 5800,  unit: 'por kg',     icon: '🥩', category: 'Carnes' },
  { name: 'Pan lactal (500g)', hint: 'Pan de molde blanco, marca conocida en supermercado', price: 1900,  unit: '500 gramos', icon: '🍞', category: 'Panadería' },
  { name: 'Cine (entrada popular)', hint: 'Una entrada de cine en día de semana, sala estándar', price: 6500,  unit: 'por persona', icon: '🎬', category: 'Entretenimiento' },
  { name: 'Remera básica (talles comunes)', hint: 'Remera lisa de algodón en tienda ropa', price: 12000, unit: 'prenda',     icon: '👕', category: 'Ropa' },
  { name: 'Kilo de tomates', hint: 'Tomates redondos en verdulería o feria', price: 1800,  unit: 'por kg',     icon: '🍅', category: 'Verduras' },
  { name: 'Docena de huevos', hint: 'Huevos frescos en almacén o supermercado', price: 2900,  unit: 'la docena',  icon: '🥚', category: 'Almacén' },
  { name: 'Botella de vino (750ml)', hint: 'Vino tinto de mesa, botella estándar', price: 4800,  unit: '750ml',      icon: '🍷', category: 'Bebidas' },
  { name: 'Pack de agua (6×1.5L)', hint: 'Seis botellas de agua mineral sin gas', price: 3200,  unit: '6 botellas', icon: '💧', category: 'Bebidas' },
  { name: 'Factura (tipo cuernito)', hint: 'Una factura de manteca en una panadería', price: 500,   unit: 'por unidad', icon: '🥐', category: 'Panadería' },
  { name: 'Netflix (plan básico mensual)', hint: 'Suscripción mensual plan básico de Netflix en Argentina', price: 4300,  unit: 'por mes',    icon: '📺', category: 'Digital' },
  { name: 'Taxi / Remis (5km)', hint: 'Viaje de unos 5km en taxi en ciudad', price: 4500,  unit: 'aprox.',     icon: '🚕', category: 'Transporte' },
  { name: 'Muzzarella (250g)', hint: 'Queso muzzarella en trozo en super o dietética', price: 2600,  unit: '250g',       icon: '🧀', category: 'Lácteos' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROUNDS = 8;
const SLIDER_W = 310;

type Phase = 'intro' | 'playing' | 'feedback' | 'result';

function formatARS(n: number) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function scoreForDiff(pct: number): number {
  if (pct <= 10) return 100;
  if (pct <= 25) return 70;
  if (pct <= 50) return 40;
  if (pct <= 75) return 15;
  return 0;
}

export default function PrecioCorrectoGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [products, setProducts] = useState<typeof PRODUCTS>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundResults, setRoundResults] = useState<{ diff: number; pts: number; price: number; guess: number }[]>([]);

  // Slider state
  const [sliderX, setSliderX] = useState(SLIDER_W / 2);
  const sliderRef = useRef(SLIDER_W / 2);
  const thumbAnim = useRef(new Animated.Value(SLIDER_W / 2)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  const current = products[round];

  // Price range: actual price ± 70%
  function getRange(price: number) {
    const lo = Math.max(100, Math.round(price * 0.15));
    const hi = Math.round(price * 2.8);
    return { lo, hi };
  }

  function sliderToPrice(x: number) {
    if (!current) return 0;
    const { lo, hi } = getRange(current.price);
    const ratio = Math.max(0, Math.min(1, x / SLIDER_W));
    // Quadratic scale so middle of slider ≈ correct price
    return Math.round(lo + ratio * ratio * (hi - lo));
  }

  function startGame() {
    const shuffled = shuffle(PRODUCTS).slice(0, ROUNDS);
    setProducts(shuffled);
    setRound(0); setScore(0); setRoundResults([]);
    setSliderX(SLIDER_W / 2); sliderRef.current = SLIDER_W / 2;
    thumbAnim.setValue(SLIDER_W / 2);
    setPhase('playing');
    enterAnim();
  }

  function enterAnim() {
    fadeAnim.setValue(0); scaleAnim.setValue(0.93);
    Animated.parallel([
      Animated.spring(fadeAnim,  { toValue: 1, useNativeDriver: nativeDriver, tension: 100, friction: 8 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: nativeDriver, tension: 100, friction: 8 }),
    ]).start();
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (_, gs) => {
      const newX = Math.max(0, Math.min(SLIDER_W, sliderRef.current + gs.dx));
      thumbAnim.setValue(newX);
      setSliderX(newX);
    },
    onPanResponderRelease: (_, gs) => {
      const newX = Math.max(0, Math.min(SLIDER_W, sliderRef.current + gs.dx));
      sliderRef.current = newX;
      setSliderX(newX);
    },
  });

  function handleConfirm() {
    const guess = sliderToPrice(sliderX);
    const { price } = current;
    const pct = Math.abs(guess - price) / price * 100;
    const pts = scoreForDiff(pct);
    setScore(s => s + pts);
    setRoundResults(r => [...r, { diff: pct, pts, price, guess }]);
    setPhase('feedback');
  }

  function nextRound() {
    if (round + 1 >= ROUNDS) {
      setPhase('result');
    } else {
      setRound(r => r + 1);
      setSliderX(SLIDER_W / 2); sliderRef.current = SLIDER_W / 2;
      thumbAnim.setValue(SLIDER_W / 2);
      setPhase('playing');
      enterAnim();
    }
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <LinearGradient colors={['#78350F', '#92400E', '#B45309']} style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.introContent}>
          <View style={styles.introPigCircle}>
            <PigAvatar mood="happy" size={88} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>¿Cuánto{'\n'}cuesta?</Text>
          <Text style={styles.introSub}>{ROUNDS} productos · adiviná el precio</Text>
          <View style={styles.rulesBox}>
            {[
              ['🎯', '100pts si errás menos del 10%'],
              ['✅', '70pts si errás menos del 25%'],
              ['👍', '40pts si errás menos del 50%'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.ruleRow}>
                <Text style={styles.ruleIcon}>{icon}</Text>
                <Text style={styles.ruleText}>{text}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>¡Empezar!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const maxScore = ROUNDS * 100;
    const pct = Math.round((score / maxScore) * 100);
    const avgDiff = roundResults.reduce((a, r) => a + r.diff, 0) / roundResults.length;
    return (
      <LinearGradient colors={['#78350F', '#92400E', '#B45309']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={styles.resultPigWrap}>
            <PigAvatar mood={pct >= 60 ? 'celebrating' : 'thinking'} size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.resultTitle}>{pct >= 80 ? '¡Sos un experto!' : pct >= 50 ? '¡Nada mal!' : 'Hay que prestar más atención'}</Text>
          <View style={styles.resultScore}>
            <Text style={styles.resultScoreNum}>{score}</Text>
            <Text style={styles.resultScoreLabel}>puntos de {maxScore}</Text>
          </View>
          <View style={styles.resultMetric}>
            <Text style={styles.resultMetricVal}>{avgDiff.toFixed(0)}%</Text>
            <Text style={styles.resultMetricLabel}>error promedio</Text>
          </View>
          {/* Per-round breakdown */}
          <View style={styles.breakdown}>
            {roundResults.map((r, i) => {
              const p = products[i];
              const color = r.pts === 100 ? '#10B981' : r.pts >= 70 ? '#F59E0B' : r.pts >= 40 ? '#FB923C' : '#EF4444';
              return (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.breakdownIcon}>{p?.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownName} numberOfLines={1}>{p?.name}</Text>
                    <Text style={styles.breakdownGuess}>Tu respuesta: {formatARS(r.guess)} · Real: {formatARS(r.price)}</Text>
                  </View>
                  <Text style={[styles.breakdownPts, { color }]}>+{r.pts}</Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>Jugar de nuevo</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Baloo2_600SemiBold', fontSize: 14 }}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── PLAYING / FEEDBACK ─────────────────────────────────────────────────────
  const { lo, hi } = getRange(current.price);
  const guessedPrice = sliderToPrice(sliderX);
  const lastResult = roundResults[roundResults.length - 1];

  return (
    <LinearGradient colors={['#78350F', '#92400E', '#B45309']} style={styles.screen}>
      {/* Header */}
      <View style={styles.qHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <View style={styles.qProgress}>
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <View key={i} style={[styles.qDot,
              i < round ? { backgroundColor: '#10B981' } :
              i === round ? { backgroundColor: '#F59E0B' } :
              { backgroundColor: 'rgba(255,255,255,0.2)' }
            ]} />
          ))}
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>{score}pt</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.qScroll}>
        <Animated.View style={[styles.productCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.productIconWrap}>
            <Text style={styles.productIcon}>{current?.icon}</Text>
          </View>
          <Text style={styles.productCategory}>{current?.category}</Text>
          <Text style={styles.productName}>{current?.name}</Text>
          <Text style={styles.productHint}>{current?.hint}</Text>
        </Animated.View>

        {/* Slider */}
        {phase === 'playing' && (
          <View style={styles.sliderSection}>
            <Text style={styles.sliderLabel}>Mové el slider para adivinar el precio:</Text>
            <Text style={styles.guessPrice}>{formatARS(guessedPrice)}</Text>

            <View style={styles.sliderWrap}>
              <Text style={styles.sliderEdge}>{formatARS(lo)}</Text>
              <View style={styles.sliderTrackWrap}>
                <View style={styles.sliderTrack}>
                  <Animated.View
                    style={[styles.sliderFill, {
                      width: thumbAnim.interpolate({ inputRange: [0, SLIDER_W], outputRange: ['0%', '100%'] }),
                    }]}
                  />
                  <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.sliderThumb, {
                      left: thumbAnim.interpolate({ inputRange: [0, SLIDER_W], outputRange: [-16, SLIDER_W - 16] }),
                    }]}
                  />
                </View>
              </View>
              <Text style={styles.sliderEdge}>{formatARS(hi)}</Text>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtnGrad}>
                <Text style={styles.confirmBtnText}>Confirmar precio</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Feedback */}
        {phase === 'feedback' && lastResult && (
          <View style={styles.feedbackBox}>
            <View style={styles.feedbackRow}>
              <View style={styles.feedbackItem}>
                <Text style={styles.feedbackLbl}>Tu precio</Text>
                <Text style={[styles.feedbackVal, { color: '#F59E0B' }]}>{formatARS(lastResult.guess)}</Text>
              </View>
              <View style={styles.feedbackDivider} />
              <View style={styles.feedbackItem}>
                <Text style={styles.feedbackLbl}>Precio real</Text>
                <Text style={[styles.feedbackVal, { color: '#10B981' }]}>{formatARS(lastResult.price)}</Text>
              </View>
            </View>
            <View style={[styles.feedbackResult,
              { backgroundColor: lastResult.pts === 100 ? '#10B98133' : lastResult.pts >= 40 ? '#F59E0B33' : '#EF444433',
                borderColor: lastResult.pts === 100 ? '#10B981' : lastResult.pts >= 40 ? '#F59E0B' : '#EF4444' }
            ]}>
              <Text style={styles.feedbackResultPts}>+{lastResult.pts} pts</Text>
              <Text style={styles.feedbackResultDiff}>
                {lastResult.diff < 5 ? '¡Casi exacto! 🎯' :
                 lastResult.diff < 25 ? `Diferencia: ${lastResult.diff.toFixed(0)}%` :
                 `Erraste ${lastResult.diff.toFixed(0)}% — seguí practicando`}
              </Text>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={nextRound} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {round + 1 < ROUNDS ? 'Siguiente →' : 'Ver resultado'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  back: { position: 'absolute', top: 52, left: 16, zIndex: 10, padding: 8 },

  // Intro
  introContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },
  introPigCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  introTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 36, color: '#fff', textAlign: 'center', letterSpacing: -1 },
  introSub: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  rulesBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 20, padding: 16, gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  ruleText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.85)', flex: 1 },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  startBtnGrad: { height: 56, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: '#fff' },

  // Header
  qHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  qProgress: { flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center' },
  qDot: { width: 8, height: 8, borderRadius: 4 },
  scoreChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  scoreChipText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#F59E0B' },

  // Question scroll
  qScroll: { padding: 16, paddingBottom: 48, gap: 20 },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', gap: 8,
  },
  productIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  productIcon: { fontSize: 40 },
  productCategory: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 1.5 },
  productName: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: '#fff', textAlign: 'center', lineHeight: 26 },
  productHint: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 19 },

  // Slider
  sliderSection: { gap: 14, alignItems: 'center' },
  sliderLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  guessPrice: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 42, color: '#F59E0B', letterSpacing: -1 },
  sliderWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', paddingHorizontal: 4 },
  sliderEdge: { fontFamily: 'Baloo2_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.45)', width: 38, textAlign: 'center' },
  sliderTrackWrap: { flex: 1 },
  sliderTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4, position: 'relative',
    overflow: 'visible',
  },
  sliderFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 4 },
  sliderThumb: {
    position: 'absolute',
    top: -12, width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F59E0B',
    borderWidth: 3, borderColor: '#fff',
    ...shadow(3, 6, '#000', 0.3, 8),
  },
  confirmBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginTop: 8 },
  confirmBtnGrad: { height: 54, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 17, color: '#fff' },

  // Feedback
  feedbackBox: { gap: 14 },
  feedbackRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20, padding: 16,
  },
  feedbackItem: { flex: 1, alignItems: 'center', gap: 4 },
  feedbackDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 12 },
  feedbackLbl: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1 },
  feedbackVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24 },
  feedbackResult: { borderRadius: 18, borderWidth: 1.5, padding: 16, alignItems: 'center', gap: 4 },
  feedbackResultPts: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 28, color: '#fff' },
  feedbackResultDiff: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  nextBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#fff' },

  // Result
  resultScroll: { padding: 28, alignItems: 'center', gap: 16, paddingTop: 60 },
  resultPigWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  resultTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24, color: '#fff', textAlign: 'center' },
  resultScore: { alignItems: 'center' },
  resultScoreNum: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 52, color: '#F59E0B', letterSpacing: -2 },
  resultScoreLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: -8 },
  resultMetric: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 14, minWidth: 120 },
  resultMetricVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 28, color: '#F59E0B' },
  resultMetricLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  breakdown: { width: '100%', gap: 8 },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12,
  },
  breakdownIcon: { fontSize: 22, width: 28 },
  breakdownName: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: '#fff' },
  breakdownGuess: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  breakdownPts: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16 },
});
