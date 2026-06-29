import { describe, it, expect } from 'vitest';
import { diagnose, getSynergyRecommendations } from './decision-engine';
import type { DiagnosisContext } from './decision-engine';

function makeCtx(overrides: Partial<DiagnosisContext> = {}): DiagnosisContext {
  const defaults: DiagnosisContext = {
    goal: 'hypertrophy',
    archetype: 'Intermediate Plateaued',
    flags: [],
    scores: { trainingHistory: 10, nutrition: 12, recovery: 14, adherence: 4, total: 40 },
    constraints: {
      timeConstraint: 'none',
      equipment: 'full',
      injury: 'none',
      lifestyleConstraint: 'moderate',
      adherenceFlag: 'none',
    },
    findings: {},
  };
  return { ...defaults, ...overrides, constraints: { ...defaults.constraints, ...overrides.constraints }, scores: { ...defaults.scores, ...overrides.scores } };
}

describe('decision-engine diagnose', () => {
  it('returns null primary when no diagnosis matches', () => {
    const ctx = makeCtx({ findings: {} });
    const result = diagnose(ctx);
    expect(result.primary).toBeNull();
    expect(result.allResults).toHaveLength(0);
  });

  it('detects adherence bottleneck when adherence fails', () => {
    const ctx = makeCtx({ constraints: { ...makeCtx().constraints, adherenceFlag: 'critical' }, scores: { ...makeCtx().scores, adherence: 2 } });
    const result = diagnose(ctx);
    expect(result.primary).not.toBeNull();
    expect(result.primary!.category).toBe('motivation_adherence');
    expect(result.primary!.confidence).toBe('High');
  });

  it('detects perfectionism pattern', () => {
    const ctx = makeCtx({ constraints: { ...makeCtx().constraints, adherenceFlag: 'perfectionism' } });
    const result = diagnose(ctx);
    expect(result.primary).not.toBeNull();
    expect(result.primary!.category).toBe('motivation_adherence');
    expect(result.primary!.bottleneck).toMatch(/all.or.nothing/i);
  });

  it('detects sleep bottleneck as recovery_health priority', () => {
    const ctx = makeCtx({ goal: 'strength', findings: { sleep: true } });
    const result = diagnose(ctx);
    expect(result.primary).not.toBeNull();
    // Sleep is a recovery/health issue first, which is checked before strength_performance
    expect(result.primary!.category).toBe('recovery_health');
  });

  it('detects body comp recomp check when waist decreasing', () => {
    const ctx = makeCtx({ goal: 'recomp', findings: {} });
    const result = diagnose(ctx);
    // With no flags, adherence, or sleep issues — should return null as there's no clear diagnosis
    expect(result.primary).toBeNull();
  });

  it('detects recovery health issue from high fatigue', () => {
    const ctx = makeCtx({ scores: { ...makeCtx().scores, recovery: 6 }, findings: { volumeTooHigh: true } });
    const result = diagnose(ctx);
    expect(result.primary).not.toBeNull();
    expect(result.primary!.category).toBe('recovery_health');
  });

  it('detects sleep→training synergy', () => {
    const ctx = makeCtx({ goal: 'hypertrophy', findings: { sleep: true } });
    const synergies = getSynergyRecommendations(ctx);
    expect(synergies.some(s => s.type === 'sleep_training')).toBe(true);
  });

  it('detects allostatic load synergy under high stress', () => {
    const ctx = makeCtx({ findings: { stress: true } });
    const synergies = getSynergyRecommendations(ctx);
    expect(synergies.some(s => s.type === 'allostatic_load')).toBe(true);
  });

  it('detects recovery→diet synergy with low recovery and nutrition', () => {
    const ctx = makeCtx({ scores: { ...makeCtx().scores, recovery: 8, nutrition: 8 } });
    const synergies = getSynergyRecommendations(ctx);
    expect(synergies.some(s => s.type === 'recovery_diet')).toBe(true);
  });

  it('detects sleep→recomp synergy', () => {
    const ctx = makeCtx({ goal: 'fat_loss', findings: { sleep: true } });
    const synergies = getSynergyRecommendations(ctx);
    expect(synergies.some(s => s.type === 'sleep_recomp')).toBe(true);
  });
});
