// Decision Tree Engine — ported from the vault's Decision Tree Engine + Synergy Matrix
// Implements multi-level diagnostic branching and cross-pillar synergy rules

export type UserGoal = 'fat_loss' | 'hypertrophy' | 'strength' | 'recomp' | 'maintenance';
export type SynergyType = 'sleep_training' | 'recovery_strength' | 'diet_sleep' | 'training_diet' | 'recovery_diet' | 'sleep_recomp' | 'strength_recomp' | 'allostatic_load' | 'fatigue_training' | 'adherence_all' | 'individualization_all' | 'measurement_all';

export interface DiagnosisContext {
  goal: UserGoal | string;
  archetype: string;
  flags: string[];
  scores: { trainingHistory: number; nutrition: number; recovery: number; adherence: number; total: number };
  constraints: {
    timeConstraint: string;
    equipment: string;
    injury: string;
    lifestyleConstraint: string;
    adherenceFlag: string;
  };
  findings: Record<string, boolean | string | number>;
}

export interface DiagnosisResult {
  category: 'body_comp' | 'strength_performance' | 'recovery_health' | 'motivation_adherence';
  bottleneck: string;
  suggestedAction: string;
  effectLag: string;
  confidence: 'Low' | 'Medium' | 'High';
  synergies: { type: SynergyType; description: string }[];
  evidenceRef?: string;
}

export interface SynergyRule {
  type: SynergyType;
  priority: number;
  condition: (ctx: DiagnosisContext) => boolean;
  description: string;
  action: string;
  effectLag: string;
  evidenceRef?: string;
}

