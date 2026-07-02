import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Hat = 'none' | 'tophat' | 'cap' | 'crown' | 'graduation';
export type Glasses = 'none' | 'sunglasses' | 'reading' | 'monocle';
export type Extra = 'none' | 'moneybag' | 'phone' | 'coffee' | 'briefcase' | 'chart';
export type BgColor = 'indigo' | 'green' | 'amber' | 'rose' | 'sky' | 'purple';

interface CharacterState {
  hat: Hat;
  glasses: Glasses;
  extra: Extra;
  bgColor: BgColor;
  setHat: (hat: Hat) => void;
  setGlasses: (glasses: Glasses) => void;
  setExtra: (extra: Extra) => void;
  setBgColor: (bgColor: BgColor) => void;
}

export const HAT_OPTIONS: { id: Hat; emoji: string; label: string }[] = [
  { id: 'none', emoji: '✕', label: 'Ninguno' },
  { id: 'tophat', emoji: '🎩', label: 'Elegante' },
  { id: 'cap', emoji: '🧢', label: 'Gorra' },
  { id: 'crown', emoji: '👑', label: 'Corona' },
  { id: 'graduation', emoji: '🎓', label: 'Graduado' },
];

export const GLASSES_OPTIONS: { id: Glasses; emoji: string; label: string }[] = [
  { id: 'none', emoji: '✕', label: 'Ninguno' },
  { id: 'sunglasses', emoji: '🕶️', label: 'Sol' },
  { id: 'reading', emoji: '👓', label: 'Lectura' },
  { id: 'monocle', emoji: '🧐', label: 'Monóculo' },
];

export const EXTRA_OPTIONS: { id: Extra; emoji: string; label: string }[] = [
  { id: 'none', emoji: '✕', label: 'Ninguno' },
  { id: 'moneybag', emoji: '💰', label: 'Plata' },
  { id: 'phone', emoji: '📱', label: 'Celular' },
  { id: 'coffee', emoji: '☕', label: 'Café' },
  { id: 'briefcase', emoji: '💼', label: 'Maletín' },
  { id: 'chart', emoji: '📈', label: 'Gráfico' },
];

export const BG_OPTIONS: { id: BgColor; color: string; label: string }[] = [
  { id: 'indigo', color: '#EEF2FF', label: 'Índigo' },
  { id: 'green', color: '#DCFCE7', label: 'Verde' },
  { id: 'amber', color: '#FEF3C7', label: 'Ámbar' },
  { id: 'rose', color: '#FFE4E6', label: 'Rosa' },
  { id: 'sky', color: '#E0F2FE', label: 'Cielo' },
  { id: 'purple', color: '#F5F3FF', label: 'Violeta' },
];

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      hat: 'none',
      glasses: 'none',
      extra: 'none',
      bgColor: 'indigo',
      setHat: (hat) => set({ hat }),
      setGlasses: (glasses) => set({ glasses }),
      setExtra: (extra) => set({ extra }),
      setBgColor: (bgColor) => set({ bgColor }),
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
