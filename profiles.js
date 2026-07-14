// Exercise library with variants for different equipment/fitness levels
const EXERCISE_LIBRARY = {
  // PUSH exercises
  push_primary_press: {
    name: 'Primary Press',
    target: 'Chest / Shoulders',
    variants: {
      full_gym: { name: 'Barbell Bench Press', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Bench Press', equipment: 'dumbbells' },
      home_minimal: { name: 'Push-ups', equipment: 'bodyweight' },
      cable: { name: 'Machine Chest Press', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  push_incline: {
    name: 'Incline Press',
    target: 'Upper Chest / Front Delts',
    variants: {
      full_gym: { name: 'Incline Barbell Press', equipment: 'barbell' },
      dumbbells: { name: 'Incline Dumbbell Press', equipment: 'dumbbells' },
      home_minimal: { name: 'Incline Push-ups', equipment: 'bodyweight' },
      cable: { name: 'Machine Incline Press', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  push_secondary_horizontal: {
    name: 'Horizontal Fly',
    target: 'Chest / Pec Isolation',
    variants: {
      full_gym: { name: 'Dumbbell Flye', equipment: 'dumbbells' },
      dumbbells: { name: 'Dumbbell Flye', equipment: 'dumbbells' },
      home_minimal: { name: 'Push-up Hold', equipment: 'bodyweight' },
      cable: { name: 'Cable Crossover', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  push_secondary_overhead: {
    name: 'Overhead Press',
    target: 'Shoulders / Triceps',
    variants: {
      full_gym: { name: 'Military Press', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Shoulder Press', equipment: 'dumbbells' },
      home_minimal: { name: 'Pike Push-ups', equipment: 'bodyweight' },
      cable: { name: 'Machine Shoulder Press', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  push_tertiary_lateral_raise: {
    name: 'Lateral Raise',
    target: 'Shoulder Caps',
    variants: {
      full_gym: { name: 'Dumbbell Lateral Raise', equipment: 'dumbbells' },
      dumbbells: { name: 'Dumbbell Lateral Raise', equipment: 'dumbbells' },
      home_minimal: { name: 'Banded Lateral Raise', equipment: 'bodyweight' },
      cable: { name: 'Cable Lateral Raise', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'dumbbells', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  push_tertiary_triceps: {
    name: 'Triceps Extension',
    target: 'Triceps',
    variants: {
      full_gym: { name: 'EZ-Bar Skull Crusher', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Skull Crusher', equipment: 'dumbbells' },
      home_minimal: { name: 'Chair Dips', equipment: 'bodyweight' },
      cable: { name: 'Cable Overhead Extension', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },

  // PULL exercises
  pull_primary_vertical: {
    name: 'Primary Pull (Vertical)',
    target: 'Lats / Upper Back',
    variants: {
      full_gym: { name: 'Weighted Pull-ups', equipment: 'pull_up_bar' },
      dumbbells: { name: 'Single-Arm Rows', equipment: 'dumbbells' },
      home_minimal: { name: 'Assisted Pull-ups', equipment: 'pull_up_bar' },
      cable: { name: 'Lat Pulldown', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'cable', home_minimal: 'home_minimal', cable: 'cable' }
  },
  pull_primary_horizontal: {
    name: 'Primary Row (Horizontal)',
    target: 'Back / Rhomboids',
    variants: {
      full_gym: { name: 'Barbell Rows', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Rows', equipment: 'dumbbells' },
      home_minimal: { name: 'Inverted Rows', equipment: 'bodyweight' },
      cable: { name: 'Cable Rows', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  pull_secondary_vertical: {
    name: 'Secondary Pull (Vertical)',
    target: 'Lats / Shoulders',
    variants: {
      full_gym: { name: 'Machine Pulldown', equipment: 'cable_machine' },
      dumbbells: { name: 'Dumbbell Pullovers', equipment: 'dumbbells' },
      home_minimal: { name: 'Assisted Pull-ups', equipment: 'pull_up_bar' },
      cable: { name: 'Wide Pulldown', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  pull_secondary_vertical_narrow: {
    name: 'Narrow Pulldown',
    target: 'Lats / Biceps',
    variants: {
      full_gym: { name: 'Close-Grip Lat Pulldown', equipment: 'cable_machine' },
      dumbbells: { name: 'Single-Arm Rows', equipment: 'dumbbells' },
      home_minimal: { name: 'Narrow Assisted Pull-ups', equipment: 'pull_up_bar' },
      cable: { name: 'Close-Grip Pulldown', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  pull_secondary_face_pull: {
    name: 'Face Pull',
    target: 'Rear Shoulders / Back',
    variants: {
      full_gym: { name: 'Rope Face Pull', equipment: 'cable_machine' },
      dumbbells: { name: 'Reverse Flye', equipment: 'dumbbells' },
      home_minimal: { name: 'Band Pull Apart', equipment: 'bodyweight' },
      cable: { name: 'Rope Face Pull', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  pull_tertiary_biceps: {
    name: 'Biceps Curl',
    target: 'Biceps',
    variants: {
      full_gym: { name: 'Barbell Curl', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Curl', equipment: 'dumbbells' },
      home_minimal: { name: 'Band Curl', equipment: 'bodyweight' },
      cable: { name: 'Cable Curl', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'barbell', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },

  // LEGS exercises
  legs_primary_lower: {
    name: 'Primary Lower (Squat Pattern)',
    target: 'Quads / Glutes',
    variants: {
      full_gym: { name: 'Barbell Squat', equipment: 'barbell' },
      dumbbells: { name: 'Goblet Squat', equipment: 'dumbbells' },
      home_minimal: { name: 'Bodyweight Squat', equipment: 'bodyweight' },
      cable: { name: 'Leg Press', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  legs_primary_posterior: {
    name: 'Primary Posterior (Hinge Pattern)',
    target: 'Hamstrings / Glutes / Back',
    variants: {
      full_gym: { name: 'Barbell Deadlift', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Deadlifts', equipment: 'dumbbells' },
      home_minimal: { name: 'Single-Leg Deadlifts', equipment: 'bodyweight' },
      cable: { name: 'Leg Curl', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  legs_secondary_lunge: {
    name: 'Lunge Variation',
    target: 'Quads / Glutes / Stability',
    variants: {
      full_gym: { name: 'Barbell Lunge', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Lunge', equipment: 'dumbbells' },
      home_minimal: { name: 'Bodyweight Lunge', equipment: 'bodyweight' },
      cable: { name: 'Machine Leg Press', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'full_gym', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  legs_secondary_quad_isolation: {
    name: 'Quad Isolation',
    target: 'Quadriceps',
    variants: {
      full_gym: { name: 'Leg Extension', equipment: 'cable_machine' },
      dumbbells: { name: 'Dumbbell Step-ups', equipment: 'dumbbells' },
      home_minimal: { name: 'Sissy Squats', equipment: 'bodyweight' },
      cable: { name: 'Leg Extension', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  legs_secondary_hamstring_isolation: {
    name: 'Hamstring Isolation',
    target: 'Hamstrings',
    variants: {
      full_gym: { name: 'Leg Curl', equipment: 'cable_machine' },
      dumbbells: { name: 'Swiss Ball Curl', equipment: 'bodyweight' },
      home_minimal: { name: 'Swiss Ball Curl', equipment: 'bodyweight' },
      cable: { name: 'Leg Curl', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'home_minimal', home_minimal: 'home_minimal', cable: 'cable' }
  },
  legs_tertiary_calf: {
    name: 'Calf Raise',
    target: 'Calves',
    variants: {
      full_gym: { name: 'Barbell Calf Raise', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Calf Raise', equipment: 'dumbbells' },
      home_minimal: { name: 'Bodyweight Calf Raise', equipment: 'bodyweight' },
      cable: { name: 'Machine Calf Raise', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'barbell', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },

  // CORE exercises
  core_compound: {
    name: 'Compound Core',
    target: 'Anterior Core',
    variants: {
      full_gym: { name: 'Cable Crunches', equipment: 'cable_machine' },
      dumbbells: { name: 'Dumbbell Crunches', equipment: 'dumbbells' },
      home_minimal: { name: 'Crunches', equipment: 'bodyweight' },
      cable: { name: 'Cable Crunches', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  core_stability: {
    name: 'Core Stability',
    target: 'Stabilizer Core',
    variants: {
      full_gym: { name: 'Weighted Planks', equipment: 'barbell' },
      dumbbells: { name: 'Dumbbell Planks', equipment: 'dumbbells' },
      home_minimal: { name: 'Planks', equipment: 'bodyweight' },
      cable: { name: 'Anti-Rotation Hold', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'barbell', dumbbells: 'home_minimal', home_minimal: 'home_minimal', cable: 'cable' }
  },
  core_anti_rotation: {
    name: 'Anti-Rotation',
    target: 'Obliques / Stabilizers',
    variants: {
      full_gym: { name: 'Cable Chops', equipment: 'cable_machine' },
      dumbbells: { name: 'Dumbbell Wood Chops', equipment: 'dumbbells' },
      home_minimal: { name: 'Band Chops', equipment: 'bodyweight' },
      cable: { name: 'Cable Chops', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },
  core_rotation: {
    name: 'Rotational',
    target: 'Obliques',
    variants: {
      full_gym: { name: 'Cable Twists', equipment: 'cable_machine' },
      dumbbells: { name: 'Russian Twists', equipment: 'dumbbells' },
      home_minimal: { name: 'Russian Twists', equipment: 'bodyweight' },
      cable: { name: 'Cable Twists', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'dumbbells', home_minimal: 'home_minimal', cable: 'cable' }
  },

  // CARDIO exercises
  cardio_steady_state: {
    name: 'Steady State',
    target: 'Aerobic Conditioning',
    variants: {
      full_gym: { name: 'Treadmill Run', equipment: 'cable_machine' },
      dumbbells: { name: 'Outdoor Run', equipment: 'bodyweight' },
      home_minimal: { name: 'Jump Rope', equipment: 'bodyweight' },
      cable: { name: 'Elliptical', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'home_minimal', home_minimal: 'home_minimal', cable: 'cable' }
  },
  cardio_hiit: {
    name: 'HIIT',
    target: 'Anaerobic Power',
    variants: {
      full_gym: { name: 'Battle Ropes', equipment: 'cable_machine' },
      dumbbells: { name: 'Burpees', equipment: 'bodyweight' },
      home_minimal: { name: 'Jump Squats', equipment: 'bodyweight' },
      cable: { name: 'Rowing Machine', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'home_minimal', home_minimal: 'home_minimal', cable: 'cable' }
  },
  cardio_incline: {
    name: 'Incline Work',
    target: 'Lower Body Cardio',
    variants: {
      full_gym: { name: 'Treadmill Incline', equipment: 'cable_machine' },
      dumbbells: { name: 'Hill Sprints', equipment: 'bodyweight' },
      home_minimal: { name: 'Stairs', equipment: 'bodyweight' },
      cable: { name: 'Stair Climber', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'home_minimal', home_minimal: 'home_minimal', cable: 'cable' }
  },
  cardio_low_impact: {
    name: 'Low Impact',
    target: 'Recovery Cardio',
    variants: {
      full_gym: { name: 'Bike', equipment: 'cable_machine' },
      dumbbells: { name: 'Walk/Hike', equipment: 'bodyweight' },
      home_minimal: { name: 'Walk', equipment: 'bodyweight' },
      cable: { name: 'Elliptical', equipment: 'cable_machine' },
    },
    defaults: { full_gym: 'cable', dumbbells: 'home_minimal', home_minimal: 'home_minimal', cable: 'cable' }
  }
};

// Difficulty tier prescriptions
const DIFFICULTY_TIERS = {
  beginner: {
    name: 'Beginner',
    description: 'Building foundational strength and movement quality',
    light: { setsMultiplier: 1, repRange: [15, 20], restSeconds: 90 },
    heavy: { setsMultiplier: 1, repRange: [12, 15], restSeconds: 75 }
  },
  intermediate: {
    name: 'Intermediate',
    description: 'Balanced strength and hypertrophy development',
    light: { setsMultiplier: 1, repRange: [12, 15], restSeconds: 75 },
    heavy: { setsMultiplier: 1.2, repRange: [8, 10], restSeconds: 60 }
  },
  advanced: {
    name: 'Advanced',
    description: 'Pushing strength and volume for competitive gains',
    light: { setsMultiplier: 1.2, repRange: [10, 12], restSeconds: 60 },
    heavy: { setsMultiplier: 1.5, repRange: [5, 8], restSeconds: 45 }
  }
};

// Derive a training archetype from the user's full profile
function getTrainingProfile(userProfile) {
  const age = parseInt(userProfile.age) || 30;
  const gender = userProfile.gender || '';
  const goal = userProfile.goal || 'build';
  const level = userProfile.fitnessLevel || 'beginner';

  const ageGroup = age < 30 ? 'young' : age < 45 ? 'adult' : 'masters';

  // Rep range: experience × goal matrix
  const repRangeMatrix = {
    beginner:     { build: [10, 12], cut: [15, 20], endurance: [20, 25] },
    intermediate: { build: [8,  10], cut: [12, 15], endurance: [15, 20] },
    advanced:     { build: [6,  8],  cut: [10, 12], endurance: [12, 15] }
  };

  // Rest (seconds): experience × goal
  const restMatrix = {
    beginner:     { build: 90, cut: 60, endurance: 45 },
    intermediate: { build: 75, cut: 45, endurance: 30 },
    advanced:     { build: 60, cut: 30, endurance: 20 }
  };

  const repRange = (repRangeMatrix[level] || repRangeMatrix.beginner)[goal] || [12, 15];
  let restSeconds = (restMatrix[level] || restMatrix.beginner)[goal] || 75;

  if (ageGroup === 'masters') restSeconds += 20;

  // Emphasis: glute/posterior chain for female users building or cutting
  const gluteFocus = gender === 'female' && (goal === 'build' || goal === 'cut');

  // Cardio style
  const cardioPreference =
    ageGroup === 'masters'                    ? 'low_impact'   :
    goal === 'endurance'                      ? 'steady_state' :
    goal === 'cut' && ageGroup !== 'masters'  ? 'hiit'         :
                                                'mixed';

  // Volume: masters carry slightly less raw volume
  const volMod = ageGroup === 'masters' ? 0.85 : 1.0;

  // Archetype label + coaching note
  let archetypeLabel, archetypeDesc;
  if (ageGroup === 'masters' && goal === 'build') {
    archetypeLabel = 'Masters Builder';
    archetypeDesc = 'Longer rest, controlled volume, joint-friendly compound lifts.';
  } else if (ageGroup === 'masters') {
    archetypeLabel = 'Masters Athlete';
    archetypeDesc = 'Low-impact cardio, mobility priority, sustainable training load.';
  } else if (gluteFocus && goal === 'build') {
    archetypeLabel = 'Glute & Strength';
    archetypeDesc = 'Hip hinges and posterior chain lead your leg sessions.';
  } else if (gluteFocus && goal === 'cut') {
    archetypeLabel = 'Lean & Sculpted';
    archetypeDesc = 'High reps, glute focus, HIIT-forward cardio sessions.';
  } else if (goal === 'build') {
    archetypeLabel = 'Strength Builder';
    archetypeDesc = 'Compound-first programming with progressive overload each week.';
  } else if (goal === 'cut') {
    archetypeLabel = 'Fat Loss Focus';
    archetypeDesc = 'HIIT cardio, shorter rest, higher reps to maximize burn.';
  } else if (goal === 'endurance') {
    archetypeLabel = 'Endurance Athlete';
    archetypeDesc = 'Volume and aerobic capacity over raw strength output.';
  } else {
    archetypeLabel = 'Athletic Build';
    archetypeDesc = 'Balanced strength and conditioning across all sessions.';
  }

  return { ageGroup, gender, goal, gluteFocus, cardioPreference, repRange, restSeconds, volMod, archetypeLabel, archetypeDesc };
}

function getPersonalizedExercises(workoutType, intensity, userProfile) {
  if (!userProfile) return null;
  if (!userProfile.fitnessLevel) {
    console.error('User profile missing fitnessLevel:', userProfile);
    return null;
  }

  const tier = DIFFICULTY_TIERS[userProfile.fitnessLevel];
  if (!tier) {
    console.error('Tier not found for fitness level:', userProfile.fitnessLevel);
    return null;
  }

  const eq = userProfile.equipment || [];
  const has = (item) => eq.includes(item);
  const equipmentSet =
    eq.length === 0                                      ? 'home_minimal' :
    has('barbell')                                       ? 'full_gym'     :
    has('dumbbells') && has('cable_machine')             ? 'full_gym'     :
    has('dumbbells')                                     ? 'dumbbells'    :
    has('cable_machine')                                 ? 'cable'        :
    (has('pull_up_bar') || has('bench'))                 ? 'home_minimal' :
                                                           'home_minimal';

  // Recovery day — fixed exercises, no equipment variation
  if (workoutType === 'recovery') {
    return EXERCISES.recovery.map(ex => ({
      name: ex.name,
      target: ex[intensity],
      sets: Array(ex[intensity].sets).fill(null).map(() => ({
        weight: '',
        reps: ex[intensity].reps,
        done: false
      }))
    }));
  }

  const tp = getTrainingProfile(userProfile);
  const tierConfig = intensity === 'light' ? tier.light : tier.heavy;

  // Sets: tier setsMultiplier × age-based volMod
  const baseSets = Math.max(2, Math.round(3 * tierConfig.setsMultiplier * tp.volMod));

  // Reps: smart profile base, shifted by light/heavy toggle
  const repShift = intensity === 'light' ? 2 : -2;
  const repLow = Math.max(5, tp.repRange[0] + repShift);
  const repHigh = Math.max(6, tp.repRange[1] + repShift);
  const repStr = `${repLow}-${repHigh}`;

  // Rest: smart profile base, shifted by intensity
  const restSecs = Math.max(15, tp.restSeconds + (intensity === 'light' ? 15 : -10));

  // Exercise order — adjusted by training profile emphasis
  const exerciseKeys = {
    push: ['push_primary_press', 'push_incline', 'push_secondary_horizontal', 'push_secondary_overhead', 'push_tertiary_lateral_raise', 'push_tertiary_triceps'],
    pull: ['pull_primary_vertical', 'pull_primary_horizontal', 'pull_secondary_vertical', 'pull_secondary_vertical_narrow', 'pull_secondary_face_pull', 'pull_tertiary_biceps'],
    legs: tp.gluteFocus
      // Posterior-chain first: RDL → ham curl → lunge → squat → quad iso → calf
      ? ['legs_primary_posterior', 'legs_secondary_hamstring_isolation', 'legs_secondary_lunge', 'legs_primary_lower', 'legs_secondary_quad_isolation', 'legs_tertiary_calf']
      // Standard: squat → deadlift → lunge → quad → ham → calf
      : ['legs_primary_lower', 'legs_primary_posterior', 'legs_secondary_lunge', 'legs_secondary_quad_isolation', 'legs_secondary_hamstring_isolation', 'legs_tertiary_calf'],
    core: ['core_compound', 'core_stability', 'core_anti_rotation', 'core_rotation', 'core_compound', 'core_stability'],
    cardio:
      tp.cardioPreference === 'low_impact'   ? ['cardio_low_impact',   'cardio_steady_state', 'cardio_incline', 'cardio_hiit',          'cardio_low_impact',   'cardio_steady_state'] :
      tp.cardioPreference === 'hiit'         ? ['cardio_hiit',         'cardio_steady_state', 'cardio_incline', 'cardio_low_impact',    'cardio_hiit',         'cardio_steady_state'] :
      tp.cardioPreference === 'steady_state' ? ['cardio_steady_state', 'cardio_incline',      'cardio_low_impact', 'cardio_steady_state', 'cardio_incline',     'cardio_hiit'        ] :
                                               ['cardio_steady_state', 'cardio_hiit',         'cardio_incline', 'cardio_low_impact',    'cardio_steady_state', 'cardio_hiit'        ],
  };

  if (!exerciseKeys[workoutType]) return [];

  const exercises = [];
  for (const exerciseKey of exerciseKeys[workoutType]) {
    const libraryExercise = EXERCISE_LIBRARY[exerciseKey];
    if (!libraryExercise) continue;

    const variantKey = libraryExercise.defaults[equipmentSet] || 'home_minimal';
    const variant = libraryExercise.variants[variantKey];

    exercises.push({
      name: variant.name,
      target: { sets: baseSets, reps: repStr, rest: restSecs },
      sets: Array(baseSets).fill(null).map(() => ({ weight: '', reps: repStr, done: false }))
    });
  }

  return exercises;
}

// Get personalized goal message
function getGoalMessage(goal) {
  const messages = {
    build: 'Focus on progressive overload—add weight or reps each week. Eat in a caloric surplus.',
    cut: 'Maintain strength while in a caloric deficit. Prioritize protein intake.',
    endurance: 'Build aerobic capacity and work capacity. Focus on movement quality and consistency.'
  };
  return messages[goal] || messages.build;
}
