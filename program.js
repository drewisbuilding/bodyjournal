// Body Journal - Workout Program Definition

const PHASES = [
  { phase: 1, name: 'Foundation', startDay: 1, endDay: 30, description: 'Build base strength and movement patterns' },
  { phase: 2, name: 'Intensity', startDay: 31, endDay: 60, description: 'Increase load and volume' },
  { phase: 3, name: 'Peak', startDay: 61, endDay: 90, description: 'Push intensity, refine weak points' }
];

// Phase 1: no true rest — build the daily habit with active recovery
// Phase 2: one real rest day introduced
// Phase 3: full rest schedule
const ROTATIONS = {
  1: ['push', 'recovery', 'pull', 'legs', 'core', 'cardio', 'recovery'],
  2: ['push', 'pull', 'legs', 'recovery', 'core', 'cardio', 'rest'],
  3: ['push', 'pull', 'legs', 'core', 'cardio', 'rest', 'rest']
};

const WORKOUT_META = {
  push: {
    label: 'Push Day',
    subtitle: 'Chest, shoulders, triceps'
  },
  pull: {
    label: 'Pull Day',
    subtitle: 'Back, biceps, rear delts'
  },
  legs: {
    label: 'Leg Day',
    subtitle: 'Quads, hamstrings, glutes, calves'
  },
  core: {
    label: 'Core Day',
    subtitle: 'Abs, obliques, stabilizers'
  },
  cardio: {
    label: 'Cardio Day',
    subtitle: 'Endurance and conditioning'
  },
  rest: {
    label: 'Rest Day',
    subtitle: 'Full recovery — sleep, eat, prepare'
  },
  recovery: {
    label: 'Active Recovery',
    subtitle: 'Mobility, stretching & light movement'
  }
};

