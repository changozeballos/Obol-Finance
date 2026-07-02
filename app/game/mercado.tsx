import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PigAvatar } from '../../components/PigAvatar';
import { nativeDriver } from '../../constants/platform';

// ── Assets ───────────────────────────────────────────────────────────────────
const ASSETS = [
  { id: 'ypf',   name: 'YPF',       icon: '⛽', color: '#F59E0B', initPrice: 6500, volatility: 0.08, sector: 'Energía' },
  { id: 'galb',  name: 'Galicia',   icon: '🏦', color: '#3B82F6', initPrice: 2200, volatility: 0.07, sector: 'Finanzas' },
  { id: 'meli',  name: 'MercadoL.', icon: '🛒', color: '#FBBF24', initPrice: 185000, volatility: 0.09, sector: 'Tech' },
  { id: 'teco',  name: 'Telecom',   icon: '📡', color: '#10B981', initPrice: 900, volatility: 0.06, sector: 'Telecoms' },
  { id: 'al30',  name: 'Bono AL30', icon: '📜', color: '#8B5CF6', initPrice: 72000, volatility: 0.04, sector: 'Deuda' },
];

const NEWS_POOL = [
  { asset: 'ypf',  good: true,  text: '🛢️ YPF anuncia nuevo pozo en Vaca Muerta con reservas récord' },
  { asset: 'ypf',  good: false, text: '⚡ Gobierno congela precios de combustibles. Margen de YPF cae' },
  { asset: 'galb', good: true,  text: '📈 Banco Galicia supera expectativas de ganancia trimestral' },
  { asset: 'galb', good: false, text: '💸 Suba de encajes afecta rentabilidad bancaria' },
  { asset: 'meli', good: true,  text: '🚀 MercadoLibre reporta crecimiento del 40% en usuarios activos' },
  { asset: 'meli', good: false, text: '📦 Aumento de costos logísticos golpea a MercadoLibre' },
  { asset: 'teco', good: true,  text: '📲 Telecom gana licitación de espectro 5G en Argentina' },
  { asset: 'teco', good: false, text: '📉 Caída en suscriptores de cable afecta ingresos de Telecom' },
  { asset: 'al30', good: true,  text: '🤝 Argentina llega a acuerdo con el FMI. Bonos recuperan valor' },
  { asset: 'al30', good: false, text: '⚠️ Riesgo país sube 200 puntos básicos. Bonos caen fuerte' },
  { asset: null,   good: true,  text: '📊 Datos de inflación mejor a lo esperado impulsan el mercado' },
  { asset: null,   good: false, text: '🔴 Crisis cambiaria: dólar paralelo sube 15% en una semana' },
];

const TOTAL_DAYS = 20;
const INITIAL_CASH = 100_000;

type Position = { qty: number; avgCost: number };
type Prices = Record<string, number>;
type Positions = Record<string, Position>;

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtARS(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'k';
  return '$' + Math.round(n).toLocaleString('es-AR');
}

function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

type Phase = 'intro' | 'trading' | 'result';

