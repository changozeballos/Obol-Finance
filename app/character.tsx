import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/Colors';
import {
  useCharacterStore,
  HAT_OPTIONS,
  GLASSES_OPTIONS,
  EXTRA_OPTIONS,
  BG_OPTIONS,
  type Hat,
  type Glasses,
  type Extra,
  type BgColor,
} from '../store/characterStore';
import { PigAvatar } from '../components/PigAvatar';

type Category = 'hat' | 'glasses' | 'extra' | 'bg';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'hat', label: 'Sombrero', emoji: '🎩' },
  { id: 'glasses', label: 'Anteojos', emoji: '🕶️' },
  { id: 'extra', label: 'Extra', emoji: '✨' },
  { id: 'bg', label: 'Fondo', emoji: '🎨' },
];

function OptionItem({
  emoji,
  label,
  selected,
  bgColor,
  onPress,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  bgColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.optionItem, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {bgColor ? (
        <View style={[styles.colorCircle, { backgroundColor: bgColor }]} />
      ) : (
        <Text style={[styles.optionEmoji, emoji === '✕' && styles.noneEmoji]}>{emoji}</Text>
      )}
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function CharacterScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>('hat');
  const { hat, glasses, extra, bgColor, setHat, setGlasses, setExtra, setBgColor } =
    useCharacterStore();

  const renderOptions = () => {
    switch (activeCategory) {
      case 'hat':
        return HAT_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.id}
            emoji={opt.emoji}
            label={opt.label}
            selected={hat === opt.id}
            onPress={() => setHat(opt.id as Hat)}
          />
        ));
      case 'glasses':
        return GLASSES_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.id}
            emoji={opt.emoji}
            label={opt.label}
            selected={glasses === opt.id}
            onPress={() => setGlasses(opt.id as Glasses)}
          />
        ));
      case 'extra':
        return EXTRA_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.id}
            emoji={opt.emoji}
            label={opt.label}
            selected={extra === opt.id}
            onPress={() => setExtra(opt.id as Extra)}
          />
        ));
      case 'bg':
        return BG_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.id}
            emoji=""
            label={opt.label}
            selected={bgColor === opt.id}
            bgColor={opt.color}
            onPress={() => setBgColor(opt.id as BgColor)}
          />
        ));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Chanchito</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Live preview */}
        <View style={styles.previewArea}>
          <View style={styles.previewGlow} />
          <PigAvatar mood="celebrating" size={120} showAccessories />
          <Text style={styles.previewLabel}>¡Así luce tu chanchito! 🐷</Text>
        </View>

        {/* Category tabs */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catTab, activeCategory === cat.id && styles.catTabActive]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text
                style={[styles.catLabel, activeCategory === cat.id && styles.catLabelActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Options grid */}
        <View style={styles.optionsGrid}>{renderOptions()}</View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: Colors.text },
  scroll: { padding: 16, gap: 20 },
  previewArea: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  previewGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight + '22',
    top: 10,
  },
  previewLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 15,
    color: Colors.textMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 18,
    padding: 5,
  },
  catTab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    borderRadius: 14,
  },
  catTabActive: {
    backgroundColor: '#fff',
    ...Shadows.sm,
  },
  catEmoji: { fontSize: 18 },
  catLabel: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 10,
    color: Colors.textMuted,
  },
  catLabelActive: { color: Colors.primary },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionItem: {
    width: '30%',
    minWidth: 90,
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceMuted,
  },
  optionEmoji: { fontSize: 32 },
  noneEmoji: { fontSize: 20, color: Colors.textMuted },
  optionLabel: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  optionLabelSelected: { color: Colors.primary },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
});
