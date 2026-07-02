import { shadow } from './platform';

export const Colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  secondary: '#7C3AED',
  accent: '#16A34A',
  accentLight: '#4ADE80',
  gold: '#F59E0B',
  goldDark: '#D97706',
  background: '#EEF2FF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F3FF',
  border: '#E0E7FF',
  borderStrong: '#C7D2FE',
  text: '#1E1B4B',
  textSecondary: '#4338CA',
  textMuted: '#818CF8',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  streak: '#F97316',
  hearts: '#EF4444',
  locked: '#C7D2FE',
} as const;

export const Shadows = {
  sm: shadow(2,  4,  '#4F46E5', 0.10, 2),
  md: shadow(4,  12, '#4F46E5', 0.15, 5),
  lg: shadow(8,  20, '#4F46E5', 0.20, 10),
};
