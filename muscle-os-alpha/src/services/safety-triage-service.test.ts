import { describe, it, expect } from 'vitest';
import { computeTriage, QUESTIONNAIRE } from './safety-triage-service';

function safeAnswers(): Record<string, string> {
  return {
    A1: 'no', A2: 'no', A3: 'no', A4: 'no', A5: 'no', A6: 'no',
    B1: 'no', B2: 'no', B3: 'never', B4: 'rarely', B5: 'no', B6: 'no', B7: 'no_or_na', B8: 'no',
    C1: 'rarely', C2: 'no', C3: 'no', C4: 'no',
    D1: 'no', D2: 'no',
    E1: 'no', E2: 'no', E3: 'no_or_untested', E4: 'five_plus', E5: 'no',
  };
}

describe('computeTriage', () => {
  it('returns Green when all answers are safe', () => {
    const result = computeTriage(safeAnswers());
    expect(result.result).toBe('Green');
    expect(result.flagged).toHaveLength(0);
  });

  it('returns Red for unmanaged medical conditions', () => {
    const answers = { ...safeAnswers(), A1: 'unmanaged' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Red');
    expect(result.flagged).toContain('Medical conditions');
  });

  it('returns Red for active eating disorder', () => {
    const answers = { ...safeAnswers(), B1: 'active' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Red');
  });

  it('returns Yellow for managed medical conditions', () => {
    const answers = { ...safeAnswers(), A1: 'managed' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Yellow');
  });

  it('returns Red for 75+ age with multiple conditions', () => {
    const answers = { ...safeAnswers(), D2: '75_plus_or_multiple' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Red');
  });

  it('returns Red for active purging', () => {
    const answers = { ...safeAnswers(), B3: 'current_recent' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Red');
  });

  it('returns Yellow for supervised calorie restriction', () => {
    const answers = { ...safeAnswers(), B6: 'supervised' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Yellow');
  });

  it('skips A4b when A4 is not suspected', () => {
    const answers = { ...safeAnswers(), A4b: '3_plus' };
    const result = computeTriage(answers);
    expect(result.result).toBe('Green');
  });

  it('flags A4b when A4 is suspected', () => {
    const answers = { ...safeAnswers(), A4: 'suspected', A4b: '3_plus' };
    const result = computeTriage(answers);
    // A4b '3_plus' = risk 2 (Red) — sleep apnea indicators are serious
    expect(result.result).toBe('Red');
    expect(result.flagged).toContain('OSA indicators (A4b)');
  });

  it('prioritizes highest risk level across all answers', () => {
    const answers = { ...safeAnswers(), A1: 'managed', C1: 'often' };
    const result = computeTriage(answers);
    // C1 'often' = risk 2 (Red), A1 'managed' = risk 1 (Yellow)
    expect(result.result).toBe('Red');
  });
});
