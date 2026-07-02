import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../types';

interface ProgressState {
  streak: number;
  totalXp: number;
  level: number;
  hearts: number;
  completedLessons: string[];
  perfectLessons: string[];
  language: Language;
  lastActiveDate: string | null;
  setLanguage: (lang: Language) => void;
  addXp: (xp: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  completeLesson: (id: string, perfect?: boolean) => void;
  incrementStreak: () => void;
  checkAndUpdateStreak: () => void;
}

const XP_PER_LEVEL = 500;

const todayISO = () => new Date().toISOString().split('T')[0];
const yesterdayISO = () => new Date(Date.now() - 86_400_000).toISOString().split('T')[0];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      totalXp: 0,
      level: 1,
      hearts: 5,
      completedLessons: [],
      perfectLessons: [],
      language: 'es',
      lastActiveDate: null,

      setLanguage: (language) => set({ language }),

      addXp: (xp) => {
        const newXp = get().totalXp + xp;
        set({ totalXp: newXp, level: Math.floor(newXp / XP_PER_LEVEL) + 1 });
      },

      loseHeart: () => set((s) => ({ hearts: Math.max(0, s.hearts - 1) })),

      refillHearts: () => set({ hearts: 5 }),

      completeLesson: (id, perfect = false) =>
        set((s) => ({
          completedLessons: s.completedLessons.includes(id)
            ? s.completedLessons
            : [...s.completedLessons, id],
          perfectLessons:
            perfect && !s.perfectLessons.includes(id)
              ? [...s.perfectLessons, id]
              : s.perfectLessons,
        })),

      incrementStreak: () => set((s) => ({ streak: s.streak + 1 })),

      checkAndUpdateStreak: () => {
        const today = todayISO();
        const last = get().lastActiveDate;
        if (last === today) return;
        const newStreak = last === yesterdayISO() ? get().streak + 1 : 1;
        set({ lastActiveDate: today, streak: newStreak });
      },
    }),
    {
      name: 'obol-progress-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        streak: state.streak,
        totalXp: state.totalXp,
        level: state.level,
        hearts: state.hearts,
        completedLessons: state.completedLessons,
        perfectLessons: state.perfectLessons,
        language: state.language,
        lastActiveDate: state.lastActiveDate,
      }),
    },
  ),
);
