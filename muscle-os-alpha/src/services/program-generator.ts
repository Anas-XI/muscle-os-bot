import type { IntakeAssessment } from '../models/intake-assessment';
import {
  generateProgram,
  type Exercise,
  type MuscleGroup,
  type ExerciseLevel,
  type Equipment,
} from './exercise-service';

export interface ProgramSession {
  name: string;
  exercises: Exercise[];
}

export interface Program {
  splitType: string;
  sessionsPerWeek: number;
  sessions: ProgramSession[];
  warmUp: string[];
  cardioRecommendation: string | null;
  notes: string[];
}

const EQUIPMENT_MAP: Record<IntakeAssessment['constraintProfile']['equipment'], Equipment[]> = {
  minimal: ['bodyweight'],
  home_light: ['bodyweight', 'band', 'dumbbell'],
  home_full: ['barbell', 'dumbbell', 'kettlebell', 'band', 'bodyweight', 'ez_bar'],
  full: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'band', 'ez_bar', 'smith', 'kettlebell', 'trap_bar'],
  na: ['bodyweight'],
};

const LEVEL_MAP: Record<IntakeAssessment['archetype'], ExerciseLevel> = {
  Beginner: 'novice',
  'Endurance Hybrid': 'intermediate',
  'Busy Professional': 'novice',
  'Masters Athlete': 'intermediate',
  'Fat Loss Client': 'novice',
  'Intermediate Plateaued': 'intermediate',
  'Strength Athlete': 'intermediate',
};

interface SplitDefinition {
  name: string;
  sessions: { name: string; groups: MuscleGroup[] }[];
  baseNotes: string[];
}

