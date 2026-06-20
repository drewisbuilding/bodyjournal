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

// Map old EXERCISES format to new system
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

  const equipmentSet = userProfile.equipment.length === 0 ? 'home_minimal' :
    userProfile.equipment.includes('barbell') && userProfile.equipment.includes('pull_up_bar') ? 'full_gym' :
    userProfile.equipment.includes('dumbbells') ? 'dumbbells' :
    userProfile.equipment.includes('cable_machine') ? 'cable' :
    'home_minimal';

  const exerciseKeys = {
    push: ['push_primary_press', 'push_incline', 'push_secondary_horizontal', 'push_secondary_overhead', 'push_tertiary_lateral_raise', 'push_tertiary_triceps'],
    pull: ['pull_primary_vertical', 'pull_primary_horizontal', 'pull_secondary_vertical', 'pull_secondary_vertical_narrow', 'pull_secondary_face_pull', 'pull_tertiary_biceps'],
    legs: ['legs_primary_lower', 'legs_primary_posterior', 'legs_secondary_lunge', 'legs_secondary_quad_isolation', 'legs_secondary_hamstring_isolation', 'legs_tertiary_calf'],
    core: ['core_compound', 'core_stability', 'core_anti_rotation', 'core_rotation', 'core_compound', 'core_stability'],
    cardio: ['cardio_steady_state', 'cardio_hiit', 'cardio_incline', 'cardio_low_impact', 'cardio_steady_state', 'cardio_hiit'],
  };

  if (!exerciseKeys[workoutType]) return [];

  const tierConfig = intensity === 'light' ? tier.light : tier.heavy;
  const exercises = [];

  for (const exerciseKey of exerciseKeys[workoutType]) {
    const libraryExercise = EXERCISE_LIBRARY[exerciseKey];
    if (!libraryExercise) continue;

    const variantKey = libraryExercise.defaults[equipmentSet] || 'home_minimal';
    const variant = libraryExercise.variants[variantKey];

    const baseReps = tierConfig.repRange;
    const baseSets = Math.round(3 * tierConfig.setsMultiplier);

    exercises.push({
      name: variant.name,
      target: {
        sets: baseSets,
        reps: `${baseReps[0]}-${baseReps[1]}`,
        rest: tierConfig.restSeconds
      },
      sets: Array(baseSets).fill(null).map(() => ({
        weight: '',
        reps: `${baseReps[0]}-${baseReps[1]}`,
        done: false
      }))
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
