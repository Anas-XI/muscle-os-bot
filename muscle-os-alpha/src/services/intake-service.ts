import type { IntakeAssessment, IntakeQuestion, CardioProfile, PsychProfile, SleepProfile, NutritionDetail, FemaleHealth } from '../models/intake-assessment';

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  // ============================================================
  // Section 1: Training History & Experience (UNCHANGED)
  // ============================================================
  { id: 'Q1', section: 1, sectionLabel: 'Training History',
    label: 'How many years have you been consistently resistance training? (min 2 sessions/wk, 6+ months/yr)',
    options: [
      { value: 'less_1', label: '<1 year', score: 1 },
      { value: '1_2', label: '1-2 years', score: 2 },
      { value: '2_4', label: '2-4 years', score: 3 },
      { value: '4_8', label: '4-8 years', score: 4 },
      { value: '8_plus', label: '8+ years', score: 5 },
    ] },
  { id: 'Q2', section: 1, sectionLabel: 'Training History',
    label: 'In the last 3 months, how many sessions per week have you averaged?',
    options: [
      { value: '0_1', label: '0-1', score: 1 },
      { value: '2', label: '2', score: 2 },
      { value: '3', label: '3', score: 3 },
      { value: '4_5', label: '4-5', score: 4 },
      { value: '6_plus', label: '6+', score: 5 },
    ] },
  { id: 'Q3', section: 1, sectionLabel: 'Training History',
    label: 'Can you perform these exercises with controlled technique? (Squat, hip hinge, horizontal press, vertical press, horizontal pull, vertical pull)',
    options: [
      { value: 'none', label: 'None of them', score: 1 },
      { value: '1_2', label: '1-2 of them', score: 2 },
      { value: '3_4', label: '3-4 of them', score: 3 },
      { value: '5_6', label: '5-6 of them', score: 4 },
      { value: 'all_6', label: 'All 6', score: 5 },
    ] },

  // ============================================================
  // Section 2: Body Composition & Goals (UNCHANGED)
  // ============================================================
  { id: 'Q4', section: 2, sectionLabel: 'Body Composition',
    label: 'Current body weight (kg)',
    options: [
      { value: 'skip', label: 'Skip — best guess later' },
    ] },
  { id: 'Q5', section: 2, sectionLabel: 'Body Composition',
    label: 'Estimated body fat % (visual estimate or recent measurement)',
    options: [
      { value: 'under_12', label: '<12% (lean)' },
      { value: '12_18', label: '12-18% (athletic)' },
      { value: '18_25', label: '18-25% (moderate)' },
      { value: 'over_25', label: '>25% (higher body fat)' },
      { value: 'unknown', label: 'Not sure' },
    ] },
  { id: 'Q6', section: 2, sectionLabel: 'Body Composition',
    label: 'What is your primary body composition goal?',
    options: [
      { value: 'lose_significant', label: 'Lose significant fat (15+ kg)' },
      { value: 'lose_moderate', label: 'Lose moderate fat (5-15 kg)' },
      { value: 'lose_small', label: 'Lose small fat (0-5 kg)' },
      { value: 'maintain', label: 'Maintain / recomp' },
      { value: 'gain_muscle', label: 'Gain muscle' },
      { value: 'not_sure', label: 'Not sure yet' },
    ] },
  { id: 'Q7', section: 2, sectionLabel: 'Body Composition',
    label: 'Age',
    options: [
      { value: 'under_25', label: 'Under 25' },
      { value: '25_39', label: '25-39' },
      { value: '40_54', label: '40-54' },
      { value: '55_plus', label: '55+' },
    ] },
  { id: 'Q8', section: 2, sectionLabel: 'Body Composition',
    label: 'Sex assigned at birth',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ] },

  // ============================================================
  // Section 3: Cardio & Activity (NEW)
  // ============================================================
  { id: 'Q24', section: 3, sectionLabel: 'Cardio & Activity',
    label: 'How many cardio sessions per week do you currently do? (walking for exercise, running, cycling, swimming, etc.)',
    options: [
      { value: '0', label: 'None', score: 1 },
      { value: '1', label: '1 session', score: 2 },
      { value: '2', label: '2 sessions', score: 3 },
      { value: '3_4', label: '3-4 sessions', score: 4 },
      { value: '5_plus', label: '5+ sessions', score: 5 },
    ] },
  { id: 'Q25', section: 3, sectionLabel: 'Cardio & Activity',
    label: 'What is your primary type of cardio?',
    options: [
      { value: 'none', label: 'I don\'t do cardio', flag: 'No cardio' },
      { value: 'walking', label: 'Walking (incl. incline walking)' },
      { value: 'running', label: 'Running / jogging' },
      { value: 'cycling', label: 'Cycling' },
      { value: 'swimming', label: 'Swimming' },
      { value: 'rowing', label: 'Rowing' },
      { value: 'other', label: 'Other (sports, HIIT, etc.)' },
    ] },
  { id: 'Q26', section: 3, sectionLabel: 'Cardio & Activity',
    label: 'What is your approximate average daily step count?',
    options: [
      { value: 'under_5k', label: '<5,000 steps (sedentary)', flag: 'Low NEAT' },
      { value: '5_8k', label: '5,000-8,000 steps (lightly active)' },
      { value: '8_10k', label: '8,000-10,000 steps (moderately active)' },
      { value: '10k_plus', label: '10,000+ steps (very active)' },
      { value: 'unknown', label: 'Not sure' },
    ] },

  // ============================================================
  // Section 4: Nutrition & Dieting (old Q9-Q12 + new Q27-Q29)
  // ============================================================
  { id: 'Q9', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'What is your current daily protein intake?',
    options: [
      { value: 'dont_track', label: 'Don\'t track / unsure', score: 1 },
      { value: 'under_1_6', label: '<1.6 g/kg', score: 2 },
      { value: '1_6_2_0', label: '1.6-2.0 g/kg', score: 3 },
      { value: '2_0_2_2', label: '2.0-2.2 g/kg', score: 4 },
      { value: '2_2_plus', label: '2.2+ g/kg', score: 5 },
    ] },
  { id: 'Q10', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'How many meals per day have >30g protein?',
    options: [
      { value: '0', label: '0', score: 1 },
      { value: '1', label: '1', score: 2 },
      { value: '2', label: '2', score: 3 },
      { value: '3', label: '3', score: 4 },
      { value: '4_plus', label: '4+', score: 5 },
    ] },
  { id: 'Q11', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'Do you currently track calories?',
    options: [
      { value: 'no', label: 'No', score: 1 },
      { value: 'occasionally', label: 'Occasionally', score: 2 },
      { value: 'most_days', label: 'Most days', score: 3 },
      { value: 'every_day', label: 'Every day', score: 4 },
      { value: 'every_day_scale', label: 'Every day with food scale', score: 5 },
    ] },
  { id: 'Q12', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'Have you done >3 diet phases (caloric restriction of 8+ weeks) in the last 5 years?',
    options: [
      { value: 'no', label: 'No', flag: '' },
      { value: 'yes', label: 'Yes', flag: 'Multiple diet history' },
    ] },
  { id: 'Q27', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'How many servings of vegetables and fruit do you typically eat per day? (1 serving = 1 cup raw or 1/2 cup cooked veg, 1 piece fruit)',
    options: [
      { value: '0_1', label: '0-1 servings', score: 1, flag: 'Low fiber intake' },
      { value: '2_3', label: '2-3 servings', score: 2 },
      { value: '4_5', label: '4-5 servings', score: 3 },
      { value: '6_plus', label: '6+ servings', score: 4 },
    ] },
  { id: 'Q28', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'Which supplements do you currently take regularly?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'protein', label: 'Protein powder only' },
      { value: 'protein_creatine', label: 'Protein + Creatine' },
      { value: 'protein_creatine_omega3', label: 'Protein + Creatine + Omega-3' },
      { value: 'protein_creatine_omega3_d3', label: 'Protein + Creatine + Omega-3 + Vitamin D' },
      { value: 'comprehensive', label: 'A more comprehensive stack' },
    ] },
  { id: 'Q29', section: 4, sectionLabel: 'Nutrition & Dieting',
    label: 'How would you describe your digestive health? (bloating, gas, discomfort after meals)',
    options: [
      { value: 'good', label: 'Good — no issues' },
      { value: 'mild_bloating', label: 'Mild bloating occasionally', flag: 'Digestive concern' },
      { value: 'frequent_issues', label: 'Frequent bloating/discomfort', flag: 'Digestive concern' },
      { value: 'diagnosed', label: 'Diagnosed GI condition (IBS, IBD, etc.)', flag: 'Digestive concern' },
    ] },

  // ============================================================
  // Section 5: Recovery & Sleep (old Q13-Q16 + new Q30-Q31)
  // ============================================================
  { id: 'Q13', section: 5, sectionLabel: 'Recovery & Sleep',
    label: 'Average sleep duration over the last 2 weeks',
    options: [
      { value: 'under_5', label: '<5 hours', score: 1, flag: 'Critical sleep deficit' },
      { value: '5_6', label: '5-6 hours', score: 2, flag: 'Sleep deficit' },
      { value: '6_7', label: '6-7 hours', score: 3 },
      { value: '7_8', label: '7-8 hours', score: 4 },
      { value: '8_9', label: '8-9 hours', score: 5 },
    ] },
  { id: 'Q14', section: 5, sectionLabel: 'Recovery & Sleep',
    label: 'Sleep quality (1-10) — how rested do you feel on waking?',
    options: [
      { value: 'under_4', label: '1-4 (poor)', score: 1 },
      { value: '4_5', label: '4-5', score: 2 },
      { value: '6_7', label: '6-7', score: 3 },
      { value: '8_9', label: '8-9', score: 4 },
      { value: '10', label: '10 (perfect)', score: 5 },
    ] },
  { id: 'Q15', section: 5, sectionLabel: 'Recovery & Sleep',
    label: 'Current stress level (1-10) — average over last 2 weeks',
    options: [
      { value: '8_10', label: '8-10 (very high)', score: 1, flag: 'High stress' },
      { value: '6_7', label: '6-7', score: 2 },
      { value: '4_5', label: '4-5', score: 3 },
      { value: '3', label: '3', score: 4 },
      { value: '1_2', label: '1-2 (very low)', score: 5 },
    ] },
  { id: 'Q16', section: 5, sectionLabel: 'Recovery & Sleep',
    label: 'How many days per week do you feel recovered enough to train at full capacity?',
    options: [
      { value: '0_1', label: '0-1 days', score: 1 },
      { value: '2', label: '2 days', score: 2 },
      { value: '3', label: '3 days', score: 3 },
      { value: '4_5', label: '4-5 days', score: 4 },
      { value: '6_7', label: '6-7 days', score: 5 },
    ] },
  { id: 'Q30', section: 5, sectionLabel: 'Recovery & Sleep',
    label: 'What is your chronotype — when do you feel most alert and productive?',
    options: [
      { value: 'morning', label: 'Morning lark — best early (6-10am)' },
      { value: 'intermediate', label: 'Intermediate — balanced' },
      { value: 'evening', label: 'Night owl — best late (6pm-midnight)' },
    ] },
  { id: 'Q31', section: 5, sectionLabel: 'Recovery & Sleep',
    label: 'When do you typically consume caffeine?',
    options: [
      { value: 'morning_only', label: 'Morning only (before 12pm)' },
      { value: 'pre_workout', label: 'Only before workouts' },
      { value: 'afternoon', label: 'Morning + afternoon' },
      { value: 'all_day', label: 'Throughout the day + evening', flag: 'Late caffeine' },
      { value: 'none', label: 'No caffeine' },
    ] },

  // ============================================================
  // Section 6: Lifestyle & Constraints (old Q17-Q21 + new Q32-Q34)
  // ============================================================
  { id: 'Q17', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'How many days per week can you realistically train?',
    options: [
      { value: '1_or_fewer', label: '1 or fewer', flag: 'Severe time constraint' },
      { value: '2', label: '2', flag: 'Time constraint' },
      { value: '3_4', label: '3-4' },
      { value: '5_6', label: '5-6' },
    ] },
  { id: 'Q18', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'How long can each session be?',
    options: [
      { value: 'under_30', label: '<30 min', flag: 'Severe time constraint' },
      { value: '30_45', label: '30-45 min', flag: 'Moderate time constraint' },
      { value: '45_60', label: '45-60 min' },
      { value: 'over_60', label: '>60 min' },
    ] },
  { id: 'Q19', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'What equipment do you have regular access to?',
    options: [
      { value: 'bodyweight', label: 'Bodyweight only' },
      { value: 'home_light', label: 'Resistance bands + dumbbells' },
      { value: 'home_full', label: 'Full home gym (barbell, rack, plates)' },
      { value: 'commercial', label: 'Commercial gym' },
      { value: 'not_training', label: 'Not currently training' },
    ] },
  { id: 'Q20', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'Do you have any current injuries that limit exercise?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'minor', label: 'Minor (discomfort but can train around)', flag: 'Minor injury' },
      { value: 'moderate', label: 'Moderate (some exercises restricted)', flag: 'Moderate injury' },
      { value: 'significant', label: 'Significant (cannot train certain patterns)', flag: 'Major injury' },
    ] },
  { id: 'Q32', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'Where is your primary injury location? (if applicable)',
    options: [
      { value: 'none', label: 'No injury / not applicable' },
      { value: 'lower_back', label: 'Lower back' },
      { value: 'knee', label: 'Knee' },
      { value: 'shoulder', label: 'Shoulder' },
      { value: 'hip', label: 'Hip / groin' },
      { value: 'elbow_wrist', label: 'Elbow / wrist' },
      { value: 'neck_upper_back', label: 'Neck / upper back' },
      { value: 'multiple', label: 'Multiple areas' },
    ],
    skipIf: (answers) => answers['Q20'] === 'no' },
  { id: 'Q21', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'Current life demands (work, family, other commitments)',
    options: [
      { value: 'low', label: 'Low — training is my top priority' },
      { value: 'moderate', label: 'Moderate — balanced demands' },
      { value: 'high', label: 'High — training fits in when possible', flag: 'Lifestyle constraint' },
      { value: 'very_high', label: 'Very high — training often deprioritized', flag: 'Major lifestyle constraint' },
    ] },
  { id: 'Q33', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'What is your primary occupation / activity type?',
    options: [
      { value: 'sedentary', label: 'Sedentary (desk job, remote)' },
      { value: 'standing', label: 'Standing (retail, teaching, etc.)' },
      { value: 'active', label: 'Active (walking/moving most of day)' },
      { value: 'physical_labor', label: 'Physical labor (construction, warehouse, etc.)' },
      { value: 'mixed', label: 'Mixed (varies day to day)' },
    ] },
  { id: 'Q34', section: 6, sectionLabel: 'Lifestyle & Constraints',
    label: 'How often do you travel for work or personal reasons?',
    options: [
      { value: 'never', label: 'Rarely / never' },
      { value: 'monthly_or_less', label: 'Monthly or less' },
      { value: 'weekly', label: 'Weekly travel' },
      { value: 'often', label: 'Often (multiple trips per month)', flag: 'Frequent travel' },
    ] },

  // ============================================================
  // Section 7: Adherence & Psychology (old Q22-Q23 + new Q35-Q37)
  // ============================================================
  { id: 'Q22', section: 7, sectionLabel: 'Adherence & Psychology',
    label: 'In the last 4 weeks, what % of planned sessions did you complete?',
    options: [
      { value: 'under_40', label: '<40%', score: 1, flag: 'Critical adherence gap' },
      { value: '40_60', label: '40-60%', score: 2, flag: 'Adherence gap' },
      { value: '60_80', label: '60-80%', score: 3 },
      { value: '80_90', label: '80-90%', score: 4 },
      { value: 'over_90', label: '>90%', score: 5 },
    ] },
  { id: 'Q23', section: 7, sectionLabel: 'Adherence & Psychology',
    label: 'When you miss a session, what typically happens?',
    options: [
      { value: 'all_or_nothing', label: 'Training stops for the week', flag: 'Perfectionism pattern' },
      { value: 'reschedule', label: 'Reschedule within the week' },
      { value: 'skip_continue', label: 'Skip and continue normally next session' },
      { value: 'stop_weeks', label: 'Stop training for weeks/months', flag: 'Serious adherence issue' },
    ] },
  { id: 'Q35', section: 7, sectionLabel: 'Adherence & Psychology',
    label: 'What is your primary reason for training?',
    options: [
      { value: 'enjoyment', label: 'I genuinely enjoy it' },
      { value: 'results', label: 'I want the results (appearance, strength)' },
      { value: 'identity', label: 'It\'s part of who I am' },
      { value: 'obligation', label: 'I feel I should / have to' },
      { value: 'social', label: 'Social connection / community' },
    ] },
  { id: 'Q36', section: 7, sectionLabel: 'Adherence & Psychology',
    label: 'Would you be open to systematic self-experimentation? (testing one variable at a time over several weeks)',
    options: [
      { value: 'very_open', label: 'Very open — I\'m curious' },
      { value: 'somewhat_open', label: 'Somewhat open — depends on the variable' },
      { value: 'neutral', label: 'Neutral — show me the evidence first' },
      { value: 'skeptical', label: 'Skeptical — prefer established protocols' },
      { value: 'not_interested', label: 'Not interested — just tell me what to do' },
    ] },
  { id: 'Q37', section: 7, sectionLabel: 'Adherence & Psychology',
    label: 'What type of accountability works best for you?',
    options: [
      { value: 'self', label: 'Self-accountability (I track myself)' },
      { value: 'app_reminders', label: 'App reminders / notifications' },
      { value: 'coach', label: 'Regular check-ins with a coach' },
      { value: 'training_partner', label: 'Training partner / friend' },
      { value: 'community', label: 'Community / group accountability' },
    ] },

  // ============================================================
  // Section 8: Female Health (NEW — conditional on Q8 = female)
  // ============================================================
  { id: 'Q38', section: 8, sectionLabel: 'Female Health',
    label: 'Do you track your menstrual cycle in relation to training?',
    options: [
      { value: 'yes_track', label: 'Yes — I track and adjust training' },
      { value: 'no_track', label: 'No — I don\'t track' },
      { value: 'na', label: 'Not applicable' },
    ],
    skipIf: (answers) => answers['Q8'] !== 'female' },
  { id: 'Q39', section: 8, sectionLabel: 'Female Health',
    label: 'What type of contraception do you use? (if applicable)',
    options: [
      { value: 'none', label: 'None' },
      { value: 'hormonal', label: 'Hormonal (pill, IUD, implant, injection)' },
      { value: 'non_hormonal_iud', label: 'Non-hormonal IUD' },
      { value: 'other', label: 'Other' },
      { value: 'na', label: 'Not applicable' },
    ],
    skipIf: (answers) => answers['Q8'] !== 'female' },
  { id: 'Q40', section: 8, sectionLabel: 'Female Health',
    label: 'Are you currently pregnant or postpartum?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'trying', label: 'Trying to conceive' },
      { value: 'pregnant', label: 'Currently pregnant', flag: 'Pregnant — requires medical clearance' },
      { value: 'postpartum_under_6mo', label: 'Postpartum (<6 months)', flag: 'Postpartum — return-to-training protocol' },
      { value: 'postpartum_6mo_plus', label: 'Postpartum (6+ months)' },
    ],
    skipIf: (answers) => answers['Q8'] !== 'female' },
];

