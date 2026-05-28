import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { UserSettings, WeeklyPlan, WorkoutSession, PersonalRecord, WorkoutExercise, SetLog, Exercise } from '../types';
import { getWeekId } from '../utils/dateUtils';
import { generateWeeklyPlan, generateWorkout, getWarmupImages, getCanonicalWarmupName, seedExerciseSets } from '../utils/generator';

const DEFAULT_SETTINGS: UserSettings = {
  equipment: ['bodyweight'],
  duration: 30,
  fitnessLevel: 'beginner',
  intensity: 'moderate',
  enableFullBody: false,
  setupCompleted: false,
};

export function useWorkoutState() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('ppl_user_settings', DEFAULT_SETTINGS);
  const [currentPlan, setCurrentPlan] = useLocalStorage<WeeklyPlan | null>('ppl_current_weekly_plan', null);
  const [history, setHistory] = useLocalStorage<WorkoutSession[]>('ppl_workout_history', []);
  const [prs, setPrs] = useLocalStorage<PersonalRecord[]>('ppl_personal_records', []);
  const [activeWorkout, setActiveWorkout] = useLocalStorage<WorkoutSession | null>('ppl_active_workout', null);

  // Rollover detection: runs on load and when window gains focus
  const checkWeeklyRollover = useCallback(() => {
    if (!settings.setupCompleted) return;

    const currentWeekId = getWeekId();

    if (!currentPlan) {
      // No plan exists yet, generate one
      const newPlan = generateWeeklyPlan(settings, history);
      setCurrentPlan(newPlan);
      return;
    }

    if (currentPlan.weekId !== currentWeekId) {
      // It's a new week! Archive the old plan to history
      const workoutsToArchive = currentPlan.workouts.map(w => {
        // If it was in progress but not completed, we mark it incomplete
        if (w.startedAt && !w.isCompleted) {
          return {
            ...w,
            notes: w.notes ? `${w.notes} (Archived incomplete at week boundary)` : 'Archived incomplete at week boundary'
          };
        }
        return w;
      }).filter(w => w.isCompleted || w.startedAt); // only archive workouts they actually interacted with

      if (workoutsToArchive.length > 0) {
        setHistory(prev => [...prev, ...workoutsToArchive]);
      }

      // Generate a fresh plan for the new week
      const newPlan = generateWeeklyPlan(settings, history);
      setCurrentPlan(newPlan);

      // Clear active workout if it was from the previous week
      if (activeWorkout) {
        setActiveWorkout(null);
      }
    }
  }, [settings, currentPlan, history, activeWorkout, setCurrentPlan, setHistory, setActiveWorkout]);

  useEffect(() => {
    checkWeeklyRollover();

    // Check again if user leaves the tab and comes back (rollover can occur while app is open)
    const handleFocus = () => checkWeeklyRollover();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkWeeklyRollover]);

  // Auto-patch old warmup structures in LocalStorage that are missing images
  useEffect(() => {
    let changed = false;

    const patchWarmups = (warmups: Exercise[]): Exercise[] => {
      return warmups.map(wu => {
        let updated = false;
        const updatedWu = { ...wu };

        const canonicalName = getCanonicalWarmupName(wu.name);
        if (wu.name !== canonicalName) {
          updatedWu.name = canonicalName;
          updated = true;
        }

        if (!wu.images || wu.images.length === 0) {
          const images = getWarmupImages(wu.name);
          if (images.length > 0) {
            updatedWu.images = images;
            updated = true;
          }
        }

        if (updated) {
          changed = true;
          return updatedWu;
        }
        return wu;
      });
    };

    if (activeWorkout && activeWorkout.warmups) {
      const patched = patchWarmups(activeWorkout.warmups);
      if (changed) {
        setActiveWorkout({ ...activeWorkout, warmups: patched });
        changed = false;
      }
    }

    if (currentPlan) {
      let planChanged = false;
      const patchedWorkouts = currentPlan.workouts.map(w => {
        if (!w.warmups) return w;
        const patched = patchWarmups(w.warmups);
        if (changed) {
          planChanged = true;
          changed = false;
          return { ...w, warmups: patched };
        }
        return w;
      });
      if (planChanged) {
        setCurrentPlan({ ...currentPlan, workouts: patchedWorkouts });
      }
    }
  }, [activeWorkout, currentPlan, setActiveWorkout, setCurrentPlan]);

  // Complete onboarding
  const completeOnboarding = (newSettings: UserSettings) => {
    setSettings(newSettings);
    // Generate the initial weekly plan right after settings are configured
    const initialPlan = generateWeeklyPlan(newSettings, []);
    setCurrentPlan(initialPlan);
  };

  // Update user settings and regenerate remaining workouts if desired
  const updateSettings = (newSettings: UserSettings, regenerateThisWeek: boolean = false) => {
    setSettings(newSettings);
    if (regenerateThisWeek) {
      const newPlan = generateWeeklyPlan(newSettings, history);
      if (currentPlan) {
        // Keep completed workouts, replace in-progress or not-started workouts
        const mergedWorkouts = newPlan.workouts.map(newWorkout => {
          const existingWorkout = currentPlan.workouts.find(w => w.type === newWorkout.type);
          if (existingWorkout && existingWorkout.isCompleted) {
            return existingWorkout; // preserve completed workout
          }
          return newWorkout; // use fresh regenerated workout
        });

        setCurrentPlan({
          ...currentPlan,
          workouts: mergedWorkouts,
          isCompleted: mergedWorkouts
            .filter(w => w.type !== 'Full Body')
            .every(w => w.isCompleted)
        });
      } else {
        setCurrentPlan(newPlan);
      }
      setActiveWorkout(null);
    }
  };

  // Start a workout session
  const startWorkout = (workoutId: string) => {
    if (!currentPlan) return;

    const workout = currentPlan.workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const updatedWorkout: WorkoutSession = {
      ...workout,
      startedAt: workout.startedAt || Date.now()
    };

    // Update inside plan
    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === workoutId ? updatedWorkout : w)
      };
    });

    setActiveWorkout(updatedWorkout);
  };

  // Log a set (weight, reps, and completed status with dynamic subsequent set propagation)
  const logSet = (exerciseId: string, setId: string, reps: number, weight: number, completed: boolean) => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;

      const targetSetIdx = ex.sets.findIndex(s => s.id === setId);
      if (targetSetIdx === -1) return ex;

      const oldSet = ex.sets[targetSetIdx];
      const repsChanged = oldSet.reps !== reps;
      const weightChanged = oldSet.weight !== weight;

      const updatedSets = ex.sets.map((s, idx) => {
        if (idx === targetSetIdx) {
          return { ...s, reps, weight, completed };
        }
        // Propagate changes to subsequent sets if they are not yet completed
        if (idx > targetSetIdx && !s.completed) {
          return {
            ...s,
            reps: repsChanged ? reps : s.reps,
            weight: weightChanged ? weight : s.weight
          };
        }
        return s;
      });

      // An exercise is completed if all its sets are completed
      const isExCompleted = updatedSets.every(s => s.completed);

      return {
        ...ex,
        sets: updatedSets,
        completed: isExCompleted
      };
    });

    const updatedWorkout: WorkoutSession = {
      ...activeWorkout,
      exercises: updatedExercises
    };

    setActiveWorkout(updatedWorkout);

    // Sync back to current weekly plan in background
    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === activeWorkout.id ? updatedWorkout : w)
      };
    });
  };

  // Update notes for an exercise
  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map(ex => {
      if (ex.id !== exerciseId) return ex;
      return { ...ex, notes };
    });

    const updatedWorkout: WorkoutSession = {
      ...activeWorkout,
      exercises: updatedExercises
    };

    setActiveWorkout(updatedWorkout);

    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === activeWorkout.id ? updatedWorkout : w)
      };
    });
  };

  // Swap an exercise in the active workout (and current week's plan)
  const swapExercise = (exerciseId: string, newExercise: Exercise) => {
    const targetSession = activeWorkout || currentPlan?.workouts[0]; // fallback
    if (!targetSession) return;

    const workoutId = targetSession.id;

    const replaceInSession = (session: WorkoutSession): WorkoutSession => {
      const existing = session.exercises.find(ex => ex.id === exerciseId);
      if (!existing) return session;

      // Map newExercise to a WorkoutExercise with set logs seeded from history
      const newSets: SetLog[] = existing.sets.map((s, idx) => ({
        id: `${newExercise.id}-set-${idx}`,
        reps: s.reps,
        weight: s.weight, // transfer weights/reps structure
        completed: false
      }));

      const swappedWorkoutEx: WorkoutExercise = {
        ...newExercise,
        sets: newSets,
        completed: false
      };

      return {
        ...session,
        exercises: session.exercises.map(ex => ex.id === exerciseId ? swappedWorkoutEx : ex)
      };
    };

    // If active
    if (activeWorkout && activeWorkout.id === workoutId) {
      const updatedActive = replaceInSession(activeWorkout);
      setActiveWorkout(updatedActive);
    }

    // Update in weekly plan
    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === workoutId ? replaceInSession(w) : w)
      };
    });
  };

  // Delete an exercise from the active workout (and current week's plan)
  const deleteExercise = (exerciseId: string) => {
    const targetSession = activeWorkout || currentPlan?.workouts[0];
    if (!targetSession) return;

    const workoutId = targetSession.id;

    const removeFromSession = (session: WorkoutSession): WorkoutSession => {
      return {
        ...session,
        exercises: session.exercises.filter(ex => ex.id !== exerciseId)
      };
    };

    if (activeWorkout && activeWorkout.id === workoutId) {
      setActiveWorkout(removeFromSession(activeWorkout));
    }

    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === workoutId ? removeFromSession(w) : w)
      };
    });
  };

  // Add an exercise to the active workout (and current week's plan)
  const addExercise = (newExercise: Exercise) => {
    const targetSession = activeWorkout || currentPlan?.workouts[0];
    if (!targetSession) return;

    const workoutId = targetSession.id;

    const addToSession = (session: WorkoutSession): WorkoutSession => {
      const sets = seedExerciseSets(newExercise, settings, history);
      const workoutEx: WorkoutExercise = {
        ...newExercise,
        sets,
        completed: false
      };
      return {
        ...session,
        exercises: [...session.exercises, workoutEx]
      };
    };

    if (activeWorkout && activeWorkout.id === workoutId) {
      setActiveWorkout(addToSession(activeWorkout));
    }

    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === workoutId ? addToSession(w) : w)
      };
    });
  };

  // Complete the active workout session
  const finishWorkout = (notes?: string) => {
    if (!activeWorkout) return;

    const completedTime = Date.now();
    const durationMins = activeWorkout.startedAt 
      ? Math.max(1, Math.round((completedTime - activeWorkout.startedAt) / 60000))
      : 30;

    const finalizedWorkout: WorkoutSession = {
      ...activeWorkout,
      isCompleted: true,
      completedAt: completedTime,
      durationMinutes: durationMins,
      notes: notes || activeWorkout.notes
    };

    // Check and save Personal Records (PRs)
    const newPrs: PersonalRecord[] = [...prs];
    let prAdded = false;

    finalizedWorkout.exercises.forEach(ex => {
      if (!ex.completed) return;
      
      // Find max weight lifted in this workout for this exercise
      const maxWeightSet = ex.sets.reduce((max, s) => (s.completed && s.weight > max.weight ? s : max), { weight: -1, reps: 0 });
      
      if (maxWeightSet.weight > 0) {
        const existingPr = prs.find(p => p.exerciseId === ex.id);
        
        if (!existingPr || maxWeightSet.weight > existingPr.weight || (maxWeightSet.weight === existingPr.weight && maxWeightSet.reps > existingPr.reps)) {
          // Remove old PR
          const index = newPrs.findIndex(p => p.exerciseId === ex.id);
          if (index >= 0) newPrs.splice(index, 1);
          
          newPrs.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            weight: maxWeightSet.weight,
            reps: maxWeightSet.reps,
            date: completedTime
          });
          prAdded = true;
        }
      }
    });

    if (prAdded) {
      setPrs(newPrs);
    }

    // Save to history list
    setHistory(prev => [...prev, finalizedWorkout]);

    // Update status in the weekly plan
    setCurrentPlan(prev => {
      if (!prev) return null;
      const updatedWorkouts = prev.workouts.map(w => w.id === finalizedWorkout.id ? finalizedWorkout : w);
      const allCoreCompleted = updatedWorkouts
        .filter(w => w.type !== 'Full Body') // core: Push, Pull, Legs
        .every(w => w.isCompleted);

      return {
        ...prev,
        workouts: updatedWorkouts,
        isCompleted: allCoreCompleted
      };
    });

    // Clear active workout
    setActiveWorkout(null);
  };

  // Exit/pause the active workout session, preserving progress in the current weekly plan
  const cancelWorkout = () => {
    if (activeWorkout) {
      const hasCompletedSets = activeWorkout.exercises.some(ex => ex.sets.some(s => s.completed));
      if (!hasCompletedSets) {
        const resetWorkout: WorkoutSession = {
          ...activeWorkout,
          startedAt: null
        };
        setCurrentPlan(prev => {
          if (!prev) return null;
          return {
            ...prev,
            workouts: prev.workouts.map(w => w.id === activeWorkout.id ? resetWorkout : w)
          };
        });
      }
    }
    setActiveWorkout(null);
  };

  // Re-generate a single workout in the weekly plan
  const regenerateSingleWorkout = (workoutId: string) => {
    if (!currentPlan) return;
    const workout = currentPlan.workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const freshWorkout = generateWorkout(workout.type, settings, history);

    setCurrentPlan(prev => {
      if (!prev) return null;
      return {
        ...prev,
        workouts: prev.workouts.map(w => w.id === workoutId ? freshWorkout : w)
      };
    });

    if (activeWorkout && activeWorkout.id === workoutId) {
      setActiveWorkout(null);
    }
  };

  // Calculate Streak & Consistency Statistics
  const getStats = useCallback(() => {
    // Group workouts in history and current plan by weekId
    const weekWorkoutCompletion: Record<string, { push: boolean; pull: boolean; legs: boolean }> = {};

    history.forEach(w => {
      if (w.isCompleted) {
        const weekId = getWeekId(new Date(w.completedAt || w.startedAt || Date.now()));
        if (!weekWorkoutCompletion[weekId]) {
          weekWorkoutCompletion[weekId] = { push: false, pull: false, legs: false };
        }
        if (w.type === 'Push') weekWorkoutCompletion[weekId].push = true;
        else if (w.type === 'Pull') weekWorkoutCompletion[weekId].pull = true;
        else if (w.type === 'Legs') weekWorkoutCompletion[weekId].legs = true;
      }
    });

    if (currentPlan) {
      const weekId = currentPlan.weekId;
      if (!weekWorkoutCompletion[weekId]) {
        weekWorkoutCompletion[weekId] = { push: false, pull: false, legs: false };
      }
      currentPlan.workouts.forEach(w => {
        if (w.isCompleted) {
          if (w.type === 'Push') weekWorkoutCompletion[weekId].push = true;
          else if (w.type === 'Pull') weekWorkoutCompletion[weekId].pull = true;
          else if (w.type === 'Legs') weekWorkoutCompletion[weekId].legs = true;
        }
      });
    }

    const completedWeeks = new Set<string>();
    Object.entries(weekWorkoutCompletion).forEach(([weekId, completion]) => {
      if (completion.push && completion.pull && completion.legs) {
        completedWeeks.add(weekId);
      }
    });

    // Trace back week by week to count streak
    let streakCount = 0;
    let checkDate = new Date();
    
    while (true) {
      const weekId = getWeekId(checkDate);
      if (completedWeeks.has(weekId)) {
        streakCount++;
        // Go back 7 days
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        // If it's the current week, it might not be completed yet, so check previous week before breaking
        const isCurrentWeek = weekId === getWeekId(new Date());
        if (isCurrentWeek) {
          checkDate.setDate(checkDate.getDate() - 7);
          continue;
        }
        break;
      }
    }

    // 2. Muscle volume breakdown
    const muscleVolume: Record<string, number> = {};
    history.forEach(session => {
      session.exercises.forEach(ex => {
        if (!ex.completed) return;
        const vol = ex.sets.reduce((sum, s) => sum + (s.completed ? s.reps * s.weight : 0), 0);
        ex.primaryMuscles.forEach(m => {
          muscleVolume[m] = (muscleVolume[m] || 0) + vol;
        });
      });
    });

    // 3. Completion counts
    const totalCoreCompleted = history.filter(w => w.isCompleted && w.type !== 'Full Body').length;
    const totalFullBodyCompleted = history.filter(w => w.isCompleted && w.type === 'Full Body').length;

    return {
      streak: streakCount,
      muscleVolume,
      totalCoreCompleted,
      totalFullBodyCompleted,
      totalWorkoutsCompleted: history.filter(w => w.isCompleted).length
    };
  }, [history, currentPlan]);

  return {
    settings,
    currentPlan,
    history,
    prs,
    activeWorkout,
    completeOnboarding,
    updateSettings,
    startWorkout,
    logSet,
    updateExerciseNotes,
    swapExercise,
    deleteExercise,
    addExercise,
    finishWorkout,
    cancelWorkout,
    regenerateSingleWorkout,
    getStats,
  };
}
