import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { PigAvatar } from './PigAvatar';
import { shadow } from '../constants/platform';
import type { Section } from '../types';

const PIG_SIZE = 92;
const PIG_SIDE_OVERFLOW = 18; // cuántos px sobresale a la derecha del card

// Chanchito ilustrado grande: se superpone al card (no va al lado), igual que
// en el diseño original — proporciones tomadas del mockup (card 760x280, pig 390
// ancho, right:-38 bottom:-34 → ~51% del ancho del card, offsets ~5%/12%).
const HERO_PIG_WIDTH_PCT = '51%';
const HERO_PIG_RIGHT_PCT = '-5%';
const HERO_PIG_BOTTOM_PCT = '-12%';

interface SectionMeta {
  accent: string;
  deep:   string;
  pig:    'happy' | 'motivated' | 'celebrating' | 'thinking';
  name:   string;
}

// rgb "r,g,b" para tintar el degradé de legibilidad sobre cada fondo.
// Si una sección no tiene tinte propio, se deriva de meta.deep.
function hexToRgbTriplet(hex: string): string {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `${r},${g},${b}`;
}

export function SectionHeaderCard({
  sec,
  isFirstInWorld,
  meta,
  desc,
  cardImage,
  heroPigImage,
  cardTint,
}: {
  sec: Section;
  isFirstInWorld: boolean;
  meta: SectionMeta;
  desc?: string;
  cardImage?: any;
  heroPigImage?: any;
  cardTint?: string; // "r,g,b"
}) {
  const { t } = useTranslation();
  const done  = sec.lessons.filter((l) => l.status === 'completed').length;
  const total = sec.lessons.length;
  const pct   = total > 0 ? (done / total) * 100 : 0;
  const tint  = cardTint ?? hexToRgbTriplet(meta.deep);

  const cardContent = (
    <>
      {/* Marca de agua del ícono (solo si no hay foto de fondo propia) */}
      {!cardImage && <Text style={styles.watermark}>{sec.icon}</Text>}

      {/* Brillo diagonal */}
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'transparent'] as any}
        start={{ x: 0.8, y: 0 }} end={{ x: 0.2, y: 0.8 }}
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      />

      {/* Texto: limitado al 60% cuando hay chanchito grande superpuesto, para no chocar */}
      <View style={heroPigImage ? { maxWidth: '60%' } : undefined}>
        {/* Chips: mundo + progreso */}
        <View style={styles.chipRow}>
          <View style={styles.pathChip}>
            <Text style={styles.pathChipText}>{meta.name.toUpperCase()}</Text>
          </View>
          <View style={[styles.progressChip, { backgroundColor: `rgba(${tint},0.45)` }]}>
            <Text style={styles.progressChipText}>{done}/{total} lecciones</Text>
          </View>
        </View>

        {/* Nombre de la sección */}
        <Text style={styles.sectionTitle} numberOfLines={2}>{t(sec.titleKey)}</Text>

        {/* Descripción sólo en la primera sección del mundo */}
        {isFirstInWorld && desc && (
          <Text style={styles.sectionDesc} numberOfLines={2}>{desc}</Text>
        )}

        {/* Barra de progreso */}
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={['#ffe08a', '#ffb24a'] as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${pct || 3}%` as any }]}
          />
        </View>
      </View>
    </>
  );

  return (
    <View style={[styles.headerWrap, { marginTop: isFirstInWorld ? 24 : 16 }]}>

      {/* Ribbon "NUEVO MUNDO" — solo en la primera sección del mundo */}
      {isFirstInWorld && (
        <View style={styles.ribbon}>
          <LinearGradient
            colors={['transparent', meta.accent + 'AA'] as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ribbonLine}
          />
          <Text style={[styles.ribbonText, { color: meta.accent }]}>
            ✦ {meta.name.toUpperCase()} ✦
          </Text>
          <LinearGradient
            colors={[meta.accent + 'AA', 'transparent'] as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ribbonLine}
          />
        </View>
      )}

      {/* Card — imagen de fondo + gradiente + contenido */}
      <View style={[
        styles.card,
        shadow(8, 20, sec.color, 0.3, 10),
        !heroPigImage && { marginRight: PIG_SIZE - PIG_SIDE_OVERFLOW },
      ]}>
        {cardImage && (
          <Image
            source={cardImage}
            style={styles.cardBgImage}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={cardImage
            ? [`rgba(${tint},0.8)`, `rgba(${tint},0.55)`, `rgba(${tint},0.15)`, `rgba(${tint},0)`] as any
            : [sec.color, meta.deep] as any}
          locations={cardImage ? [0, 0.4, 0.64, 1] : undefined}
          start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1.1 }}
          style={styles.cardGradient}
        >
          {cardImage && (
            <LinearGradient
              colors={[`rgba(${tint},0.5)`, 'transparent'] as any}
              locations={[0, 0.45]}
              start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
              style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
            />
          )}
          {cardContent}
        </LinearGradient>
      </View>

      {/* Chanchito — quieto, sobresaliendo del card. En las secciones rediseñadas
          se superpone (como en el mockup); en el resto va al costado, en el
          margen reservado del card */}
      <View
        style={[
          styles.sidePig,
          heroPigImage
            ? { right: HERO_PIG_RIGHT_PCT, bottom: HERO_PIG_BOTTOM_PCT, width: HERO_PIG_WIDTH_PCT, aspectRatio: 1 }
            : { right: -PIG_SIDE_OVERFLOW, bottom: 0 },
        ]}
        pointerEvents="none"
      >
        {heroPigImage ? (
          <Image source={heroPigImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        ) : (
          <PigAvatar mood={meta.pig} size={PIG_SIZE} overrideBg="transparent" />
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    marginHorizontal: 14,
    marginBottom: 4,
    position: 'relative',
  },

  // Ribbon "NUEVO MUNDO"
  ribbon:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  ribbonLine: { flex: 1, height: 1.5, borderRadius: 99 },
  ribbonText: {
    fontFamily: 'Baloo2_800ExtraBold', fontSize: 10,
    letterSpacing: 2, textTransform: 'uppercase',
  },

  // Card principal
  card: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  cardBgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%' as any,
    height: '100%' as any,
  },
  cardGradient: {
    paddingTop: 18,
    paddingLeft: 18,
    paddingRight: 14,
    paddingBottom: 16,
    overflow: 'hidden',
  },

  // Marca de agua (fallback cuando no hay foto)
  watermark: {
    position: 'absolute', right: -14, bottom: -22,
    fontSize: 110, opacity: 0.07, lineHeight: 120,
  },

  // Chips
  chipRow: { flexDirection: 'row', gap: 6, marginBottom: 8, alignItems: 'center' },
  pathChip: {
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: 11, paddingVertical: 5,
  },
  pathChipText: {
    fontFamily: 'Fredoka_600SemiBold', fontSize: 10,
    color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase',
  },
  progressChip: {
    borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10, paddingVertical: 5,
  },
  progressChipText: { fontFamily: 'Nunito_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.92)' },

  // Textos
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold', fontSize: 21, color: '#fff',
    lineHeight: 25, letterSpacing: -0.3, marginBottom: 4,
    textShadowColor: 'rgba(20,10,5,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  sectionDesc: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.78)',
    lineHeight: 15, marginBottom: 6,
    textShadowColor: 'rgba(20,10,5,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },

  // Barra de progreso
  progressBarBg: {
    height: 6, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 99,
    overflow: 'hidden', marginTop: 10, width: '100%',
  },
  progressBarFill: { height: '100%', borderRadius: 99 },

  // Chanchito lateral
  sidePig: {
    position: 'absolute',
    bottom: 0,
  },
});