export function computeIntakeAssessment(answers: Record<string, string>): IntakeAssessment {
  const flags: string[] = [];
  const scores = { trainingHistory: 0, nutrition: 0, recovery: 0, adherence: 0, cardio: 0 };

  for (const q of INTAKE_QUESTIONS) {
    const ans = answers[q.id];
    if (!ans) continue;

    const opt = q.options.find((o) => o.value === ans);
    if (!opt) continue;

    if (opt.flag) {
      const trimmed = opt.flag.trim();
      if (trimmed) flags.push(trimmed);
    }
  }

  // Training History score (Q1-Q3)
  for (const id of ['Q1', 'Q2', 'Q3']) {
    const ans = answers[id];
    const q = INTAKE_QUESTIONS.find((x) => x.id === id)!;
    const opt = q.options.find((o) => o.value === ans);
    if (opt?.score) scores.trainingHistory += opt.score;
  }

  // Nutrition score (Q9-Q11, Q27)
  for (const id of ['Q9', 'Q10', 'Q11', 'Q27']) {
    const ans = answers[id];
    const q = INTAKE_QUESTIONS.find((x) => x.id === id)!;
    const opt = q.options.find((o) => o.value === ans);
    if (opt?.score) scores.nutrition += opt.score;
  }

  // Recovery score (Q13-Q16)
  for (const id of ['Q13', 'Q14', 'Q15', 'Q16']) {
    const ans = answers[id];
    const q = INTAKE_QUESTIONS.find((x) => x.id === id)!;
    const opt = q.options.find((o) => o.value === ans);
    if (opt?.score) scores.recovery += opt.score;
  }

  // Adherence score (Q22 only)
  const q22Ans = answers['Q22'];
  const q22Q = INTAKE_QUESTIONS.find((x) => x.id === 'Q22')!;
  const q22Opt = q22Q.options.find((o) => o.value === q22Ans);
  if (q22Opt?.score) scores.adherence += q22Opt.score;

  // Cardio score (Q24 only)
  const q24Ans = answers['Q24'];
  const q24Q = INTAKE_QUESTIONS.find((x) => x.id === 'Q24')!;
  const q24Opt = q24Q.options.find((o) => o.value === q24Ans);
  if (q24Opt?.score) scores.cardio += q24Opt.score;

  const totalScore = scores.trainingHistory + scores.nutrition + scores.recovery + scores.adherence + scores.cardio;
  const scoresWithTotal = { ...scores, total: totalScore };

  // Constraint profile
  const timeConstraint = computeTimeConstraint(answers);
  const equipment = computeEquipment(answers);
  const injury = computeInjury(answers);
  const injuryLocation = computeInjuryLocation(answers);
  const lifestyleConstraint = computeLifestyleConstraint(answers);
  const adherenceFlag = computeAdherenceFlag(flags);
  const multipleDietHistory = answers['Q12'] === 'yes';
  const workType = computeWorkType(answers);
  const travelFreq = computeTravelFreq(answers);

  // Profile objects
  const cardioProfile = computeCardioProfile(answers);
  const psychProfile = computePsychProfile(answers);
  const sleepProfile = computeSleepProfile(answers);
  const nutritionDetail = computeNutritionDetail(answers);
  const femaleHealth = computeFemaleHealth(answers);

  // Archetype
  const archetype = computeArchetype(scoresWithTotal, flags, answers);

  // Pillar priorities
  const pillarPriorities = computePillarPriorities(scoresWithTotal, flags, answers);

  return {
    scores: scoresWithTotal,
    flags: [...new Set(flags)],
    constraintProfile: { timeConstraint, equipment, injury, injuryLocation, lifestyleConstraint, adherenceFlag, multipleDietHistory, workType, travelFreq },
    archetype,
    pillarPriorities,
    cardioProfile,
    psychProfile,
    sleepProfile,
    nutritionDetail,
    femaleHealth,
    answers,
  };
}

