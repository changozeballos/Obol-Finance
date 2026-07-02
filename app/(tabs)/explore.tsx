import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Colors, Shadows } from '../../constants/Colors';
import { useComputedSections } from '../../hooks/useComputedSections';
import type { Section } from '../../types';

const TOPICS = [
  {
    icon: '🏛️',
    label: 'Fundamentos',
    color: '#F59E0B',
    ids: ['base_comun'],
  },
  {
    icon: '📊',
    label: 'Economía',
    color: '#3B82F6',
    ids: [
      'inflation_prices',
      'supply_demand_markets',
      'macro_indicators',
      'economic_policy',
      'international_money',
      'crises_cycles',
    ],
  },
  {
    icon: '💰',
    label: 'Finanzas',
    color: '#10B981',
    ids: [
      'personal_budgeting',
      'saving_track',
      'debt_credit',
      'investments_base',
      'capital_markets',
      'crypto_track',
      'advanced_finance',
    ],
  },
  {
    icon: '🔍',
    label: 'Mitos',
    color: '#8B5CF6',
    ids: ['myths_busting'],
  },
];

function SectionCard({
  section,
  onPreview,
}: {
  section: Section;
  onPreview: (s: Section) => void;
}) {
  const { t } = useTranslation();
  const total = section.lessons.length;
  const done = section.lessons.filter((l) => l.status === 'completed').length;
  const available = section.lessons.find((l) => l.status !== 'locked');
  const allLocked = !available;

  const handlePress = () => {
    if (allLocked) {
      onPreview(section);
    } else {
      router.push(`/lesson/${available!.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.sectionCard} onPress={handlePress} activeOpacity={0.82}>
      <View style={[styles.sectionIcon, { backgroundColor: section.color + '22' }]}>
        <Text style={styles.sectionEmoji}>{section.icon}</Text>
      </View>
      <View style={styles.sectionInfo}>
        <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
        <Text style={styles.sectionMeta}>
          {total} lecciones · {done} completadas
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(done / total) * 100}%`, backgroundColor: section.color },
            ]}
          />
        </View>
      </View>
      {allLocked ? (
        <View style={[styles.lockBadge, { backgroundColor: section.color + '22' }]}>
          <Text style={[styles.lockBadgeText, { color: section.color }]}>Ver</Text>
        </View>
      ) : (
        <Text style={[styles.sectionArrow, { color: section.color }]}>›</Text>
      )}
    </TouchableOpacity>
  );
}

function PreviewModal({
  section,
  onClose,
}: {
  section: Section | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  if (!section) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <View style={[styles.modalIconWrap, { backgroundColor: section.color + '22' }]}>
            <Text style={styles.modalIcon}>{section.icon}</Text>
          </View>
          <Text style={styles.modalTitle}>{t(section.titleKey)}</Text>
          <Text style={styles.modalSubtitle}>
            Completa las lecciones anteriores para desbloquear este módulo
          </Text>

          <View style={styles.lessonList}>
            {section.lessons.map((lesson) => (
              <View key={lesson.id} style={styles.lessonRow}>
                <View style={[styles.lessonDot, { backgroundColor: section.color + '33' }]}>
                  <Text style={styles.lessonDotIcon}>🔒</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonRowTitle}>{t(lesson.titleKey)}</Text>
                  <Text style={styles.lessonRowXp}>+{lesson.xpReward} XP</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: section.color }]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Entendido</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const sections = useComputedSections();
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [previewSection, setPreviewSection] = useState<Section | null>(null);

  const filtered =
    activeTopic === null
      ? sections
      : sections.filter((s) => {
          const topic = TOPICS.find((tp) => tp.label === activeTopic);
          return topic?.ids.includes(s.id);
        });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Explorar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Temas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsRow}
        >
          {TOPICS.map((topic) => {
            const isActive = activeTopic === topic.label;
            return (
              <TouchableOpacity
                key={topic.label}
                onPress={() => setActiveTopic(isActive ? null : topic.label)}
                style={[
                  styles.topicChip,
                  {
                    backgroundColor: isActive ? topic.color : topic.color + '18',
                    borderColor: isActive ? topic.color : topic.color + '44',
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.topicIcon}>{topic.icon}</Text>
                <Text style={[styles.topicLabel, { color: isActive ? '#fff' : topic.color }]}>
                  {topic.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionLabel}>
          {activeTopic ? `${activeTopic}` : 'Todos los cursos'}
        </Text>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🚧</Text>
            <Text style={styles.emptyTitle}>Próximamente</Text>
            <Text style={styles.emptyDesc}>
              Estamos creando más contenido para este tema. ¡Vuelve pronto!
            </Text>
          </View>
        ) : (
          <View style={styles.sectionsList}>
            {filtered.map((s) => (
              <SectionCard key={s.id} section={s} onPreview={setPreviewSection} />
            ))}
          </View>
        )}
      </ScrollView>

      <PreviewModal section={previewSection} onClose={() => setPreviewSection(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  heading: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 24, color: Colors.text },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  sectionLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  topicsRow: { gap: 10, paddingVertical: 4 },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  topicIcon: { fontSize: 16 },
  topicLabel: { fontFamily: 'Baloo2_700Bold', fontSize: 13 },
  sectionsList: { gap: 12 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionEmoji: { fontSize: 26 },
  sectionInfo: { flex: 1, gap: 4 },
  sectionTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 16, color: Colors.text },
  sectionMeta: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  sectionArrow: { fontSize: 28, fontFamily: 'Baloo2_800ExtraBold' },
  lockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockBadgeText: { fontFamily: 'Baloo2_700Bold', fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: Colors.text },
  emptyDesc: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalIcon: { fontSize: 40 },
  modalTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  lessonList: { gap: 10 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 14,
    padding: 12,
  },
  lessonDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonDotIcon: { fontSize: 18 },
  lessonRowTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: Colors.text },
  lessonRowXp: { fontFamily: 'Baloo2_400Regular', fontSize: 12, color: Colors.textMuted },
  closeBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
});
