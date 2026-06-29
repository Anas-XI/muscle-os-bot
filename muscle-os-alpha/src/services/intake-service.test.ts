import { describe, it, expect, beforeEach } from 'vitest';
import { computeIntakeAssessment } from './intake-service';

function makeAnswers(overrides: Record<string, string> = {}): Record<string, string> {
  const defaults: Record<string, string> = {
    Q1: '2_4', Q2: '3', Q3: '3_4', Q4: 'skip', Q5: '18_25',
    Q6: 'gain_muscle', Q7: '25_39', Q8: 'male',
    Q9: '1_6_2_0', Q10: '2', Q11: 'most_days', Q12: 'no',
    Q13: '7_8', Q14: '6_7', Q15: '4_5', Q16: '3',
    Q17: '3_4', Q18: '45_60', Q19: 'commercial', Q20: 'no',
    Q21: 'moderate', Q22: '80_90', Q23: 'reschedule',
    Q24: '2', Q25: 'walking', Q26: '8_10k',
    Q27: '4_5', Q28: 'protein_creatine', Q29: 'good',
    Q30: 'intermediate', Q31: 'morning_only',
    Q32: 'none', Q33: 'sedentary', Q34: 'never',
    Q35: 'results', Q36: 'somewhat_open', Q37: 'app_reminders',
    Q38: 'na', Q39: 'na', Q40: 'na',
  };
  return { ...defaults, ...overrides };
}

