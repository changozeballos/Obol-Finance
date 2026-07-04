import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Modal,
  SafeAreaView, StatusBar, Pressable, PanResponder,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Svg, { Polyline, Line, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { Colors, Shadows } from '../../constants/Colors';
import { nativeDriver, shadow } from '../../constants/platform';
import { SECTIONS } from '../../content/lessons/sections';
import { useProgressStore } from '../../store/progressStore';
import { syncProgressToCloud } from '../../lib/syncProgress';
import type { Question } from '../../types';

const SUPPORTED_TYPES = [
  'multiple_choice', 'true_false', 'fill_number',
  'order', 'classify', 'slider', 'graph_id', 'match', 'graph_point',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: current / total, duration: 350, useNativeDriver: false }).start();
  }, [current]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
}

function HeartBar({ hearts }: { hearts: number }) {
  return (
    <View style={styles.heartBar}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.heartIcon, i > hearts && styles.heartEmpty]}>❤️</Text>
      ))}
    </View>
  );
}

function OptionButton({
  text, selected, correct, revealed, onPress,
}: {
  text: string; selected: boolean; correct: boolean; revealed: boolean; onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: nativeDriver }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: nativeDriver }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.option,
          !revealed && selected && styles.optionSelected,
          revealed && correct && styles.optionCorrect,
          revealed && selected && !correct && styles.optionWrong,
        ]}
        onPress={handlePress}
        disabled={revealed}
      >
        <Text style={[
          styles.optionText,
          !revealed && selected && styles.optionTextSelected,
          revealed && correct && styles.optionTextCorrect,
          revealed && selected && !correct && styles.optionTextWrong,
        ]}>{text}</Text>
        {revealed && correct && <Text style={styles.optionCheck}>✓</Text>}
        {revealed && selected && !correct && <Text style={styles.optionX}>✗</Text>}
      </Pressable>
    </Animated.View>
  );
}

