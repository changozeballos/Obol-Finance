export type Language = 'es' | 'en' | 'pt';

export type LessonStatus = 'locked' | 'available' | 'completed';

export type PathId = 'fundamentos' | 'economia' | 'finanzas' | 'desmitificando';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_number'
  | 'classify'
  | 'match'
  | 'order'
  | 'graph_point'
  | 'graph_id'
  | 'slider';

export interface Option {
  id: string;
  textKey: string;
}

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
  type: QuestionType;
  textKey: string;
  explanationKey: string;
  group?: 1 | 2 | 3 | 4;
  // multiple_choice | true_false | fill_number | graph_id
  options?: Option[];
  correctId?: string;
  // classify
  items?: { id: string; labelKey: string; bucket?: string; position?: number }[];
  buckets?: { id: string; labelKey: string }[];
  // match
  pairs?: { leftKey: string; rightKey: string }[];
  // graph_id | graph_point
  series?: { values: number[]; color?: string }[];
  labels?: string[];
  values?: number[];
  correctLabel?: string;
  // slider
  correct?: number;
  tolerance?: number;
  min?: number;
  max?: number;
  unit?: string;
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
