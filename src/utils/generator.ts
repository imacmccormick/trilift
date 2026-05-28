import type { Exercise, WorkoutSession, UserSettings, WorkoutExercise, SetLog, WeeklyPlan } from '../types';
import exercisesData from '../data/exercises-db.json';
import { getWeekId } from './dateUtils';

// Cast the imported JSON to our typed array.
const globalExercises = exercisesData as Exercise[];

/**
 * Curated high-quality dynamic warm-up exercises.
 * This guarantees we only include dynamic, mobility-focused warm-ups (no static stretches).
 */
const DYNAMIC_WARMUPS: Omit<Exercise, 'id'>[] = [
  {
    name: 'Dynamic Chest Stretch',
    force: 'pull',
    level: 'beginner',
    mechanic: null,
    equipment: null,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['middle back'],
    instructions: [
      'Stand with your hands together, arms extended directly in front of you. This will be your starting position.',
      'Keeping your arms straight, quickly move your arms back as far as possible and back in again, similar to an exaggerated clapping motion. Repeat 5-10 times, increasing speed as you do so.'
    ],
    category: 'stretching',
    images: ['Dynamic_Chest_Stretch/0.jpg', 'Dynamic_Chest_Stretch/1.jpg']
  },
  {
    name: 'Elbow Circles',
    force: 'pull',
    level: 'beginner',
    mechanic: 'isolation',
    equipment: null,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['traps'],
    instructions: [
      'Sit or stand with your feet slightly apart.',
      'Place your hands on your shoulders with your elbows at shoulder level and pointing out.',
      'Slowly make a circle with your elbows. Breathe out as you start the circle and breathe in as you complete the circle.'
    ],
    category: 'stretching',
    images: ['Elbow_Circles/0.jpg', 'Elbow_Circles/1.jpg']
  },
  {
    name: 'Bodyweight Squat',
    force: 'push',
    level: 'beginner',
    mechanic: 'compound',
    equipment: 'body only',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    instructions: [
      'Stand with your feet shoulder width apart. You can place your hands behind your head. This will be your starting position.',
      'Begin the movement by flexing your knees and hips, sitting back with your hips.',
      'Continue down to full depth if you are able,and quickly reverse the motion until you return to the starting position. As you squat, keep your head and chest up and push your knees out.'
    ],
    category: 'strength',
    images: ['Bodyweight_Squat/0.jpg', 'Bodyweight_Squat/1.jpg']
  },
  {
    name: 'Front Leg Raises',
    force: 'pull',
    level: 'beginner',
    mechanic: null,
    equipment: 'body only',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    instructions: [
      'Stand next to a chair or other support, holding on with one hand.',
      'Swing your leg forward, keeping the leg straight. Continue with a downward swing, bringing the leg as far back as your flexibility allows. Repeat 5-10 times, and then switch legs.'
    ],
    category: 'stretching',
    images: ['Front_Leg_Raises/0.jpg', 'Front_Leg_Raises/1.jpg']
  },
  {
    name: 'Cat Stretch',
    force: 'static',
    level: 'beginner',
    mechanic: null,
    equipment: null,
    primaryMuscles: ['lower back'],
    secondaryMuscles: ['middle back', 'traps'],
    instructions: [
      'Position yourself on the floor on your hands and knees.',
      'Pull your belly in and round your spine, lower back, shoulders, and neck, letting your head drop.',
      'Hold for 15 seconds.'
    ],
    category: 'stretching',
    images: ['Cat_Stretch/0.jpg', 'Cat_Stretch/1.jpg']
  },
  {
    name: 'World\'s Greatest Stretch',
    force: 'static',
    level: 'intermediate',
    mechanic: null,
    equipment: null,
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves', 'glutes', 'quadriceps'],
    instructions: [
      'This is a three-part stretch. Begin by lunging forward, with your front foot flat on the ground and on the toes of your back foot. With your knees bent, squat down until your knee is almost touching the ground. Keep your torso erect, and hold this position for 10-20 seconds.',
      'Now, place the arm on the same side as your front leg on the ground, with the elbow next to the foot. Your other hand should be placed on the ground, parallel to your lead leg, to help support you during this portion of the stretch.',
      'After 10-20 seconds, place your hands on either side of your front foot. Raise the toes of the front foot off of the ground, and straighten your leg. You may need to reposition your rear leg to do so. Hold for 10-20 seconds, and then repeat the entire sequence for the other side.'
    ],
    category: 'stretching',
    images: ['Worlds_Greatest_Stretch/0.jpg', 'Worlds_Greatest_Stretch/1.jpg']
  },
  {
    name: 'Russian Twist',
    force: 'pull',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: 'body only',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: ['lower back'],
    instructions: [
      'Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.',
      'Elevate your body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to your torso and with the hands clasped. This is the starting position.',
      'Twist your torso to the right side until your arms are parallel with the floor while breathing out.',
      'Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same techniques you applied to the right side.',
      'Repeat for the recommended amount of repetitions.'
    ],
    category: 'strength',
    images: ['Russian_Twist/0.jpg', 'Russian_Twist/1.jpg']
  }
];

