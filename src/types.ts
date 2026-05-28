export interface Exercise {
  id: string;
  name: string;
  force: 'push' | 'pull' | 'static' | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  mechanic: 'compound' | 'isolation' | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export interface SetLog {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise extends Exercise {
  sets: SetLog[];
  notes?: string;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  type: 'Push' | 'Pull' | 'Legs' | 'Full Body';
  exercises: WorkoutExercise[];
  warmups: Exercise[];
  isCompleted: boolean;
  startedAt: number | null;
  completedAt?: number;
  durationMinutes?: number;
  notes?: string;
}

export interface UserSettings {
  equipment: string[];
  duration: 15 | 30 | 45 | 60;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  intensity: 'moderate' | 'high';
  enableFullBody: boolean;
  setupCompleted: boolean;
}

export interface WeeklyPlan {
  weekId: string;
  workouts: WorkoutSession[];
  isCompleted: boolean;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: number;
}
