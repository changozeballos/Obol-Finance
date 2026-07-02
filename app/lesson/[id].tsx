import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Modal,
  SafeAreaView, StatusBar, Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Colors, Shadows } from '../../constants/Colors';
import { nativeDriver, shadow } from '../../constants/platform';
import { SECTIONS } from '../../content/lessons/sections';
import { useProgressStore } from '../../store/progressStore';
import { syncProgressToCloud } from '../../lib/syncProgress';
import type { Question } from '../../types';

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: current / total,
      duration: 350,
      useNativeDriver: false,
    }).start();
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
  text: string;
  selected: boolean;
  correct: boolean;
  revealed: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: nativeDriver }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: nativeDriver }),
    ]).start();
    onPress();
  };

  const containerStyle = [
    styles.option,
    !revealed && selected && styles.optionSelected,
    revealed && correct && styles.optionCorrect,
    revealed && selected && !correct && styles.optionWrong,
  ];

  const textStyle = [
    styles.optionText,
    !revealed && selected && styles.optionTextSelected,
    revealed && correct && styles.optionTextCorrect,
    revealed && selected && !correct && styles.optionTextWrong,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable style={containerStyle} onPress={handlePress} disabled={revealed}>
        <Text style={textStyle}>{text}</Text>
        {revealed && correct && <Text style={styles.optionCheck}>✓</Text>}
        {revealed && selected && !correct && <Text style={styles.optionX}>✗</Text>}
      </Pressable>
    </Animated.View>
  );
}

function FeedbackPanel({
  isCorrect, explanation, onContinue, combo,
}: {
  isCorrect: boolean;
  explanation: string;
  onContinue: () => void;
  combo: number;
}) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(120)).current;
  const comboPop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 65,
      friction: 9,
      useNativeDriver: nativeDriver,
    }).start();
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
    <Animated.View
      style={[
        styles.feedback,
        isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
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

  const SUPPORTED_TYPES = ['multiple_choice', 'true_false', 'fill_number'];
  const questions: Question[] = (lesson?.lesson.questions ?? []).filter(
    (q) => SUPPORTED_TYPES.includes(q.type),
  );
  const [qIndex, setQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showQuit, setShowQuit] = useState(false);
  const [localHearts, setLocalHearts] = useState(hearts);

  const currentQ = questions[qIndex];
  const sectionColor = lesson?.color ?? Colors.primary;

  const handleSelect = (optId: string) => {
    if (revealed) return;
    setSelectedId(optId);
  };

  const handleCheck = () => {
    if (!selectedId || !currentQ) return;
    const isCorrect = selectedId === currentQ.correctId;
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

  const handleContinue = () => {
    if (qIndex + 1 >= questions.length) {
      const base = Math.round(((lesson?.lesson.xpReward ?? 10) * correctCount) / questions.length);
      const perfect = correctCount === questions.length ? 5 : 0;
      const comboBonus = Math.floor(maxCombo / 3) * 2;
      const earned = base + perfect + comboBonus;
      const isPerfect = correctCount === questions.length;
      addXp(earned);
      completeLesson(id!, isPerfect);
      checkAndUpdateStreak();
      syncProgressToCloud();
      router.replace({
        pathname: '/lesson/result',
        params: {
          lessonId: id,
          correct: correctCount,
          total: questions.length,
          xp: earned,
          color: sectionColor,
        },
      });
    } else {
      setQIndex((i) => i + 1);
      setSelectedId(null);
      setRevealed(false);
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

      {/* Question */}
      <View style={styles.body}>
        <View style={styles.qCard}>
          <Text style={styles.qCount}>{qIndex + 1} / {questions.length}</Text>
          <Text style={styles.qText}>{t(currentQ.textKey)}</Text>
        </View>

        {/* Options */}
        <View style={[styles.options, isTrueFalse && styles.optionsTF]}>
          {(currentQ.options ?? []).map((opt) => (
            <OptionButton
              key={opt.id}
              text={t(opt.textKey)}
              selected={selectedId === opt.id}
              correct={opt.id === currentQ.correctId}
              revealed={revealed}
              onPress={() => handleSelect(opt.id)}
            />
          ))}
        </View>
      </View>

      {/* Check button */}
      {!revealed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.checkBtn, { backgroundColor: sectionColor }, !selectedId && styles.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!selectedId}
          >
            <Text style={styles.checkBtnText}>{t('lesson.checkAnswer')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback */}
      {revealed && currentQ && (
        <FeedbackPanel
          isCorrect={selectedId === currentQ.correctId}
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

  body: { flex: 1, padding: 20, gap: 24 },
  qCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 8, ...Shadows.md },
  qCount: { fontFamily: 'Baloo2_600SemiBold', fontSize: 12, color: Colors.textMuted, letterSpacing: 0.5 },
  qText: { fontFamily: 'Baloo2_700Bold', fontSize: 20, color: Colors.text, lineHeight: 28 },

  options: { gap: 12 },
  optionsTF: { flexDirection: 'row', gap: 12 },
  option: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    ...Shadows.sm,
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
  checkBtnDisabled: { opacity: 0.4, elevation: 0 },
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
    marginLeft: 'auto',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...shadow(2, 4, '#F59E0B', 0.4, 3),
  },
  comboBadgeText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 13, color: '#fff' },

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
