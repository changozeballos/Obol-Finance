import { useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { SECTIONS } from '../content/lessons/sections';
import type { Section } from '../types';

export function useComputedSections(): Section[] {
  const { completedLessons } = useProgressStore();

  return useMemo(() => {
    // Fundamentos must complete fully before other paths unlock
    const fundamentosSections = SECTIONS.filter((s) => s.pathId === 'fundamentos');
    const fundamentosComplete = fundamentosSections.every((s) =>
      s.lessons.every((l) => completedLessons.includes(l.id)),
    );

    // Per-path: track whether the previous section in that path is complete
    const pathPrevSectionComplete: Record<string, boolean> = {
      fundamentos: true,
      economia: fundamentosComplete,
      finanzas: fundamentosComplete,
      desmitificando: fundamentosComplete,
    };

    const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
    const visibleSections = DEMO_MODE ? SECTIONS.filter((s) => s.id === 'base_comun') : SECTIONS;

    return visibleSections.map((section) => {
      const prevComplete = pathPrevSectionComplete[section.pathId];

      const computedLessons = section.lessons.map((lesson, i) => {
        if (completedLessons.includes(lesson.id)) {
          return { ...lesson, status: 'completed' as const };
        }
        const allPrevDone = section.lessons
          .slice(0, i)
          .every((l) => completedLessons.includes(l.id));
        const status = 'available' as const;
        return { ...lesson, status };
      });

      pathPrevSectionComplete[section.pathId] = computedLessons.every(
        (l) => l.status === 'completed',
      );
      return { ...section, lessons: computedLessons };
    });
  }, [completedLessons]);
}
