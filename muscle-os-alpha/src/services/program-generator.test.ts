import { describe, it, expect } from 'vitest';
import { generateProgramFromIntake } from './program-generator';
import type { IntakeAssessment } from '../models/intake-assessment';

function createMockIntake(overrides: Partial<IntakeAssessment> = {}): IntakeAssessment {
  return {
    scores: { trainingHistory: 10, nutrition: 10, recovery: 10, adherence: 4, cardio: 3, total: 37 },
    flags: [],
    constraintProfile: {
      timeConstraint: 'none',
      equipment: 'full',
      injury: 'none',
      injuryLocation: 'none',
      lifestyleConstraint: 'none',
      adherenceFlag: 'none',
      multipleDietHistory: false,
      workType: 'sedentary',
      travelFreq: 'never',
    },
    archetype: 'Intermediate Plateaued',
    pillarPriorities: ['Training maxing — volume and program design are next'],
    cardioProfile: { sessionsPerWeek: '2', primaryType: 'walking', dailySteps: '5_8k' },
    psychProfile: { motivationSource: 'results', selfExperimentation: 'neutral', accountabilityPref: 'self' },
    sleepProfile: { chronotype: 'intermediate', caffeineTiming: 'morning_only' },
    nutritionDetail: { fiberServings: '2_3', supplements: ['protein'], digestiveHealth: 'good' },
    femaleHealth: { trackCycle: 'na', contraception: 'na', pregnancyStatus: 'na' },
    answers: {},
    ...overrides,
  };
}

describe('generateProgramFromIntake', () => {
  it('generates a Beginner program with Full Body 3x/week', () => {
    const intake = createMockIntake({ archetype: 'Beginner' });
    const program = generateProgramFromIntake(intake);
    expect(program.splitType).toBe('Full Body');
    expect(program.sessionsPerWeek).toBe(3);
    expect(program.sessions.length).toBe(3);
    for (const session of program.sessions) {
      expect(session.exercises.length).toBeGreaterThan(0);
      expect(session.name).toMatch(/^Full Body [ABC]$/);
    }
  });

  it('generates a Busy Professional program with Full Body 2x/week', () => {
    const intake = createMockIntake({ archetype: 'Busy Professional' });
    const program = generateProgramFromIntake(intake);
    expect(program.splitType).toBe('Full Body (Time-Efficient)');
    expect(program.sessionsPerWeek).toBe(2);
    expect(program.sessions.length).toBe(2);
    for (const session of program.sessions) {
      expect(session.exercises.length).toBeGreaterThan(0);
      expect(session.name).toMatch(/^Full Body [AB]$/);
    }
  });

  it('generates an Intermediate Plateaued program with Push/Pull/Legs 5x/week', () => {
    const intake = createMockIntake({ archetype: 'Intermediate Plateaued' });
    const program = generateProgramFromIntake(intake);
    expect(program.splitType).toBe('Push/Pull/Legs');
    expect(program.sessionsPerWeek).toBe(5);
    expect(program.sessions.length).toBe(5);
    const sessionNames = program.sessions.map(s => s.name);
    expect(sessionNames).toContain('Push');
    expect(sessionNames).toContain('Pull');
    expect(sessionNames).toContain('Legs');
    for (const session of program.sessions) {
      expect(session.exercises.length).toBeGreaterThan(0);
    }
  });

  it('generates a Masters Athlete program with recovery-focused split', () => {
    const intake = createMockIntake({ archetype: 'Masters Athlete', constraintProfile: { timeConstraint: 'none', equipment: 'full', injury: 'none', injuryLocation: 'none', lifestyleConstraint: 'none', adherenceFlag: 'none', multipleDietHistory: false, workType: 'sedentary', travelFreq: 'never' } });
    const program = generateProgramFromIntake(intake);
    expect(program.splitType).toBe('Full Body (Recovery-Focused)');
    expect(program.sessionsPerWeek).toBe(3);
    expect(program.sessions.length).toBe(3);
    for (const session of program.sessions) {
      expect(session.exercises.length).toBeGreaterThan(0);
    }
    expect(program.warmUp.length).toBeGreaterThanOrEqual(3);
  });

  it('generates a Fat Loss Client program with Upper/Lower 4x/week', () => {
    const intake = createMockIntake({ archetype: 'Fat Loss Client' });
    const program = generateProgramFromIntake(intake);
    expect(program.splitType).toBe('Upper/Lower');
    expect(program.sessionsPerWeek).toBe(4);
    expect(program.sessions.length).toBe(4);
    for (const session of program.sessions) {
      expect(session.exercises.length).toBeGreaterThan(0);
    }
  });

  it('respects minimal equipment constraints', () => {
    const intake = createMockIntake({
      archetype: 'Beginner',
      constraintProfile: { timeConstraint: 'none', equipment: 'minimal', injury: 'none', injuryLocation: 'none', lifestyleConstraint: 'none', adherenceFlag: 'none', multipleDietHistory: false, workType: 'sedentary', travelFreq: 'never' },
    });
    const program = generateProgramFromIntake(intake);
    for (const session of program.sessions) {
      for (const exercise of session.exercises) {
        expect(exercise.equipment.some(eq => ['bodyweight', 'band'].includes(eq))).toBe(true);
      }
    }
  });

  it('returns cardio recommendation when cardio profile is active', () => {
    const intake = createMockIntake({
      archetype: 'Endurance Hybrid',
      cardioProfile: { sessionsPerWeek: '3_4', primaryType: 'running', dailySteps: '8_10k' },
    });
    const program = generateProgramFromIntake(intake);
    expect(program.cardioRecommendation).not.toBeNull();
    expect(program.cardioRecommendation).toContain('3-4');
  });

  it('returns null cardio recommendation when no cardio', () => {
    const intake = createMockIntake({
      cardioProfile: { sessionsPerWeek: '0', primaryType: 'none', dailySteps: 'under_5k' },
    });
    const program = generateProgramFromIntake(intake);
    expect(program.cardioRecommendation).toBeNull();
  });

  it('includes pillar priority in notes', () => {
    const intake = createMockIntake({
      archetype: 'Beginner',
      pillarPriorities: ['Training maxing — volume and program design are next'],
    });
    const program = generateProgramFromIntake(intake);
    expect(program.notes.some(n => n.includes('Priority:'))).toBe(true);
  });

  it('returns exercises with valid muscle group mappings for Strength Athlete', () => {
    const intake = createMockIntake({ archetype: 'Strength Athlete' });
    const program = generateProgramFromIntake(intake);
    expect(program.splitType).toBe('Push/Pull/Legs');
    expect(program.sessionsPerWeek).toBe(5);
    const pushSession = program.sessions.find(s => s.name === 'Push')!;
    expect(pushSession.exercises.every(e => e.muscleGroup === 'chest' || e.muscleGroup === 'shoulders' || e.muscleGroup === 'triceps')).toBe(true);
  });
});