describe('computeIntakeAssessment', () => {
  it('classifies Beginner for low training score', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q1: 'less_1', Q2: '0_1', Q3: 'none' }));
    expect(result.archetype).toBe('Beginner');
  });

  it('classifies Busy Professional under severe time constraints', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q17: '1_or_fewer', Q18: 'under_30', Q7: '40_54' }));
    expect(result.archetype).toBe('Busy Professional');
  });

  it('classifies Fat Loss Client with high body fat and fat loss goal', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q5: 'over_25', Q6: 'lose_significant', Q7: '40_54' }));
    expect(result.archetype).toBe('Fat Loss Client');
  });

  it('classifies Masters Athlete for 55+ age', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q7: '55_plus' }));
    expect(result.archetype).toBe('Masters Athlete');
  });

  it('classifies Masters Athlete for 40-54 with low recovery score', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q7: '40_54', Q13: 'under_5', Q14: 'under_4', Q15: '8_10', Q16: '0_1' }));
    expect(result.archetype).toBe('Masters Athlete');
  });

  it('classifies Endurance Hybrid for high cardio + trained', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q24: '5_plus', Q1: '4_8', Q2: '4_5', Q3: '5_6' }));
    expect(result.archetype).toBe('Endurance Hybrid');
  });

  it('classifies Intermediate Plateaued for trained lifter with good equipment', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q1: '2_4', Q2: '3', Q3: '5_6' }));
    expect(result.archetype).toBe('Intermediate Plateaued');
  });

  it('collects flags from risk responses', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q13: 'under_5', Q15: '8_10', Q22: 'under_40' }));
    expect(result.flags).toContain('Critical sleep deficit');
    expect(result.flags).toContain('High stress');
    expect(result.flags).toContain('Critical adherence gap');
  });

  it('collects new flags from expanded questions', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q20: 'moderate', Q26: 'under_5k', Q29: 'frequent_issues', Q31: 'all_day', Q34: 'often' }));
    expect(result.flags).toContain('Moderate injury');
    expect(result.flags).toContain('Low NEAT');
    expect(result.flags).toContain('Digestive concern');
    expect(result.flags).toContain('Late caffeine');
    expect(result.flags).toContain('Frequent travel');
  });

  it('computes correct training history scores', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q1: '4_8', Q2: '4_5', Q3: '5_6' }));
    expect(result.scores.trainingHistory).toBe(12);
  });

  it('computes correct nutrition scores including fiber (Q27)', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q9: '2_0_2_2', Q10: '3', Q11: 'every_day', Q27: '6_plus' }));
    expect(result.scores.nutrition).toBe(16);
  });

  it('computes correct cardio score from Q24', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q24: '5_plus' }));
    expect(result.scores.cardio).toBe(5);
  });

  it('computes correct total score with cardio dimension', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q1: '4_8', Q2: '4_5', Q3: '5_6', Q9: '2_0_2_2', Q10: '3', Q11: 'every_day', Q27: '6_plus', Q13: '8_9', Q14: '8_9', Q15: '1_2', Q16: '6_7', Q22: 'over_90', Q24: '5_plus' }));
    expect(result.scores.trainingHistory).toBe(12);
    expect(result.scores.nutrition).toBe(16);
    expect(result.scores.recovery).toBe(19);
    expect(result.scores.adherence).toBe(5);
    expect(result.scores.cardio).toBe(5);
    expect(result.scores.total).toBe(57);
  });

  it('detects severe time constraint', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q17: '1_or_fewer' }));
    expect(result.constraintProfile.timeConstraint).toBe('severe');
  });

  it('detects moderate injury flag with location', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q20: 'moderate', Q32: 'shoulder' }));
    expect(result.constraintProfile.injury).toBe('moderate');
    expect(result.constraintProfile.injuryLocation).toBe('shoulder');
    expect(result.flags).toContain('Moderate injury');
  });

  it('populates cardioProfile correctly', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q24: '3_4', Q25: 'running', Q26: '10k_plus' }));
    expect(result.cardioProfile.sessionsPerWeek).toBe('3_4');
    expect(result.cardioProfile.primaryType).toBe('running');
    expect(result.cardioProfile.dailySteps).toBe('10k_plus');
  });

  it('populates sleepProfile correctly', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q30: 'evening', Q31: 'pre_workout' }));
    expect(result.sleepProfile.chronotype).toBe('evening');
    expect(result.sleepProfile.caffeineTiming).toBe('pre_workout');
  });

  it('populates psychProfile correctly', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q35: 'identity', Q36: 'very_open', Q37: 'coach' }));
    expect(result.psychProfile.motivationSource).toBe('identity');
    expect(result.psychProfile.selfExperimentation).toBe('very_open');
    expect(result.psychProfile.accountabilityPref).toBe('coach');
  });

  it('populates nutritionDetail correctly', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q27: '6_plus', Q28: 'protein_creatine_omega3_d3', Q29: 'good' }));
    expect(result.nutritionDetail.fiberServings).toBe('6_plus');
    expect(result.nutritionDetail.supplements).toContain('vitamin_d');
    expect(result.nutritionDetail.digestiveHealth).toBe('good');
  });

  it('populates femaleHealth as na for male users', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q8: 'male' }));
    expect(result.femaleHealth.trackCycle).toBe('na');
    expect(result.femaleHealth.contraception).toBe('na');
    expect(result.femaleHealth.pregnancyStatus).toBe('na');
  });

  it('populates femaleHealth for female users', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q8: 'female', Q38: 'yes_track', Q39: 'hormonal', Q40: 'no' }));
    expect(result.femaleHealth.trackCycle).toBe('yes_track');
    expect(result.femaleHealth.contraception).toBe('hormonal');
    expect(result.femaleHealth.pregnancyStatus).toBe('no');
  });

  it('generates pillar priorities', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q13: 'under_5', Q22: 'under_40', Q9: 'dont_track' }));
    expect(result.pillarPriorities.length).toBeGreaterThan(0);
    expect(result.pillarPriorities[0]).toMatch(/Injury|Recovery|Sleep|Simplify|Diet/i);
  });

  it('generates concurrent training priority for high cardio + trained', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q24: '5_plus', Q1: '4_8', Q2: '4_5', Q3: '5_6' }));
    expect(result.pillarPriorities.some(p => p.includes('Concurrent training'))).toBe(true);
  });

  it('detects Low NEAT flag from low steps', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q26: 'under_5k' }));
    expect(result.flags).toContain('Low NEAT');
  });

  it('computes workType correctly', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q33: 'physical_labor' }));
    expect(result.constraintProfile.workType).toBe('physical_labor');
  });

  it('computes travelFreq correctly', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q34: 'weekly' }));
    expect(result.constraintProfile.travelFreq).toBe('weekly');
  });

  it('adds postpartum return-to-training priority', () => {
    const result = computeIntakeAssessment(makeAnswers({ Q8: 'female', Q40: 'postpartum_under_6mo', Q38: 'no_track', Q39: 'none' }));
    expect(result.pillarPriorities.some(p => p.includes('Postpartum return'))).toBe(true);
  });

  it('handles all questions answered with skipIf conditions met', () => {
    // Verify that skipped questions don't cause issues
    const maleAnswers = makeAnswers({ Q8: 'male' });
    const result = computeIntakeAssessment(maleAnswers);
    expect(result.archetype).toBeTruthy();
    expect(result.scores.total).toBeGreaterThan(0);
  });
});
