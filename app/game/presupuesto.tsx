import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PigAvatar } from '../../components/PigAvatar';
import { nativeDriver } from '../../constants/platform';

// ── Game data ─────────────────────────────────────────────────────────────────
const TOTAL_MONTHS = 6;
const MONTHLY_INCOME = 250_000; // Salario neto mensual

type Category = 'vivienda' | 'comida' | 'transporte' | 'salud' | 'ocio' | 'ahorro' | 'educacion' | 'ropa';

type BudgetAlloc = Record<Category, number>;

const CATEGORY_META: Record<Category, { label: string; icon: string; color: string; min: number; max: number; desc: string }> = {
  vivienda:   { label: 'Vivienda', icon: '🏠', color: '#3B82F6', min: 30000, max: 100000, desc: 'Alquiler, expensas, servicios' },
  comida:     { label: 'Comida',   icon: '🛒', color: '#F59E0B', min: 20000, max: 80000,  desc: 'Supermercado, verdulería, carnicería' },
  transporte: { label: 'Transporte', icon: '🚌', color: '#10B981', min: 5000, max: 30000, desc: 'SUBE, combustible, taxi' },
  salud:      { label: 'Salud',    icon: '💊', color: '#EF4444', min: 0,    max: 40000,  desc: 'Prepaga, medicamentos, médicos' },
  ocio:       { label: 'Ocio',     icon: '🎬', color: '#8B5CF6', min: 0,    max: 50000,  desc: 'Salidas, entretenimiento, hobbies' },
  ahorro:     { label: 'Ahorro',   icon: '💰', color: '#EC4899', min: 0,    max: 80000,  desc: 'Fondo de emergencia, inversiones' },
  educacion:  { label: 'Educación', icon: '📚', color: '#14B8A6', min: 0,   max: 40000,  desc: 'Cursos, libros, inglés' },
  ropa:       { label: 'Ropa',     icon: '👕', color: '#F97316', min: 0,    max: 30000,  desc: 'Vestimenta y calzado' },
};

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

const EVENTS_POOL = [
  { month: 1, text: '🔧 Se rompió el lavarropas', category: 'vivienda' as Category, extraCost: 25000, avoidable: false },
  { month: 2, text: '🦷 Turno al dentista — caries', category: 'salud' as Category, extraCost: 18000, avoidable: false },
  { month: 3, text: '🎂 Cumpleaños de la familia — salida', category: 'ocio' as Category, extraCost: 12000, avoidable: true },
  { month: 4, text: '📱 Se rompe el teléfono — necesitás uno nuevo', category: 'ropa' as Category, extraCost: 80000, avoidable: false },
  { month: 5, text: '✈️ Viaje de egresados — podés ir o no', category: 'ocio' as Category, extraCost: 35000, avoidable: true },
  { month: 6, text: '📚 Anotarte a un curso de finanzas', category: 'educacion' as Category, extraCost: 15000, avoidable: true },
];

function fmtARS(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  return '$' + Math.round(n).toLocaleString('es-AR');
}

type Phase = 'intro' | 'allocate' | 'event' | 'monthResult' | 'result';

const DEFAULT_ALLOC: BudgetAlloc = {
  vivienda: 60000, comida: 45000, transporte: 15000, salud: 10000,
  ocio: 20000, ahorro: 30000, educacion: 10000, ropa: 10000,
};