export default function MercadoGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(INITIAL_CASH);
  const [prices, setPrices] = useState<Prices>({});
  const [prevPrices, setPrevPrices] = useState<Prices>({});
  const [positions, setPositions] = useState<Positions>({});
  const [newsItem, setNewsItem] = useState<typeof NEWS_POOL[number] | null>(null);
  const [newsAffects, setNewsAffects] = useState<string[]>([]);
  const [history, setHistory] = useState<{ day: number; portfolio: number }[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [tradeFeedback, setTradeFeedback] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function initPrices(): Prices {
    const p: Prices = {};
    ASSETS.forEach(a => { p[a.id] = a.initPrice; });
    return p;
  }

  function totalPortfolioValue(p: Prices, pos: Positions, c: number) {
    let val = c;
    Object.entries(pos).forEach(([id, pos]) => {
      val += (p[id] || 0) * pos.qty;
    });
    return val;
  }

  function startGame() {
    const p = initPrices();
    setPrices(p); setPrevPrices(p);
    setPositions({});
    setCash(INITIAL_CASH);
    setDay(1);
    setHistory([{ day: 0, portfolio: INITIAL_CASH }]);
    setNewsItem(null); setNewsAffects([]);
    setSelectedAsset(null); setQty(1);
    setTradeFeedback(null);
    setPhase('trading');
  }

  function advanceDay() {
    const newPrices = { ...prices };
    const prev = { ...prices };

    // Pick a news item
    const news = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
    setNewsItem(news);

    const affected: string[] = [];
    ASSETS.forEach(a => {
      let change = (Math.random() - 0.5) * 2 * a.volatility;
      if (news.asset === a.id) {
        change += news.good ? 0.05 + Math.random() * 0.06 : -(0.05 + Math.random() * 0.06);
        affected.push(a.id);
      } else if (news.asset === null) {
        change += news.good ? 0.01 : -0.01;
      }
      newPrices[a.id] = Math.max(a.initPrice * 0.3, newPrices[a.id] * (1 + change));
    });

    setNewsAffects(affected);
    setPrevPrices(prev);
    setPrices(newPrices);
    const newDay = day + 1;
    setDay(newDay);
    setHistory(h => [...h, { day: newDay, portfolio: totalPortfolioValue(newPrices, positions, cash) }]);

    if (newDay > TOTAL_DAYS) {
      setPhase('result');
    }

    // Animate
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: nativeDriver, tension: 80, friction: 8 }).start();
  }

  function buy(assetId: string, quantity: number) {
    const asset = ASSETS.find(a => a.id === assetId)!;
    const cost = prices[assetId] * quantity;
    if (cost > cash) { setTradeFeedback('No tenés suficiente efectivo'); return; }
    setCash(c => c - cost);
    setPositions(pos => {
      const existing = pos[assetId] || { qty: 0, avgCost: 0 };
      const totalQty = existing.qty + quantity;
      const totalCost = existing.avgCost * existing.qty + cost;
      return { ...pos, [assetId]: { qty: totalQty, avgCost: totalCost / totalQty } };
    });
    setTradeFeedback(`Compraste ${quantity} ${asset.name}`);
    setTimeout(() => setTradeFeedback(null), 2000);
  }

  function sell(assetId: string, quantity: number) {
    const asset = ASSETS.find(a => a.id === assetId)!;
    const pos = positions[assetId];
    if (!pos || pos.qty < quantity) { setTradeFeedback('No tenés suficientes acciones'); return; }
    const proceeds = prices[assetId] * quantity;
    setCash(c => c + proceeds);
    setPositions(p => {
      const newQty = pos.qty - quantity;
      if (newQty === 0) {
        const newPos = { ...p };
        delete newPos[assetId];
        return newPos;
      }
      return { ...p, [assetId]: { ...pos, qty: newQty } };
    });
    setTradeFeedback(`Vendiste ${quantity} ${asset.name}`);
    setTimeout(() => setTradeFeedback(null), 2000);
  }

  const portfolioValue = totalPortfolioValue(prices, positions, cash);
  const portfolioGain = ((portfolioValue - INITIAL_CASH) / INITIAL_CASH) * 100;

  const selected = ASSETS.find(a => a.id === selectedAsset);
  const selPos = selectedAsset ? positions[selectedAsset] : null;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <LinearGradient colors={['#064E3B', '#065F46', '#059669']} style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.center}>
          <View style={styles.introPig}>
            <PigAvatar mood="happy" size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>Mercado{'\n'}Virtual</Text>
          <Text style={styles.introSub}>Operá con $100.000 durante 20 días</Text>
          <View style={styles.rulesBox}>
            {[
              ['📈', '5 activos: acciones, bonos y más'],
              ['📰', 'Noticias diarias afectan los precios'],
              ['🎯', 'Maximizá tu cartera al día 20'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.ruleRow}>
                <Text style={styles.ruleIcon}>{icon}</Text>
                <Text style={styles.ruleText}>{text}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>¡Abrir mercado!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const best = ASSETS.map(a => ({
      a, gain: ((prices[a.id] - a.initPrice) / a.initPrice) * 100,
    })).sort((x, y) => y.gain - x.gain)[0];
    return (
      <LinearGradient colors={['#064E3B', '#065F46', '#059669']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={styles.introPig}>
            <PigAvatar mood={portfolioGain > 0 ? 'celebrating' : 'thinking'} size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>{portfolioGain > 10 ? '¡Excelente trader!' : portfolioGain > 0 ? 'Buen trabajo' : 'La bolsa te ganó esta vez'}</Text>
          <View style={styles.resultCards}>
            <View style={styles.resultCard}>
              <Text style={styles.rcLabel}>Portfolio final</Text>
              <Text style={styles.rcVal}>{fmtARS(portfolioValue)}</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.rcLabel}>Ganancia</Text>
              <Text style={[styles.rcGain, { color: portfolioGain >= 0 ? '#10B981' : '#EF4444' }]}>{fmtPct(portfolioGain)}</Text>
            </View>
          </View>
          <Text style={styles.pricesTitle}>Precios finales</Text>
          {ASSETS.map(a => {
            const chg = ((prices[a.id] - a.initPrice) / a.initPrice) * 100;
            return (
              <View key={a.id} style={styles.assetRow}>
                <Text style={styles.arIcon}>{a.icon}</Text>
                <Text style={styles.arName}>{a.name}</Text>
                <Text style={styles.arPrice}>{fmtARS(prices[a.id])}</Text>
                <Text style={[styles.arChg, { color: chg >= 0 ? '#10B981' : '#EF4444' }]}>{fmtPct(chg)}</Text>
              </View>
            );
          })}
          <Text style={{ fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4 }}>
            El activo ganador fue {best?.a.name} ({fmtPct(best?.gain || 0)})
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>Jugar de nuevo</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Baloo2_600SemiBold', fontSize: 14 }}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── TRADING ────────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#064E3B', '#065F46', '#059669']} style={styles.screen}>
      {/* Header */}
      <View style={styles.qHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <View>
          <Text style={styles.dayLabel}>Día {day} / {TOTAL_DAYS}</Text>
        </View>
        <View style={styles.portfolioChip}>
          <Text style={[styles.chipPct, { color: portfolioGain >= 0 ? '#10B981' : '#EF4444' }]}>{fmtPct(portfolioGain)}</Text>
          <Text style={styles.chipVal}>{fmtARS(portfolioValue)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.qScroll} showsVerticalScrollIndicator={false}>
        {/* News */}
        {newsItem && (
          <Animated.View style={[styles.newsBox, { opacity: fadeAnim }]}>
            <Text style={styles.newsText}>{newsItem.text}</Text>
          </Animated.View>
        )}

        {/* Asset list */}
        <View style={styles.assetGrid}>
          {ASSETS.map(a => {
            const chg = ((prices[a.id] - prevPrices[a.id]) / prevPrices[a.id]) * 100;
            const myPos = positions[a.id];
            const isSelected = selectedAsset === a.id;
            const isAffected = newsAffects.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.assetCard,
                  { borderColor: isSelected ? a.color : isAffected ? a.color + '88' : 'rgba(255,255,255,0.12)' },
                  isSelected && { backgroundColor: a.color + '22' },
                ]}
                onPress={() => { setSelectedAsset(isSelected ? null : a.id); setQty(1); }}
                activeOpacity={0.82}
              >
                <Text style={styles.acIcon}>{a.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.acName}>{a.name}</Text>
                  {myPos && <Text style={[styles.acQty, { color: a.color }]}>{myPos.qty} unid.</Text>}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.acPrice}>{fmtARS(prices[a.id])}</Text>
                  <Text style={[styles.acChg, { color: chg >= 0 ? '#10B981' : '#EF4444' }]}>
                    {chg >= 0 ? '▲' : '▼'} {Math.abs(chg).toFixed(1)}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Trade panel */}
        {selected && (
          <View style={styles.tradePanel}>
            <Text style={styles.tradePanelTitle}>Operar {selected.name}</Text>
            <View style={styles.tradeInfo}>
              <View style={styles.tiItem}>
                <Text style={styles.tiLabel}>Precio</Text>
                <Text style={styles.tiVal}>{fmtARS(prices[selected.id])}</Text>
              </View>
              {selPos && (
                <View style={styles.tiItem}>
                  <Text style={styles.tiLabel}>Tu posición</Text>
                  <Text style={[styles.tiVal, {
                    color: prices[selected.id] >= selPos.avgCost ? '#10B981' : '#EF4444'
                  }]}>
                    {selPos.qty} × {fmtARS(selPos.avgCost)}
                  </Text>
                </View>
              )}
              <View style={styles.tiItem}>
                <Text style={styles.tiLabel}>Efectivo</Text>
                <Text style={styles.tiVal}>{fmtARS(cash)}</Text>
              </View>
            </View>
            {/* Qty selector */}
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                <Ionicons name="remove" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyTotal}>= {fmtARS(prices[selected.id] * qty)}</Text>
            </View>
            <View style={styles.tradeBtns}>
              <TouchableOpacity
                style={[styles.tradeBtn, { backgroundColor: '#10B981' }]}
                onPress={() => buy(selected.id, qty)}
                activeOpacity={0.85}
              >
                <Text style={styles.tradeBtnText}>Comprar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tradeBtn, { backgroundColor: '#EF4444', opacity: selPos ? 1 : 0.3 }]}
                onPress={() => sell(selected.id, qty)}
                disabled={!selPos}
                activeOpacity={0.85}
              >
                <Text style={styles.tradeBtnText}>Vender</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Trade feedback toast */}
        {tradeFeedback && (
          <View style={styles.toastBox}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.toastText}>{tradeFeedback}</Text>
          </View>
        )}

        {/* Advance day */}
        <TouchableOpacity style={styles.nextDayBtn} onPress={advanceDay} activeOpacity={0.85}>
          <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextDayGrad}>
            <Text style={styles.nextDayText}>
              {day < TOTAL_DAYS ? `Avanzar al día ${day + 1} →` : 'Ver resultados finales →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  back: { position: 'absolute', top: 52, left: 16, zIndex: 10, padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },

  introPig: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  introTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 34, color: '#fff', textAlign: 'center', letterSpacing: -1 },
  introSub: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  rulesBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 20, padding: 16, gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  ruleText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.85)', flex: 1 },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  startBtnGrad: { height: 56, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: '#fff' },

  qHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 10, gap: 10 },
  dayLabel: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  portfolioChip: { marginLeft: 'auto', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  chipPct: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13 },
  chipVal: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.6)' },

  qScroll: { padding: 14, paddingBottom: 48, gap: 12 },

  newsBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  newsText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: '#fff', lineHeight: 19 },

  assetGrid: { gap: 8 },
  assetCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, borderWidth: 1.5, padding: 12,
  },
  acIcon: { fontSize: 26, width: 32, textAlign: 'center' },
  acName: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff' },
  acQty: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, marginTop: 2 },
  acPrice: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff' },
  acChg: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, marginTop: 2 },

  tradePanel: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    padding: 16, gap: 12,
  },
  tradePanelTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  tradeInfo: { flexDirection: 'row', gap: 0 },
  tiItem: { flex: 1, alignItems: 'center', gap: 3 },
  tiLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
  tiVal: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: '#fff', textAlign: 'center' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 22, color: '#fff', minWidth: 30, textAlign: 'center' },
  qtyTotal: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  tradeBtns: { flexDirection: 'row', gap: 10 },
  tradeBtn: { flex: 1, borderRadius: 14, height: 46, alignItems: 'center', justifyContent: 'center' },
  tradeBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },

  toastBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(16,185,129,0.25)', borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: '#10B98155',
  },
  toastText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: '#fff' },

  nextDayBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 4 },
  nextDayGrad: { height: 54, alignItems: 'center', justifyContent: 'center' },
  nextDayText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 17, color: '#fff' },

  resultScroll: { padding: 24, alignItems: 'center', gap: 16, paddingTop: 60 },
  resultCards: { flexDirection: 'row', gap: 12, width: '100%' },
  resultCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 14, alignItems: 'center', gap: 6 },
  rcLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 },
  rcVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: '#fff' },
  rcGain: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24 },
  pricesTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-start' },
  assetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 12, width: '100%',
  },
  arIcon: { fontSize: 20, width: 26 },
  arName: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff', flex: 1 },
  arPrice: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: '#fff' },
  arChg: { fontFamily: 'Baloo2_700Bold', fontSize: 13, width: 54, textAlign: 'right' },
});
