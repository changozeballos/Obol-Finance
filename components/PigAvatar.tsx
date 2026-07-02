import { View, Image, Text, StyleSheet } from 'react-native';
import { useCharacterStore, BG_OPTIONS } from '../store/characterStore';

export type PigMood =
  | 'neutral'
  | 'celebrating'
  | 'motivated'
  | 'sleeping'
  | 'thinking'
  | 'surprised'
  | 'lostHeart'
  | 'longStreak'
  | 'happy';

const PIG_IMAGES: Record<PigMood, any> = {
  neutral:     require('../assets/characters/neutral-plata.png'),
  celebrating: require('../assets/characters/festejando.png'),
  motivated:   require('../assets/characters/motivado.png'),
  sleeping:    require('../assets/characters/durmiendo.png'),
  thinking:    require('../assets/characters/pensando.png'),
  surprised:   require('../assets/characters/sorprendido.png'),
  lostHeart:   require('../assets/characters/perdio-vida.png'),
  longStreak:  require('../assets/characters/racha-larga.png'),
  happy:       require('../assets/characters/neutral-plata.png'),
};

const HAT_EMOJI: Record<string, string> = {
  tophat:     '🎩',
  cap:        '🧢',
  crown:      '👑',
  graduation: '🎓',
};
const GLASSES_EMOJI: Record<string, string> = {
  sunglasses: '🕶️',
  reading:    '👓',
  monocle:    '🧐',
};
const EXTRA_EMOJI: Record<string, string> = {
  moneybag:  '💰',
  phone:     '📱',
  coffee:    '☕',
  briefcase: '💼',
  chart:     '📈',
};

interface PigAvatarProps {
  mood?: PigMood;
  size?: number;
  showAccessories?: boolean;
  overrideBg?: string;
}

export function PigAvatar({
  mood = 'neutral',
  size = 80,
  showAccessories = true,
  overrideBg,
}: PigAvatarProps) {
  const { hat, glasses, extra, bgColor } = useCharacterStore();
  const bg = overrideBg ?? BG_OPTIONS.find((b) => b.id === bgColor)?.color ?? '#EEF2FF';
  const hatEmoji     = showAccessories && hat     !== 'none' ? HAT_EMOJI[hat]         : null;
  const glassesEmoji = showAccessories && glasses !== 'none' ? GLASSES_EMOJI[glasses] : null;
  const extraEmoji   = showAccessories && extra   !== 'none' ? EXTRA_EMOJI[extra]     : null;

  const wrapSize = size * 1.15;

  return (
    <View
      style={[
        styles.wrapper,
        { width: wrapSize, height: wrapSize, borderRadius: wrapSize / 2, backgroundColor: bg },
      ]}
    >
      <Image
        source={PIG_IMAGES[mood] ?? PIG_IMAGES.neutral}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {hatEmoji ? (
        <Text style={[styles.accessory, { fontSize: size * 0.3, top: size * -0.04, left: size * 0.1 }]}>
          {hatEmoji}
        </Text>
      ) : null}
      {glassesEmoji ? (
        <Text style={[styles.accessory, { fontSize: size * 0.22, top: size * 0.32, left: size * 0.14 }]}>
          {glassesEmoji}
        </Text>
      ) : null}
      {extraEmoji ? (
        <Text style={[styles.accessory, { fontSize: size * 0.26, bottom: size * -0.02, right: size * -0.04 }]}>
          {extraEmoji}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { alignItems: 'center', justifyContent: 'center' },
  accessory: { position: 'absolute' },
});