const SYNERGY_RULES: SynergyRule[] = [
  {
    type: 'sleep_training',
    priority: 1,
    condition: (ctx) => {
      const sleepDeficit = ctx.findings.sleep === true || ctx.flags.some(f => f.toLowerCase().includes('sleep'));
      const strengthDecline = ctx.goal === 'strength' || ctx.goal === 'hypertrophy';
      return sleepDeficit && strengthDecline;
    },
    description: 'Sleep → Training: The Invisible Strength Tax — sleep restriction reduces testosterone by 10-15% and suppresses IGF-1 via blunted GH pulsatility',
    action: 'Prioritize 8h sleep for 14 consecutive nights before adjusting any training variables',
    effectLag: '3-7 days',
    evidenceRef: 'Leproult & Van Cauter, 2011 — 10-15% testosterone reduction after 1 week of 5h sleep',
  },
  {
    type: 'recovery_strength',
    priority: 2,
    condition: (ctx) => {
      const highFatigue = ctx.findings.volumeTooHigh === true || ctx.findings.stress === true;
      const strengthGoal = ctx.goal === 'strength' || ctx.goal === 'hypertrophy';
      return highFatigue && strengthGoal;
    },
    description: 'Recovery → Strength: Fatigue is hiding your true 1RM — most lifters have never tested strength minus accumulated fatigue',
    action: 'Schedule a 7-day deload (50% volume, maintain intensity), then test strength on day 5',
    effectLag: '1-2 weeks',
    evidenceRef: 'NSCA FM-01 — Functional overreaching resolves with 1-2wk reduced volume',
  },
  {
    type: 'diet_sleep',
    priority: 3,
    condition: (ctx) => {
      const deficit = ctx.flags.includes('Multiple diet history') || ctx.findings.deficitAdherence === false;
      const poorSleep = ctx.findings.sleep === true;
      return deficit && poorSleep;
    },
    description: 'Diet → Sleep: High-glycemic meals pre-bed suppress GHRH and blunt GH pulse; aggressive deficits increase nocturnal awakening',
    action: 'Shift carbs to earlier in the day. No high-glycemic foods within 2h of bed. If deficit >750kcal, reduce to 300-500kcal deficit',
    effectLag: '3-7 days',
    evidenceRef: 'Spiegel et al., 2004 — 2 nights of 4h sleep elevated ghrelin 28%, reduced leptin 18%',
  },
  {
    type: 'training_diet',
    priority: 4,
    condition: (ctx) => {
      const lowProtein = ctx.scores.nutrition <= 10;
      const training = ctx.scores.trainingHistory >= 7;
      return lowProtein && training;
    },
    description: 'Training → Diet: GLUT4 density scales with training frequency — protein requirements scale with training age',
    action: 'Increase protein to 2.0-2.2 g/kg minimum. Distribute across 3-5 meals with leucine threshold (~3g) per meal',
    effectLag: '2-4 weeks',
    evidenceRef: 'Morton et al., 2018 — Protein meta-analysis: 1.6g/kg minimum, higher for advanced trainees',
  },
  {
    type: 'recovery_diet',
    priority: 5,
    condition: (ctx) => {
      const poorRecovery = ctx.scores.recovery <= 12;
      const lowNut = ctx.scores.nutrition <= 10;
      return poorRecovery && lowNut;
    },
    description: 'Recovery → Diet: Omega-3 fatty acids drive M1→M2 macrophage transition; Vitamin D deficiency elevates inflammatory markers',
    action: 'Add 3g EPA+DHA omega-3 daily. Check Vitamin D status (target 50+ ng/mL). Ensure zinc intake (15-30mg/day)',
    effectLag: '2-4 weeks',
    evidenceRef: 'Roberts et al., 2015 — COX-2/PGE2 inflammatory signal is anabolic trigger; do not suppress',
  },
  {
    type: 'sleep_recomp',
    priority: 6,
    condition: (ctx) => {
      const sleepIssue = ctx.findings.sleep === true;
      const recompGoal = ctx.goal === 'recomp' || ctx.goal === 'fat_loss' || ctx.goal === 'maintain';
      return sleepIssue && recompGoal;
    },
    description: 'Sleep → Recomposition: Sleep debt elevates cortisol activating 11β-HSD1 promoting central fat accumulation; GH pulse drives lipolysis',
    action: 'Treat sleep as a body composition intervention. 8h minimum for 14 nights. Nocturnal GH pulse drives preferential fat mobilization from adipose',
    effectLag: '1-2 weeks',
    evidenceRef: 'Spiegel et al., 2004 — 24% increase in subjective hunger from sleep restriction',
  },
  {
    type: 'strength_recomp',
    priority: 7,
    condition: (ctx) => {
      const strengthFocus = ctx.goal === 'strength' || ctx.goal === 'hypertrophy' || ctx.goal === 'gain_muscle';
      return strengthFocus;
    },
    description: 'Strength → Recomposition: Heavy compound loading is the primary non-insulin driver of GLUT4 expression; EPOC lasts 24-48h',
    action: 'Maintain heavy compounds (80%+ 1RM) even during deficit phases. Heavy loading provides mTORC1 activation signaling muscle preservation',
    effectLag: '4-6 weeks',
    evidenceRef: 'Barakat et al., 2020 — Body recomposition evidence review',
  },
  {
    type: 'allostatic_load',
    priority: 0,
    condition: (ctx) => {
      const highStress = ctx.findings.stress === true || ctx.constraints.lifestyleConstraint === 'high' || ctx.constraints.lifestyleConstraint === 'very_high';
      return highStress;
    },
    description: 'All Pillars → Allostatic Load: Every stressor in every category draws from the same neuroendocrine resource pool',
    action: 'Reduce training volume 20-30%. Maintain protein and sleep non-negotiables. Total stress budget must be managed, not just training stress',
    effectLag: '1-2 weeks',
    evidenceRef: 'Guyton & Hall — HPA axis and allostatic load model',
  },
  {
    type: 'fatigue_training',
    priority: 8,
    condition: (ctx) => {
      return ctx.findings.volumeTooHigh === true || ctx.scores.recovery <= 8;
    },
    description: 'Fatigue Management → Training: Volume landmarks (MEV→MAV→MRV) connect training dose to recovery capacity',
    action: 'Use the NSCA 3-tier classification. If decline <2wk: monitor. 2-4wk: 1wk deload (50% volume). >4wk: 10-14 day complete break',
    effectLag: '1-2 weeks',
    evidenceRef: 'NSCA FM-01 — 3-tier time-based fatigue classification',
  },
];

