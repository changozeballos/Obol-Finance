import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PigAvatar } from '../../components/PigAvatar';
import { nativeDriver } from '../../constants/platform';

// ── Scenario data ────────────────────────────────────────────────────────────
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const INVESTMENT_OPTIONS = [
  {
    id: 'colchon',
    name: 'Colchón',
    icon: '🛏️',
    desc: 'Sin rendimiento. El dinero pierde valor con la inflación.',
    monthlyReturn: () => 0,
    risk: 0,
    color: '#6B7280',
  },
  {
    id: 'plazo_fijo',
    name: 'Plazo fijo',
    icon: '🏦',
    desc: 'Tasa nominal mensual fija del banco. Protege parcialmente de la inflación.',
    monthlyReturn: () => 8 + Math.random() * 2, // 8-10% nominal
    risk: 1,
    color: '#3B82F6',
  },
  {
    id: 'dolar',
    name: 'Dólar',
    icon: '💵',
    desc: 'Comprás dólar. Gana si el tipo de cambio sube más que el plazo fijo.',
    monthlyReturn: () => Math.random() * 12 - 1, // -1% a +11%
    risk: 2,
    color: '#10B981',
  },
  {
    id: 'acciones',
    name: 'Acciones',
    icon: '📈',
    desc: 'Bolsa argentina. Alto riesgo, alto potencial. Puede ir para cualquier lado.',
    monthlyReturn: () => Math.random() * 30 - 8, // -8% a +22%
    risk: 3,
    color: '#F59E0B',
  },
  {
    id: 'cripto',
    name: 'Cripto',
    icon: '₿',
    desc: 'Bitcoin/Ether. Máximo riesgo, máximo potencial. Muy volátil.',
    monthlyReturn: () => Math.random() * 40 - 15, // -15% a +25%
    risk: 4,
    color: '#8B5CF6',
  },
];

const INFLATION_SCENARIOS = [
  { name: 'Alta inflación', months: [8, 11, 9, 10, 13, 12, 9, 11, 14, 10, 8, 9] },
  { name: 'Inflación galopante', months: [15, 18, 20, 22, 19, 17, 21, 25, 18, 20, 16, 14] },
  { name: 'Estabilización', months: [6, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 3] },
];

type Phase = 'intro' | 'choose' | 'result';
type InvestmentId = 'colchon' | 'plazo_fijo' | 'dolar' | 'acciones' | 'cripto';

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}
function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