const EXERCISES = {
  push: [
    {
      name: 'Push-ups',
      light: { sets: 3, reps: '12-15', rest: 60 },
      heavy: { sets: 4, reps: '8-10', rest: 45 }
    },
    {
      name: 'Bench Press',
      light: { sets: 3, reps: '12-15', rest: 60 },
      heavy: { sets: 4, reps: '6-8', rest: 45 }
    },
    {
      name: 'Overhead Press',
      light: { sets: 3, reps: '10-12', rest: 60 },
      heavy: { sets: 4, reps: '6-8', rest: 45 }
    },
    {
      name: 'Incline DB Press',
      light: { sets: 3, reps: '12-15', rest: 60 },
      heavy: { sets: 3, reps: '8-10', rest: 45 }
    },
    {
      name: 'Triceps Dips',
      light: { sets: 3, reps: '8-12', rest: 60 },
      heavy: { sets: 4, reps: '5-8', rest: 45 }
    },
    {
      name: 'Lateral Raises',
      light: { sets: 3, reps: '12-15', rest: 45 },
      heavy: { sets: 3, reps: '8-10', rest: 45 }
    }
  ],
  pull: [
    {
      name: 'Pull-ups',
      light: { sets: 3, reps: '6-10', rest: 60 },
      heavy: { sets: 4, reps: '5-8', rest: 45 }
    },
    {
      name: 'Bent-over Rows',
      light: { sets: 3, reps: '10-12', rest: 60 },
      heavy: { sets: 4, reps: '6-8', rest: 45 }
    },
    {
      name: 'Lat Pulldown',
      light: { sets: 3, reps: '12-15', rest: 60 },
      heavy: { sets: 4, reps: '8-10', rest: 45 }
    },
    {
      name: 'Face Pulls',
      light: { sets: 3, reps: '12-15', rest: 45 },
      heavy: { sets: 3, reps: '10-12', rest: 45 }
    },
    {
      name: 'Bicep Curls',
      light: { sets: 3, reps: '12-15', rest: 45 },
      heavy: { sets: 3, reps: '8-10', rest: 45 }
    },
    {
      name: 'Hammer Curls',
      light: { sets: 3, reps: '10-12', rest: 45 },
      heavy: { sets: 3, reps: '8-10', rest: 45 }
    }
  ],
  legs: [
    {
      name: 'Squats',
      light: { sets: 3, reps: '12-15', rest: 60 },
      heavy: { sets: 4, reps: '6-8', rest: 60 }
    },
    {
      name: 'Romanian Deadlifts',
      light: { sets: 3, reps: '10-12', rest: 60 },
      heavy: { sets: 4, reps: '6-8', rest: 60 }
    },
    {
      name: 'Walking Lunges',
      light: { sets: 3, reps: '12 each leg', rest: 60 },
      heavy: { sets: 3, reps: '10 each leg', rest: 60 }
    },
    {
      name: 'Leg Press',
      light: { sets: 3, reps: '15-20', rest: 60 },
      heavy: { sets: 4, reps: '8-10', rest: 60 }
    },
    {
      name: 'Calf Raises',
      light: { sets: 3, reps: '15-20', rest: 45 },
      heavy: { sets: 4, reps: '10-12', rest: 45 }
    },
    {
      name: 'Glute Bridges',
      light: { sets: 3, reps: '12-15', rest: 45 },
      heavy: { sets: 3, reps: '10-12', rest: 45 }
    }
  ],
  core: [
    {
      name: 'Plank Hold',
      light: { sets: 3, reps: '45-60s', rest: 60 },
      heavy: { sets: 3, reps: '60-90s', rest: 60 }
    },
    {
      name: 'Hanging Knee Raises',
      light: { sets: 3, reps: '10-12', rest: 60 },
      heavy: { sets: 3, reps: '12-15', rest: 60 }
    },
    {
      name: 'Russian Twists',
      light: { sets: 3, reps: '20 total', rest: 45 },
      heavy: { sets: 3, reps: '30 total', rest: 45 }
    },
    {
      name: 'Bicycle Crunches',
      light: { sets: 3, reps: '15-20', rest: 45 },
      heavy: { sets: 3, reps: '20-25', rest: 45 }
    },
    {
      name: 'Dead Bugs',
      light: { sets: 3, reps: '10-12', rest: 45 },
      heavy: { sets: 3, reps: '12-15', rest: 45 }
    },
    {
      name: 'Deep Squat Hold',
      light: { sets: 2, reps: '30-45s', rest: 60 },
      heavy: { sets: 2, reps: '45-60s', rest: 60 }
    }
  ],
  recovery: [
    {
      name: 'Cat-Cow',
      light: { sets: 2, reps: '10 reps', rest: 0 },
      heavy: { sets: 2, reps: '10 reps', rest: 0 }
    },
    {
      name: "World's Greatest Stretch",
      light: { sets: 2, reps: '5 each side', rest: 0 },
      heavy: { sets: 2, reps: '5 each side', rest: 0 }
    },
    {
      name: 'Hip Flexor Lunge Stretch',
      light: { sets: 2, reps: '45s each side', rest: 0 },
      heavy: { sets: 2, reps: '60s each side', rest: 0 }
    },
    {
      name: 'Thread the Needle',
      light: { sets: 2, reps: '30s each side', rest: 0 },
      heavy: { sets: 2, reps: '45s each side', rest: 0 }
    },
    {
      name: 'Dead Hangs',
      light: { sets: 3, reps: '20-30s', rest: 30 },
      heavy: { sets: 3, reps: '30-45s', rest: 30 }
    },
    {
      name: 'Easy Walk / Light Bike',
      light: { sets: 1, reps: '20-30 min', rest: 0 },
      heavy: { sets: 1, reps: '30-40 min', rest: 0 }
    }
  ],
  cardio: [
    {
      name: 'Warm-up Jog',
      light: { sets: 1, reps: '5-10 min', rest: 0 },
      heavy: { sets: 1, reps: '5 min', rest: 0 }
    },
    {
      name: 'Interval Cardio',
      light: { sets: 3, reps: '2 min work, 1 min easy', rest: 120 },
      heavy: { sets: 4, reps: '90s work, 90s easy', rest: 90 }
    },
    {
      name: 'Steady-state Finisher',
      light: { sets: 1, reps: '15-20 min', rest: 0 },
      heavy: { sets: 1, reps: '10-15 min', rest: 0 }
    },
    {
      name: 'Cooldown Stretch',
      light: { sets: 1, reps: '5-10 min', rest: 0 },
      heavy: { sets: 1, reps: '5-10 min', rest: 0 }
    }
  ]
};