function computeTimeConstraint(answers: Record<string, string>): 'none' | 'moderate' | 'severe' {
  const q17 = answers['Q17'];
  const q18 = answers['Q18'];
  const severe = (q17 === '1_or_fewer' || q18 === 'under_30');
  const moderate = (q17 === '2' || q18 === '30_45');
  if (severe) return 'severe';
  if (moderate) return 'moderate';
  return 'none';
}

function computeEquipment(answers: Record<string, string>): 'minimal' | 'home_light' | 'home_full' | 'full' | 'na' {
  const v = answers['Q19'];
  if (v === 'bodyweight') return 'minimal';
  if (v === 'home_light') return 'home_light';
  if (v === 'home_full') return 'home_full';
  if (v === 'commercial') return 'full';
  return 'na';
}

function computeInjury(answers: Record<string, string>): 'none' | 'minor' | 'moderate' | 'major' {
  const v = answers['Q20'];
  if (v === 'minor') return 'minor';
  if (v === 'moderate') return 'moderate';
  if (v === 'significant') return 'major';
  return 'none';
}

function computeInjuryLocation(answers: Record<string, string>): string {
  const loc = answers['Q32'];
  if (!loc || loc === 'none') return 'none';
  return loc;
}

function computeLifestyleConstraint(answers: Record<string, string>): 'none' | 'moderate' | 'high' | 'very_high' {
  const v = answers['Q21'];
  if (v === 'high') return 'high';
  if (v === 'very_high') return 'very_high';
  if (v === 'moderate') return 'moderate';
  return 'none';
}