const CATEGORY_RULES = {
  body_comp: (ctx: DiagnosisContext): DiagnosisResult | null => {
    const isFatGoal = ctx.goal === 'fat_loss' || ctx.goal === 'recomp' || ctx.goal === 'lose_significant' || ctx.goal === 'lose_moderate' || ctx.goal === 'maintain';

    if (!isFatGoal) return null;

    const deficitAdherence = ctx.findings.deficitAdherence;
    const weeksStuck = ctx.findings.weeksStuck;
    const sleepIssue = ctx.findings.sleep === true;
    const stressIssue = ctx.findings.stress === true;
    const adherenceIssue = ctx.findings.adherence === false;
    const flags = ctx.flags;

    // Pre-check: sequential dependency model from vault
    if (adherenceIssue !== false) {
      return {
        category: 'body_comp',
        bottleneck: 'Adherence is the primary bottleneck — tracking accuracy and execution consistency',
        suggestedAction: 'Audit tracking accuracy. Use the 80/80/80 rule: aim for 80% compliance on 80% of days before adjusting any variable',
        effectLag: 'Immediate to 2 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (sleepIssue) {
      return {
        category: 'body_comp',
        bottleneck: 'Sleep debt is driving compensatory hunger (ghrelin↑, leptin↓) and cortisol-mediated fat storage',
        suggestedAction: 'Sleep is the most underrated body composition intervention. 8h minimum for 14 nights. Track morning cortisol trend',
        effectLag: '1-2 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
        evidenceRef: 'Spiegel et al., 2004 — 28% ghrelin increase, 18% leptin reduction from sleep restriction',
      };
    }

    if (deficitAdherence === false) {
      return {
        category: 'body_comp',
        bottleneck: 'Inaccurate tracking is the most likely cause — studies show most people underestimate intake by 30-50%',
        suggestedAction: 'Use a food scale for 2 weeks. Track everything including oils, drinks, and bites. Compare actual vs planned intake',
        effectLag: 'Immediate',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (stressIssue) {
      return {
        category: 'body_comp',
        bottleneck: 'Chronic stress elevates cortisol, activating 11β-HSD1 which promotes central fat storage and muscle catabolism',
        suggestedAction: 'Reduce training volume 20-30%. Add daily 10min box breathing or walk. Maintain protein at 2.0g/kg minimum',
        effectLag: '2-3 weeks',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
      };
    }

    if (weeksStuck === true) {
      const dietHistory = flags.includes('Multiple diet history');
      if (dietHistory) {
        return {
          category: 'body_comp',
          bottleneck: 'Metabolic adaptation from chronic dieting — post-weight-loss metabolic adaptation persists 1+ year',
          suggestedAction: 'Schedule a 2-week diet break at maintenance calories. This resets leptin and thyroid axes. Then resume deficit at 300-500kcal',
          effectLag: '2 weeks to reset, then resumes',
          confidence: 'Medium',
          synergies: detectSynergies(ctx),
          evidenceRef: 'Guyton Ch 72 — Metabolic adaptation; Trexler et al., 2014',
        };
      }
      return {
        category: 'body_comp',
        bottleneck: 'Energy balance is tighter than calculated — TDEE may have dropped with weight loss',
        suggestedAction: 'Reduce calories by 200 OR increase steps by 2,000/day. Do NOT do both — change one variable at a time for 3 weeks',
        effectLag: '3-4 weeks',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
      };
    }

    return null;
  },

  strength_performance: (ctx: DiagnosisContext): DiagnosisResult | null => {
    const isStrengthGoal = ctx.goal === 'strength' || ctx.goal === 'hypertrophy' || ctx.goal === 'gain_muscle';

    if (!isStrengthGoal) return null;

    const technique = ctx.findings.technique;
    const progression = ctx.findings.progression;
    const volumeTooHigh = ctx.findings.volumeTooHigh;
    const sleepIssue = ctx.findings.sleep === true;
    const stressIssue = ctx.findings.stress === true;

    // Pre-check: sequential dependency from vault Decision Tree Engine
    if (technique === false) {
      return {
        category: 'strength_performance',
        bottleneck: 'Technique ceiling — later sets degrading indicates fatigue-induced form breakdown, not strength limit',
        suggestedAction: 'Reduce volume per session OR increase rest between sets by 30-60s. Fix technique before any other diagnosis is valid',
        effectLag: '2 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
        evidenceRef: 'NSCA TEC-01 — Technique must be stable before other diagnostics',
      };
    }

    if (progression === false) {
      return {
        category: 'strength_performance',
        bottleneck: 'No progressive overload protocol — the body only adapts when demand systematically increases',
        suggestedAction: 'Track top set performance each session. Aim to add 1 rep or 2.5kg on compounds weekly. Use double progression (reps first, then weight)',
        effectLag: '4-6 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (volumeTooHigh === true) {
      return {
        category: 'strength_performance',
        bottleneck: 'Volume above MRV — junk volume impairs recovery without adding growth stimulus',
        suggestedAction: 'Reduce weekly sets by 20-30%. Stay at MAV (not MRV). Schedule deload every 4-6 weeks',
        effectLag: '1-2 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (sleepIssue) {
      return {
        category: 'strength_performance',
        bottleneck: 'Sleep deprivation impairing neuromuscular output and recovery',
        suggestedAction: '7.5-9h sleep for 14 nights before adjusting any training variables. Sleep is the highest-leverage strength intervention',
        effectLag: '3-7 days',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
        evidenceRef: 'Leproult & Van Cauter, 2011',
      };
    }

    if (stressIssue) {
      return {
        category: 'strength_performance',
        bottleneck: 'Allostatic load is consuming CNS recovery capacity — your true 1RM is masked by accumulated fatigue',
        suggestedAction: 'Schedule a deload week (50% volume, maintain intensity). Test strength on day 5 of deload',
        effectLag: '1-2 weeks',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
      };
    }

    return null;
  },

  recovery_health: (ctx: DiagnosisContext): DiagnosisResult | null => {
    const recoveryScore = ctx.scores.recovery;
    const sleepIssue = ctx.findings.sleep === true;
    const stressIssue = ctx.findings.stress === true;

    if (recoveryScore > 12 && !sleepIssue && !stressIssue) return null;

    // Use vault's NSCA 3-tier classification
    const volumeTooHigh = ctx.findings.volumeTooHigh === true;
    const fatigueSeverity = volumeTooHigh && recoveryScore <= 8 ? 'nonfunctional' : volumeTooHigh ? 'functional' : 'acute';

    if (fatigueSeverity === 'nonfunctional') {
      return {
        category: 'recovery_health',
        bottleneck: 'Nonfunctional overreaching — performance decline with systemic symptoms persisting >4 weeks',
        suggestedAction: 'Mandatory 10-14 day complete training break. Maintain protein and walking only. If 3+ symptoms persist (chronic fatigue, sleep disruption, mood disturbance, appetite loss, frequent illness) escalate to medical professional',
        effectLag: '2-4 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
        evidenceRef: 'NSCA FM-01, FM-03 — Nonfunctional overreaching protocol',
      };
    }

    if (fatigueSeverity === 'functional') {
      return {
        category: 'recovery_health',
        bottleneck: 'Functional overreaching — beneficial training phase if managed correctly',
        suggestedAction: 'Schedule 1-week deload (50% volume, maintain intensity). Supercompensation expected after deload. This is a normal and beneficial training phase',
        effectLag: '1-2 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
        evidenceRef: 'NSCA FM-01 — Functional overreaching resolves with 1-2wk reduced volume',
      };
    }

    if (sleepIssue) {
      return {
        category: 'recovery_health',
        bottleneck: 'Sleep deficit is the primary recovery bottleneck — GH pulsatility, glymphatic clearance, and inflammation resolution all depend on sleep',
        suggestedAction: '8h minimum. Consistent timing ±30min. No alcohol. No pre-bed high-glycemic meals. Magnesium glycinate 200-400mg pre-bed',
        effectLag: '3-7 days',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (stressIssue) {
      return {
        category: 'recovery_health',
        bottleneck: 'Chronic allostatic load is exceeding recovery capacity — HPA axis processes training and life stress from a single pool',
        suggestedAction: 'Reduce training volume 20-30%. Add active recovery (10-15min walk post-training). Daily HRV monitoring. Maintain sleep and protein non-negotiables',
        effectLag: '1-2 weeks',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
      };
    }

    return null;
  },

  cardio_endurance: (ctx: DiagnosisContext): DiagnosisResult | null => {
    const isEnduranceGoal = ctx.goal === 'endurance' || ctx.goal === 'health';
    const hasEnduranceWork = ctx.findings.cardioVolume !== undefined || ctx.findings.enduranceTraining === true;

    if (!isEnduranceGoal && !hasEnduranceWork) return null;

    const cardioVolume = Number(ctx.findings.cardioVolume) || 0;
    const interferenceRisk = cardioVolume > 3; // >3h/week triggers interference with strength/hypertrophy

    if (interferenceRisk && (ctx.goal === 'hypertrophy' || ctx.goal === 'strength')) {
      return {
        category: 'recovery_health',
        bottleneck: 'Cardio volume exceeding 3h/week is creating AMPK-mTOR interference with resistance training adaptations',
        suggestedAction: 'Cap cardio at 3h/week max, 5 sessions max. Separate cardio and resistance by 6h+. Do resistance first in same-session training. Use HIIT (2x20min) over LISS to minimize interference.',
        effectLag: '2-4 weeks',
        confidence: 'High',
        synergies: detectSynergies(ctx),
        evidenceRef: 'Fyfe et al., 2014 — Concurrent training interference review',
      };
    }

    if (isEnduranceGoal && cardioVolume < 2) {
      return {
        category: 'body_comp',
        bottleneck: 'Insufficient cardio volume for endurance/health goals — current volume below minimum effective dose',
        suggestedAction: 'Build to 150 min/week moderate cardio OR 75 min/week vigorous. Zone 2 (conversational pace) for base building, HIIT 1-2x/week for VO2 max.',
        effectLag: '4-8 weeks',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
        evidenceRef: 'ACSM guidelines — minimum cardio for health',
      };
    }

    return null;
  },

  motivation_adherence: (ctx: DiagnosisContext): DiagnosisResult | null => {
    const adherenceScore = ctx.scores.adherence;
    const adherenceFlag = ctx.constraints.adherenceFlag;
    const lifestyleConstraint = ctx.constraints.lifestyleConstraint;

    if (adherenceScore >= 4 && adherenceFlag === 'none' && lifestyleConstraint !== 'very_high') return null;

    if (adherenceFlag === 'critical' || adherenceScore < 3) {
      return {
        category: 'motivation_adherence',
        bottleneck: 'Critical adherence gap — execution is the bottleneck, not the protocol design',
        suggestedAction: 'Drop to Minimum Effective Dose: 2x/week full body, protein 1.6g/kg, 6.5h sleep minimum. Fix environment before optimizing content',
        effectLag: 'Immediate',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (adherenceFlag === 'perfectionism') {
      return {
        category: 'motivation_adherence',
        bottleneck: 'All-or-nothing pattern — one missed session derails the entire week',
        suggestedAction: 'Adopt the 80/80/80 rule: 80% compliance on 80% of days is success. Schedule make-up sessions. Progress > perfection',
        effectLag: 'Immediate',
        confidence: 'High',
        synergies: detectSynergies(ctx),
      };
    }

    if (lifestyleConstraint === 'very_high' || lifestyleConstraint === 'high') {
      return {
        category: 'motivation_adherence',
        bottleneck: 'Life demands exceed available time budget — protocol must fit the life, not the other way around',
        suggestedAction: 'Use the MDE protocol: 2-3x/week, compounds only, MEV per group. 30-45min sessions. Meal prep 1x/week',
        effectLag: 'Immediate',
        confidence: 'Medium',
        synergies: detectSynergies(ctx),
      };
    }

    return null;
  },
};

function detectSynergies(ctx: DiagnosisContext): { type: SynergyType; description: string }[] {
  return SYNERGY_RULES
    .filter(rule => rule.condition(ctx))
    .sort((a, b) => a.priority - b.priority)
    .map(rule => ({ type: rule.type, description: rule.description }));
}

export function diagnose(ctx: DiagnosisContext): {
  primary: DiagnosisResult | null;
  allResults: DiagnosisResult[];
  synergies: { type: SynergyType; description: string }[];
} {
  const results: (DiagnosisResult | null)[] = [
    // Order: safety + fundamentals first
    CATEGORY_RULES.motivation_adherence(ctx),
    CATEGORY_RULES.recovery_health(ctx),
    CATEGORY_RULES.body_comp(ctx),
    CATEGORY_RULES.cardio_endurance(ctx),
    CATEGORY_RULES.strength_performance(ctx),
  ];

  const allResults = results.filter((r): r is DiagnosisResult => r !== null);

  // Apply the "One Bottleneck Rule" from the vault
  if (allResults.length === 0) {
    return {
      primary: null,
      allResults: [],
      synergies: detectSynergies(ctx),
    };
  }

  return {
    primary: allResults[0],
    allResults,
    synergies: detectSynergies(ctx),
  };
}

export function getSynergyRecommendations(ctx: DiagnosisContext): SynergyRule[] {
  return SYNERGY_RULES
    .filter(rule => rule.condition(ctx))
    .sort((a, b) => a.priority - b.priority);
}