export default function PresupuestoGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [month, setMonth] = useState(1);
  const [savings, setSavings] = useState(0);
  const [alloc, setAlloc] = useState<BudgetAlloc>({ ...DEFAULT_ALLOC });
  const [currentEvent, setCurrentEvent] = useState<typeof EVENTS_POOL[0] | null>(null);
  const [acceptedEvent, setAcceptedEvent] = useState<boolean | null>(null);
  const [monthHistory, setMonthHistory] = useState<{
    month: number; spent: number; saved: number; event: string | null; eventCost: number;
  }[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalAlloc = CATEGORIES.reduce((s, c) => s + alloc[c], 0);
  const remaining = MONTHLY_INCOME - totalAlloc;

  function startGame() {
    setMonth(1); setSavings(0); setTotalSaved(0);
    setAlloc({ ...DEFAULT_ALLOC });
    setMonthHistory([]);
    setCurrentEvent(null); setAcceptedEvent(null);
    setPhase('allocate');
    fadeIn();
  }

  function fadeIn() {
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: nativeDriver, tension: 80, friction: 8 }).start();
  }

  function confirmBudget() {
    const event = EVENTS_POOL.find(e => e.month === month) ?? null;
    setCurrentEvent(event);
    setAcceptedEvent(null);
    if (event) {
      setPhase('event');
    } else {
      processMonth(null, false);
    }
  }

  function handleEvent(accept: boolean) {
    setAcceptedEvent(accept);
    processMonth(currentEvent, accept);
  }

  function processMonth(event: typeof EVENTS_POOL[0] | null, accepted: boolean) {
    const normalSpend = totalAlloc;
    const eventCost = event && accepted ? event.extraCost : 0;
    const totalSpend = normalSpend + eventCost;
    const saved = Math.max(0, MONTHLY_INCOME - totalSpend);
    setSavings(s => s + saved);
    setTotalSaved(s => s + alloc.ahorro);
    setMonthHistory(h => [...h, {
      month,
      spent: totalSpend,
      saved,
      event: event ? event.text : null,
      eventCost,
    }]);
    setPhase('monthResult');
    fadeIn();
  }

  function nextMonth() {
    if (month >= TOTAL_MONTHS) {
      setPhase('result');
    } else {
      setMonth(m => m + 1);
      setPhase('allocate');
      fadeIn();
    }
  }

  function adjustAlloc(cat: Category, delta: number) {
    const meta = CATEGORY_META[cat];
    const newVal = Math.max(meta.min, Math.min(meta.max, alloc[cat] + delta));
    setAlloc(a => ({ ...a, [cat]: newVal }));
  }

  const MONTH_NAMES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
  const lastResult = monthHistory[monthHistory.length - 1];

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <LinearGradient colors={['#1E3A8A', '#1D4ED8', '#3B82F6']} style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.center}>
          <View style={styles.introPig}>
            <PigAvatar mood="thinking" size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>Desafío{'\n'}Presupuesto</Text>
          <Text style={styles.introSub}>Manejá {fmtARS(MONTHLY_INCOME)}/mes durante {TOTAL_MONTHS} meses</Text>
          <View style={styles.rulesBox}>
            {[
              ['📊', 'Distribuí tu sueldo en distintas categorías'],
              ['⚡', 'Cada mes surge un evento inesperado'],
              ['💰', 'El objetivo: ahorrar lo máximo posible'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.ruleRow}>
                <Text style={styles.ruleIcon}>{icon}</Text>
                <Text style={styles.ruleText}>{text}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={['#60A5FA', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>¡Empezar!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // ── EVENT ──────────────────────────────────────────────────────────────────
  if (phase === 'event' && currentEvent) {
    return (
      <LinearGradient colors={['#1E3A8A', '#1D4ED8', '#3B82F6']} style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.eventBadge}>¡EVENTO!</Text>
          <Text style={styles.eventText}>{currentEvent.text}</Text>
          <Text style={styles.eventCost}>Costo: {fmtARS(currentEvent.extraCost)}</Text>
          {currentEvent.avoidable ? (
            <>
              <Text style={styles.eventQuestion}>¿Lo hacés?</Text>
              <View style={styles.eventBtns}>
                <TouchableOpacity style={[styles.eventBtn, { backgroundColor: '#10B981' }]} onPress={() => handleEvent(true)} activeOpacity={0.85}>
                  <Text style={styles.eventBtnText}>Sí, lo hago</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.eventBtn, { backgroundColor: '#6B7280' }]} onPress={() => handleEvent(false)} activeOpacity={0.85}>
                  <Text style={styles.eventBtnText}>No, paso</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.eventQuestion}>Es un gasto obligatorio</Text>
              <TouchableOpacity style={[styles.eventBtn, { backgroundColor: '#3B82F6', width: '100%' }]} onPress={() => handleEvent(true)} activeOpacity={0.85}>
                <Text style={styles.eventBtnText}>Aceptar y continuar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    );
  }

  // ── MONTH RESULT ───────────────────────────────────────────────────────────
  if (phase === 'monthResult' && lastResult) {
    const balance = MONTHLY_INCOME - lastResult.spent;
    return (
      <LinearGradient colors={['#1E3A8A', '#1D4ED8', '#3B82F6']} style={styles.screen}>
        <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
          <Text style={styles.mrMonthTitle}>{MONTH_NAMES[month]} — resumen</Text>
          <View style={styles.mrCards}>
            <View style={styles.mrCard}>
              <Text style={styles.mrCardLabel}>Ingresos</Text>
              <Text style={[styles.mrCardVal, { color: '#10B981' }]}>{fmtARS(MONTHLY_INCOME)}</Text>
            </View>
            <View style={styles.mrCard}>
              <Text style={styles.mrCardLabel}>Gastos</Text>
              <Text style={[styles.mrCardVal, { color: '#EF4444' }]}>{fmtARS(lastResult.spent)}</Text>
            </View>
            <View style={styles.mrCard}>
              <Text style={styles.mrCardLabel}>Sobrante</Text>
              <Text style={[styles.mrCardVal, { color: balance >= 0 ? '#F59E0B' : '#EF4444' }]}>{fmtARS(balance)}</Text>
            </View>
          </View>
          {lastResult.event && (
            <View style={styles.mrEventBox}>
              <Text style={styles.mrEventText}>{lastResult.event}</Text>
              {lastResult.eventCost > 0 && (
                <Text style={styles.mrEventCost}>Gastaste extra: {fmtARS(lastResult.eventCost)}</Text>
              )}
            </View>
          )}
          <View style={styles.mrSavingsTotal}>
            <Text style={styles.mrstLabel}>Ahorro acumulado</Text>
            <Text style={styles.mrstVal}>{fmtARS(savings)}</Text>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={nextMonth} activeOpacity={0.85}>
            <LinearGradient colors={['#60A5FA', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
              <Text style={styles.startBtnText}>
                {month < TOTAL_MONTHS ? `${MONTH_NAMES[month + 1]} →` : 'Ver resultado final'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const totalIncome = MONTHLY_INCOME * TOTAL_MONTHS;
    const savingsRate = (savings / totalIncome) * 100;
    return (
      <LinearGradient colors={['#1E3A8A', '#1D4ED8', '#3B82F6']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={styles.introPig}>
            <PigAvatar mood={savingsRate >= 20 ? 'celebrating' : 'happy'} size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>{savingsRate >= 30 ? '¡Sos un hacha!' : savingsRate >= 15 ? '¡Bien hecho!' : 'Podés mejorar tu ahorro'}</Text>
          <View style={styles.resultGrid}>
            <View style={styles.rgCard}>
              <Text style={styles.rgLabel}>Ahorro total</Text>
              <Text style={[styles.rgVal, { color: '#10B981' }]}>{fmtARS(savings)}</Text>
            </View>
            <View style={styles.rgCard}>
              <Text style={styles.rgLabel}>Tasa de ahorro</Text>
              <Text style={[styles.rgVal, { color: '#F59E0B' }]}>{savingsRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.rgCard}>
              <Text style={styles.rgLabel}>Ingresos totales</Text>
              <Text style={[styles.rgVal, { color: '#fff' }]}>{fmtARS(totalIncome)}</Text>
            </View>
            <View style={styles.rgCard}>
              <Text style={styles.rgLabel}>Meses logrados</Text>
              <Text style={[styles.rgVal, { color: '#60A5FA' }]}>{TOTAL_MONTHS}/6</Text>
            </View>
          </View>
          <Text style={styles.tip}>
            {savingsRate >= 30
              ? '💡 Excelente — superás la regla del 20% de ahorro recomendada por muchos asesores.'
              : savingsRate >= 15
              ? '💡 Bien — estás cerca del 20% recomendado. Podés ajustar ocio o ropa para llegar.'
              : '💡 Intentá aplicar la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro.'}
          </Text>
          <Text style={styles.histTitleText}>Historial mensual</Text>
          {monthHistory.map((h, i) => (
            <View key={i} style={styles.hRow}>
              <Text style={styles.hMonth}>{MONTH_NAMES[h.month]}</Text>
              <View style={{ flex: 1 }}>
                {h.event && <Text style={styles.hEvent} numberOfLines={1}>{h.event.split(' ').slice(0,5).join(' ')}...</Text>}
                <Text style={styles.hSpent}>Gasto: {fmtARS(h.spent)}</Text>
              </View>
              <Text style={[styles.hSaved, { color: h.saved >= 0 ? '#10B981' : '#EF4444' }]}>+{fmtARS(h.saved)}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
            <LinearGradient colors={['#60A5FA', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGrad}>
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

  // ── ALLOCATE ───────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#1E3A8A', '#1D4ED8', '#3B82F6']} style={styles.screen}>
      <View style={styles.qHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.allocTitle}>{MONTH_NAMES[month]} — Distribución</Text>
          <Text style={styles.allocSub}>Mes {month} de {TOTAL_MONTHS}</Text>
        </View>
        <View style={styles.incomeChip}>
          <Text style={styles.incomeLabel}>Sueldo</Text>
          <Text style={styles.incomeVal}>{fmtARS(MONTHLY_INCOME)}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        {Array.from({ length: TOTAL_MONTHS }).map((_, i) => (
          <View key={i} style={[styles.progDot,
            i + 1 < month ? { backgroundColor: '#10B981' } :
            i + 1 === month ? { backgroundColor: '#F59E0B' } :
            { backgroundColor: 'rgba(255,255,255,0.2)' }
          ]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.allocScroll} showsVerticalScrollIndicator={false}>
        {/* Budget balance */}
        <View style={[styles.balanceBox, { borderColor: remaining >= 0 ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.balanceLabel}>Saldo para distribuir</Text>
          <Text style={[styles.balanceVal, { color: remaining >= 0 ? '#10B981' : '#EF4444' }]}>
            {remaining >= 0 ? fmtARS(remaining) : '-' + fmtARS(-remaining)}
          </Text>
        </View>

        {/* Category sliders */}
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat];
          return (
            <View key={cat} style={styles.catCard}>
              <View style={styles.catHeader}>
                <Text style={styles.catIcon}>{meta.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catLabel}>{meta.label}</Text>
                  <Text style={styles.catDesc}>{meta.desc}</Text>
                </View>
                <Text style={[styles.catVal, { color: meta.color }]}>{fmtARS(alloc[cat])}</Text>
              </View>
              <View style={styles.catControls}>
                {[-10000, -5000].map(d => (
                  <TouchableOpacity key={d} style={styles.adjBtn} onPress={() => adjustAlloc(cat, d)} activeOpacity={0.8}>
                    <Text style={styles.adjBtnText}>{d / 1000}k</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.adjSpace} />
                {[5000, 10000].map(d => (
                  <TouchableOpacity key={d} style={[styles.adjBtn, { backgroundColor: meta.color + '33', borderColor: meta.color + '66' }]} onPress={() => adjustAlloc(cat, d)} activeOpacity={0.8}>
                    <Text style={[styles.adjBtnText, { color: meta.color }]}>+{d / 1000}k</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Mini bar */}
              <View style={styles.catBarBg}>
                <View style={[styles.catBarFill, {
                  width: `${Math.min(100, (alloc[cat] / meta.max) * 100)}%`,
                  backgroundColor: meta.color,
                }]} />
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.confirmBtn, remaining < 0 && { opacity: 0.4 }]}
          onPress={confirmBudget}
          disabled={remaining < 0}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#60A5FA', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtnGrad}>
            <Text style={styles.confirmBtnText}>
              {remaining < 0 ? 'Gastás más de lo que ganás' : `Confirmar — sobrante: ${fmtARS(remaining)}`}
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

  qHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8, gap: 10 },
  allocTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  allocSub: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  incomeChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'flex-end' },
  incomeLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
  incomeVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#10B981' },

  progressWrap: { flexDirection: 'row', gap: 6, justifyContent: 'center', paddingBottom: 6 },
  progDot: { width: 10, height: 10, borderRadius: 5 },

  allocScroll: { padding: 14, paddingBottom: 48, gap: 10 },

  balanceBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, padding: 14,
    borderWidth: 1.5,
  },
  balanceLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  balanceVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20 },

  catCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 12, gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  catLabel: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff' },
  catDesc: { fontFamily: 'Baloo2_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  catVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 14 },
  catControls: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  adjBtn: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  adjBtnText: { fontFamily: 'Baloo2_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  adjSpace: { flex: 1 },
  catBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },

  confirmBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 4 },
  confirmBtnGrad: { minHeight: 54, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 15, color: '#fff', textAlign: 'center' },

  // Event
  eventBadge: {
    fontFamily: 'Baloo2_800ExtraBold', fontSize: 10,
    color: '#F59E0B', letterSpacing: 2, textTransform: 'uppercase',
    backgroundColor: '#F59E0B22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
  },
  eventText: { fontFamily: 'Baloo2_700Bold', fontSize: 18, color: '#fff', textAlign: 'center', lineHeight: 26 },
  eventCost: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 26, color: '#EF4444' },
  eventQuestion: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  eventBtns: { flexDirection: 'row', gap: 14, width: '100%' },
  eventBtn: { flex: 1, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  eventBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },

  // Month result
  mrMonthTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 22, color: '#fff', textAlign: 'center' },
  mrCards: { flexDirection: 'row', gap: 10, width: '100%' },
  mrCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  mrCardLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  mrCardVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 15 },
  mrEventBox: { width: '100%', backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#F59E0B55' },
  mrEventText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: '#fff' },
  mrEventCost: { fontFamily: 'Baloo2_700Bold', fontSize: 13, color: '#EF4444', marginTop: 4 },
  mrSavingsTotal: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#10B98155',
  },
  mrstLabel: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#fff' },
  mrstVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: '#10B981' },

  // Result
  resultScroll: { padding: 24, alignItems: 'center', gap: 16, paddingTop: 60 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  rgCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  rgLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  rgVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20 },
  tip: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, width: '100%' },
  histTitleText: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-start' },
  hRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 10, width: '100%' },
  hMonth: { fontFamily: 'Baloo2_700Bold', fontSize: 12, color: 'rgba(255,255,255,0.6)', width: 50 },
  hEvent: { fontFamily: 'Baloo2_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.45)' },
  hSpent: { fontFamily: 'Baloo2_600SemiBold', fontSize: 12, color: '#fff' },
  hSaved: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, width: 62, textAlign: 'right' },
});