export function getCanonicalWarmupName(name: string): string {
  const norm = name.toLowerCase();
  if (norm.includes('torso twist') || norm.includes('russian twist')) return 'Russian Twist';
  if (norm.includes('cat-cow') || norm.includes('cat stretch')) return 'Cat Stretch';
  if (norm.includes('spiderman lunge') || norm.includes('greatest stretch')) return "World's Greatest Stretch";
  if (norm.includes('arm swings') || norm.includes('chest openers') || norm.includes('chest stretch')) return 'Dynamic Chest Stretch';
  if (norm.includes('shoulder rotation') || norm.includes('arm circles') || norm.includes('elbow circles')) return 'Elbow Circles';
  if (norm.includes('goblet squat') || norm.includes('bodyweight squat')) return 'Bodyweight Squat';
  if (norm.includes('leg swing') || norm.includes('leg raise')) return 'Front Leg Raises';
  return name;
}

export function getWarmupImages(name: string): string[] {
  const canonicalName = getCanonicalWarmupName(name);
  const found = DYNAMIC_WARMUPS.find(w => w.name.toLowerCase() === canonicalName.toLowerCase());
  return found?.images || [];
}

/**
 * Filter exercises by available equipment.
 * Map user equipment selection list to DB equipment tags.
 */
export function filterExercisesByEquipment(exercises: Exercise[], equipmentSettings: string[]): Exercise[] {
  const allowedTags = new Set<string>();

  // "bodyweight" setting maps to "body only"
  if (equipmentSettings.includes('bodyweight')) {
    allowedTags.add('body only');
  }
  // "dumbbell" setting maps to "dumbbell"
  if (equipmentSettings.includes('dumbbell')) {
    allowedTags.add('dumbbell');
  }
  // "barbell" setting maps to "barbell" and "e-z curl bar"
  if (equipmentSettings.includes('barbell')) {
    allowedTags.add('barbell');
    allowedTags.add('e-z curl bar');
  }
  // "bands" setting maps to "bands"
  if (equipmentSettings.includes('bands')) {
    allowedTags.add('bands');
  }
  // "machines" setting maps to "machine" and "cable"
  if (equipmentSettings.includes('machines')) {
    allowedTags.add('machine');
    allowedTags.add('cable');
  }
  // kettlebells and medicine balls
  if (equipmentSettings.includes('full gym') || equipmentSettings.includes('dumbbell')) {
    allowedTags.add('kettlebells');
  }

  let filtered = exercises;

  // If user selected "bodyweight only" explicitly in the UI or only checked bodyweight, filter out weighted items.
  // Otherwise, filter based on checked equipment tags.
  if (!equipmentSettings.includes('full gym')) {
    filtered = exercises.filter(ex => {
      const eq = (ex.equipment || 'body only').toLowerCase();
      // If body only, always allowed
      if (eq === 'body only') return true;
      return allowedTags.has(eq);
    });
  }

  // Filter out Bench exercises if the user does NOT have a bench
  if (!equipmentSettings.includes('bench') && !equipmentSettings.includes('full gym')) {
    filtered = filtered.filter(ex => {
      const name = ex.name.toLowerCase();
      return !name.includes('bench') && !name.includes('lying') && !name.includes('incline') && !name.includes('decline');
    });
  }

  // Filter out Pull-up bar exercises if the user does NOT have a pull-up bar
  if (!equipmentSettings.includes('pull-up-bar') && !equipmentSettings.includes('full gym')) {
    filtered = filtered.filter(ex => {
      const name = ex.name.toLowerCase();
      return !name.includes('pullup') && !name.includes('pull-up') && !name.includes('chin-up') && !name.includes('chinup') && !name.includes('hanging');
    });
  }

  return filtered;
}

/**
 * Filter exercises by PPL Workout Type and Muscle Mapping.
 */