const SPLITS: Record<IntakeAssessment['archetype'], SplitDefinition> = {
  Beginner: {
    name: 'Full Body',
    sessions: [
      { name: 'Full Body A', groups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'biceps', 'triceps', 'abs'] as MuscleGroup[] },
      { name: 'Full Body B', groups: ['chest', 'back', 'shoulders', 'glutes', 'hamstrings', 'biceps', 'triceps', 'abs'] as MuscleGroup[] },
      { name: 'Full Body C', groups: ['chest', 'back', 'shoulders', 'quads', 'glutes', 'biceps', 'triceps', 'abs'] as MuscleGroup[] },
    ],
    baseNotes: ['Focus on compound movements', 'Progressive overload: add 2.5-5kg per week when reps are achieved'],
  },
  'Endurance Hybrid': {
    name: 'Upper/Lower + Cardio',
    sessions: [
      { name: 'Upper A', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Lower A', groups: ['quads', 'hamstrings', 'glutes', 'abs', 'calves'] as MuscleGroup[] },
      { name: 'Upper B', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Lower B', groups: ['quads', 'hamstrings', 'glutes', 'abs', 'calves'] as MuscleGroup[] },
    ],
    baseNotes: ['Separate cardio and resistance sessions by 6+ hours when possible', 'Keep resistance sessions under 45 min to manage concurrent training interference'],
  },
  'Busy Professional': {
    name: 'Full Body (Time-Efficient)',
    sessions: [
      { name: 'Full Body A', groups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Full Body B', groups: ['chest', 'back', 'shoulders', 'glutes', 'hamstrings', 'biceps', 'triceps'] as MuscleGroup[] },
    ],
    baseNotes: ['Superset antagonistic pairs to save time', 'Keep sessions under 45 min', 'Prioritize compound lifts'],
  },
  'Masters Athlete': {
    name: 'Full Body (Recovery-Focused)',
    sessions: [
      { name: 'Full Body A', groups: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Full Body B', groups: ['chest', 'back', 'shoulders', 'glutes', 'hamstrings', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Full Body C', groups: ['chest', 'back', 'shoulders', 'quads', 'glutes', 'biceps', 'triceps'] as MuscleGroup[] },
    ],
    baseNotes: ['Lower volume: 2-3 working sets per exercise', 'Longer rest periods (2-3 min)', 'Prioritize joint health — avoid movements that cause discomfort'],
  },
  'Fat Loss Client': {
    name: 'Upper/Lower',
    sessions: [
      { name: 'Upper A', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Lower A', groups: ['quads', 'hamstrings', 'glutes', 'abs', 'calves'] as MuscleGroup[] },
      { name: 'Upper B', groups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] as MuscleGroup[] },
      { name: 'Lower B', groups: ['quads', 'hamstrings', 'glutes', 'abs', 'calves'] as MuscleGroup[] },
    ],
    baseNotes: ['Maintain intensity (keep RPE 7-8) even in a deficit', 'Add 15-20 min LISS cardio post-session if time allows'],
  },
  'Intermediate Plateaued': {
    name: 'Push/Pull/Legs',
    sessions: [
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'] as MuscleGroup[] },
      { name: 'Pull', groups: ['back', 'biceps', 'abs'] as MuscleGroup[] },
      { name: 'Legs', groups: ['quads', 'hamstrings', 'glutes', 'calves'] as MuscleGroup[] },
      { name: 'Push B', groups: ['chest', 'shoulders', 'triceps'] as MuscleGroup[] },
      { name: 'Pull B', groups: ['back', 'biceps', 'abs'] as MuscleGroup[] },
    ],
    baseNotes: ['Use double progression: add reps first, then weight', 'Consider deload every 4-6 weeks', 'Add variation within the same movement pattern'],
  },
  'Strength Athlete': {
    name: 'Push/Pull/Legs',
    sessions: [
      { name: 'Push', groups: ['chest', 'shoulders', 'triceps'] as MuscleGroup[] },
      { name: 'Pull', groups: ['back', 'biceps', 'abs'] as MuscleGroup[] },
      { name: 'Legs', groups: ['quads', 'hamstrings', 'glutes', 'calves'] as MuscleGroup[] },
      { name: 'Push B', groups: ['chest', 'shoulders', 'triceps'] as MuscleGroup[] },
      { name: 'Pull B', groups: ['back', 'biceps', 'abs'] as MuscleGroup[] },
    ],
    baseNotes: ['Periodize main lifts (4-6 week blocks)', 'Heavy compound focus at 3-5 rep range for strength'],
  },
};

function getCardioRecommendation(cardioProfile: IntakeAssessment['cardioProfile']): string | null {
  const { sessionsPerWeek, primaryType, dailySteps } = cardioProfile;
  if (sessionsPerWeek === '0') return null;

  const sessions = sessionsPerWeek.replace('_', '-');
  const typeLabel = primaryType === 'none' ? '' : ` (${primaryType})`;
  let recommendation = `Maintain ${sessions} cardio sessions per week${typeLabel}`;

  if (dailySteps === 'under_5k') {
    recommendation += '. Aim to increase daily steps above 8,000';
  }

  return recommendation;
}

function getWarmUp(archetype: IntakeAssessment['archetype']): string[] {
  const general = ['5-10 min light cardio (walking, cycling, or jump rope)', 'Dynamic stretches for target muscle groups'];
  if (archetype === 'Masters Athlete') {
    return [...general, 'Extended warm-up: 10-15 min with specific activation drills'];
  }
  return general;
}

export function generateProgramFromIntake(intakeResult: IntakeAssessment): Program {
  const { archetype, constraintProfile, pillarPriorities, cardioProfile } = intakeResult;
  const split = SPLITS[archetype];
  const equipment = EQUIPMENT_MAP[constraintProfile.equipment];
  const level = LEVEL_MAP[archetype];

  const sessions: ProgramSession[] = split.sessions.map(session => {
    const exercises = generateProgram({
      muscleGroups: session.groups,
      level,
      equipment,
      sessionsPerWeek: split.sessions.length,
    });
    return { name: session.name, exercises };
  });

  const warmUp = getWarmUp(archetype);
  const cardioRecommendation = getCardioRecommendation(cardioProfile);

  const notes = [...split.baseNotes];
  if (pillarPriorities.length > 0) {
    notes.push(`Priority: ${pillarPriorities[0]}`);
  }

  return {
    splitType: split.name,
    sessionsPerWeek: split.sessions.length,
    sessions,
    warmUp,
    cardioRecommendation,
    notes,
  };
}