export default function InflacionRunGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [month, setMonth] = useState(0);
  const [capital, setCapital] = useState(100_000);
  const [purchasePower, setPurchasePower] = useState(100);
  const [history, setHistory] = useState<{ capital: number; pp: number; inv: string; inf: number; ret: number }[]>([]);
  const [scenario, setScenario] = useState(INFLATION_SCENARIOS[0]);
  const [selectedInv, setSelectedInv] = useState<InvestmentId | null>(null);
  const [monthResult, setMonthResult] = useState<{ inf: number; ret: number; newCap: number; newPP: number } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const barAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function startGame() {
    const s = INFLATION_SCENARIOS[Math.floor(Math.random() * INFLATION_SCENARIOS.length)];
    setScenario(s);
    setMonth(0); setCapital(100_000); setPurchasePower(100);
    setHistory([]); setSelectedInv(null); setMonthResult(null); setShowResult(false);
    setPhase('choose');
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: nativeDriver, tension: 80, friction: 8 }).start();
  }

  function confirmChoice() {
    if (!selectedInv) return;
    const inv = INVESTMENT_OPTIONS.find(i => i.id === selectedInv)!;
    const inf = scenario.months[month];
    const ret = inv.monthlyReturn();
    const factor = (1 + ret / 100);
    const newCap = capital * factor;
    const newPP = purchasePower * factor / (1 + inf / 100);
    setMonthResult({ inf, ret, newCap, newPP });
    setShowResult(true);
  }

  function nextMonth() {
    if (!monthResult) return;
    const { inf, ret, newCap, newPP } = monthResult;
    const newHistory = [...history, { capital: newCap, pp: newPP, inv: selectedInv!, inf, ret }];
    setHistory(newHistory);
    setCapital(newCap);
    setPurchasePower(newPP);
    if (month + 1 >= 12) {
      setPhase('result');
    } else {
      setMonth(m => m + 1);
      setSelectedInv(null);
      setMonthResult(null);
      setShowResult(false);
    }
  }

  const finalResult = () => {
    const totalInflation = scenario.months.reduce((a, m) => a + m, 0);
    const ppGain = purchasePower - 100;
    const capGain = ((capital - 100_000) / 100_000) * 100;
    return { totalInflation, ppGain, capGain };
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <LinearGradient colors={['#7F1D1D', '#991B1B', '#DC2626']} style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.center}>
          <View style={styles.introPig}>
            <PigAvatar mood="motivated" size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>Inflación{'\n'}Run</Text>
          <Text style={styles.introSub}>Protegé $100.000 durante 12 meses</Text>
          <View style={styles.rulesBox}>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>📉</Text>
              <Text style={styles.ruleText}>Cada mes la inflación come tu dinero en el colchón</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>💡</Text>
              <Text style={styles.ruleText}>Elegí dónde invertir cada mes para ganarle</Text>
            </View>
            <View style={styles.ruleRow}>
              <Text style={styles.ruleIcon}>🎯</Text>
              <Text style={styles.ruleText}>El objetivo es mantener el poder adquisitivo</Text>
            </View>
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
    const { totalInflation, ppGain, capGain } = finalResult();
    const won = ppGain > -10;
    return (
      <LinearGradient colors={['#7F1D1D', '#991B1B', '#DC2626']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={styles.introPig}>
            <PigAvatar mood={won ? 'celebrating' : 'thinking'} size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>{won ? '¡Ganaste!' : 'La inflación te comió'}</Text>
          <View style={styles.resultCards}>
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Capital final</Text>
              <Text style={[styles.resultCardVal, { color: '#F59E0B' }]}>{fmt(capital)}</Text>
              <Text style={[styles.resultCardDelta, { color: capGain >= 0 ? '#10B981' : '#EF4444' }]}>{fmtPct(capGain)}</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Poder adq.</Text>
              <Text style={[styles.resultCardVal, { color: ppGain >= 0 ? '#10B981' : '#EF4444' }]}>{ppGain >= 0 ? '+' : ''}{ppGain.toFixed(1)}%</Text>
              <Text style={styles.resultCardDelta}>vs inicio</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.resultCardLabel}>Inflación total</Text>
              <Text style={[styles.resultCardVal, { color: '#EF4444' }]}>+{totalInflation}%</Text>
              <Text style={styles.resultCardDelta}>{scenario.name}</Text>
            </View>
          </View>
          {/* Month history */}
          <Text style={styles.histTitle}>Historial por mes</Text>
          {history.map((h, i) => {
            const inv = INVESTMENT_OPTIONS.find(o => o.id === h.inv)!;
            return (
              <View key={i} style={styles.histRow}>
                <Text style={styles.histMonth}>{MONTHS[i]}</Text>
                <Text style={[styles.histInv, { color: inv?.color }]}>{inv?.icon} {inv?.name}</Text>
                <Text style={[styles.histRet, { color: h.ret >= h.inf ? '#10B981' : '#EF4444' }]}>
                  {fmtPct(h.ret)}
                </Text>
                <Text style={styles.histInf}>inf: {fmtPct(h.inf)}</Text>
              </View>
            );
          })}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.startBtn, { flex: 1 }]} onPress={startGame} activeOpacity={0.85}>
              <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
                <Text style={styles.startBtnText}>Jugar de nuevo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Baloo2_600SemiBold', fontSize: 14 }}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ── CHOOSE ─────────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#7F1D1D', '#991B1B', '#DC2626']} style={styles.screen}>
      {/* Header */}
      <View style={styles.qHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.monthLabel}>{MONTHS[month]} — Mes {month + 1} de 12</Text>
          <Text style={styles.scenarioLabel}>{scenario.name}</Text>
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>{fmt(capital)}</Text>
        </View>
      </View>

      {/* Month progress dots */}
      <View style={styles.monthDots}>
        {MONTHS.map((_, i) => (
          <View key={i} style={[styles.monthDot,
            i < month ? { backgroundColor: '#10B981' } :
            i === month ? { backgroundColor: '#F59E0B' } :
            { backgroundColor: 'rgba(255,255,255,0.18)' }
          ]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.qScroll}>
        {/* Inflation preview */}
        <View style={styles.infBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infTitle}>Inflación estimada este mes</Text>
            <Text style={styles.infSub}>Basada en el escenario actual</Text>
          </View>
          <Text style={styles.infVal}>~{scenario.months[month]}%</Text>
        </View>

        {/* Power meter */}
        <View style={styles.ppBox}>
          <Text style={styles.ppLabel}>Poder adquisitivo actual</Text>
          <Text style={[styles.ppVal, { color: purchasePower >= 90 ? '#10B981' : purchasePower >= 70 ? '#F59E0B' : '#EF4444' }]}>
            {purchasePower.toFixed(1)}%
          </Text>
        </View>

        {!showResult ? (
          <>
            <Text style={styles.chooseLabel}>¿Dónde invertís este mes?</Text>
            {INVESTMENT_OPTIONS.map(inv => (
              <TouchableOpacity
                key={inv.id}
                style={[styles.invCard,
                  { borderColor: selectedInv === inv.id ? inv.color : 'rgba(255,255,255,0.15)' },
                  selectedInv === inv.id && { backgroundColor: inv.color + '22' },
                ]}
                onPress={() => setSelectedInv(inv.id as InvestmentId)}
                activeOpacity={0.82}
              >
                <Text style={styles.invIcon}>{inv.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invName}>{inv.name}</Text>
                  <Text style={styles.invDesc}>{inv.desc}</Text>
                </View>
                {/* Risk dots */}
                <View style={styles.riskWrap}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <View key={i} style={[styles.riskDot, { backgroundColor: i < inv.risk ? inv.color : 'rgba(255,255,255,0.2)' }]} />
                  ))}
                </View>
                {selectedInv === inv.id && (
                  <Ionicons name="checkmark-circle" size={22} color={inv.color} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.confirmBtn, !selectedInv && { opacity: 0.4 }]}
              onPress={confirmChoice}
              disabled={!selectedInv}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtnGrad}>
                <Text style={styles.confirmBtnText}>Confirmar inversión</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : monthResult && (
          <View style={styles.monthResultBox}>
            <Text style={styles.mrTitle}>Resultado del mes</Text>
            <View style={styles.mrRow}>
              <View style={styles.mrItem}>
                <Text style={styles.mrLabel}>Tu rendimiento</Text>
                <Text style={[styles.mrVal, { color: monthResult.ret >= 0 ? '#10B981' : '#EF4444' }]}>{fmtPct(monthResult.ret)}</Text>
              </View>
              <View style={styles.mrItem}>
                <Text style={styles.mrLabel}>Inflación</Text>
                <Text style={[styles.mrVal, { color: '#EF4444' }]}>+{monthResult.inf}%</Text>
              </View>
              <View style={styles.mrItem}>
                <Text style={styles.mrLabel}>Balance real</Text>
                <Text style={[styles.mrVal, { color: monthResult.ret >= monthResult.inf ? '#10B981' : '#EF4444' }]}>
                  {fmtPct(monthResult.ret - monthResult.inf)}
                </Text>
              </View>
            </View>
            <View style={styles.mrCapRow}>
              <Text style={styles.mrCapLabel}>Capital nuevo:</Text>
              <Text style={styles.mrCapVal}>{fmt(monthResult.newCap)}</Text>
            </View>
            <View style={[styles.mrVerdict,
              { backgroundColor: monthResult.ret >= monthResult.inf ? '#10B98133' : '#EF444433',
                borderColor: monthResult.ret >= monthResult.inf ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.mrVerdictText}>
                {monthResult.ret >= monthResult.inf
                  ? `¡Le ganaste a la inflación! +${(monthResult.ret - monthResult.inf).toFixed(1)}% real`
                  : `La inflación te ganó. Perdiste ${(monthResult.inf - monthResult.ret).toFixed(1)}% de poder adquisitivo`}
              </Text>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={nextMonth} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>{month + 1 < 12 ? `Mes ${month + 2} →` : 'Ver resultado final'}</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },

  introPig: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
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

  qHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8, gap: 12 },
  monthLabel: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  scenarioLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  scoreChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  scoreChipText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 12, color: '#F59E0B' },

  monthDots: { flexDirection: 'row', gap: 4, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 4 },
  monthDot: { width: 6, height: 6, borderRadius: 3 },

  qScroll: { padding: 16, paddingBottom: 48, gap: 12 },

  infBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.25)', borderRadius: 18,
    borderWidth: 1, borderColor: '#EF444455', padding: 16,
  },
  infTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff' },
  infSub: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  infVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 28, color: '#EF4444' },

  ppBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14,
  },
  ppLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  ppVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 22 },

  chooseLabel: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff', marginTop: 4 },

  invCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18, borderWidth: 1.5, padding: 14,
  },
  invIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  invName: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#fff' },
  invDesc: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 16, marginTop: 2 },
  riskWrap: { flexDirection: 'column', gap: 3, marginRight: 4 },
  riskDot: { width: 6, height: 6, borderRadius: 3 },

  confirmBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 4 },
  confirmBtnGrad: { height: 54, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 17, color: '#fff' },

  monthResultBox: { gap: 14 },
  mrTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: '#fff' },
  mrRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18, padding: 14, gap: 0 },
  mrItem: { flex: 1, alignItems: 'center', gap: 4 },
  mrLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 },
  mrVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20 },
  mrCapRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, alignItems: 'center' },
  mrCapLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  mrCapVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: '#F59E0B' },
  mrVerdict: { borderRadius: 16, borderWidth: 1.5, padding: 14 },
  mrVerdictText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 20 },
  nextBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#fff' },

  // Result
  resultScroll: { padding: 24, alignItems: 'center', gap: 16, paddingTop: 60 },
  resultCards: { flexDirection: 'row', gap: 10, width: '100%' },
  resultCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, padding: 12, alignItems: 'center', gap: 4 },
  resultCardLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  resultCardVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16 },
  resultCardDelta: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  histTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.7)', alignSelf: 'flex-start' },
  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 10,
    width: '100%',
  },
  histMonth: { fontFamily: 'Baloo2_700Bold', fontSize: 12, color: 'rgba(255,255,255,0.6)', width: 28 },
  histInv: { fontFamily: 'Baloo2_700Bold', fontSize: 12, flex: 1 },
  histRet: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, width: 52, textAlign: 'right' },
  histInf: { fontFamily: 'Baloo2_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 52, textAlign: 'right' },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
});
