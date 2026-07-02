export type Language = 'es' | 'en' | 'pt';

export type LessonStatus = 'locked' | 'available' | 'completed';

export type PathId = 'fundamentos' | 'economia' | 'finanzas' | 'desmitificando';

export interface Section {
  id: string;
  pathId: PathId;
  icon: string;
  titleKey: string;
  color: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  titleKey: string;
  icon: string;
  status: LessonStatus;
  xpReward: number;
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  textKey: string;
  options: Option[];
  correctId: string;
  explanationKey: string;
  group?: 1 | 2 | 3 | 4;
}

export interface Option {
  id: string;
  textKey: string;
}

export interface UserProgress {
  userId: string;
  streak: number;
  lastActivityDate: string;
  totalXp: number;
  level: number;
  hearts: number;
  maxHearts: number;
  completedLessons: string[];
  language: Language;
}
