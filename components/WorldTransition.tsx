import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PigAvatar } from './PigAvatar';
import { shadow, textShadow, nativeDriver } from '../constants/platform';

type PathId = 'fundamentos' | 'economia' | 'finanzas' | 'desmitificando';

const WORLD_META: Record<string, {
  name: string; accent: string; deep: string;
  pig: 'happy' | 'motivated' | 'celebrating' | 'thinking';
  tagline: string; icon: string;
}> = {
  fundamentos:    { name: 'Fundamentos',    accent: '#F59E0B', deep: '#92400E', pig: 'celebrating', tagline: 'Domina las bases del dinero',  icon: '🌱' },
  economia:       { name: 'Economía',       accent: '#3B82F6', deep: '#1E3A8A', pig: 'thinking',    tagline: 'Entendé cómo funciona el mundo', icon: '🏙️' },
  finanzas:       { name: 'Finanzas',       accent: '#10B981', deep: '#064E3B', pig: 'happy',       tagline: 'Hacé crecer tu patrimonio',    icon: '💰' },
  desmitificando: { name: 'Desmitificando', accent: '#8B5CF6', deep: '#4C1D95', pig: 'motivated',   tagline: 'La verdad sobre el dinero',    icon: '🔬' },
};

// Imágenes completas (fondo + card + texto + chanchito, ya compuestas en el
// diseño) para los mundos a los que se puede transicionar. "Fundamentos"
// nunca se muestra como transición (es el primer mundo), no necesita una.
const WORLD_IMAGE: Partial<Record<string, any>> = {
  economia:       require('../assets/entresecciones/economía.png'),
  finanzas:       require('../assets/entresecciones/finanzas.png'),
  desmitificando: require('../assets/entresecciones/desmitificando.png'),
};

export function WorldTransition({ pathId }: { pathId: string }) {
  const meta = WORLD_META[pathId] ?? WORLD_META.fundamentos;
  const image = WORLD_IMAGE[pathId];
  // aspectRatio no se comporta bien acá combinado con ancho en %, así que el
  // cuadrado se fuerza a mano: se mide el ancho real disponible y se usa
  // ese mismo valor como alto.
  const [boxSize, setBoxSize] = useState(0);

  // Animations
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.6)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const pigBounce  = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.parallel([
      Animated.spring(fadeAnim,  { toValue: 1, useNativeDriver: nativeDriver, tension: 80, friction: 8 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: nativeDriver, tension: 80, friction: 7 }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: nativeDriver, tension: 80, friction: 8 }),
    ]).start();

    // Pig bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.spring(pigBounce, { toValue: -14, useNativeDriver: nativeDriver, tension: 120, friction: 4 }),
        Animated.spring(pigBounce, { toValue: 0,   useNativeDriver: nativeDriver, tension: 120, friction: 6 }),
        Animated.delay(800),
      ])
    ).start();

    // Shimmer loop on the banner
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2200, useNativeDriver: nativeDriver })
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1], outputRange: [-200, 360],
  });

  // Imagen completa (fondo + card + texto + chanchito ya compuestos) —
  // reemplaza todo el banner de gradiente cuando existe para ese mundo.
  if (image) {
    return (
      <Animated.View style={[
        styles.imageOuter,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] },
      ]}>
        <View
          style={styles.imageMeasure}
          onLayout={(e) => setBoxSize(e.nativeEvent.layout.width)}
        >
          {boxSize > 0 && (
            <Image
              source={image}
              style={{ width: boxSize, height: boxSize }}
              resizeMode="cover"
            />
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[
      styles.wrap,
      { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] },
    ]}>
      {/* Top edge line */}
      <View style={[styles.edgeLine, { backgroundColor: meta.accent + '44' }]} />

      {/* Main banner */}
      <LinearGradient
        colors={[meta.deep, meta.accent + 'DD', meta.deep] as any}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={styles.banner}
      >
        {/* Shimmer sweep */}
        <Animated.View
          style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }], pointerEvents: 'none' }]}
        />

        {/* Star decorations */}
        <Text style={[styles.starLeft,  { color: meta.accent }]}>✦</Text>
        <Text style={[styles.starRight, { color: meta.accent }]}>✦</Text>

        {/* Pig bouncing */}
        <Animated.View style={[styles.pigWrap, { transform: [{ translateY: pigBounce }] }]}>
          <View style={[styles.pigCircle, { borderColor: meta.accent + '88' }, shadow(6, 16, meta.accent, 0.5, 10)]}>
            <PigAvatar mood={meta.pig} size={72} overrideBg="transparent" />
          </View>
        </Animated.View>

        {/* World icon + name */}
        <View style={styles.textBlock}>
          <View style={styles.badgeRow}>
            <View style={[styles.worldBadge, { backgroundColor: meta.accent + '33', borderColor: meta.accent + '66' }]}>
              <Text style={styles.worldBadgeIcon}>{meta.icon}</Text>
              <Text style={[styles.worldBadgeText, { color: meta.accent }]}>NUEVO MUNDO</Text>
            </View>
          </View>

          <Text style={styles.worldName}>{meta.name}</Text>
          <Text style={[styles.tagline, { color: meta.accent + 'DD' }]}>{meta.tagline}</Text>
        </View>
      </LinearGradient>

      {/* Bottom edge line */}
      <View style={[styles.edgeLine, { backgroundColor: meta.accent + '44' }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 0 },

  imageOuter: { width: '100%' },
  imageMeasure: { width: '100%' },

  edgeLine: { height: 2, width: '100%' },

  banner: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  // Shimmer overlay
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
    transform: [{ skewX: '-20deg' }],
  },

  starLeft:  { position: 'absolute', left: 16,  top: 16, fontSize: 18, opacity: 0.6 },
  starRight: { position: 'absolute', right: 16, top: 16, fontSize: 18, opacity: 0.6 },

  // Pig
  pigWrap: { alignItems: 'center' },
  pigCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },

  // Text
  textBlock: { alignItems: 'center', gap: 6 },

  badgeRow: { flexDirection: 'row' },
  worldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 99,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  worldBadgeIcon: { fontSize: 13 },
  worldBadgeText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
  },

  worldName: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 28, color: '#fff',
    letterSpacing: -0.5, textAlign: 'center',
    ...textShadow(2, 8, 'rgba(0,0,0,0.4)'),
  },
  tagline: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 13, textAlign: 'center', lineHeight: 18,
  },
});