function FeedbackPanel({
  isCorrect, explanation, onContinue, combo,
}: {
  isCorrect: boolean; explanation: string; onContinue: () => void; combo: number;
}) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(120)).current;
  const comboPop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 9, useNativeDriver: nativeDriver }).start();
  }, []);
  useEffect(() => {
    if (isCorrect && combo >= 2) {
      Animated.sequence([
        Animated.timing(comboPop, { toValue: 1.3, duration: 180, useNativeDriver: nativeDriver }),
        Animated.spring(comboPop, { toValue: 1, friction: 5, useNativeDriver: nativeDriver }),
      ]).start();
    }
  }, [combo, isCorrect]);
  return (
    <Animated.View style={[
      styles.feedback,
      isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
      { transform: [{ translateY: slideAnim }] },
    ]}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.feedbackIcon}>{isCorrect ? '🎉' : '💡'}</Text>
        <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
          {isCorrect ? t('lesson.correct') : t('lesson.incorrect')}
        </Text>
        {isCorrect && combo >= 2 && (
          <Animated.View style={[styles.comboBadge, { transform: [{ scale: comboPop }] }]}>
            <Text style={styles.comboBadgeText}>🔥 ×{combo}</Text>
          </Animated.View>
        )}
      </View>
      <Text style={[styles.feedbackExp, isCorrect ? styles.feedbackExpCorrect : styles.feedbackExpWrong]}>
        {explanation}
      </Text>
      <TouchableOpacity
        style={[styles.feedbackBtn, isCorrect ? styles.feedbackBtnCorrect : styles.feedbackBtnWrong]}
        onPress={onContinue}
      >
        <Text style={styles.feedbackBtnText}>{t('lesson.continue')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Order question ───────────────────────────────────────────────────────────

function OrderQuestion({
  items, answer, revealed, isCorrect, onChangeAnswer, color,
}: {
  items: NonNullable<Question['items']>;
  answer: string[];
  revealed: boolean;
  isCorrect: boolean;
  onChangeAnswer: (a: string[]) => void;
  color: string;
}) {
  const { t } = useTranslation();
  const shuffled = useMemo(() => [...items].sort(() => Math.random() - 0.5), []);
  const available = shuffled.filter((item) => !answer.includes(item.id));
  const selected = answer.map((id) => items.find((i) => i.id === id)!).filter(Boolean);
  const sortedCorrect = useMemo(
    () => [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((i) => i.id),
    [items],
  );

  const tapAvailable = (itemId: string) => {
    if (revealed) return;
    onChangeAnswer([...answer, itemId]);
  };
  const tapSelected = (itemId: string) => {
    if (revealed) return;
    const idx = answer.indexOf(itemId);
    onChangeAnswer(answer.slice(0, idx));
  };

  return (
    <View style={styles.orderWrap}>
      {/* Answer slots */}
      <View style={styles.orderSlots}>
        {selected.length === 0 && (
          <Text style={styles.orderPlaceholder}>Toca los elementos en orden...</Text>
        )}
        {selected.map((item, i) => {
          const correct = revealed && sortedCorrect[i] === item.id;
          const wrong = revealed && sortedCorrect[i] !== item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.orderToken, styles.orderTokenPlaced,
                correct && styles.orderTokenCorrect,
                wrong && styles.orderTokenWrong,
              ]}
              onPress={() => tapSelected(item.id)}
              disabled={revealed}
            >
              <Text style={[styles.orderNum, { color }]}>{i + 1}</Text>
              <Text style={styles.orderTokenText}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.orderDivider} />

      {/* Available pool */}
      <View style={styles.orderPool}>
        {available.map((item) => (
          <TouchableOpacity key={item.id} style={styles.orderToken} onPress={() => tapAvailable(item.id)}>
            <Text style={styles.orderTokenText}>{t(item.labelKey)}</Text>
          </TouchableOpacity>
        ))}
        {available.length === 0 && !revealed && (
          <Text style={styles.orderPlaceholder}>Todos ubicados ✓</Text>
        )}
      </View>
    </View>
  );
}

// ─── Classify question ────────────────────────────────────────────────────────

function ClassifyQuestion({
  items, buckets, answer, revealed, onChangeAnswer,
}: {
  items: NonNullable<Question['items']>;
  buckets: NonNullable<Question['buckets']>;
  answer: Record<string, string>;
  revealed: boolean;
  onChangeAnswer: (a: Record<string, string>) => void;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  const unplaced = items.filter((item) => !answer[item.id]);
  const getItemsInBucket = (bid: string) => items.filter((item) => answer[item.id] === bid);

  const tapItem = (itemId: string) => {
    if (revealed) return;
    if (answer[itemId]) {
      // Remove from bucket → back to pool
      const next = { ...answer };
      delete next[itemId];
      onChangeAnswer(next);
      return;
    }
    setSelected((prev) => (prev === itemId ? null : itemId));
  };

  const tapBucket = (bucketId: string) => {
    if (!selected || revealed) return;
    onChangeAnswer({ ...answer, [selected]: bucketId });
    setSelected(null);
  };

  return (
    <View style={styles.classifyWrap}>
      {/* Pool */}
      <View style={styles.classifyPool}>
        {unplaced.length === 0
          ? <Text style={styles.orderPlaceholder}>Todos clasificados ✓</Text>
          : unplaced.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.classifyChip, selected === item.id && styles.classifyChipSelected]}
              onPress={() => tapItem(item.id)}
            >
              <Text style={styles.classifyChipText}>{t(item.labelKey)}</Text>
            </TouchableOpacity>
          ))
        }
      </View>

      {/* Buckets */}
      <View style={styles.classifyBuckets}>
        {buckets.map((bucket) => {
          const bucketItems = getItemsInBucket(bucket.id);
          return (
            <TouchableOpacity
              key={bucket.id}
              style={[styles.classifyBucket, !!selected && !revealed && styles.classifyBucketTarget]}
              onPress={() => tapBucket(bucket.id)}
              activeOpacity={selected ? 0.7 : 1}
            >
              <Text style={styles.classifyBucketLabel}>{t(bucket.labelKey)}</Text>
              <View style={styles.classifyBucketItems}>
                {bucketItems.map((item) => {
                  const ok = revealed && item.bucket === bucket.id;
                  const bad = revealed && item.bucket !== bucket.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.classifyChip,
                        ok && styles.classifyChipCorrect,
                        bad && styles.classifyChipWrong,
                      ]}
                      onPress={() => tapItem(item.id)}
                      disabled={revealed}
                    >
                      <Text style={styles.classifyChipText}>{t(item.labelKey)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!!selected && !revealed && (
        <Text style={styles.classifyHint}>Toca una categoría para clasificar</Text>
      )}
    </View>
  );
}

// ─── Slider question ──────────────────────────────────────────────────────────

function SliderQuestion({
  min, max, correct, tolerance, unit, value, revealed, isCorrect, onChange, color,
}: {
  min: number; max: number; correct: number; tolerance: number; unit: string;
  value: number | null; revealed: boolean; isCorrect: boolean;
  onChange: (v: number) => void; color: string;
}) {
  const [trackW, setTrackW] = useState(280);
  const posRef = useRef(trackW / 2);
  const [posX, setPosX] = useState(trackW / 2);

  const xToVal = useCallback((x: number) => Math.round(min + (x / trackW) * (max - min)), [min, max, trackW]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !revealed,
    onMoveShouldSetPanResponder: () => !revealed,
    onPanResponderMove: (_, gs) => {
      const nx = Math.max(0, Math.min(trackW, posRef.current + gs.dx));
      setPosX(nx);
      onChange(xToVal(nx));
    },
    onPanResponderRelease: (_, gs) => {
      const nx = Math.max(0, Math.min(trackW, posRef.current + gs.dx));
      posRef.current = nx;
      setPosX(nx);
      onChange(xToVal(nx));
    },
  }), [revealed, trackW, xToVal]);

  const fillPct = (posX / trackW) * 100;
  const correctPct = ((correct - min) / (max - min)) * 100;
  const displayVal = value ?? xToVal(posX);

  return (
    <View style={styles.sliderWrap}>
      <Text style={styles.sliderValue}>
        {displayVal.toLocaleString()} <Text style={styles.sliderUnit}>{unit}</Text>
      </Text>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderEdge}>{min.toLocaleString()}</Text>
        <View style={{ flex: 1 }} onLayout={(e) => { setTrackW(e.nativeEvent.layout.width); posRef.current = e.nativeEvent.layout.width / 2; }}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${fillPct}%` as any, backgroundColor: color }]} />
            {revealed && (
              <View style={[styles.sliderCorrectMark, { left: `${correctPct}%` as any }]} />
            )}
            <View
              {...panResponder.panHandlers}
              style={[styles.sliderThumb, { left: posX - 16, backgroundColor: color }]}
            />
          </View>
        </View>
        <Text style={styles.sliderEdge}>{max.toLocaleString()}</Text>
      </View>

      {revealed && (
        <Text style={[styles.sliderHint, isCorrect ? styles.sliderHintCorrect : styles.sliderHintWrong]}>
          {isCorrect ? '¡Bien! Estabas en el rango correcto' : `La respuesta era ${correct.toLocaleString()} ${unit}`}
        </Text>
      )}
    </View>
  );
}

// ─── Mini chart (for graph_id) ────────────────────────────────────────────────

function ChartMini({ series, labels }: { series: NonNullable<Question['series']>; labels: string[] }) {
  const W = 290;
  const H = 90;
  const PAD = { t: 8, r: 8, b: 20, l: 8 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444'];

  const allVals = series.flatMap((s) => s.values);
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const toX = (i: number) => PAD.l + (i / (labels.length - 1)) * chartW;
  const toY = (v: number) => PAD.t + chartH - ((v - minV) / range) * chartH;

  return (
    <View style={styles.chartWrap}>
      <Svg width={W} height={H}>
        {/* Zero line */}
        {minV < 0 && maxV > 0 && (
          <Line
            x1={PAD.l} y1={toY(0)} x2={W - PAD.r} y2={toY(0)}
            stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3,3"
          />
        )}
        {/* Series */}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
          return (
            <Polyline
              key={si}
              points={pts}
              fill="none"
              stroke={s.color ?? COLORS[si % COLORS.length]}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
        {/* X labels */}
        {labels.map((label, i) => (
          <SvgText
            key={i}
            x={toX(i)}
            y={H - 4}
            fontSize={8}
            fill="#94A3B8"
            textAnchor="middle"
          >{label}</SvgText>
        ))}
      </Svg>
      {/* Legend */}
      <View style={styles.chartLegend}>
        {series.map((s, si) => (
          <View key={si} style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: s.color ?? COLORS[si % COLORS.length] }]} />
            <Text style={styles.chartLegendText}>Serie {String.fromCharCode(65 + si)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Match question ───────────────────────────────────────────────────────────

const PAIR_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

function MatchQuestion({
  pairs, answer, revealed, onChangeAnswer,
}: {
  pairs: NonNullable<Question['pairs']>;
  answer: Record<string, string>;
  revealed: boolean;
  onChangeAnswer: (a: Record<string, string>) => void;
}) {
  const { t } = useTranslation();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const shuffledRight = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), []);

  const colorOf = (leftKey: string) =>
    PAIR_COLORS[pairs.findIndex((p) => p.leftKey === leftKey) % PAIR_COLORS.length];

  const matchedLeftFor = (rightKey: string) =>
    Object.entries(answer).find(([, v]) => v === rightKey)?.[0];

  const tapLeft = (leftKey: string) => {
    if (revealed) return;
    if (answer[leftKey]) {
      const next = { ...answer };
      delete next[leftKey];
      onChangeAnswer(next);
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft((prev) => (prev === leftKey ? null : leftKey));
  };

  const tapRight = (rightKey: string) => {
    if (revealed) return;
    const existingLeft = matchedLeftFor(rightKey);
    if (existingLeft) {
      const next = { ...answer };
      delete next[existingLeft];
      if (selectedLeft) {
        onChangeAnswer({ ...next, [selectedLeft]: rightKey });
        setSelectedLeft(null);
      } else {
        onChangeAnswer(next);
      }
      return;
    }
    if (!selectedLeft) return;
    onChangeAnswer({ ...answer, [selectedLeft]: rightKey });
    setSelectedLeft(null);
  };

  return (
    <View style={styles.matchWrap}>
      <View style={styles.matchColumns}>
        {/* Left column */}
        <View style={styles.matchCol}>
          {pairs.map((pair) => {
            const isSel = selectedLeft === pair.leftKey;
            const matched = answer[pair.leftKey];
            const color = colorOf(pair.leftKey);
            const revOk = revealed && matched === pair.rightKey;
            const revBad = revealed && matched && matched !== pair.rightKey;
            return (
              <TouchableOpacity
                key={pair.leftKey}
                style={[
                  styles.matchChip,
                  isSel && styles.matchChipSelected,
                  matched && !revealed && { borderColor: color, backgroundColor: color + '18' },
                  revOk && styles.matchChipCorrect,
                  revBad && styles.matchChipWrong,
                ]}
                onPress={() => tapLeft(pair.leftKey)}
                disabled={revealed}
              >
                {matched && !revealed && <View style={[styles.matchDot, { backgroundColor: color }]} />}
                <Text style={styles.matchChipText} numberOfLines={3}>{t(pair.leftKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right column */}
        <View style={styles.matchCol}>
          {shuffledRight.map((pair) => {
            const leftOf = matchedLeftFor(pair.rightKey);
            const color = leftOf ? colorOf(leftOf) : undefined;
            const revOk = revealed && leftOf && answer[leftOf] === pair.rightKey;
            const revBad = revealed && leftOf && answer[leftOf] !== pair.rightKey;
            return (
              <TouchableOpacity
                key={pair.rightKey}
                style={[
                  styles.matchChip,
                  selectedLeft && !leftOf && !revealed && styles.matchChipTarget,
                  leftOf && !revealed && { borderColor: color, backgroundColor: color + '18' },
                  revOk && styles.matchChipCorrect,
                  revBad && styles.matchChipWrong,
                ]}
                onPress={() => tapRight(pair.rightKey)}
                disabled={revealed}
              >
                {leftOf && !revealed && <View style={[styles.matchDot, { backgroundColor: color }]} />}
                <Text style={styles.matchChipText} numberOfLines={3}>{t(pair.rightKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedLeft && !revealed && (
        <Text style={styles.matchHint}>Tocá la definición que corresponde →</Text>
      )}
    </View>
  );
}

// ─── Graph point question ─────────────────────────────────────────────────────

function GraphPointQuestion({
  labels, values, correctLabel, selectedLabel, revealed, onSelect, color,
}: {
  labels: string[]; values: number[]; correctLabel: string;
  selectedLabel: string | null; revealed: boolean;
  onSelect: (label: string) => void; color: string;
}) {
  const W = 290;
  const H = 130;
  const PAD = { t: 12, r: 8, b: 24, l: 8 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const barW = chartW / values.length - 4;

  const minV = Math.min(...values, 0);
  const maxV = Math.max(...values, 0);
  const range = maxV - minV || 1;
  const zeroY = PAD.t + chartH * (maxV / range);

  const barX = (i: number) => PAD.l + i * (chartW / values.length) + 2;
  const barY = (v: number) => v >= 0 ? zeroY - (v / range) * chartH : zeroY;
  const barH = (v: number) => Math.abs(v / range) * chartH;

  return (
    <View style={styles.chartWrap}>
      <Svg width={W} height={H}>
        {/* Zero line */}
        <Line x1={PAD.l} y1={zeroY} x2={W - PAD.r} y2={zeroY} stroke="#CBD5E1" strokeWidth={1} />

        {values.map((v, i) => {
          const label = labels[i];
          const isSel = label === selectedLabel;
          const revOk = revealed && label === correctLabel;
          const revBad = revealed && isSel && label !== correctLabel;
          const fill = revOk ? '#16A34A' : revBad ? '#DC2626' : isSel ? color : '#CBD5E1';

          return (
            <SvgRect
              key={label}
              x={barX(i)} y={barY(v)}
              width={barW} height={Math.max(barH(v), 2)}
              fill={fill} rx={3}
              onPress={() => !revealed && onSelect(label)}
            />
          );
        })}

        {/* X labels */}
        {labels.map((label, i) => (
          <SvgText
            key={label}
            x={barX(i) + barW / 2} y={H - 4}
            fontSize={8} fill={label === selectedLabel ? color : '#94A3B8'}
            textAnchor="middle" fontWeight={label === selectedLabel ? 'bold' : 'normal'}
          >{label}</SvgText>
        ))}
      </Svg>
      <Text style={styles.graphHint}>
        {revealed
          ? `La respuesta correcta era: ${correctLabel}`
          : 'Tocá la barra correcta en el gráfico'}
      </Text>
    </View>
  );
}

// ─── Main lesson screen ───────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { hearts, loseHeart, addXp, completeLesson, checkAndUpdateStreak } = useProgressStore();

  const lesson = useMemo(() => {
    for (const section of SECTIONS) {
      const found = section.lessons.find((l) => l.id === id);
      if (found) return { lesson: found, color: section.color };
    }
    return null;
  }, [id]);

  const questions: Question[] = (lesson?.lesson.questions ?? []).filter(
    (q) => SUPPORTED_TYPES.includes(q.type),
  );

  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [checkResult, setCheckResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showQuit, setShowQuit] = useState(false);
  const [localHearts, setLocalHearts] = useState(hearts);

  // Per-type answer state
  const [selectedId, setSelectedId] = useState<string | null>(null);           // MC/TF/fill/graph_id
  const [orderAnswer, setOrderAnswer] = useState<string[]>([]);                // order
  const [classifyAnswer, setClassifyAnswer] = useState<Record<string, string>>({}); // classify
  const [sliderValue, setSliderValue] = useState<number | null>(null);          // slider
  const [matchAnswer, setMatchAnswer] = useState<Record<string, string>>({});  // match
  const [graphLabel, setGraphLabel] = useState<string | null>(null);           // graph_point

  const currentQ = questions[qIndex];
  const sectionColor = lesson?.color ?? Colors.primary;

  const canCheck = (): boolean => {
    if (!currentQ || revealed) return false;
    const type = currentQ.type;
    if (['multiple_choice', 'true_false', 'fill_number', 'graph_id'].includes(type)) return selectedId !== null;
    if (type === 'order') return orderAnswer.length === (currentQ.items?.length ?? 0);
    if (type === 'classify') return Object.keys(classifyAnswer).length === (currentQ.items?.length ?? 0);
    if (type === 'slider') return sliderValue !== null;
    if (type === 'match') return Object.keys(matchAnswer).length === (currentQ.pairs?.length ?? 0);
    if (type === 'graph_point') return graphLabel !== null;
    return false;
  };

  const computeIsCorrect = (): boolean => {
    if (!currentQ) return false;
    const type = currentQ.type;
    if (['multiple_choice', 'true_false', 'fill_number', 'graph_id'].includes(type)) {
      return selectedId === currentQ.correctId;
    }
    if (type === 'order') {
      const sorted = [...(currentQ.items ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((i) => i.id);
      return JSON.stringify(orderAnswer) === JSON.stringify(sorted);
    }
    if (type === 'classify') {
      return (currentQ.items ?? []).every((item) => classifyAnswer[item.id] === item.bucket);
    }
    if (type === 'slider') {
      return sliderValue !== null && Math.abs(sliderValue - (currentQ.correct ?? 0)) <= (currentQ.tolerance ?? 0);
    }
    if (type === 'match') {
      return (currentQ.pairs ?? []).every((p) => matchAnswer[p.leftKey] === p.rightKey);
    }
    if (type === 'graph_point') {
      return graphLabel === currentQ.correctLabel;
    }
    return false;
  };

  const handleCheck = () => {
    if (!canCheck() || !currentQ) return;
    const isCorrect = computeIsCorrect();
    setCheckResult(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);
      setMaxCombo((m) => Math.max(m, nextCombo));
    } else {
      loseHeart();
      setLocalHearts((h) => Math.max(0, h - 1));
      setComboCount(0);
    }
    setRevealed(true);
  };

  const resetAnswerState = () => {
    setSelectedId(null);
    setOrderAnswer([]);
    setClassifyAnswer({});
    setSliderValue(null);
    setMatchAnswer({});
    setGraphLabel(null);
    setCheckResult(false);
  };

  const handleContinue = () => {
    if (qIndex + 1 >= questions.length) {
      const base = Math.round(((lesson?.lesson.xpReward ?? 10) * correctCount) / questions.length);
      const perfect = correctCount === questions.length ? 5 : 0;
      const comboBonus = Math.floor(maxCombo / 3) * 2;
      const earned = base + perfect + comboBonus;
      addXp(earned);
      completeLesson(id!, correctCount === questions.length);
      checkAndUpdateStreak();
      syncProgressToCloud();
      router.replace({
        pathname: '/lesson/result',
        params: { lessonId: id, correct: correctCount, total: questions.length, xp: earned, color: sectionColor },
      });
    } else {
      setQIndex((i) => i + 1);
      setRevealed(false);
      resetAnswerState();
    }
  };

  if (!lesson || questions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🚧</Text>
        <Text style={styles.emptyText}>Lección en construcción</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => router.back()}>
          <Text style={styles.emptyBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMcType = ['multiple_choice', 'true_false', 'fill_number', 'graph_id'].includes(currentQ.type);
  const isTrueFalse = currentQ.type === 'true_false';

  return (
    <SafeAreaView style={[styles.container, { paddingTop: StatusBar.currentHeight ?? 0 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowQuit(true)}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <ProgressBar current={qIndex} total={questions.length} color={sectionColor} />
        <HeartBar hearts={localHearts} />
      </View>

      {/* Question card + interactive area */}
      <View style={styles.body}>
        <View style={styles.qCard}>
          <Text style={styles.qCount}>{qIndex + 1} / {questions.length}</Text>
          <Text style={styles.qText}>{t(currentQ.textKey)}</Text>
        </View>

        {/* Graph preview for graph_id */}
        {currentQ.type === 'graph_id' && currentQ.series && currentQ.labels && (
          <ChartMini series={currentQ.series} labels={currentQ.labels} />
        )}

        {/* MC / TF / fill_number / graph_id options */}
        {isMcType && (
          <View style={[styles.options, isTrueFalse && styles.optionsTF]}>
            {(currentQ.options ?? []).map((opt) => (
              <OptionButton
                key={opt.id}
                text={t(opt.textKey)}
                selected={selectedId === opt.id}
                correct={opt.id === currentQ.correctId}
                revealed={revealed}
                onPress={() => !revealed && setSelectedId(opt.id)}
              />
            ))}
          </View>
        )}

        {/* Order */}
        {currentQ.type === 'order' && currentQ.items && (
          <OrderQuestion
            key={qIndex}
            items={currentQ.items}
            answer={orderAnswer}
            revealed={revealed}
            isCorrect={checkResult}
            onChangeAnswer={setOrderAnswer}
            color={sectionColor}
          />
        )}

        {/* Classify */}
        {currentQ.type === 'classify' && currentQ.items && currentQ.buckets && (
          <ClassifyQuestion
            key={qIndex}
            items={currentQ.items}
            buckets={currentQ.buckets}
            answer={classifyAnswer}
            revealed={revealed}
            onChangeAnswer={setClassifyAnswer}
          />
        )}

        {/* Slider */}
        {currentQ.type === 'slider' && (
          <SliderQuestion
            key={qIndex}
            min={currentQ.min ?? 0}
            max={currentQ.max ?? 100}
            correct={currentQ.correct ?? 50}
            tolerance={currentQ.tolerance ?? 5}
            unit={currentQ.unit ?? ''}
            value={sliderValue}
            revealed={revealed}
            isCorrect={checkResult}
            onChange={setSliderValue}
            color={sectionColor}
          />
        )}

        {/* Match */}
        {currentQ.type === 'match' && currentQ.pairs && (
          <MatchQuestion
            key={qIndex}
            pairs={currentQ.pairs}
            answer={matchAnswer}
            revealed={revealed}
            onChangeAnswer={setMatchAnswer}
          />
        )}

        {/* Graph point */}
        {currentQ.type === 'graph_point' && currentQ.labels && currentQ.values && (
          <GraphPointQuestion
            key={qIndex}
            labels={currentQ.labels}
            values={currentQ.values}
            correctLabel={currentQ.correctLabel ?? ''}
            selectedLabel={graphLabel}
            revealed={revealed}
            onSelect={setGraphLabel}
            color={sectionColor}
          />
        )}
      </View>

      {/* Check button */}
      {!revealed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.checkBtn, { backgroundColor: sectionColor }, !canCheck() && styles.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!canCheck()}
          >
            <Text style={styles.checkBtnText}>{t('lesson.checkAnswer')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback panel */}
      {revealed && currentQ && (
        <FeedbackPanel
          isCorrect={checkResult}
          explanation={t(currentQ.explanationKey)}
          onContinue={handleContinue}
          combo={comboCount}
        />
      )}

      {/* Quit modal */}
      <Modal visible={showQuit} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowQuit(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('lesson.quitConfirm')}</Text>
            <Text style={styles.modalBody}>{t('lesson.quitMessage')}</Text>
            <TouchableOpacity style={styles.modalBtnDanger} onPress={() => router.back()}>
              <Text style={styles.modalBtnDangerText}>{t('lesson.quitYes')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnSafe} onPress={() => setShowQuit(false)}>
              <Text style={styles.modalBtnSafeText}>{t('lesson.quitNo')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.border, borderRadius: 12 },
  closeBtnText: { fontSize: 14, color: Colors.textMuted, fontFamily: 'Baloo2_700Bold' },
  progressTrack: { flex: 1, height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  heartBar: { flexDirection: 'row', gap: 1 },
  heartIcon: { fontSize: 14 },
  heartEmpty: { opacity: 0.2 },

  body: { flex: 1, padding: 20, gap: 16 },
  qCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 8, ...Shadows.md },
  qCount: { fontFamily: 'Baloo2_600SemiBold', fontSize: 12, color: Colors.textMuted, letterSpacing: 0.5 },
  qText: { fontFamily: 'Baloo2_700Bold', fontSize: 18, color: Colors.text, lineHeight: 26 },

  options: { gap: 10 },
  optionsTF: { flexDirection: 'row', gap: 12 },
  option: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    flex: 1, ...Shadows.sm,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  optionCorrect: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  optionWrong: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  optionText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 15, color: Colors.text, flex: 1 },
  optionTextSelected: { color: Colors.primary },
  optionTextCorrect: { color: '#16A34A' },
  optionTextWrong: { color: '#DC2626' },
  optionCheck: { fontSize: 18, color: '#16A34A' },
  optionX: { fontSize: 18, color: '#DC2626' },

  footer: { padding: 20, paddingBottom: 32 },
  checkBtn: { paddingVertical: 17, borderRadius: 20, alignItems: 'center', ...Shadows.md },
  checkBtnDisabled: { opacity: 0.4 },
  checkBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 17, color: '#fff' },

  feedback: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  feedbackCorrect: { backgroundColor: '#F0FDF4' },
  feedbackWrong: { backgroundColor: '#FFF7F7' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackIcon: { fontSize: 24 },
  feedbackTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20 },
  feedbackTitleCorrect: { color: '#16A34A' },
  feedbackTitleWrong: { color: '#DC2626' },
  feedbackExp: { fontFamily: 'Baloo2_400Regular', fontSize: 14, lineHeight: 21 },
  feedbackExpCorrect: { color: '#166534' },
  feedbackExpWrong: { color: '#7F1D1D' },
  feedbackBtn: { paddingVertical: 15, borderRadius: 18, alignItems: 'center', marginTop: 4 },
  feedbackBtnCorrect: { backgroundColor: '#16A34A' },
  feedbackBtnWrong: { backgroundColor: '#DC2626' },
  feedbackBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  comboBadge: {
    marginLeft: 'auto', backgroundColor: '#F59E0B', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    ...shadow(2, 4, '#F59E0B', 0.4, 3),
  },
  comboBadgeText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#fff' },

  // Order
  orderWrap: { gap: 12 },
  orderSlots: {
    minHeight: 60, backgroundColor: '#fff', borderRadius: 18,
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    padding: 12, gap: 8, ...Shadows.sm,
  },
  orderPool: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  orderToken: {
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 2, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 8,
    ...Shadows.sm,
  },
  orderTokenPlaced: { backgroundColor: '#EEF2FF', borderColor: Colors.primary },
  orderTokenCorrect: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  orderTokenWrong: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  orderNum: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13 },
  orderTokenText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: Colors.text },
  orderDivider: { height: 1.5, backgroundColor: Colors.border },
  orderPlaceholder: { fontFamily: 'Baloo2_400Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 8 },

  // Classify
  classifyWrap: { gap: 12 },
  classifyPool: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classifyChip: {
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 2, borderColor: Colors.border, ...Shadows.sm,
  },
  classifyChipSelected: { backgroundColor: '#EEF2FF', borderColor: Colors.primary },
  classifyChipCorrect: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  classifyChipWrong: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  classifyChipText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, color: Colors.text },
  classifyBuckets: { flexDirection: 'row', gap: 10 },
  classifyBucket: {
    flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 12,
    borderWidth: 2, borderColor: Colors.border, gap: 8, minHeight: 80, ...Shadows.sm,
  },
  classifyBucketTarget: { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  classifyBucketLabel: { fontFamily: 'Baloo2_700Bold', fontSize: 12, color: Colors.textMuted, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  classifyBucketItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  classifyHint: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.primary, textAlign: 'center' },

  // Slider
  sliderWrap: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 16, alignItems: 'center', ...Shadows.md },
  sliderValue: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 32, color: Colors.text },
  sliderUnit: { fontFamily: 'Baloo2_600SemiBold', fontSize: 16, color: Colors.textMuted },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  sliderEdge: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: Colors.textMuted, width: 36, textAlign: 'center' },
  sliderTrack: {
    flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'visible',
    position: 'relative',
  },
  sliderFill: { height: '100%', borderRadius: 4, position: 'absolute', left: 0, top: 0 },
  sliderThumb: {
    position: 'absolute', width: 32, height: 32, borderRadius: 16, top: -12,
    borderWidth: 3, borderColor: '#fff',
    ...shadow(3, 6, '#000', 0.2, 6),
  },
  sliderCorrectMark: {
    position: 'absolute', width: 4, height: 20, backgroundColor: '#16A34A',
    borderRadius: 2, top: -6,
  },
  sliderHint: { fontFamily: 'Baloo2_600SemiBold', fontSize: 13, textAlign: 'center' },
  sliderHintCorrect: { color: '#16A34A' },
  sliderHintWrong: { color: '#DC2626' },

  // Match
  matchWrap: { gap: 10 },
  matchColumns: { flexDirection: 'row', gap: 8 },
  matchCol: { flex: 1, gap: 8 },
  matchChip: {
    backgroundColor: '#fff', borderRadius: 14, padding: 10,
    borderWidth: 2, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    minHeight: 52, ...Shadows.sm,
  },
  matchChipSelected: { borderColor: Colors.primary, backgroundColor: '#EEF2FF' },
  matchChipTarget: { borderColor: Colors.primary, borderStyle: 'dashed' },
  matchChipCorrect: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  matchChipWrong: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  matchChipText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 12, color: Colors.text, flex: 1 },
  matchDot: { width: 8, height: 8, borderRadius: 4 },
  matchHint: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.primary, textAlign: 'center' },

  // Graph point
  graphHint: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },

  // Chart
  chartWrap: { backgroundColor: '#fff', borderRadius: 18, padding: 12, gap: 8, ...Shadows.sm },
  chartLegend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  chartLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chartLegendDot: { width: 10, height: 10, borderRadius: 5 },
  chartLegendText: { fontFamily: 'Baloo2_600SemiBold', fontSize: 10, color: Colors.textMuted },

  modalOverlay: { flex: 1, backgroundColor: '#00000066', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 28, padding: 28, width: '100%', gap: 12, alignItems: 'center' },
  modalTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: Colors.text, textAlign: 'center' },
  modalBody: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalBtnDanger: { backgroundColor: '#DC2626', paddingVertical: 14, borderRadius: 16, alignItems: 'center', width: '100%' },
  modalBtnDangerText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#fff' },
  modalBtnSafe: { paddingVertical: 14, borderRadius: 16, alignItems: 'center', width: '100%', borderWidth: 2, borderColor: Colors.border },
  modalBtnSafeText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: Colors.text },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.background },
  emptyIcon: { fontSize: 52 },
  emptyText: { fontFamily: 'Baloo2_700Bold', fontSize: 18, color: Colors.text },
  emptyBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 16 },
  emptyBtnText: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#fff' },
});
