import { describe, it, expect } from 'vitest';
import { assessConflicts, getGoalCompatibility } from './conflict-resolution-engine';

describe('conflict-resolution-engine', () => {
  describe('assessConflicts', () => {
    it('returns no conflicts for compatible goals', () => {
      const result = assessConflicts(['hypertrophy', 'strength']);
      expect(result.hasConflict).toBe(false);
    });

    it('detects fat_loss vs hypertrophy conflict', () => {
      const result = assessConflicts(['fat_loss', 'hypertrophy']);
      expect(result.hasConflict).toBe(true);
      expect(result.conflicts[0].type).toBe('fat_loss_vs_hypertrophy');
    });

    it('detects fat_loss vs strength conflict', () => {
      const result = assessConflicts(['fat_loss', 'strength']);
      expect(result.hasConflict).toBe(true);
      expect(result.conflicts[0].type).toBe('fat_loss_vs_strength');
    });

    it('detects hypertrophy vs endurance conflict', () => {
      const result = assessConflicts(['hypertrophy', 'endurance']);
      expect(result.hasConflict).toBe(true);
      expect(result.conflicts[0].type).toBe('hypertrophy_vs_endurance');
    });

    it('prioritizes health as primary goal', () => {
      const result = assessConflicts(['fat_loss', 'hypertrophy', 'health']);
      expect(result.primaryGoal).toBe('health');
    });

    it('returns a recommendation for the highest-priority conflict', () => {
      const result = assessConflicts(['fat_loss', 'hypertrophy']);
      expect(result.recommendation).toBeTruthy();
    });

    it('handles single goal without conflict', () => {
      const result = assessConflicts(['hypertrophy']);
      expect(result.hasConflict).toBe(false);
    });

    it('handles recomp + fat_loss as conflict', () => {
      const result = assessConflicts(['fat_loss', 'recomp']);
      expect(result.hasConflict).toBe(true);
    });

    it('deduplicates duplicate goals', () => {
      const result = assessConflicts(['hypertrophy', 'hypertrophy', 'strength']);
      expect(result.hasConflict).toBe(false);
    });
  });

  describe('getGoalCompatibility', () => {
    it('returns synergistic for hypertrophy + strength', () => {
      expect(getGoalCompatibility('hypertrophy', 'strength')).toBe('synergistic');
    });

    it('returns conflicting for fat_loss + hypertrophy', () => {
      expect(getGoalCompatibility('fat_loss', 'hypertrophy')).toBe('conflicting');
    });

    it('returns conflicting for endurance + hypertrophy (alphabetical sorting)', () => {
      expect(getGoalCompatibility('endurance', 'hypertrophy')).toBe('conflicting');
    });

    it('returns neutral for maintenance + recomp', () => {
      expect(getGoalCompatibility('maintenance', 'recomp')).toBe('neutral');
    });
  });
});
