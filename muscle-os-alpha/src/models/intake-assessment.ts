export interface CardioProfile {
  sessionsPerWeek: '0' | '1' | '2' | '3_4' | '5_plus';
  primaryType: 'none' | 'walking' | 'running' | 'cycling' | 'swimming' | 'rowing' | 'other';
  dailySteps: 'under_5k' | '5_8k' | '8_10k' | '10k_plus' | 'unknown';
}

export interface PsychProfile {
  motivationSource: 'enjoyment' | 'results' | 'identity' | 'obligation' | 'social';
  selfExperimentation: 'very_open' | 'somewhat_open' | 'neutral' | 'skeptical' | 'not_interested';
  accountabilityPref: 'self' | 'app_reminders' | 'coach' | 'training_partner' | 'community';
}

export interface SleepProfile {
  chronotype: 'morning' | 'intermediate' | 'evening';
  caffeineTiming: 'morning_only' | 'pre_workout' | 'afternoon' | 'all_day' | 'none';
}

export interface NutritionDetail {
  fiberServings: '0_1' | '2_3' | '4_5' | '6_plus';
  supplements: string[];
  digestiveHealth: 'good' | 'mild_bloating' | 'frequent_issues' | 'diagnosed_condition';
}

export interface FemaleHealth {
  trackCycle: 'yes_track' | 'no_track' | 'na';
  contraception: 'none' | 'hormonal' | 'non_hormonal_iud' | 'other' | 'na';
  pregnancyStatus: 'no' | 'trying' | 'pregnant' | 'postpartum_under_6mo' | 'postpartum_6mo_plus' | 'na';
}

export interface IntakeAssessment {
  scores: {
    trainingHistory: number;
    nutrition: number;
    recovery: number;
    adherence: number;
    cardio: number;
    total: number;
  };
  flags: string[];
  constraintProfile: {
    timeConstraint: 'none' | 'moderate' | 'severe';
    equipment: 'minimal' | 'home_light' | 'home_full' | 'full' | 'na';
    injury: 'none' | 'minor' | 'moderate' | 'major';
    injuryLocation: string;
    lifestyleConstraint: 'none' | 'moderate' | 'high' | 'very_high';
    adherenceFlag: 'none' | 'perfectionism' | 'gap' | 'critical' | 'serious';
    multipleDietHistory: boolean;
    workType: 'sedentary' | 'standing' | 'active' | 'physical_labor' | 'mixed' | 'unknown';
    travelFreq: 'never' | 'monthly_or_less' | 'weekly' | 'often';
  };
  archetype: 'Beginner' | 'Intermediate Plateaued' | 'Busy Professional' | 'Fat Loss Client' | 'Strength Athlete' | 'Masters Athlete' | 'Endurance Hybrid';
  pillarPriorities: string[];
  cardioProfile: CardioProfile;
  psychProfile: PsychProfile;
  sleepProfile: SleepProfile;
  nutritionDetail: NutritionDetail;
  femaleHealth: FemaleHealth;
  answers: Record<string, string>;
}

export interface IntakeQuestion {
  id: string;
  section: number;
  sectionLabel: string;
  label: string;
  options: { value: string; label: string; score?: number; flag?: string }[];
  skipIf?: (answers: Record<string, string>) => boolean;
}
