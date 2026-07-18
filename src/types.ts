export type AppTab = 'dashboard' | 'exercise' | 'languages' | 'habits' | 'statistics' | 'settings';

export type LanguageType = 'en' | 'fr';

export interface Habit {
  id: string;
  name: string;
  completed: boolean;
  duration?: string;
  icon?: string; // Lucide icon name
}

export interface ActivityCard {
  id: string;
  type: 'exercise' | 'language' | 'habit';
  title: string;
  subtitle: string;
  status: 'Pendente' | 'Concluído' | string;
  icon: string;
  bgColorClass: string;
  textColorClass: string;
  checked?: boolean;
}

export interface ExerciseLog {
  id: string;
  type: 'Bike' | 'Caminhada' | 'Corrida' | 'Musculação';
  duration: number; // in minutes
  intensity: 'Leve' | 'Moderada' | 'Intensa';
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface LanguageProgress {
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  grammar: number;
  vocabulary: number;
  conversation: number;
}

export interface LanguageLog {
  id: string;
  language: LanguageType;
  hours: number;
  date: string; // YYYY-MM-DD
  skills: string[];
}

export interface RoutineSettings {
  wakeTime: string;
  sleepTime: string;
  weeklyExerciseGoal: number; // days
  monthlyLanguageGoal: number; // hours
  pushNotifications: boolean;
  darkTheme: boolean;
}

export interface DayContribution {
  date: string; // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4; // for contribution grid
  completedCount: number;
}
