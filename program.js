// P90X Lite - Workout Program Definition

const PHASES = [
  { phase: 1, name: 'Foundation', startDay: 1, endDay: 30, description: 'Build base strength and movement patterns' },
  { phase: 2, name: 'Intensity', startDay: 31, endDay: 60, description: 'Increase load and volume' },
  { phase: 3, name: 'Peak', startDay: 61, endDay: 90, description: 'Push intensity, refine weak points' }
];

const ROTATIONS = {
  1: ['push', 'rest', 'pull', 'legs', 'core', 'cardio', 'rest'],
  2: ['push', 'pull', 'legs', 'rest', 'core', 'cardio', 'rest'],
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
    subtitle: 'Recovery and preparation'
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