function filterExercisesByWorkoutType(exercises: Exercise[], type: WorkoutSession['type']): Exercise[] {
  switch (type) {
    case 'Push':
      return exercises.filter(ex => {
        // Push category muscles: chest, shoulders, triceps
        const muscles = ex.primaryMuscles.map(m => m.toLowerCase());
        const isPushMuscle = muscles.some(m => m === 'chest' || m === 'shoulders' || m === 'triceps');
        // Exclude stretching, cardio and non-strength/powerlifting
        const isStrength = ex.category === 'strength' || ex.category === 'powerlifting';
        // Double check force (exclude obvious pull movements that target shoulders, e.g. facepulls, but include push movements)
        const isPushForce = ex.force === 'push' || ex.force === null;
        return isPushMuscle && isStrength && isPushForce;
      });

    case 'Pull':
      return exercises.filter(ex => {
        // Pull category muscles: lats, middle back, biceps, traps, forearms
        const muscles = ex.primaryMuscles.map(m => m.toLowerCase());
        const isPullMuscle = muscles.some(m => 
          m === 'lats' || m === 'middle back' || m === 'biceps' || m === 'traps' || m === 'forearms' || m === 'lower back'
        );
        const isStrength = ex.category === 'strength' || ex.category === 'powerlifting';
        // Force should be pull, or null, or if shoulder/trap exercise it must be pull (e.g. face pull, shrugs)
        const isPullForce = ex.force === 'pull' || ex.force === null || ex.name.toLowerCase().includes('shrug') || ex.name.toLowerCase().includes('face pull');
        return isPullMuscle && isStrength && isPullForce;
      });

    case 'Legs':
      return exercises.filter(ex => {
        // Legs muscles: quadriceps, hamstrings, glutes, calves, adductors, abductors
        const muscles = ex.primaryMuscles.map(m => m.toLowerCase());
        const isLegMuscle = muscles.some(m => 
          m === 'quadriceps' || m === 'hamstrings' || m === 'glutes' || m === 'calves' || m === 'adductors' || m === 'abductors'
        );
        const isStrength = ex.category === 'strength' || ex.category === 'powerlifting' || ex.category === 'plyometrics';
        return isLegMuscle && isStrength;
      });

    case 'Full Body':
      return exercises.filter(ex => {
        // Allow chest, back, legs, and abs/core
        const muscles = ex.primaryMuscles.map(m => m.toLowerCase());
        const isFullBodyMuscle = muscles.some(m => 
          m === 'chest' || m === 'lats' || m === 'middle back' || m === 'quadriceps' || m === 'hamstrings' || m === 'glutes' || m === 'abdominals'
        );
        const isStrength = ex.category === 'strength' || ex.category === 'powerlifting';
        return isFullBodyMuscle && isStrength;
      });

    default:
      return [];
  }
}

/**
 * Returns default sets and reps target based on fitness level and workout intensity.
 */
function getDefaultSetsAndReps(fitnessLevel: UserSettings['fitnessLevel'], isCompound: boolean): { setsCount: number, repsCount: number } {
  let setsCount = 3;
  let repsCount = 10;

  if (fitnessLevel === 'beginner') {
    setsCount = 3;
    repsCount = isCompound ? 10 : 12;
  } else if (fitnessLevel === 'intermediate') {
    setsCount = isCompound ? 4 : 3;
    repsCount = isCompound ? 8 : 10;
  } else if (fitnessLevel === 'advanced') {
    setsCount = isCompound ? 4 : 4;
    repsCount = isCompound ? 6 : 10;
  }

  return { setsCount, repsCount };
}

/**
 * Seeds target weight and reps from exercise history or PRs to promote progressive overload.
 */
