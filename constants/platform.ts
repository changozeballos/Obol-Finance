import { Platform } from 'react-native';

export const IS_WEB = Platform.OS === 'web';

/** Use in every Animated call: useNativeDriver: nativeDriver */
export const nativeDriver = !IS_WEB;

function hexColor(hex: string, opacity: number): string {
  const c = hex.replace('#', '');
  // handle 8-char hex (includes alpha) — use only rgb part
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Cross-platform drop shadow.
 * Web → boxShadow   Native → shadow* + elevation
 */
export function shadow(
  dy: number,
  blur: number,
  color: string,
  opacity: number,
  elevation?: number,
  dx = 0,
): object {
  if (IS_WEB) {
    const rgba = color.startsWith('#') ? hexColor(color, opacity) : color;
    return { boxShadow: `${dx}px ${dy}px ${blur}px ${rgba}` } as object;
  }
  return {
    shadowColor: color,
    shadowOffset: { width: dx, height: dy },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation: elevation ?? Math.round(dy * 1.5),
  };
}

/**
 * Cross-platform text shadow.
 * Web → textShadow CSS   Native → textShadow* props
 */
export function textShadow(dy: number, blur: number, color: string): object {
  if (IS_WEB) {
    let rgba = color;
    if (color.startsWith('#') && color.length === 9) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const a = (parseInt(color.slice(7, 9), 16) / 255).toFixed(2);
      rgba = `rgba(${r},${g},${b},${a})`;
    }
    return { textShadow: `0px ${dy}px ${blur}px ${rgba}` } as object;
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: 0, height: dy },
    textShadowRadius: blur,
  };
}
