import type { TriageResult } from '../models/triage-result';

interface QuestionSpec {
  responses: Record<string, number>;
  label: string;
}

const QUESTIONNAIRE: Record<string, QuestionSpec> = {
  A1: { responses: { no: 0, managed: 1, unmanaged: 2 }, label: 'Medical conditions' },
  A2: { responses: { no: 0, stable: 1, recent_change: 2 }, label: 'Medications' },
  A3: { responses: { no: 0, postpartum_6_12: 1, pregnant_trying_early_pp: 2 }, label: 'Pregnancy / postpartum' },
  A4: { responses: { no: 0, suspected: 1, diagnosed_untreated: 2 }, label: 'Sleep disorder suspected' },
  A4b: { responses: { '0_2': 1, '3_plus': 2 }, label: 'OSA indicators (A4b)' },
  A5: { responses: { no: 0, managed_stable: 1, worsening_undiagnosed: 2 }, label: 'Chronic pain / injury' },
  A6: { responses: { no: 0, resolved: 1, active_restriction: 2 }, label: 'Doctor exercise restriction' },
  B1: { responses: { no: 0, recovered: 1, active: 2 }, label: 'Eating disorder history' },
  B2: { responses: { no: 0, occasional: 1, regular: 2 }, label: 'Binge eating' },
  B3: { responses: { never: 0, past_resolved: 1, current_recent: 2 }, label: 'Purging history' },
  B4: { responses: { rarely: 0, occasionally: 1, frequently: 2 }, label: 'Guilt / anxiety after eating' },
  B5: { responses: { no: 0, intentional: 1, unintentional: 2 }, label: 'Unintentional weight loss' },
  B6: { responses: { no: 0, supervised: 1, unsupervised: 2 }, label: 'Calorie restriction' },
  B7: { responses: { no_or_na: 0, past_resolved: 1, current: 2 }, label: 'Missed period (female)' },
  B8: { responses: { no: 0, diagnosed_pcos: 1, irregular_undiagnosed: 1 }, label: 'PCOS / irregular cycles (female)' },
  C1: { responses: { rarely: 0, sometimes: 1, often: 2 }, label: 'Compelled to exercise' },
  C2: { responses: { no: 0, past: 1, current: 2 }, label: 'Excessive exercise history' },
  C3: { responses: { no: 0, mild_managed: 1, moderate_severe: 2 }, label: 'Anxiety / depression' },
  C4: { responses: { no: 0, maintenance: 0, active_treatment: 1 }, label: 'Mental health care' },
  D1: { responses: { no: 0, '16_17_supported': 1, under_16_no_support: 2 }, label: 'Under 18' },
  D2: { responses: { no: 0, '65_75_no_major': 1, '75_plus_or_multiple': 2 }, label: '65+' },
  E1: { responses: { no: 0, planned: 1, unplanned: 1 }, label: 'Restrictive diet (vegan, keto, etc.)' },
  E2: { responses: { no: 0, basic: 0, multiple_high_dose: 1 }, label: 'Supplement use' },
  E3: { responses: { no_or_untested: 0, resolved: 1, current_untreated: 2 }, label: 'Bloodwork nutrient deficiency' },
  E4: { responses: { five_plus: 0, three_to_four: 1, under_three: 1 }, label: 'Daily produce intake (<3 servings veg / <2 fruit)' },
  E5: { responses: { no: 0, past_resolved: 1, current: 2 }, label: 'Iron deficiency / anaemia (female)' },
};

export { QUESTIONNAIRE };

export function computeTriage(answers: Record<string, string>): TriageResult {
  let maxRisk = 0;
  const flagged: string[] = [];

  const skipA4b = answers['A4'] !== 'suspected';

  for (const [qid, ans] of Object.entries(answers)) {
    const spec = QUESTIONNAIRE[qid];
    if (!spec) continue;
    if (qid === 'A4b' && skipA4b) continue;
    const risk = spec.responses[ans] ?? 0;
    if (risk > maxRisk) {
      maxRisk = risk;
      flagged.length = 0;
      flagged.push(spec.label);
    } else if (risk === maxRisk && risk > 0) {
      flagged.push(spec.label);
    }
  }

  const triageMap: Record<number, 'Green' | 'Yellow' | 'Red'> = {
    0: 'Green',
    1: 'Yellow',
    2: 'Red',
  };

  return {
    result: triageMap[maxRisk] ?? 'Green',
    flagged,
    answers,
  };
}
