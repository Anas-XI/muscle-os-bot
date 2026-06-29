// Conflict Resolution Engine — handles conflicting training/nutrition goals
// When a user has multiple goals that pull in opposite directions, this engine
// determines the optimal prioritization and compromise strategy.

export type UserGoal = 'fat_loss' | 'hypertrophy' | 'strength' | 'recomp' | 'maintenance' | 'endurance' | 'health';
export type ConflictType =
  | 'fat_loss_vs_hypertrophy'     // deficit impairs MPS
  | 'fat_loss_vs_strength'        // deficit impairs CNS recovery, strength expression
  | 'hypertrophy_vs_endurance'    // AMPK-mTOR interference
  | 'strength_vs_endurance'       // CNS fatigue + interference
  | 'fat_loss_vs_recomp';         // recomp requires surplus cycling
export type Priority = 'primary' | 'secondary' | 'tertiary';

interface ConflictRule {
  type: ConflictType;
  detect: (goals: UserGoal[]) => boolean;
  priority: number;
  resolution: string;
  compromise: string;
  timeWindow: string;
}

const CONFLICT_RULES: ConflictRule[] = [
  {
    type: 'fat_loss_vs_hypertrophy',
    priority: 1,
    detect: (goals) => goals.includes('fat_loss') && goals.includes('hypertrophy'),
    resolution: 'Prioritize fat loss as primary goal. Use maintenance-level training volume (MEV) to preserve muscle. Protein at 2.2-2.4 g/kg. Accept slower muscle gain — fat loss and hypertrophy are largely incompatible simultaneously.',
    compromise: 'Run 4-6 week fat loss phase, then 4-6 week maintenance phase, then 4-6 week hypertrophy phase. Alternate, do not attempt simultaneously.',
    timeWindow: 'Phased approach over 12-16 weeks',
  },
  {
    type: 'fat_loss_vs_strength',
    priority: 2,
    detect: (goals) => goals.includes('fat_loss') && goals.includes('strength'),
    resolution: 'Modest deficit (300-500 kcal) is compatible with strength maintenance but not significant strength gain. Expect 5-15% strength drop during deficit. Prioritize strength maintenance by keeping training at 80%+ 1RM with reduced volume.',
    compromise: 'Run strength maintenance phase during deficit (keep intensity high, drop volume 20-30%). Full strength phase after deficit ends.',
    timeWindow: 'Strength maintenance during deficit; 4-6 week strength block after',
  },
  {
    type: 'hypertrophy_vs_endurance',
    priority: 3,
    detect: (goals) => goals.includes('hypertrophy') && (goals.includes('endurance') || goals.includes('health')),
    resolution: 'Keep endurance work to <3h/week, separated by 6h+ from resistance training. Perform resistance first in same-session training. Cap endurance at 5 sessions/week.',
    compromise: 'Use HIIT (2x/week, 15-20 min) for metabolic benefit without significant interference. Save long LISS for rest days.',
    timeWindow: 'Ongoing with separation rules',
  },
  {
    type: 'strength_vs_endurance',
    priority: 4,
    detect: (goals) => goals.includes('strength') && (goals.includes('endurance') || goals.includes('health')),
    resolution: 'Endurance work directly impairs strength gains via CNS fatigue and AMPK-mTOR interference. Limit to 2x/week HIIT or 1x/week LISS separated 6h+ from strength work.',
    compromise: 'Periodize: 8-week strength block (no endurance), then 4-week hybrid block (maintain strength, build endurance base).',
    timeWindow: 'Separate sessions by 6h+ minimum',
  },
  {
    type: 'fat_loss_vs_recomp',
    priority: 5,
    detect: (goals) => goals.includes('fat_loss') && goals.includes('recomp'),
    resolution: 'Recomp and fat loss are compatible when energy flux is high. Prioritize high protein (2.2-2.4 g/kg), high training volume (at MEV), and modest deficit (300-500 kcal). Recomp is slower than dedicated fat loss.',
    compromise: 'Use calorie cycling: deficit on rest days, maintenance or slight surplus on training days. This creates the energy flux that enables recomp.',
    timeWindow: '8-12 weeks for visible recomp results',
  },
];

interface ConflictAssessment {
  hasConflict: boolean;
  conflicts: {
    type: ConflictType;
    resolution: string;
    compromise: string;
    timeWindow: string;
    priority: Priority;
  }[];
  recommendation: string;
  primaryGoal: UserGoal | null;
}

export function assessConflicts(goals: UserGoal[]): ConflictAssessment {
  const uniqueGoals = [...new Set(goals)];
  const activeConflicts = CONFLICT_RULES
    .filter(rule => rule.detect(uniqueGoals))
    .sort((a, b) => a.priority - b.priority);

  if (activeConflicts.length === 0) {
    return {
      hasConflict: false,
      conflicts: [],
      recommendation: 'No conflicting goals detected. Current combination is synergistic.',
      primaryGoal: uniqueGoals[0],
    };
  }

  // Determine primary goal from conflict resolution
  const primaryGoal = determinePrimaryGoal(uniqueGoals, activeConflicts);
  const assigned: Priority[] = ['primary', 'secondary', 'tertiary'];

  return {
    hasConflict: true,
    conflicts: activeConflicts.map((c, i) => ({
      type: c.type,
      resolution: c.resolution,
      compromise: c.compromise,
      timeWindow: c.timeWindow,
      priority: assigned[Math.min(i, assigned.length - 1)] as Priority,
    })),
    recommendation: activeConflicts[0].resolution,
    primaryGoal,
  };
}

function determinePrimaryGoal(goals: UserGoal[], conflicts: ConflictRule[]): UserGoal | null {
  // Heuristic: fat loss or health usually takes priority in conflicts
  if (goals.includes('health')) return 'health';
  if (goals.includes('fat_loss')) return 'fat_loss';
  if (goals.includes('recomp')) return 'recomp';
  if (goals.includes('hypertrophy')) return 'hypertrophy';
  if (goals.includes('strength')) return 'strength';
  if (goals.includes('maintenance')) return 'maintenance';
  if (goals.includes('endurance')) return 'endurance';
  return goals[0] ?? null;
}

export function getGoalCompatibility(goalA: UserGoal, goalB: UserGoal): 'synergistic' | 'neutral' | 'conflicting' {
  const synergistic: [UserGoal, UserGoal][] = [
    ['hypertrophy', 'strength'],
    ['fat_loss', 'health'],
    ['hypertrophy', 'recomp'],
    ['strength', 'recomp'],
    ['maintenance', 'health'],
  ];
  const conflicting: [UserGoal, UserGoal][] = [
    ['endurance', 'fat_loss'],
    ['endurance', 'hypertrophy'],
    ['endurance', 'strength'],
    ['fat_loss', 'hypertrophy'],
    ['fat_loss', 'strength'],
  ];

  const pair: [UserGoal, UserGoal] = goalA < goalB ? [goalA, goalB] : [goalB, goalA];
  if (synergistic.some(s => s[0] === pair[0] && s[1] === pair[1])) return 'synergistic';
  if (conflicting.some(c => c[0] === pair[0] && c[1] === pair[1])) return 'conflicting';
  return 'neutral';
}