export function seedExerciseSets(
  exercise: Exercise,
  settings: UserSettings,
  history: WorkoutSession[]
): SetLog[] {
  const isCompound = exercise.mechanic === 'compound';
  const { setsCount, repsCount } = getDefaultSetsAndReps(settings.fitnessLevel, isCompound);
  
  // Try to find the most recent time the user completed this specific exercise
  let previousLogs: SetLog[] | undefined = undefined;
  
  for (let i = history.length - 1; i >= 0; i--) {
    const session = history[i];
    const match = session.exercises.find(ex => ex.id === exercise.id && ex.completed);
    if (match && match.sets.length > 0) {
      previousLogs = match.sets;
      break;
    }
  }

  const sets: SetLog[] = [];
  
  for (let setIdx = 0; setIdx < setsCount; setIdx++) {
    let weight = 0;
    let reps = repsCount;
    let prevWeight: number | undefined = undefined;
    let prevReps: number | undefined = undefined;

    if (previousLogs && previousLogs[setIdx]) {
      // Use previous weight & reps
      prevWeight = previousLogs[setIdx].weight;
      prevReps = previousLogs[setIdx].reps;
      
      // Auto-populate target (maybe small progression if last workout was fully completed)
      weight = prevWeight;
      reps = prevReps;
      
      // Progressive overload nudge: if all sets were completed last time, nudge up intensity
      const allPrevCompleted = previousLogs.every(s => s.completed);
      if (allPrevCompleted && setIdx === 0) {
        if (settings.intensity === 'high') {
          // Increase weight slightly for compounds, or reps for accessory
          if (isCompound && weight > 0) {
            weight += settings.equipment.includes('barbell') ? 5 : 2.5; // lbs
          } else {
            reps += 1;
          }
        }
      }
    } else {
      // No history, seed based on exercise type and equipment
      const eq = (exercise.equipment || 'body only').toLowerCase();
      if (eq === 'body only') {
        weight = 0;
      } else if (eq === 'dumbbell') {
        weight = isCompound ? 25 : 15; // default dumbbell weight per arm
      } else if (eq === 'barbell') {
        weight = isCompound ? 45 : 30; // default barbell bar weight
      } else {
        weight = 20; // generic machine/cable weight
      }
    }

    sets.push({
      id: `${exercise.id}-set-${setIdx}`,
      reps,
      weight,
      completed: false,
      previousWeight: prevWeight,
      previousReps: prevReps
    });
  }

  return sets;
}

/**
 * Main Workout Generation Function.
 */
