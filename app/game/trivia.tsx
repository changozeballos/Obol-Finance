import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PigAvatar } from '../../components/PigAvatar';
import { nativeDriver } from '../../constants/platform';

// ── Questions ────────────────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: '¿Qué es la inflación?', opts: ['Subida generalizada de precios', 'Crecimiento del PBI', 'Caída del desempleo', 'Aumento de exportaciones'], c: 0, exp: 'La inflación es el aumento sostenido y generalizado del nivel de precios de bienes y servicios.' },
  { q: '¿Qué mide el IPC?', opts: ['Variación de precios de una canasta de bienes', 'El valor del dólar', 'El empleo formal', 'Las exportaciones anuales'], c: 0, exp: 'El IPC (Índice de Precios al Consumidor) mide la variación de precios de una canasta representativa.' },
  { q: '¿Qué es el PBI?', opts: ['Valor de todos los bienes y servicios producidos en un país', 'La deuda externa total', 'El presupuesto del gobierno', 'Las reservas del banco central'], c: 0, exp: 'El Producto Bruto Interno es el valor total de bienes y servicios producidos en un país en un período.' },
  { q: '¿Qué es el interés compuesto?', opts: ['Interés que se calcula sobre capital + intereses previos', 'Interés fijo mensual', 'Un tipo de préstamo bancario', 'La tasa de inflación mensual'], c: 0, exp: 'El interés compuesto genera "interés sobre interés", haciendo crecer el capital exponencialmente.' },
  { q: '¿Qué es un bono?', opts: ['Título de deuda que emite un gobierno o empresa', 'Una acción de una empresa', 'Un fondo de inversión', 'Un tipo de cuenta bancaria'], c: 0, exp: 'Un bono es un instrumento de deuda: el emisor pide dinero prestado y se compromete a devolver capital + intereses.' },
  { q: '¿Qué es la oferta y la demanda?', opts: ['Cantidad disponible vs cantidad que quieren comprar', 'El precio del dólar vs el peso', 'Los impuestos vs los subsidios', 'Exportaciones vs importaciones'], c: 0, exp: 'La oferta es la cantidad que se ofrece de un bien; la demanda es la cantidad que los compradores desean adquirir.' },
  { q: '¿Qué es un plazo fijo?', opts: ['Depósito bancario que genera interés por un tiempo determinado', 'Un préstamo a cuotas fijas', 'Una cuenta sin comisión', 'Un bono del gobierno'], c: 0, exp: 'Un plazo fijo es un depósito a un banco por un tiempo pactado, a cambio de una tasa de interés.' },
  { q: '¿Qué es la tasa de desempleo?', opts: ['Porcentaje de personas sin trabajo que buscan empleo', 'Número total de desempleados', 'Personas que nunca trabajaron', 'Porcentaje de trabajadores informales'], c: 0, exp: 'Es el porcentaje de la población activa (que busca trabajo) que no tiene empleo.' },
  { q: '¿Qué son las acciones?', opts: ['Partes del capital de una empresa que se pueden comprar', 'Bonos emitidos por empresas', 'Monedas digitales', 'Préstamos entre privados'], c: 0, exp: 'Una acción representa una porción de la propiedad de una empresa. Al comprarla, te volvés socio.' },
  { q: '¿Qué es la devaluación?', opts: ['Caída del valor de la moneda local respecto a otras', 'Aumento del salario mínimo', 'Suba de las tasas de interés', 'Reducción de la deuda pública'], c: 0, exp: 'La devaluación es la reducción del tipo de cambio oficial de una moneda respecto a monedas extranjeras.' },
  { q: '¿Qué es el déficit fiscal?', opts: ['Cuando el Estado gasta más de lo que recauda', 'Cuando las exportaciones superan las importaciones', 'Cuando la inflación supera el 10%', 'Cuando el PBI cae dos trimestres seguidos'], c: 0, exp: 'El déficit fiscal ocurre cuando los gastos del gobierno superan sus ingresos (impuestos y otros).' },
  { q: '¿Qué es la política monetaria?', opts: ['Manejo de la oferta de dinero y tasas de interés por el banco central', 'Los impuestos que cobra el gobierno', 'El control del tipo de cambio', 'Las reglas del comercio exterior'], c: 0, exp: 'La política monetaria es el conjunto de acciones del banco central para controlar la inflación y el dinero en circulación.' },
  { q: '¿Qué es la diversificación en inversiones?', opts: ['Distribuir el dinero en distintos activos para reducir riesgo', 'Invertir todo en un solo activo seguro', 'Comprar dólares como única inversión', 'Ahorrar en el banco sin invertir'], c: 0, exp: 'Diversificar significa no "poner todos los huevos en la misma canasta": distribuir inversiones reduce el riesgo.' },
  { q: '¿Qué es un ETF?', opts: ['Fondo que replica un índice y cotiza en bolsa', 'Un tipo de cuenta corriente', 'Una criptomoneda regulada', 'Un bono de corto plazo'], c: 0, exp: 'Un ETF (Exchange Traded Fund) es un fondo de inversión que cotiza en bolsa y replica un índice como el S&P 500.' },
  { q: '¿Qué es la hiperinflación?', opts: ['Inflación extremadamente alta, usualmente +50% mensual', 'Inflación de dos dígitos anuales', 'Deflación muy pronunciada', 'Inflación causada por importaciones'], c: 0, exp: 'La hiperinflación es inflación fuera de control. La definición clásica es más del 50% mensual.' },
  { q: '¿Qué es el patrón oro?', opts: ['Sistema donde el valor de la moneda se respaldaba en oro', 'El precio internacional del oro', 'Un tipo de inversión en metales', 'El índice de reservas del banco central'], c: 0, exp: 'Bajo el patrón oro, cada unidad de moneda tenía un respaldo fijo en oro. Se abandonó en el siglo XX.' },
  { q: '¿Qué es el riesgo país?', opts: ['Indicador de probabilidad de que un país no pague su deuda', 'El nivel de violencia en un país', 'La tasa de pobreza', 'El déficit comercial'], c: 0, exp: 'El riesgo país mide cuánto más debe pagar un país por su deuda comparado con EEUU (considerado libre de riesgo).' },
  { q: '¿Qué significa "comprar en cuotas sin interés"?', opts: ['El interés lo absorbe el comercio o el banco', 'Realmente no hay costo financiero para nadie', 'El precio del producto baja por pagar en cuotas', 'Es un beneficio exclusivo de las fintech'], c: 0, exp: 'El "sin interés" generalmente significa que el comerciante o banco absorbe el costo financiero, no que desaparece.' },
  { q: '¿Qué es el Bitcoin?', opts: ['Criptomoneda descentralizada creada en 2009', 'Una moneda digital del gobierno de EEUU', 'Un sistema de pagos bancario', 'Un índice de acciones tecnológicas'], c: 0, exp: 'Bitcoin es la primera criptomoneda, creada en 2009 por Satoshi Nakamoto. Funciona sobre una red descentralizada.' },
  { q: '¿Qué es el tipo de cambio?', opts: ['El precio de una moneda en términos de otra', 'La tasa de inflación mensual', 'El costo del dinero en el tiempo', 'El índice de precios al por mayor'], c: 0, exp: 'El tipo de cambio indica cuántas unidades de una moneda se necesitan para comprar una unidad de otra.' },
  { q: '¿Qué es la tasa de interés real?', opts: ['Tasa nominal menos la inflación', 'La tasa que cobran los bancos privados', 'El rendimiento de los bonos del tesoro', 'La tasa del banco central'], c: 0, exp: 'La tasa real = tasa nominal - inflación. Mide el verdadero poder de compra que gana o pierde el dinero.' },
  { q: '¿Qué es el efecto de la curva de Laffer?', opts: ['Que subir impuestos demasiado puede reducir la recaudación', 'Que la inflación sube con el desempleo', 'Que la demanda cae cuando sube el precio', 'Que el ahorro aumenta con la tasa de interés'], c: 0, exp: 'La curva de Laffer plantea que existe un punto óptimo de impuestos: más allá, la recaudación cae porque desincentiva la actividad.' },
  { q: '¿Qué es un fondo común de inversión?', opts: ['Vehículo que agrupa dinero de muchos inversores para invertir', 'Una cuenta de ahorro con tasa fija', 'Un préstamo hipotecario', 'Un seguro de vida con capitalización'], c: 0, exp: 'Un FCI reúne aportes de muchos inversores y los invierte en cartera diversificada, con gestión profesional.' },
  { q: '¿Qué es la recesión económica?', opts: ['Caída del PBI por dos trimestres consecutivos', 'Un período de alta inflación', 'Aumento del desempleo por encima del 10%', 'Reducción del salario real'], c: 0, exp: 'La definición técnica de recesión es la contracción del PBI durante dos trimestres seguidos.' },
  { q: '¿Qué diferencia hay entre ahorro e inversión?', opts: ['El ahorro guarda dinero sin riesgo; la inversión busca rendimiento asumiendo riesgo', 'Son lo mismo, solo cambia el nombre', 'El ahorro siempre rinde más que la inversión', 'La inversión es solo para empresas'], c: 0, exp: 'Ahorrar implica guardar sin riesgo (plata fija). Invertir implica asumir riesgo a cambio de un rendimiento mayor.' },
  { q: '¿Qué es el costo de oportunidad?', opts: ['Lo que resignás al elegir una opción sobre otra', 'El costo de producir un bien', 'Los impuestos sobre las ganancias', 'El interés de un préstamo'], c: 0, exp: 'El costo de oportunidad es el valor de la mejor alternativa que descartaste al tomar una decisión.' },
  { q: '¿Qué es la blockchain?', opts: ['Base de datos distribuida e inmutable de transacciones', 'Un tipo de inteligencia artificial', 'El sistema de pagos de los bancos centrales', 'Una red social financiera'], c: 0, exp: 'La blockchain es una cadena de bloques de datos validados en forma distribuida, sin un servidor central.' },
  { q: '¿Qué es el salario mínimo?', opts: ['El piso legal de remuneración que debe pagar un empleador', 'El promedio de los salarios del sector privado', 'El sueldo de los empleados estatales', 'El salario de los trabajadores informales'], c: 0, exp: 'El salario mínimo es el monto mínimo legal que un empleador puede pagar a un trabajador por su labor.' },
  { q: '¿Qué son los derivados financieros?', opts: ['Contratos cuyo valor depende de otro activo subyacente', 'Activos respaldados en oro', 'Monedas de reserva internacional', 'Fondos de pensión estatales'], c: 0, exp: 'Los derivados (opciones, futuros) son contratos cuyo precio se "deriva" de otro activo como acciones, materias primas o divisas.' },
  { q: '¿Para qué sirve el seguro de desempleo?', opts: ['Brindar ingresos temporales a quienes pierden su trabajo', 'Subsidiar empresas en quiebra', 'Reducir la inflación', 'Financiar obras públicas'], c: 0, exp: 'El seguro de desempleo es una prestación que reciben los trabajadores que pierden su empleo involuntariamente.' },
  { q: '¿Qué es el proteccionismo comercial?', opts: ['Política que protege la industria local de la competencia extranjera', 'La libre circulación de capitales', 'Un acuerdo comercial bilateral', 'La regulación de los mercados financieros'], c: 0, exp: 'El proteccionismo usa aranceles, cuotas u otras barreras para limitar las importaciones y proteger la producción local.' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TOTAL_QUESTIONS = 10;
const TIME_PER_Q = 20;

type Phase = 'intro' | 'question' | 'feedback' | 'result';

export default function TriviaGame() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<typeof ALL_QUESTIONS>([]);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [results, setResults] = useState<boolean[]>([]);

  const timerRef = useRef<any>(null);
  const barAnim   = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const current = questions[qi];

  function startGame() {
    setQuestions(shuffle(ALL_QUESTIONS).slice(0, TOTAL_QUESTIONS));
    setQi(0); setScore(0); setStreak(0); setBestStreak(0);
    setResults([]); setSelected(null);
    setPhase('question');
  }

  // Timer
  useEffect(() => {
    if (phase !== 'question') return;
    setTimeLeft(TIME_PER_Q);
    Animated.timing(barAnim, { toValue: 0, duration: TIME_PER_Q * 1000, useNativeDriver: false }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1); // time out
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qi]);

  // Card entrance animation
  useEffect(() => {
    if (phase === 'question') {
      fadeAnim.setValue(0); scaleAnim.setValue(0.93);
      Animated.parallel([
        Animated.spring(fadeAnim,  { toValue: 1, useNativeDriver: nativeDriver, tension: 100, friction: 8 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: nativeDriver, tension: 100, friction: 8 }),
      ]).start();
    }
  }, [phase, qi]);

  function handleAnswer(idx: number) {
    clearInterval(timerRef.current);
    barAnim.stopAnimation();
    setSelected(idx);
    const correct = idx === current.c;
    const newStreak = correct ? streak + 1 : 0;
    const bonus = correct ? Math.min(streak, 4) : 0;
    setScore(s => s + (correct ? 10 + bonus * 2 : 0));
    setStreak(newStreak);
    setBestStreak(b => Math.max(b, newStreak));
    setResults(r => [...r, correct]);
    setPhase('feedback');
  }

  function nextQuestion() {
    if (qi + 1 >= TOTAL_QUESTIONS) {
      setPhase('result');
    } else {
      barAnim.setValue(1);
      setQi(q => q + 1);
      setSelected(null);
      setPhase('question');
    }
  }

  const maxScore = TOTAL_QUESTIONS * 10 + (TOTAL_QUESTIONS - 1) * 2 * 4;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <LinearGradient colors={['#1e1b4b', '#312e81', '#4c1d95']} style={styles.screen}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.introContent}>
          <View style={styles.introPigCircle}>
            <PigAvatar mood="thinking" size={90} overrideBg="transparent" />
          </View>
          <Text style={styles.introTitle}>Trivia{'\n'}Financiera</Text>
          <Text style={styles.introSubtitle}>10 preguntas · 20 segundos cada una</Text>
          <View style={styles.rulesBox}>
            {[
              ['🎯', '10 puntos por respuesta correcta'],
              ['🔥', 'Bonus x racha: +2pts extra por racha'],
              ['⏱️', 'El tiempo corre — no te duermas'],
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
    const pct = Math.round((score / maxScore) * 100);
    const mood = pct >= 80 ? 'celebrating' : pct >= 50 ? 'happy' : 'thinking';
    const msg  = pct >= 80 ? '¡Maestro financiero!' : pct >= 50 ? '¡Buen trabajo!' : 'Seguí practicando';
    return (
      <LinearGradient colors={['#1e1b4b', '#312e81', '#4c1d95']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <View style={styles.resultPigWrap}>
            <PigAvatar mood={mood} size={100} overrideBg="transparent" />
          </View>
          <Text style={styles.resultMsg}>{msg}</Text>
          <View style={styles.resultScoreBox}>
            <Text style={styles.resultScoreNum}>{score}</Text>
            <Text style={styles.resultScoreLabel}>puntos</Text>
          </View>
          <View style={styles.resultStats}>
            {[
              { label: 'Correctas', val: results.filter(Boolean).length, color: '#10B981' },
              { label: 'Incorrectas', val: results.filter(r => !r).length, color: '#EF4444' },
              { label: 'Mejor racha', val: bestStreak, color: '#F59E0B' },
            ].map(s => (
              <View key={s.label} style={styles.resultStat}>
                <Text style={[styles.resultStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.resultStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          {/* Results dots */}
          <View style={styles.dotsRow}>
            {results.map((r, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: r ? '#10B981' : '#EF4444' }]} />
            ))}
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

  // ── QUESTION / FEEDBACK ────────────────────────────────────────────────────
  const timerColor = timeLeft > 10 ? '#10B981' : timeLeft > 5 ? '#F59E0B' : '#EF4444';

  return (
    <LinearGradient colors={['#1e1b4b', '#312e81', '#4c1d95']} style={styles.screen}>
      {/* Header */}
      <View style={styles.qHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <View style={styles.qProgress}>
          {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
            <View key={i} style={[styles.qDot,
              i < qi ? { backgroundColor: '#10B981' } :
              i === qi ? { backgroundColor: '#F59E0B' } :
              { backgroundColor: 'rgba(255,255,255,0.2)' }
            ]} />
          ))}
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>{score}pt</Text>
        </View>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBg}>
        <Animated.View style={[styles.timerFill, {
          backgroundColor: timerColor,
          width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>
      <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>

      {/* Streak */}
      {streak >= 2 && (
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 Racha ×{streak}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.qScroll}>
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.qNum}>{qi + 1} / {TOTAL_QUESTIONS}</Text>
          <Text style={styles.qText}>{current?.q}</Text>
        </Animated.View>

        <View style={styles.optionsWrap}>
          {current?.opts.map((opt, i) => {
            let bg: string = 'rgba(255,255,255,0.10)';
            let border = 'rgba(255,255,255,0.18)';
            if (phase === 'feedback') {
              if (i === current.c) { bg = '#10B981'; border = '#10B981'; }
              else if (i === selected) { bg = '#EF4444'; border = '#EF4444'; }
            } else if (selected === i) {
              bg = 'rgba(255,255,255,0.25)'; border = '#F59E0B';
            }
            return (
              <TouchableOpacity
                key={i}
                onPress={() => phase === 'question' && handleAnswer(i)}
                style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                activeOpacity={0.82}
                disabled={phase === 'feedback'}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>{['A','B','C','D'][i]}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
                {phase === 'feedback' && i === current.c && (
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                )}
                {phase === 'feedback' && i === selected && i !== current.c && (
                  <Ionicons name="close-circle" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {phase === 'feedback' && (
          <Animated.View style={[styles.expBox, {
            backgroundColor: selected === current.c ? '#10B98133' : '#EF444433',
            borderColor: selected === current.c ? '#10B981' : '#EF4444',
          }]}>
            <Text style={styles.expTitle}>
              {selected === current.c ? '¡Correcto! 🎉' : selected === -1 ? 'Tiempo agotado ⏱️' : 'Incorrecto 😅'}
            </Text>
            <Text style={styles.expText}>{current?.exp}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion} activeOpacity={0.85}>
              <Text style={styles.nextBtnText}>
                {qi + 1 < TOTAL_QUESTIONS ? 'Siguiente →' : 'Ver resultado'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  back: { position: 'absolute', top: 52, left: 16, zIndex: 10, padding: 8 },

  // Intro
  introContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 20 },
  introPigCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  introTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 36, color: '#fff', textAlign: 'center', letterSpacing: -1 },
  introSubtitle: { fontFamily: 'Baloo2_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  rulesBox: { width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 18, gap: 12 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  ruleText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.85)', flex: 1 },
  startBtn: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  startBtnGrad: { height: 56, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: '#fff', letterSpacing: 0.3 },

  // Header
  qHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8, gap: 12 },
  qProgress: { flex: 1, flexDirection: 'row', gap: 5, justifyContent: 'center' },
  qDot: { width: 8, height: 8, borderRadius: 4 },
  scoreChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  scoreChipText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#F59E0B' },

  // Timer
  timerBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 16, borderRadius: 99, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 99 },
  timerNum: { fontFamily: 'Baloo2_700Bold', fontSize: 13, textAlign: 'center', marginTop: 4 },

  // Streak
  streakBadge: { alignSelf: 'center', backgroundColor: 'rgba(245,158,11,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 4 },
  streakText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#F59E0B' },

  // Question
  qScroll: { padding: 16, paddingBottom: 40, gap: 14 },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24, padding: 22,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  qNum: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  qText: { fontFamily: 'Baloo2_700Bold', fontSize: 19, color: '#fff', lineHeight: 27 },

  // Options
  optionsWrap: { gap: 10 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, borderWidth: 1.5, padding: 14,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  optionLetterText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#fff' },
  optionText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: '#fff', flex: 1, lineHeight: 20 },

  // Explanation
  expBox: { borderRadius: 20, borderWidth: 1.5, padding: 18, gap: 10 },
  expTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 17, color: '#fff' },
  expText: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 21 },
  nextBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  nextBtnText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#fff' },

  // Result
  resultScroll: { padding: 28, alignItems: 'center', gap: 20, paddingTop: 60 },
  resultPigWrap: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  resultMsg: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 26, color: '#fff', textAlign: 'center' },
  resultScoreBox: { alignItems: 'center' },
  resultScoreNum: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 60, color: '#F59E0B', letterSpacing: -2 },
  resultScoreLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: -8 },
  resultStats: { flexDirection: 'row', gap: 16 },
  resultStat: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, minWidth: 90 },
  resultStatVal: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 28 },
  resultStatLabel: { fontFamily: 'Baloo2_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  dotsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
