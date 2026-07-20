import { View, Text, StyleSheet, Image } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import type { Section } from '../types';

// Relación de aspecto del canvas exportado (840x400) — el chanchito y el
// "pop" 3D ya vienen resueltos dentro de la imagen, no se recortan.
const IMAGE_ASPECT_RATIO = 840 / 400;

// Posición del bloque de texto dentro del canvas — calculada a partir del
// mockup original (card a x:40,y:60 dentro de un canvas 840x400; contenido
// con padding 44/40 adentro del card → x:84 y:100, ancho 456).
const TEXT_LEFT_PCT = '10%';
const TEXT_TOP_PCT = '22%';
const TEXT_WIDTH_PCT = '54%';

interface SectionMeta {
  accent: string;
  name:   string;
}

export function SectionHeaderCard({
  sec,
  isFirstInWorld,
  meta,
  desc,
  headerImage,
}: {
  sec: Section;
  isFirstInWorld: boolean;
  meta: SectionMeta;
  desc?: string;
  headerImage?: any;
}) {
  const { t } = useTranslation();
  const done  = sec.lessons.filter((l) => l.status === 'completed').length;
  const total = sec.lessons.length;
  const pct   = total > 0 ? (done / total) * 100 : 0;
  // Si el título ocupa las 2 líneas no hay lugar para la descripción sin que
  // la barra de progreso se salga del cartel — se oculta en ese caso.
  const [titleWrapped, setTitleWrapped] = useState(false);

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

      {/* Card: imagen única (fondo + chanchito + degradé, ya compuesta en el diseño) */}
      <View style={styles.imageWrap}>
        {headerImage && (
          <Image
            source={headerImage}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {/* Texto: siempre dinámico, posicionado sobre la zona oscurecida del diseño */}
        <View style={styles.textBlock}>
          <View style={styles.chipRow}>
            <View style={styles.pathChip}>
              <Text style={styles.pathChipText}>{meta.name.toUpperCase()}</Text>
            </View>
            <View style={styles.progressChip}>
              <Text style={styles.progressChipText}>{done}/{total} lecciones</Text>
            </View>
          </View>

          <Text
            style={styles.sectionTitle}
            numberOfLines={2}
            onTextLayout={(e) => setTitleWrapped(e.nativeEvent.lines.length > 1)}
          >
            {t(sec.titleKey)}
          </Text>

          {isFirstInWorld && desc && !titleWrapped && (
            <Text style={styles.sectionDesc} numberOfLines={2}>{desc}</Text>
          )}

          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#ffe08a', '#ffb24a'] as any}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${pct || 3}%` as any }]}
            />
          </View>
        </View>
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

  // Imagen del header
  imageWrap: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT_RATIO,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Bloque de texto dinámico
  textBlock: {
    position: 'absolute',
    left: TEXT_LEFT_PCT,
    top: TEXT_TOP_PCT,
    width: TEXT_WIDTH_PCT,
  },

  // Chips
  chipRow: { flexDirection: 'row', gap: 5, marginBottom: 4, alignItems: 'center' },
  pathChip: {
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.26)',
    paddingHorizontal: 9, paddingVertical: 3,
  },
  pathChipText: {
    fontFamily: 'Fredoka_600SemiBold', fontSize: 9,
    color: '#fff', letterSpacing: 1.2, textTransform: 'uppercase',
  },
  progressChip: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 99,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8, paddingVertical: 3,
  },
  progressChipText: { fontFamily: 'Nunito_700Bold', fontSize: 9, color: 'rgba(255,255,255,0.92)' },

  // Textos
  sectionTitle: {
    fontFamily: 'Fredoka_700Bold', fontSize: 17, color: '#fff',
    lineHeight: 19, letterSpacing: -0.3, marginBottom: 2,
    textShadowColor: 'rgba(20,10,5,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  sectionDesc: {
    fontFamily: 'Nunito_600SemiBold', fontSize: 9, color: 'rgba(255,255,255,0.78)',
    lineHeight: 11, marginBottom: 3,
    textShadowColor: 'rgba(20,10,5,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },

  // Barra de progreso
  progressBarBg: {
    height: 5, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 99,
    overflow: 'hidden', marginTop: 4, width: '100%',
  },
  progressBarFill: { height: '100%', borderRadius: 99 },
});