export function generateWorkout(
  type: WorkoutSession['type'],
  settings: UserSettings,
  history: WorkoutSession[]
): WorkoutSession {
  // 1. Filter database by available equipment
  const equipmentFiltered = filterExercisesByEquipment(globalExercises, settings.equipment);

  // 2. Filter by PPL category muscles and category
  const candidates = filterExercisesByWorkoutType(equipmentFiltered, type);

  // 3. Determine exercise counts based on duration settings
  // 15m: 3 exercises | 30m: 4 exercises | 45m: 5-6 exercises | 60m: 7 exercises
  let targetCount = 4;
  if (settings.duration === 15) targetCount = 3;
  else if (settings.duration === 30) targetCount = 4;
  else if (settings.duration === 45) targetCount = 5;
  else if (settings.duration === 60) targetCount = 7;

  // Separate compounds and accessories
  const compounds = candidates.filter(ex => ex.mechanic === 'compound');
  const accessories = candidates.filter(ex => ex.mechanic !== 'compound');

  const selectedExercises: Exercise[] = [];

  // Always prioritize compounds first
  if (type === 'Full Body') {
    // Balanced selection: 1 legs, 1 chest, 1 back, 1 core
    const legs = compounds.filter(ex => ex.primaryMuscles.some(m => m.toLowerCase() === 'quadriceps' || m.toLowerCase() === 'hamstrings' || m.toLowerCase() === 'glutes'));
    const chest = compounds.filter(ex => ex.primaryMuscles.some(m => m.toLowerCase() === 'chest'));
    const back = compounds.filter(ex => ex.primaryMuscles.some(m => m.toLowerCase() === 'lats' || m.toLowerCase() === 'middle back'));
    const core = CandidatesForCore(equipmentFiltered);

    if (legs.length > 0) selectedExercises.push(legs[Math.floor(Math.random() * legs.length)]);
    if (chest.length > 0) selectedExercises.push(chest[Math.floor(Math.random() * chest.length)]);
    if (back.length > 0) selectedExercises.push(back[Math.floor(Math.random() * back.length)]);
    if (core.length > 0 && targetCount > 3) selectedExercises.push(core[Math.floor(Math.random() * core.length)]);

    // Fill remaining spots if needed
    while (selectedExercises.length < targetCount) {
      const remainingCandidates = candidates.filter(ex => !selectedExercises.some(s => s.id === ex.id));
      if (remainingCandidates.length === 0) break;
      const pick = remainingCandidates[Math.floor(Math.random() * remainingCandidates.length)];
      selectedExercises.push(pick);
    }
  } else {
    // Standard PPL: Push, Pull, Legs
    // Aim to get a mix of compounds and accessory exercises depending on duration
    const compoundCount = Math.max(1, Math.min(compounds.length, Math.ceil(targetCount / 2)));

    // Pick compounds
    const shuffledCompounds = [...compounds].sort(() => 0.5 - Math.random());
    selectedExercises.push(...shuffledCompounds.slice(0, compoundCount));

    // Pick accessories
    const shuffledAccessories = [...accessories].sort(() => 0.5 - Math.random());
    const neededAccessoryCount = targetCount - selectedExercises.length;
    selectedExercises.push(...shuffledAccessories.slice(0, neededAccessoryCount));

    // Fallback if we didn't get enough exercises
    while (selectedExercises.length < targetCount) {
      const remaining = candidates.filter(ex => !selectedExercises.some(s => s.id === ex.id));
      if (remaining.length === 0) break;
      selectedExercises.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }
  }

  // Sort exercises: Compounds first, accessories last
  selectedExercises.sort((a, b) => {
    const aComp = a.mechanic === 'compound' ? 1 : 0;
    const bComp = b.mechanic === 'compound' ? 1 : 0;
    return bComp - aComp; // descending compound rating
  });

  // Map to WorkoutExercise with set logs
  const workoutExercises: WorkoutExercise[] = selectedExercises.map(ex => {
    const sets = seedExerciseSets(ex, settings, history);
    return {
      ...ex,
      sets,
      completed: false
    };
  });

  // 4. Core Warmup generation: 3 dynamic warmups
  // Pick dynamic warmups compatible with type
  const isUpperBody = type === 'Push' || type === 'Pull' || type === 'Full Body';
  const isLowerBody = type === 'Legs' || type === 'Full Body';

  const warmupPool = DYNAMIC_WARMUPS.filter(w => {
    const primary = w.primaryMuscles[0].toLowerCase();
    if (isUpperBody && (
      primary === 'shoulders' || 
      primary === 'middle back' || 
      primary === 'abdominals' || 
      primary === 'chest' ||
      primary === 'lower back'
    )) return true;
    if (isLowerBody && (
      primary === 'quadriceps' || 
      primary === 'hamstrings' || 
      primary === 'glutes' ||
      primary === 'lower back' ||
      primary === 'abdominals'
    )) return true;
    return false;
  });

  // Select 3 random warmups from pool
  const shuffledWarmups = [...warmupPool].sort(() => 0.5 - Math.random());
  const selectedWarmups: Exercise[] = shuffledWarmups.slice(0, 3).map((w, idx) => ({
    ...w,
    id: `warmup-${type}-${idx}`
  }));

  return {
    id: `${type.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    exercises: workoutExercises,
    warmups: selectedWarmups,
    isCompleted: false,
    startedAt: null
  };
}

/**
 * Filter core candidates for Full Body
 */
function CandidatesForCore(exercises: Exercise[]): Exercise[] {
  return exercises.filter(ex => 
    ex.primaryMuscles.some(m => m.toLowerCase() === 'abdominals') && 
    (ex.category === 'strength' || ex.category === 'powerlifting')
  );
}

/**
 * Generate a fresh weekly workout plan containing Push, Pull, Legs, and optional Full Body.
 */
export function generateWeeklyPlan(
  settings: UserSettings,
  history: WorkoutSession[]
): WeeklyPlan {
  const workouts: WorkoutSession[] = [];
  
  // 1. Always generate Core PPL workouts
  workouts.push(generateWorkout('Push', settings, history));
  workouts.push(generateWorkout('Pull', settings, history));
  workouts.push(generateWorkout('Legs', settings, history));
  
  // 2. Generate optional Full Body workout
  if (settings.enableFullBody) {
    workouts.push(generateWorkout('Full Body', settings, history));
  }

  return {
    weekId: getWeekId(),
    workouts,
    isCompleted: false
  };
}

/**
 * Returns list of alternative exercises targeting the same muscle group and using available equipment.
 */
export function getSwapOptions(
  exercise: WorkoutExercise,
  settings: UserSettings
): Exercise[] {
  // Filter by available equipment
  const equipmentFiltered = filterExercisesByEquipment(globalExercises, settings.equipment);

  // Filter exercises targeting the exact same primary muscle, but excluding the current one
  return equipmentFiltered.filter(ex => 
    ex.id !== exercise.id &&
    ex.primaryMuscles.some(m => exercise.primaryMuscles.includes(m)) &&
    (ex.category === 'strength' || ex.category === 'powerlifting' || ex.category === 'plyometrics')
  );
}

/**
 * Returns a list of candidate exercises that can be added to a given workout type.
 */
export function getAddOptions(
  type: WorkoutSession['type'],
  settings: UserSettings,
  currentExercises: WorkoutExercise[]
): Exercise[] {
  // Filter by available equipment
  const equipmentFiltered = filterExercisesByEquipment(globalExercises, settings.equipment);

  // Filter exercises by workout type
  const candidates = filterExercisesByWorkoutType(equipmentFiltered, type);

  // Exclude exercises already in the workout
  const currentIds = new Set(currentExercises.map(ex => ex.id));
  return candidates.filter(ex => !currentIds.has(ex.id));
}