function computeWorkType(answers: Record<string, string>): 'sedentary' | 'standing' | 'active' | 'physical_labor' | 'mixed' | 'unknown' {
  const v = answers['Q33'];
  if (v === 'sedentary') return 'sedentary';
  if (v === 'standing') return 'standing';
  if (v === 'active') return 'active';
  if (v === 'physical_labor') return 'physical_labor';
  if (v === 'mixed') return 'mixed';
  return 'unknown';
}

function computeTravelFreq(answers: Record<string, string>): 'never' | 'monthly_or_less' | 'weekly' | 'often' {
  const v = answers['Q34'];
  if (v === 'never') return 'never';
  if (v === 'monthly_or_less') return 'monthly_or_less';
  if (v === 'weekly') return 'weekly';
  if (v === 'often') return 'often';
  return 'never';
}

function computeCardioProfile(answers: Record<string, string>): CardioProfile {
  return {
    sessionsPerWeek: (answers['Q24'] as CardioProfile['sessionsPerWeek']) ?? '0',
    primaryType: (answers['Q25'] as CardioProfile['primaryType']) ?? 'none',
    dailySteps: (answers['Q26'] as CardioProfile['dailySteps']) ?? 'unknown',
  };
}

function computePsychProfile(answers: Record<string, string>): PsychProfile {
  return {
    motivationSource: (answers['Q35'] as PsychProfile['motivationSource']) ?? 'results',
    selfExperimentation: (answers['Q36'] as PsychProfile['selfExperimentation']) ?? 'neutral',
    accountabilityPref: (answers['Q37'] as PsychProfile['accountabilityPref']) ?? 'self',
  };
}