const WARMUP = {
  push: [
    { name: 'Arm Circles', duration: '30s each direction', notes: 'Forward then backward, full range' },
    { name: 'Band Pull-Aparts', duration: '15 reps', notes: 'Opens chest, activates rear delts' },
    { name: 'Shoulder CARs', duration: '5 each side', notes: 'Slow controlled shoulder rotation' },
    { name: 'Push-up to Downward Dog', duration: '8 reps', notes: 'Slow and controlled, full hip extension' }
  ],
  pull: [
    { name: 'Arm Circles', duration: '30s each direction', notes: 'Forward then backward' },
    { name: 'Cat-Cow', duration: '10 reps', notes: 'Mobilize thoracic spine, breathe through it' },
    { name: 'Dead Hangs', duration: '30s', notes: 'Decompress spine, feel lats engage' },
    { name: 'Scapular Pull-ups', duration: '10 reps', notes: 'No elbow bend — just depress and elevate scapula' }
  ],
  legs: [
    { name: 'Hip Circles', duration: '10 each direction', notes: 'Standing, hands on hips, big circles' },
    { name: 'Leg Swings', duration: '10 each leg', notes: 'Front/back then lateral, hold something for balance' },
    { name: 'Bodyweight Squats', duration: '15 reps', notes: 'Full depth, 3-second descent, pause at bottom' },
    { name: 'Walking Lunges', duration: '10 each leg', notes: 'No weight, full stride, upright torso' },
    { name: 'Glute Bridges', duration: '15 reps', notes: 'Squeeze at top, activate glutes before loading' }
  ],
  core: [
    { name: 'Cat-Cow', duration: '10 reps', notes: 'Mobilize the lumbar spine, exhale to flex' },
    { name: 'Dead Bug', duration: '8 each side', notes: 'Slow, press lower back into floor' },
    { name: 'Hip Flexor Stretch', duration: '30s each side', notes: 'Kneeling lunge, upright torso, squeeze glute' },
    { name: 'Thoracic Rotations', duration: '10 each side', notes: 'Seated or quadruped, rotate through upper back' }
  ],
  cardio: [
    { name: 'Slow Walk / March', duration: '3 min', notes: 'Raise heart rate gradually, swing arms' },
    { name: 'Leg Swings', duration: '10 each leg', notes: 'Front/back and lateral' },
    { name: 'High Knees', duration: '30s', notes: 'Light pace, progressive' },
    { name: 'Butt Kicks', duration: '30s', notes: 'Easy, focus on full hip extension' }
  ],
  recovery: [
    { name: 'Box Breathing', duration: '2 min', notes: 'In 4 counts, hold 4, out 4, hold 4 — calm the nervous system' },
    { name: 'Neck Rolls', duration: '5 each direction', notes: 'Slow and gentle, ear toward shoulder' },
    { name: 'Shoulder Rolls', duration: '10 each direction', notes: 'Full range, backward then forward' }
  ]
};

