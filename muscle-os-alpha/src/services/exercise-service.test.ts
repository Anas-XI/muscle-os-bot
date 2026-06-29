import { describe, it, expect } from 'vitest';
import {
  getAllExercises,
  getExercisesByMuscleGroup,
  getExercisesByLevel,
  searchExercises,
  getExerciseById,
  getMuscleGroups,
  filterByEquipment,
  generateProgram,
  getSFRRatingColor,
  getLevelLabel,
} from './exercise-service';

describe('exercise-service', () => {
  describe('getAllExercises', () => {
    it('returns at least 50 exercises across all muscle groups', () => {
      const exercises = getAllExercises();
      expect(exercises.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('getExercisesByMuscleGroup', () => {
    it('returns chest exercises', () => {
      const chest = getExercisesByMuscleGroup('chest');
      expect(chest.length).toBeGreaterThan(0);
      expect(chest[0].muscleGroup).toBe('chest');
    });

    it('returns exercises for unknown group', () => {
      const result = getExercisesByMuscleGroup('abs' as any);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getExercisesByLevel', () => {
    it('returns novice exercises', () => {
      const novice = getExercisesByLevel('novice');
      expect(novice.length).toBeGreaterThan(0);
    });

    it('returns intermediate exercises', () => {
      const intermediate = getExercisesByLevel('intermediate');
      expect(intermediate.length).toBeGreaterThan(0);
    });
  });

  describe('searchExercises', () => {
    it('finds bench press by name', () => {
      const results = searchExercises('bench');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(e => e.name.toLowerCase().includes('bench'))).toBe(true);
    });

    it('finds exercises by muscle group', () => {
      const results = searchExercises('chest');
      expect(results.some(e => e.muscleGroup === 'chest')).toBe(true);
    });
  });

  describe('getExerciseById', () => {
    it('returns exercise by ID', () => {
      const ex = getExerciseById('chest-01');
      expect(ex).toBeDefined();
      expect(ex?.name).toBe('Flat Barbell Bench Press');
    });

    it('returns undefined for unknown ID', () => {
      expect(getExerciseById('unknown')).toBeUndefined();
    });
  });

  describe('getMuscleGroups', () => {
    it('returns all muscle groups', () => {
      const groups = getMuscleGroups();
      expect(groups).toContain('chest');
      expect(groups).toContain('back');
      expect(groups).toContain('quads');
    });
  });

  describe('filterByEquipment', () => {
    it('filters by barbell', () => {
      const results = filterByEquipment('barbell');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(e => e.equipment.includes('barbell'))).toBe(true);
    });

    it('filters by bodyweight', () => {
      const results = filterByEquipment('bodyweight');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('generateProgram', () => {
    it('generates a program for given muscle groups', () => {
      const program = generateProgram({
        muscleGroups: ['chest', 'back', 'quads'],
        level: 'novice',
        equipment: ['barbell', 'dumbbell'],
        sessionsPerWeek: 3,
      });
      expect(program.length).toBeGreaterThan(0);
      const groups = program.map(e => e.muscleGroup);
      expect(new Set(groups).size).toBeGreaterThanOrEqual(2);
    });

    it('excludes advanced exercises by default', () => {
      const program = generateProgram({
        muscleGroups: ['chest'],
        level: 'novice',
        equipment: ['barbell'],
        sessionsPerWeek: 3,
      });
      program.forEach(e => {
        expect(e.level).not.toBe('advanced');
      });
    });
  });

  describe('helper functions', () => {
    it('getSFRRatingColor returns correct color', () => {
      expect(getSFRRatingColor('high')).toBe('text-emerald-400');
      expect(getSFRRatingColor('medium')).toBe('text-amber-400');
      expect(getSFRRatingColor('low')).toBe('text-red-400');
    });

    it('getLevelLabel returns correct label', () => {
      expect(getLevelLabel('novice')).toContain('beginner');
      expect(getLevelLabel('intermediate')).toContain('control');
      expect(getLevelLabel('advanced')).toContain('experienced');
    });
  });
});
