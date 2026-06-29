import type { IntakeAssessment } from '../models/intake-assessment';

export interface Diagnostics {
  triageResult: string;
  entryPath: string;
  findings: Record<string, unknown>;
  intakeAssessment?: IntakeAssessment;
  interventionHistory?: string[];
  synergyInsights?: string[];
  previousRecommendation?: string;
  nutritionSnapshot?: string;
}

// Curated evidence snippets from the vault's study notes for evidence-anchored LLM prompting
const EVIDENCE_SNIPPETS: Record<string, string> = {
  sleep_testosterone: 'Evidence: Leproult & Van Cauter (2011) — 5h sleep for 7 days reduces testosterone by 10-15% and suppresses IGF-1. This is a Tier 1 established finding.',
  sleep_hunger: 'Evidence: Spiegel et al. (2004) — 2 nights of 4h sleep elevated ghrelin by 28%, reduced leptin by 18%, producing 24% increase in subjective hunger. Tier 1.',
  protein_distribution: 'Evidence: Morton et al. (2018) meta-analysis — 1.6g/kg is the minimum; 2.2g/kg for advanced. Schoenfeld (2013) — protein timing effect is modest but real. Tier 1.',
  nutrient_timing: 'Evidence: Aragon & Schoenfeld (2013) — post-training window is real but broader than 30 min. GLUT4 upregulation creates partitioning advantage. Tier 2.',
  volume_landmarks: 'Evidence: Schoenfeld et al. (2019) — failure not necessary for growth. Rhea (2002) — DUP outperforms linear for intermediates. Tier 1.',
  recovery_inflammation: 'Evidence: Roberts et al. (2015) — CWI within 4h of strength training blunts hypertrophy by ~20-25%. COX-2/PGE2 signal IS the anabolic trigger. Tier 2.',
  sleep_recomp: 'Evidence: Sleep debt elevates 24h cortisol (activating 11β-HSD1), suppresses GH pulsatility. 8h sleep is a genuine body composition intervention. Tier 1.',
  metabolic_adaptation: 'Evidence: Trexler et al. (2014) — metabolic adaptation persists 1+ year post-diet. Hall (2012) — energy expenditure drops more than predicted. Tier 2.',
  strength_neural: 'Evidence: Neural efficiency is the ceiling; muscle size is the floor. Most intermediates have never tested true 1RM — fatigue always masks it. NSCA consensus.',
  allostatic_load: 'Evidence: HPA axis processes all stressors (training + life) from a single resource pool. DHEA:cortisol ratio reflects anabolic-catabolic balance. Guyton & Hall physiology.',
  concurrent_training: 'Evidence: Fyfe et al. (2014) — AMPK-mTOR interference is well-characterized. Cap aerobic work at 3h/week for hypertrophy goals. Separate cardio and resistance by 6h+. Tier 1.',
  chronotype_sleep: 'Evidence: Morning chronotypes have earlier melatonin onset and peak cortisol. Evening types accumulate sleep debt more easily with early schedules. Circadian alignment improves sleep quality.',
  gut_microbiome: 'Evidence: Genton et al. (2015) — gut microbiota composition affects energy harvest and inflammation. Higher Firmicutes:Bacteroidetes ratio increases energy extraction. Tier 2.',
  fiber_type: 'Evidence: Schiaffino & Reggiani (2011) — fiber type distribution is ~90% genetic. Type II-dominant responds better to heavy loads; Type I-dominant to moderate loads to failure.',
  sex_differences: 'Evidence: Nuzzo et al. (2023) — women fatigue slower, recover faster between sets, tolerate higher relative volume. MEV/MAV shifted up ~10-15% for women.',
  postpartum_return: 'Evidence: Return-to-training postpartum: phased protocol over 12-16 weeks. Diastasis recti, pelvic floor, and core stability assessed before load progression. Medical clearance required.',
};