function computeSleepProfile(answers: Record<string, string>): SleepProfile {
  return {
    chronotype: (answers['Q30'] as SleepProfile['chronotype']) ?? 'intermediate',
    caffeineTiming: (answers['Q31'] as SleepProfile['caffeineTiming']) ?? 'morning_only',
  };
}

function computeNutritionDetail(answers: Record<string, string>): NutritionDetail {
  const suppValue = answers['Q28'] ?? 'none';
  const supplementMap: Record<string, string[]> = {
    'none': [],
    'protein': ['protein'],
    'protein_creatine': ['protein', 'creatine'],
    'protein_creatine_omega3': ['protein', 'creatine', 'omega3'],
    'protein_creatine_omega3_d3': ['protein', 'creatine', 'omega3', 'vitamin_d'],
    'comprehensive': ['protein', 'creatine', 'omega3', 'vitamin_d', 'multivitamin', 'magnesium'],
  };
  return {
    fiberServings: (answers['Q27'] as NutritionDetail['fiberServings']) ?? '0_1',
    supplements: supplementMap[suppValue] ?? [],
    digestiveHealth: (answers['Q29'] as NutritionDetail['digestiveHealth']) ?? 'good',
  };
}

function computeFemaleHealth(answers: Record<string, string>): FemaleHealth {
  return {
    trackCycle: (answers['Q38'] as FemaleHealth['trackCycle']) ?? 'na',
    contraception: (answers['Q39'] as FemaleHealth['contraception']) ?? 'na',
    pregnancyStatus: (answers['Q40'] as FemaleHealth['pregnancyStatus']) ?? 'na',
  };
}