const COOLDOWN = {
  push: [
    { name: 'Chest Doorway Stretch', duration: '45s each side', notes: 'Arm at 90°, lean forward slowly' },
    { name: 'Cross-Body Shoulder Stretch', duration: '30s each side', notes: 'Pull arm across chest, hold' },
    { name: 'Overhead Triceps Stretch', duration: '30s each side', notes: 'Elbow bent behind head, gently push down' },
    { name: "Child's Pose", duration: '60s', notes: 'Arms extended forward, breathe deep into back' }
  ],
  pull: [
    { name: 'Lat Overhead Stretch', duration: '45s each side', notes: 'Grab fixed object, lean and press hips away' },
    { name: 'Biceps Wall Stretch', duration: '30s each side', notes: 'Palm flat on wall, rotate body away slowly' },
    { name: 'Thread the Needle', duration: '30s each side', notes: 'Quadruped, slide arm under body, rotate upper back' },
    { name: "Child's Pose", duration: '60s', notes: 'Arms wide, breathe into the stretch' }
  ],
  legs: [
    { name: 'Standing Quad Stretch', duration: '45s each side', notes: 'Pull heel to glute, stand tall, squeeze glute' },
    { name: 'Seated Hamstring Stretch', duration: '45s each side', notes: 'Reach toward toes, flat back, breathe out' },
    { name: 'Figure-4 Glute Stretch', duration: '45s each side', notes: 'Lying on back or seated, foot over knee' },
    { name: 'Hip Flexor Lunge Stretch', duration: '45s each side', notes: 'Low lunge, push hips forward, stay upright' },
    { name: 'Calf Stretch', duration: '30s each side', notes: 'Wall push, heel pressed flat to floor' }
  ],
  core: [
    { name: 'Cobra Stretch', duration: '45s', notes: 'Press up, hips on floor, look forward, breathe' },
    { name: 'Seated Spinal Twist', duration: '45s each side', notes: 'Foot over knee, rotate tall, breathe out' },
    { name: 'Hip Flexor Lunge Stretch', duration: '45s each side', notes: 'Kneeling, hips forward, arms overhead' },
    { name: "Child's Pose", duration: '60s', notes: 'Full body release, deep slow breaths' }
  ],
  cardio: [
    { name: 'Slow Walk', duration: '3 min', notes: 'Bring heart rate down gradually' },
    { name: 'Standing Quad Stretch', duration: '45s each side', notes: 'Hold and breathe steadily' },
    { name: 'Hip Flexor Lunge Stretch', duration: '45s each side', notes: 'Low lunge, hips pressing forward' },
    { name: 'Seated Hamstring Stretch', duration: '45s each side', notes: 'Long exhale into the stretch' },
    { name: 'Chest Opener', duration: '60s', notes: 'Arms wide, chin up, slow deep breaths' }
  ],
  recovery: [
    { name: 'Full Body Shake-out', duration: '30s', notes: 'Relax everything, literally shake it loose' },
    { name: 'Supine Spinal Twist', duration: '60s each side', notes: 'On your back, knee crosses over, breathe deep' },
    { name: "Child's Pose", duration: '90s', notes: 'Arms forward, breathe into your lower back' },
    { name: 'Legs Up the Wall', duration: '3 min', notes: 'Feet up, passive — best recovery position there is' }
  ]
};

function getDayInfo(day) {
  if (day < 1 || day > 90) {
    return null;
  }

  let phaseInfo = PHASES[0];
  for (const phase of PHASES) {
    if (day >= phase.startDay && day <= phase.endDay) {
      phaseInfo = phase;
      break;
    }
  }

  const dayInPhase = day - phaseInfo.startDay;
  const dayInWeek = dayInPhase % 7;
  const rotation = ROTATIONS[phaseInfo.phase];
  const workoutType = rotation[dayInWeek];

  const weekNumber = Math.ceil(day / 7);

  return {
    day,
    phase: phaseInfo.phase,
    phaseName: phaseInfo.name,
    phaseDescription: phaseInfo.description,
    workoutType,
    weekNumber,
    isRest: workoutType === 'rest'
  };
}

function getExercises(workoutType, intensity) {
  if (workoutType === 'rest' || !EXERCISES[workoutType]) {
    return [];
  }

  return EXERCISES[workoutType].map(exercise => ({
    name: exercise.name,
    target: exercise[intensity],
    sets: Array(exercise[intensity].sets).fill(null).map(() => ({
      weight: '',
      reps: '',
      done: false
    }))
  }));
}