export function buildSystemPrompt(diagnostics: Diagnostics): string {
  const ia = diagnostics.intakeAssessment;
  const findings = diagnostics.findings;

  // Build synergy section if available
  const synergies = diagnostics.synergyInsights?.length
    ? `\n## Cross-Pillar Synergies Detected\n${diagnostics.synergyInsights.map(s => `- ${s}`).join('\n')}`
    : '';

  // Build intervention history section
  const history = diagnostics.interventionHistory?.length
    ? `\n## Intervention History (Previous Sessions)\n${diagnostics.interventionHistory.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
    : '';

  // Build evidence context based on findings
  const evidenceKeys: string[] = [];
  if (findings.sleep) evidenceKeys.push('sleep_testosterone', 'sleep_hunger', 'sleep_recomp');
  if (findings.deficitAdherence === false || findings.weeksStuck) evidenceKeys.push('metabolic_adaptation');
  if (findings.volumeTooHigh) evidenceKeys.push('volume_landmarks', 'recovery_inflammation');
  if (findings.progression === false) evidenceKeys.push('strength_neural', 'volume_landmarks');
  if (diagnostics.entryPath === 'plateau' || diagnostics.entryPath === 'starting') evidenceKeys.push('protein_distribution', 'nutrient_timing');
  if (ia?.cardioProfile.sessionsPerWeek === '5_plus' || ia?.cardioProfile.sessionsPerWeek === '3_4') evidenceKeys.push('concurrent_training');
  if (ia?.sleepProfile.chronotype) evidenceKeys.push('chronotype_sleep');
  if (ia?.nutritionDetail.fiberServings === '0_1' || ia?.nutritionDetail.fiberServings === '2_3') evidenceKeys.push('gut_microbiome');
  if (ia?.constraintProfile.injury !== 'none') evidenceKeys.push('fiber_type');
  if (ia?.answers['Q8'] === 'female') evidenceKeys.push('sex_differences');
  if (ia?.femaleHealth.pregnancyStatus === 'postpartum_under_6mo' || ia?.femaleHealth.pregnancyStatus === 'postpartum_6mo_plus') evidenceKeys.push('postpartum_return');

  const evidenceContext = evidenceKeys.length
    ? `\n## Curated Evidence Context\n${[...new Set(evidenceKeys)].map(k => EVIDENCE_SNIPPETS[k] || '').filter(Boolean).join('\n')}`
    : '';

  const intakeSection = ia ? `
## User Profile (from Intake Assessment)
- Archetype: ${ia.archetype}
- Training Score: ${ia.scores.trainingHistory}/15
- Nutrition Score: ${ia.scores.nutrition}/20
- Recovery Score: ${ia.scores.recovery}/20
- Adherence Score: ${ia.scores.adherence}/10
- Cardio Score: ${ia.scores.cardio}/5
- Total Score: ${ia.scores.total}/70
- Flags: ${ia.flags.join(', ') || 'None'}
- Priorities: ${ia.pillarPriorities.join('; ')}
- Equipment: ${ia.constraintProfile.equipment}
- Time Constraint: ${ia.constraintProfile.timeConstraint}
- Injury: ${ia.constraintProfile.injury}${ia.constraintProfile.injuryLocation !== 'none' ? ` (${ia.constraintProfile.injuryLocation})` : ''}
- Lifestyle: ${ia.constraintProfile.lifestyleConstraint}
- Work Type: ${ia.constraintProfile.workType}
- Travel Frequency: ${ia.constraintProfile.travelFreq}
- Cardio Sessions: ${ia.cardioProfile.sessionsPerWeek}/wk (${ia.cardioProfile.primaryType}, ${ia.cardioProfile.dailySteps} steps)
- Chronotype: ${ia.sleepProfile.chronotype} (caffeine: ${ia.sleepProfile.caffeineTiming})
- Motivation: ${ia.psychProfile.motivationSource} | Self-experimentation: ${ia.psychProfile.selfExperimentation} | Accountability: ${ia.psychProfile.accountabilityPref}
- Digestion: ${ia.nutritionDetail.digestiveHealth} | Fiber: ${ia.nutritionDetail.fiberServings}/day | Supplements: ${ia.nutritionDetail.supplements.join(', ') || 'none'}
- Female Health: cycle tracking=${ia.femaleHealth.trackCycle}, contraception=${ia.femaleHealth.contraception}, pregnancy=${ia.femaleHealth.pregnancyStatus}` : '';

  const nutritionSection = diagnostics.nutritionSnapshot
    ? `\n## Live Nutrition Data (from Tracker)\n${diagnostics.nutritionSnapshot}`
    : '';

  return `You are Muscle OS, an evidence-based fitness coach for intermediate lifters. The user has come to you because they have plateaued and need a structured diagnosis.

## Current Diagnostics
- Safety Status: ${diagnostics.triageResult}
- Entry Path: ${diagnostics.entryPath}
- Findings: ${JSON.stringify(findings)}${intakeSection}${nutritionSection}${evidenceContext}${synergies}${history}

## Your Role
1. **Diagnose:** Identify the single primary bottleneck using the findings above.
2. **Recommend:** Give one specific, actionable step.
3. **Educate:** Briefly explain WHY this is the bottleneck (cite evidence naturally).

Use the curated evidence context above to ground your recommendation in real research.

## Output Format (must use these exact headings)
**Most Likely Cause:** [one sentence identifying the bottleneck]
**Confidence:** [Low/Medium/High]
**Recommended Action:** [specific, measurable, time-bound action]
**Next Review:** [interval like "2 weeks" or "3 weeks"]
**Why This:** [brief evidence-based explanation]
**Evidence:**
- [Study Name] (Tier: Established | Emerging | Exploratory) -- [how it supports the recommendation]

## Core Rules
- Never mention internal system names like "arbitration", "tiers", "triage", "decision engine".
- Never give medical advice. If safety status is Red, say they need to speak with a healthcare provider first.
- Use the evidence context provided. If none is provided, say "Research suggests..." rather than citing specific studies you are unsure of.
- If findings are inconclusive, say so. Do not fabricate confidence.
- Follow the One Bottleneck Rule: identify exactly one primary cause. If multiple exist, pick the highest-confidence one.
- Include evidence tier labels (Established/Emerging/Exploratory) for each source cited.
- For female users: use the female health data (cycle tracking, contraception, pregnancy status) to tailor recommendations. Do not assume hormonal cycle affects all women equally — ask if they notice cycle-related changes rather than imposing phase-based programming.
- For users with digestive concerns (bloating, diagnosed GI conditions): consider gut health as a factor in nutrient absorption and recovery.
- For users with high cardio volume (3+ sessions/week): consider concurrent training interference as a potential bottleneck.
- Keep response focused on diagnosis and one action. Offer to go deeper if they ask.`;
}