function computeAdherenceFlag(flags: string[]): 'none' | 'perfectionism' | 'gap' | 'critical' | 'serious' {
  if (flags.includes('Critical adherence gap')) return 'critical';
  if (flags.includes('Adherence gap')) return 'gap';
  if (flags.includes('Serious adherence issue')) return 'serious';
  if (flags.includes('Perfectionism pattern')) return 'perfectionism';
  return 'none';
}

function computeArchetype(
  scores: { trainingHistory: number; nutrition: number; recovery: number; adherence: number; cardio: number; total: number },
  flags: string[],
  answers: Record<string, string>
): IntakeAssessment['archetype'] {
  const trainingScore = scores.trainingHistory;
  const recoveryScore = scores.recovery;
  const age = answers['Q7'];
  const bodyFat = answers['Q5'];
  const goal = answers['Q6'];
  const equipment = answers['Q19'];
  const hasInjury = flags.some((f) => f.toLowerCase().includes('injury'));
  const severeTime = flags.includes('Severe time constraint');
  const highStress = flags.includes('High stress');
  const lifestyleConstraint = flags.includes('Lifestyle constraint') || flags.includes('Major lifestyle constraint');
  const fatLossGoal = goal === 'lose_significant' || goal === 'lose_moderate';
  const highBodyFat = bodyFat === 'over_25';
  const criticalAdherenceGap = flags.includes('Critical adherence gap');
  const cardioSessions = answers['Q24'];
  const isEnduranceFocused = cardioSessions === '5_plus' || cardioSessions === '3_4';
  const isStrengthOnly = cardioSessions === '0';

  // Rule 1: Beginner
  if (trainingScore <= 6 && !hasInjury) return 'Beginner';

  // Rule 2: Busy Professional
  if (severeTime || (lifestyleConstraint && highStress)) return 'Busy Professional';

  // Rule 3: Fat Loss Client
  if (fatLossGoal && highBodyFat) return 'Fat Loss Client';

  // Rule 4: Masters Athlete
  if (age === '55_plus' || (age === '40_54' && recoveryScore <= 8)) return 'Masters Athlete';

  // Rule 5: Endurance Hybrid — high cardio volume + trained
  if (isEnduranceFocused && trainingScore >= 7) return 'Endurance Hybrid';

  // Rule 6: Intermediate Plateaued
  if (trainingScore >= 7 && trainingScore <= 13 && (equipment === 'commercial' || equipment === 'home_full') && !criticalAdherenceGap) return 'Intermediate Plateaued';

  // Rule 7: Strength Athlete
  if (trainingScore >= 14 || (goal === 'gain_muscle' && trainingScore >= 10 && equipment !== 'minimal')) return 'Strength Athlete';

  return 'Intermediate Plateaued';
}

