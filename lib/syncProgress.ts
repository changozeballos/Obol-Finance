import { supabase } from './supabase';
import { useProgressStore } from '../store/progressStore';

const XP_PER_LEVEL = 500;

const log = (...args: unknown[]) => { if (__DEV__) console.log(...args); };
const warn = (...args: unknown[]) => { if (__DEV__) console.warn(...args); };

function pickMostRecent(a: string | null | undefined, b: string | null | undefined): string | null {
  if (!a && !b) return null;
  if (!a) return b ?? null;
  if (!b) return a;
  return a >= b ? a : b;
}

export async function mergeAndSyncFromCloud(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  const local = useProgressStore.getState();

  if (error || !data) {
    log('[Obol] no cloud data → uploading local state');
    await syncProgressToCloud(userId);
    return;
  }

  const mergedLessons = Array.from(new Set([...local.completedLessons, ...(data.completed_lessons ?? [])]));
  const mergedPerfect = Array.from(new Set([...local.perfectLessons, ...(data.perfect_lessons ?? [])]));
  const mergedXp = Math.max(local.totalXp, data.total_xp ?? 0);

  log('[Obol] merge ←', {
    localLessons: local.completedLessons.length,
    cloudLessons: (data.completed_lessons ?? []).length,
    mergedLessons: mergedLessons.length,
    mergedXp,
  });

  useProgressStore.setState({
    completedLessons: mergedLessons,
    perfectLessons: mergedPerfect,
    totalXp: mergedXp,
    level: Math.floor(mergedXp / XP_PER_LEVEL) + 1,
    streak: Math.max(local.streak, data.streak ?? 0),
    hearts: Math.min(5, Math.max(local.hearts, data.hearts ?? 5)),
    language: local.language,
    lastActiveDate: pickMostRecent(local.lastActiveDate, data.last_active_date),
  });

  await syncProgressToCloud(userId);
}

export async function syncProgressToCloud(userId?: string) {
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) {
    log('[Obol] sync skipped — guest mode');
    return;
  }

  const s = useProgressStore.getState();
  log('[Obol] syncing →', { lessons: s.completedLessons.length, xp: s.totalXp, streak: s.streak });

  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: uid,
      completed_lessons: s.completedLessons,
      perfect_lessons: s.perfectLessons,
      total_xp: s.totalXp,
      level: s.level,
      streak: s.streak,
      hearts: s.hearts,
      language: s.language,
      last_active_date: s.lastActiveDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    warn('[Obol] sync error:', error.message);
  } else {
    log('[Obol] sync ✓ —', s.completedLessons.length, 'lecciones,', s.totalXp, 'XP');
  }
}

export async function loadProgressFromCloud(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return;

  useProgressStore.setState({
    completedLessons: data.completed_lessons ?? [],
    perfectLessons: data.perfect_lessons ?? [],
    totalXp: data.total_xp ?? 0,
    level: data.level ?? 1,
    streak: data.streak ?? 0,
    hearts: data.hearts ?? 5,
    language: data.language ?? 'es',
    lastActiveDate: data.last_active_date ?? null,
  });
}
