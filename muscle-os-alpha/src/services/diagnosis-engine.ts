export type EntryPath = 'plateau' | 'recovery' | 'starting' | 'returning';

export function classifyEntry(input: string): EntryPath {
  const lower = input.toLowerCase();
  if (lower.includes('result') || lower.includes('plateau') || lower.includes('stuck') || lower.includes('progress')) {
    return 'plateau';
  }
  if (lower.includes('tired') || lower.includes('recover') || lower.includes('fatigue') || lower.includes('sleep')) {
    return 'recovery';
  }
  if (lower.includes('start') || lower.includes('begin') || lower.includes('new') || lower.includes('first')) {
    return 'starting';
  }
  if (lower.includes('break') || lower.includes('back') || lower.includes('return') || lower.includes('pause')) {
    return 'returning';
  }
  return 'plateau';
}

export interface PlateauFindings {
  technique: boolean;
  sleep: boolean;
  stress: boolean;
  adherence: boolean;
  deficitAdherence?: boolean;
  weeksStuck?: boolean;
  progression?: boolean;
  volumeTooHigh?: boolean;
  recoveryIssue?: boolean;
}

export function diagnosePlateau(goal: string, answers: Record<string, boolean>): PlateauFindings {
  return {
    technique: answers.technique ?? false,
    sleep: answers.sleep ?? false,
    stress: answers.stress ?? false,
    adherence: answers.adherence ?? true,
    deficitAdherence: goal === 'fat_loss' || goal === 'recomp' ? (answers.deficitAdherence ?? true) : undefined,
    weeksStuck: goal === 'fat_loss' || goal === 'recomp' ? (answers.weeksStuck ?? false) : undefined,
    progression: goal === 'hypertrophy' || goal === 'strength' ? (answers.progression ?? true) : undefined,
    volumeTooHigh: goal === 'hypertrophy' || goal === 'strength' ? (answers.volumeTooHigh ?? false) : undefined,
    recoveryIssue: (answers.sleep ?? false) || (answers.stress ?? false),
  };
}

export interface RecoveryFindings {
  sleep: boolean;
  trainingFreq: boolean;
  lifeStress: boolean;
  nutrition: boolean;
  deload: boolean;
}

export function diagnoseRecovery(answers: Record<string, boolean>): RecoveryFindings {
  return {
    sleep: answers.sleep ?? false,
    trainingFreq: answers.trainingFreq ?? false,
    lifeStress: answers.lifeStress ?? false,
    nutrition: answers.nutrition ?? false,
    deload: answers.deload ?? true,
  };
}

export interface NewUserFindings {
  goal: string;
  profile: string;
  tracking: boolean;
  trainingHistory: boolean;
}

export function diagnoseNewUser(goal: string, profile: string, answers: Record<string, boolean>): NewUserFindings {
  return {
    goal,
    profile,
    tracking: answers.tracking ?? true,
    trainingHistory: answers.trainingHistory ?? true,
  };
}

export interface ReturningFindings {
  daysAway: number;
  previousActivity: string;
}

export function diagnoseReturning(daysAway: number, previousActivity: string): ReturningFindings {
  return { daysAway, previousActivity };
}

export function getPlateauQuestions(goal?: string): { key: string; label: string; options: string[] }[] {
  const base = [
    { key: 'technique', label: 'Do your later sets look as clean as your first set?', options: ['yes', 'no'] },
    { key: 'sleep', label: 'Are you sleeping less than 7 hours per night?', options: ['yes', 'no'] },
    { key: 'stress', label: 'Is life stress high or overwhelming?', options: ['yes', 'no'] },
    { key: 'adherence', label: 'Been consistent with nutrition (>80% of days)?', options: ['yes', 'no'] },
  ];

  const isFatGoal = goal === 'fat_loss' || goal === 'recomp' || goal === 'lose_significant' || goal === 'lose_moderate' || goal === 'lose_small' || goal === 'maintain';
  const isGainGoal = goal === 'hypertrophy' || goal === 'strength' || goal === 'gain_muscle';

  if (isFatGoal) {
    return [
      ...base,
      { key: 'weeksStuck', label: 'Has your weight been stable for 3+ weeks despite being in a deficit?', options: ['yes', 'no'] },
      { key: 'deficitAdherence', label: 'Are you tracking calories accurately (weighing food, logging everything)?', options: ['yes', 'no'] },
    ];
  }

  if (isGainGoal) {
    return [
      ...base,
      { key: 'progression', label: 'Have you been progressively overloading (adding reps/weight) most sessions?', options: ['yes', 'no'] },
      { key: 'volumeTooHigh', label: 'Do you feel constantly sore, tired, or like youre accumulating fatigue?', options: ['yes', 'no'] },
    ];
  }

  return base;
}

export function getRecoveryQuestions(): { key: string; label: string; options: string[] }[] {
  return [
    { key: 'sleep', label: 'Sleeping less than 7 hours consistently?', options: ['yes', 'no'] },
    { key: 'trainingFreq', label: 'Training 5+ days per week?', options: ['yes', 'no'] },
    { key: 'lifeStress', label: 'Life stress higher than usual?', options: ['yes', 'no'] },
    { key: 'nutrition', label: 'Been in a calorie deficit for 8+ weeks?', options: ['yes', 'no'] },
    { key: 'deload', label: 'Had a deload week in the last 6 weeks?', options: ['yes', 'no'] },
  ];
}

export function getNewUserQuestions(): { key: string; label: string; options: string[] }[] {
  return [
    { key: 'tracking', label: 'Willing to track food intake?', options: ['yes', 'no'] },
    { key: 'trainingHistory', label: 'Followed a structured program before?', options: ['yes', 'no'] },
  ];
}

export function getReturningQuestions(): { key: string; label: string; options: string[] }[] {
  return [
    { key: 'daysAway', label: 'How long has it been since you last trained consistently?', options: ['<2 weeks', '2-4 weeks', '1-3 months', '3+ months'] },
    { key: 'previousActivity', label: 'What was your previous training focus?', options: ['hypertrophy', 'strength', 'fat loss', 'general fitness'] },
  ];
}