function computePillarPriorities(scores: { trainingHistory: number; nutrition: number; recovery: number; adherence: number; cardio: number; total: number }, flags: string[], answers: Record<string, string>): string[] {
  const priorities: string[] = [];

  // Tier 1: Safety
  if (flags.some((f) => f.toLowerCase().includes('injury'))) priorities.push('Injury management — modify exercise selection before anything else');

  // Pregnancy/postpartum safety
  if (answers['Q40'] === 'pregnant') priorities.push('Pregnancy — medical clearance required before any program change');
  if (answers['Q40'] === 'postpartum_under_6mo') priorities.push('Postpartum return-to-training — follow phased protocol with medical clearance');

  // Tier 2: Recovery
  if (scores.recovery <= 12) priorities.push('Recovery maxing — recovery is your binding constraint');

  // Tier 3: Sleep
  if (flags.some((f) => f.includes('sleep') || f.includes('Sleep'))) priorities.push('Sleep maxing — sleep is your priority');

  // Tier 4: Adherence
  if (scores.adherence < 4) priorities.push('Simplify before optimizing — adherence is the foundation');

  // Tier 5: Nutrition
  if (scores.nutrition <= 10) priorities.push('Diet maxing — protein and fiber are your first nutrition changes');

  // Tier 6: Cardio programming
  if (answers['Q24'] === '5_plus' && scores.trainingHistory >= 7) priorities.push('Concurrent training management — high cardio + resistance requires interference mitigation');

  // Tier 7: Training
  if (scores.trainingHistory <= 10) priorities.push('Training maxing — volume and program design are next');

  if (priorities.length === 0) priorities.push('You have a solid foundation — focus on individualization and n-of-1 titration');

  return priorities;
}
