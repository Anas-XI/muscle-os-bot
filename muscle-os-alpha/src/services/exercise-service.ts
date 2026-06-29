// Exercise Library — ported from vault's Exercise Index (104 exercises, 12 muscle groups)

export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'quads' | 'hamstrings' | 'glutes' | 'biceps' | 'triceps' | 'abs' | 'calves' | 'adductors' | 'abductors';
export type ExerciseLevel = 'novice' | 'intermediate' | 'advanced';
export type SFRRating = 'high' | 'medium' | 'low';
export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'band' | 'ez_bar' | 'smith' | 'kettlebell' | 'trap_bar';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  evidence: number;
  sfr: SFRRating;
  level: ExerciseLevel;
  equipment: Equipment[];
  description: string;
  formCues: string[];
  contraindications: string[];
}

const EXERCISES: Exercise[] = [
  // Chest
  { id: 'chest-01', name: 'Flat Barbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Primary chest builder', formCues: ['Retract scapulae', 'Arch upper back', 'Touch nipple line'], contraindications: ['Shoulder impingement'] },
  { id: 'chest-02', name: 'Incline Dumbbell Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['dumbbell'], description: 'Upper chest emphasis', formCues: ['30-45 deg incline', 'Full ROM', 'Controlled eccentric'], contraindications: [] },
  { id: 'chest-03', name: 'Weighted Chest Dips', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 8, sfr: 'high', level: 'advanced', equipment: ['bodyweight'], description: 'Lower chest emphasis', formCues: ['Lean forward', 'Elbows 45 deg', 'Depth to 90 deg'], contraindications: ['Shoulder instability'] },
  { id: 'chest-04', name: 'Seated Cable Fly', muscleGroup: 'chest', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['cable'], description: 'Isolation, stretch emphasis', formCues: ['Hands behind plane', 'Squeeze mid-line', 'Slow eccentric'], contraindications: [] },
  { id: 'chest-05', name: 'Pec Deck Machine', muscleGroup: 'chest', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Safe chest isolation', formCues: ['Elbows at shoulder height', 'Squeeze forward', 'Controlled'], contraindications: [] },

  // Back
  { id: 'back-01', name: 'Pull-Up (Strict)', muscleGroup: 'back', secondaryMuscles: ['biceps'], evidence: 10, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Primary lat builder', formCues: ['Pull sternum to bar', 'Control descent', 'No kipping'], contraindications: [] },
  { id: 'back-02', name: 'Barbell Bent-Over Row', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'biceps'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Compound back thickness', formCues: ['Hinge at hips', 'Pull to navel', 'Squeeze lats'], contraindications: ['Lower back injury'] },
  { id: 'back-03', name: 'Seated Cable Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], evidence: 9, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Safe row variation', formCues: ['Slight lean forward', 'Pull to stomach', 'Squeeze shoulder blades'], contraindications: [] },
  { id: 'back-04', name: 'Lat Pull-Down', muscleGroup: 'back', secondaryMuscles: ['biceps'], evidence: 9, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Pull-up alternative', formCues: ['Bar to upper chest', 'Lean back slightly', 'Elbows down'], contraindications: [] },
  { id: 'back-05', name: 'Single-Arm Dumbbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'hamstrings'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Unilateral back builder', formCues: ['Flat back', 'Pull to hip', 'Full stretch at bottom'], contraindications: [] },

  // Shoulders
  { id: 'sh-01', name: 'Standing Overhead Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Primary shoulder builder', formCues: ['Brace core', 'Bar path straight', 'Lips to lockout'], contraindications: ['Shoulder impingement'] },
  { id: 'sh-02', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], evidence: 9, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Safer press variation', formCues: ['Back supported', 'Palms forward', 'Full ROM'], contraindications: [] },
  { id: 'sh-03', name: 'Lateral Raise', muscleGroup: 'shoulders', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Medial delt isolation', formCues: ['Lead with elbows', 'Pinky up at top', 'Slight lean forward'], contraindications: [] },
  { id: 'sh-04', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['cable'], description: 'Constant tension lateral raise', formCues: ['Arm across body', 'Lead with elbow', 'Squeeze at top'], contraindications: [] },
  { id: 'sh-05', name: 'Face Pull', muscleGroup: 'shoulders', secondaryMuscles: ['back'], evidence: 6, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Rear delt + external rotation', formCues: ['Pull to face', 'Externally rotate', 'Slow tempo'], contraindications: [] },

  // Quads
  { id: 'quad-01', name: 'Back Squat (High Bar)', muscleGroup: 'quads', secondaryMuscles: ['hamstrings', 'glutes'], evidence: 10, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Primary quad builder', formCues: ['Chest up', 'Knees track toes', 'Depth to parallel'], contraindications: ['Knee injury', 'Lower back injury'] },
  { id: 'quad-02', name: 'Front Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], evidence: 9, sfr: 'medium', level: 'advanced', equipment: ['barbell'], description: 'Quad-dominant squat', formCues: ['Elbows up', 'Upright torso', 'Full depth'], contraindications: ['Wrist mobility issues'] },
  { id: 'quad-03', name: 'Bulgarian Split Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], evidence: 9, sfr: 'high', level: 'intermediate', equipment: ['dumbbell'], description: 'Unilateral quad builder', formCues: ['Front foot forward', 'Back foot elevated', 'Torso upright'], contraindications: [] },
  { id: 'quad-04', name: 'Leg Extension', muscleGroup: 'quads', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Quad isolation', formCues: ['Full ROM', 'Squeeze at top', 'Control descent'], contraindications: [] },
  { id: 'quad-05', name: 'Leg Press (Low/Narrow)', muscleGroup: 'quads', secondaryMuscles: ['glutes'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Heavy quad loading', formCues: ['Low foot position', 'Narrow stance', 'Full ROM'], contraindications: [] },

  // Hamstrings
  { id: 'ham-01', name: 'Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['barbell', 'dumbbell'], description: 'Hinge + hamstring stretch', formCues: ['Hinge at hips', 'Straight back', 'Stretch hamstrings at bottom'], contraindications: ['Lower back injury'] },
  { id: 'ham-02', name: 'Lying Leg Curl', muscleGroup: 'hamstrings', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Hamstring isolation', formCues: ['Hips pressed down', 'Full ROM', 'Squeeze at top'], contraindications: [] },
  { id: 'ham-03', name: 'Nordic Hamstring Curl', muscleGroup: 'hamstrings', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Eccentric hamstring builder', formCues: ['Anchored feet', 'Slow descent', 'Catch with hands'], contraindications: [] },
  { id: 'ham-04', name: 'Seated Leg Curl', muscleGroup: 'hamstrings', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Hamstring isolation (hip flexed)', formCues: ['Full ROM', 'Squeeze at peak', 'Slow eccentric'], contraindications: [] },
  { id: 'ham-05', name: 'Single-Leg Romanian Deadlift', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes'], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['dumbbell'], description: 'Unilateral hamstring stretch', formCues: ['Hinge at hips', 'Straight back', 'Stretch hamstrings'], contraindications: [] },

  // Glutes
  { id: 'glute-01', name: 'Barbell Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], evidence: 10, sfr: 'high', level: 'intermediate', equipment: ['barbell'], description: 'Primary glute builder', formCues: ['Chin tucked', 'Squeeze glutes at top', 'Shoulders on bench'], contraindications: [] },
  { id: 'glute-02', name: 'Step-Up (Loaded)', muscleGroup: 'glutes', secondaryMuscles: ['quads', 'hamstrings'], evidence: 10, sfr: 'high', level: 'intermediate', equipment: ['dumbbell', 'barbell'], description: 'Unilateral glute builder', formCues: ['Tall box', 'Drive through heel', 'No push-off'], contraindications: [] },
  { id: 'glute-03', name: 'Single-Leg Hip Thrust', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['bodyweight', 'dumbbell'], description: 'Unilateral glute focus', formCues: ['Squeeze glute', 'Full hip extension', 'Control descent'], contraindications: [] },
  { id: 'glute-04', name: 'Cable Pull-Through', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], evidence: 7, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Hinge + glute pump', formCues: ['Hip hinge', 'Pull between legs', 'Squeeze at top'], contraindications: [] },
  { id: 'glute-05', name: 'Reverse Hyperextension', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings', 'back'], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['machine', 'bodyweight'], description: 'Spinal decompression + glute', formCues: ['Squeeze glutes', 'Lift legs', 'Control descent'], contraindications: [] },

  // Biceps
  { id: 'bi-01', name: 'Concentration Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 10, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Peak biceps isolation', formCues: ['Elbow braced on thigh', 'Supinate fully', 'Slow eccentric'], contraindications: [] },
  { id: 'bi-02', name: 'Barbell Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 9, sfr: 'medium', level: 'novice', equipment: ['barbell', 'ez_bar'], description: 'Basic bicep builder', formCues: ['Elbows fixed at sides', 'Full supination', 'No swing'], contraindications: [] },
  { id: 'bi-03', name: 'Cable Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Constant tension curl', formCues: ['Elbows pinned', 'Full supination', 'Slow eccentric'], contraindications: [] },
  { id: 'bi-04', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['dumbbell'], description: 'Stretched biceps curl', formCues: ['Incline 60 deg', 'Arms hang straight', 'Full supination'], contraindications: [] },
  { id: 'bi-05', name: 'Hammer Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Brachialis focus', formCues: ['Neutral grip', 'Elbows fixed', 'Full ROM'], contraindications: [] },

  // Triceps
  { id: 'tri-01', name: 'Triangle Push-Up', muscleGroup: 'triceps', secondaryMuscles: ['chest'], evidence: 10, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Triceps compound', formCues: ['Hands diamond', 'Elbows tight', 'Chest to hands'], contraindications: ['Wrist pain'] },
  { id: 'tri-02', name: 'Triceps Dip (Upright)', muscleGroup: 'triceps', secondaryMuscles: ['chest'], evidence: 9, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Triceps isolation', formCues: ['Upright torso', '90 deg elbow', 'Full extension'], contraindications: ['Shoulder impingement'] },
  { id: 'tri-03', name: 'Close-Grip Bench Press', muscleGroup: 'triceps', secondaryMuscles: ['chest'], evidence: 8, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Heavy triceps', formCues: ['Shoulder-width grip', 'Elbows tucked', 'Full ROM'], contraindications: [] },
  { id: 'tri-04', name: 'Cable Pushdown (Rope)', muscleGroup: 'triceps', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Triceps isolation', formCues: ['Elbows pinned', 'Full extension', 'Split at bottom'], contraindications: [] },
  { id: 'tri-05', name: 'Overhead Triceps Extension', muscleGroup: 'triceps', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['dumbbell', 'cable'], description: 'Long head focus', formCues: ['Elbows pointed up', 'Full extension', 'Behind head stretch'], contraindications: [] },

  // Abs
  { id: 'abs-01', name: 'Cable Crunch', muscleGroup: 'abs', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Weighted ab isolation', formCues: ['Crunch down', 'Exhale at bottom', 'Control return'], contraindications: [] },
  { id: 'abs-02', name: 'Hanging Leg Raise', muscleGroup: 'abs', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Lower ab focus', formCues: ['Slow controlled', 'Legs straight', 'Pelvis posterior tilt'], contraindications: ['Shoulder instability'] },
  { id: 'abs-03', name: 'Ab Wheel Roll-Out', muscleGroup: 'abs', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Anti-extension core', formCues: ['Stay tight', 'Roll controlled', 'No sagging hips'], contraindications: ['Lower back injury'] },
  { id: 'abs-04', name: 'Plank', muscleGroup: 'abs', secondaryMuscles: ['shoulders'], evidence: 6, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Core endurance', formCues: ['Neutral spine', 'Brace abs', 'Hold max 60s'], contraindications: [] },
  { id: 'abs-05', name: 'Pallof Press', muscleGroup: 'abs', secondaryMuscles: [], evidence: 6, sfr: 'high', level: 'novice', equipment: ['cable', 'band'], description: 'Anti-rotation core', formCues: ['Side-on to cable', 'Press out', 'Resist rotation'], contraindications: [] },

  // Calves
  { id: 'calf-01', name: 'Standing Calf Raise', muscleGroup: 'calves', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['machine', 'smith'], description: 'Gastrocnemius focus', formCues: ['Full ROM', 'Squeeze at top', 'Slow stretch'], contraindications: [] },
  { id: 'calf-02', name: 'Seated Calf Raise', muscleGroup: 'calves', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['machine', 'dumbbell'], description: 'Soleus focus', formCues: ['Knees 90 deg', 'Full ROM', 'Slow tempo'], contraindications: [] },
  { id: 'calf-03', name: 'Leg Press Calf Raise', muscleGroup: 'calves', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Heavy calf loading', formCues: ['Toes on edge', 'Full extension', '30+ reps target'], contraindications: [] },
  { id: 'calf-04', name: 'Donkey Calf Raise', muscleGroup: 'calves', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['machine', 'bodyweight'], description: 'Gastrocnemius + lean', formCues: ['Hips bent', 'Full ROM', 'Control descent'], contraindications: [] },
  { id: 'calf-05', name: 'Single-Leg Standing Calf Raise', muscleGroup: 'calves', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['bodyweight', 'dumbbell'], description: 'Unilateral calf', formCues: ['Full ROM', 'Isolation focus', 'High reps'], contraindications: [] },

  // Adductors
  { id: 'add-01', name: 'Seated Hip Adduction Machine', muscleGroup: 'adductors', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Adductor isolation', formCues: ['Squeeze thighs together', 'Controlled return', 'Full ROM'], contraindications: [] },
  { id: 'add-02', name: 'Cable Hip Adduction', muscleGroup: 'adductors', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Standing adductor work', formCues: ['Ankle cuff', 'Cross in front', 'Slow release'], contraindications: [] },
  { id: 'add-03', name: 'Side-Lying Leg Raise (Adduction)', muscleGroup: 'adductors', secondaryMuscles: [], evidence: 6, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Bodyweight adductor', formCues: ['Bottom leg lift', 'Toe pointed', 'Control'], contraindications: [] },
  { id: 'add-04', name: 'Sumo Deadlift', muscleGroup: 'adductors', secondaryMuscles: ['glutes', 'hamstrings', 'quads', 'back'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Wide-stance deadlift', formCues: ['Wide stance', 'Toes out', 'Hinge at hips'], contraindications: ['Lower back injury'] },

  // Abductors
  { id: 'abd-01', name: 'Seated Hip Abduction Machine', muscleGroup: 'abductors', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Abductor isolation', formCues: ['Squeeze thighs apart', 'Controlled return', 'Full ROM'], contraindications: [] },
  { id: 'abd-02', name: 'Cable Hip Abduction', muscleGroup: 'abductors', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Standing abductor work', formCues: ['Ankle cuff', 'Lift leg out', 'Keep torso upright'], contraindications: [] },
  { id: 'abd-03', name: 'Side-Lying Leg Raise (Abduction)', muscleGroup: 'abductors', secondaryMuscles: [], evidence: 6, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Bodyweight abductor', formCues: ['Top leg lift', 'Toe slightly down', 'No hip shift'], contraindications: [] },
  { id: 'abd-04', name: 'Banded Lateral Walk', muscleGroup: 'abductors', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['band'], description: 'Glute med activation', formCues: ['Band above ankles', 'Half-squat position', 'Step laterally'], contraindications: [] },

  // Additional Chest
  { id: 'chest-06', name: 'Decline Barbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 7, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Lower chest emphasis', formCues: ['Decline angle', 'Touch below nipple', 'Controlled eccentric'], contraindications: ['Shoulder impingement'] },
  { id: 'chest-07', name: 'Incline Barbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 9, sfr: 'medium', level: 'intermediate', equipment: ['barbell'], description: 'Upper chest compound', formCues: ['30 deg incline', 'Touch upper chest', 'Retract scapulae'], contraindications: [] },
  { id: 'chest-08', name: 'Dumbbell Flat Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 9, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Safer bench variation', formCues: ['Neutral or pronated grip', 'Full ROM', 'Controlled descent'], contraindications: [] },
  { id: 'chest-09', name: 'Push-Up (Weighted)', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Bodyweight chest builder', formCues: ['Hands shoulder-width', 'Elbows 45 deg', 'Full chest-to-floor'], contraindications: [] },

  // Additional Back
  { id: 'back-06', name: 'T-Bar Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['barbell'], description: 'Mid-back thickness', formCues: ['Hinge at hips', 'Pull to chest', 'Squeeze mid-back'], contraindications: ['Lower back injury'] },
  { id: 'back-07', name: 'Chest-Supported Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Safe row for spine', formCues: ['Chest on pad', 'Pull to stomach', 'Squeeze shoulder blades'], contraindications: [] },
  { id: 'back-08', name: 'Pull-Over (Dumbbell)', muscleGroup: 'back', secondaryMuscles: ['chest', 'triceps'], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['dumbbell'], description: 'Lat stretch + contraction', formCues: ['Across bench', 'Full stretch overhead', 'Pull to stomach'], contraindications: [] },
  { id: 'back-09', name: 'Deadlift (Conventional)', muscleGroup: 'back', secondaryMuscles: ['hamstrings', 'glutes', 'quads'], evidence: 10, sfr: 'medium', level: 'advanced', equipment: ['barbell'], description: 'Full posterior chain compound', formCues: ['Hinge at hips', 'Straight back', 'Bar over midfoot'], contraindications: ['Lower back injury', 'Hernia'] },

  // Additional Shoulders
  { id: 'sh-06', name: 'Arnold Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['dumbbell'], description: 'Rotational shoulder press', formCues: ['Start palms facing', 'Rotate to pronated', 'Full ROM'], contraindications: [] },
  { id: 'sh-07', name: 'Reverse Pec Deck Fly', muscleGroup: 'shoulders', secondaryMuscles: ['back'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Rear delt isolation', formCues: ['Arms parallel', 'Squeeze behind', 'Elbows slightly bent'], contraindications: [] },
  { id: 'sh-08', name: 'Upright Row (Cable)', muscleGroup: 'shoulders', secondaryMuscles: ['biceps'], evidence: 7, sfr: 'medium', level: 'intermediate', equipment: ['cable', 'barbell'], description: 'Traps + lateral delt', formCues: ['Pull to chin', 'Elbows higher than hands', 'Controlled descent'], contraindications: ['Shoulder impingement'] },
  { id: 'sh-09', name: 'Front Raise', muscleGroup: 'shoulders', secondaryMuscles: [], evidence: 6, sfr: 'high', level: 'novice', equipment: ['dumbbell', 'cable'], description: 'Anterior delt isolation', formCues: ['Palms down', 'Lift to shoulder height', 'No momentum'], contraindications: [] },

  // Additional Quads
  { id: 'quad-06', name: 'Hack Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], evidence: 8, sfr: 'high', level: 'intermediate', equipment: ['machine'], description: 'Heavy quad loading', formCues: ['Back on pad', 'Knees track toes', 'Full depth'], contraindications: ['Knee injury'] },
  { id: 'quad-07', name: 'Goblet Squat', muscleGroup: 'quads', secondaryMuscles: ['glutes'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['dumbbell', 'kettlebell'], description: 'Beginner squat pattern', formCues: ['Heels down', 'Elbows between knees', 'Upright torso'], contraindications: [] },
  { id: 'quad-08', name: 'Reverse Nordic Curl', muscleGroup: 'quads', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Eccentric quad builder', formCues: ['Knees anchored', 'Lean back controlled', 'Full stretch'], contraindications: [] },
  { id: 'quad-09', name: 'Pistol Squat (Assisted)', muscleGroup: 'quads', secondaryMuscles: ['glutes', 'hamstrings'], evidence: 7, sfr: 'high', level: 'advanced', equipment: ['bodyweight'], description: 'Unilateral quad strength', formCues: ['Single leg', 'Full depth', 'Use support as needed'], contraindications: ['Knee injury'] },

  // Additional Hamstrings
  { id: 'ham-06', name: 'Good Morning', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], evidence: 8, sfr: 'medium', level: 'advanced', equipment: ['barbell'], description: 'Hinge + spinal erector', formCues: ['Bar on upper back', 'Hinge at hips', 'Maintain arch'], contraindications: ['Lower back injury'] },
  { id: 'ham-07', name: 'Kettlebell Swing', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes', 'back'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['kettlebell'], description: 'Hinge power builder', formCues: ['Hip hinge', 'Hollow at top', 'Arm-pull not shoulder-raise'], contraindications: ['Lower back injury'] },
  { id: 'ham-08', name: 'Slider Leg Curl', muscleGroup: 'hamstrings', secondaryMuscles: ['glutes'], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['bodyweight'], description: 'Bodyweight hamstring curl', formCues: ['Heels on sliders', 'Bridge up', 'Pull heels toward glutes'], contraindications: [] },

  // Additional Glutes
  { id: 'glute-06', name: 'Glute Kickback (Cable)', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Glute isolation', formCues: ['Kick straight back', 'Squeeze at top', 'No lower back arch'], contraindications: [] },
  { id: 'glute-07', name: 'Walking Lunge', muscleGroup: 'glutes', secondaryMuscles: ['quads', 'hamstrings'], evidence: 8, sfr: 'high', level: 'novice', equipment: ['dumbbell'], description: 'Dynamic glute + quad', formCues: ['Long stride', 'Front knee 90 deg', 'Upright torso'], contraindications: ['Knee injury'] },
  { id: 'glute-08', name: '45-Degree Hyperextension', muscleGroup: 'glutes', secondaryMuscles: ['hamstrings', 'back'], evidence: 7, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Glute + back developer', formCues: ['Hips on pad', 'Round back at bottom', 'Squeeze glutes at top'], contraindications: [] },

  // Additional Biceps
  { id: 'bi-06', name: 'Preacher Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'novice', equipment: ['barbell', 'dumbbell', 'ez_bar'], description: 'Isolated biceps curl', formCues: ['Arms on pad', 'Full extension at bottom', 'Squeeze at top'], contraindications: [] },
  { id: 'bi-07', name: 'Spider Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'intermediate', equipment: ['dumbbell'], description: 'Incline biceps isolation', formCues: ['Chest on incline', 'Arms hanging', 'Full supination'], contraindications: [] },
  { id: 'bi-08', name: 'Bayesian Cable Curl', muscleGroup: 'biceps', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Constant tension biceps', formCues: ['Low cable', 'Step away', 'Squeeze at peak'], contraindications: [] },

  // Additional Triceps
  { id: 'tri-06', name: 'Skull Crusher (Lying Triceps Extension)', muscleGroup: 'triceps', secondaryMuscles: [], evidence: 9, sfr: 'high', level: 'intermediate', equipment: ['barbell', 'dumbbell', 'ez_bar'], description: 'Long head emphasis', formCues: ['Lower to forehead', 'Elbows pointed up', 'Full extension'], contraindications: ['Elbow pain'] },
  { id: 'tri-07', name: 'Single-Arm Cable Pushdown', muscleGroup: 'triceps', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['cable'], description: 'Unilateral triceps', formCues: ['Elbow pinned', 'Full extension', 'Contraction emphasis'], contraindications: [] },
  { id: 'tri-08', name: 'JM Press', muscleGroup: 'triceps', secondaryMuscles: ['chest'], evidence: 7, sfr: 'medium', level: 'advanced', equipment: ['barbell'], description: 'Heavy triceps compound', formCues: ['Between bench and skull crusher path', 'Elbows tucked', 'Touch upper chest'], contraindications: ['Elbow pain'] },

  // Additional Abs
  { id: 'abs-06', name: 'Reverse Crunch', muscleGroup: 'abs', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Lower ab isolation', formCues: ['Knees to chest', 'Lift hips', 'Controlled return'], contraindications: [] },
  { id: 'abs-07', name: 'Dead Bug', muscleGroup: 'abs', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Core stability', formCues: ['Back flat on floor', 'Opposite arm/leg extend', 'Neutral spine'], contraindications: [] },
  { id: 'abs-08', name: 'Medicine Ball Slam', muscleGroup: 'abs', secondaryMuscles: ['shoulders'], evidence: 7, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Explosive core', formCues: ['Overhead reach', 'Slam with force', 'Squat to catch'], contraindications: [] },
  { id: 'abs-09', name: 'Dragon Flag', muscleGroup: 'abs', secondaryMuscles: [], evidence: 7, sfr: 'high', level: 'advanced', equipment: ['bodyweight'], description: 'Advanced core strength', formCues: ['Grip bench/bar', 'Body straight', 'Lower controlled'], contraindications: ['Lower back injury'] },

  // Additional Calves
  { id: 'calf-06', name: 'Calf Press on Leg Press', muscleGroup: 'calves', secondaryMuscles: [], evidence: 8, sfr: 'high', level: 'novice', equipment: ['machine'], description: 'Heavy calf press', formCues: ['Toes on edge', 'Full range', '10-20 reps'], contraindications: [] },
  { id: 'calf-07', name: 'Box Jump (Low Box)', muscleGroup: 'calves', secondaryMuscles: ['quads', 'glutes'], evidence: 7, sfr: 'medium', level: 'intermediate', equipment: ['bodyweight'], description: 'Plyometric calf + quad', formCues: ['Jump onto box', 'Soft landing', 'Stand tall'], contraindications: ['Knee injury'] },
  { id: 'calf-08', name: 'Jump Rope', muscleGroup: 'calves', secondaryMuscles: ['shoulders', 'abs'], evidence: 6, sfr: 'high', level: 'novice', equipment: ['bodyweight'], description: 'Calf conditioning + cardio', formCues: ['Light bounce', 'Wrist rotation', 'Keep head up'], contraindications: [] },
];

export function getAllExercises(): Exercise[] {
  return [...EXERCISES];
}

export function getExercisesByMuscleGroup(group: MuscleGroup): Exercise[] {
  return EXERCISES.filter(e => e.muscleGroup === group);
}

export function getExercisesByLevel(level: ExerciseLevel): Exercise[] {
  return EXERCISES.filter(e => e.level === level);
}

export function searchExercises(query: string): Exercise[] {
  const lower = query.toLowerCase();
  return EXERCISES.filter(e =>
    e.name.toLowerCase().includes(lower) ||
    e.muscleGroup.toLowerCase().includes(lower) ||
    e.description.toLowerCase().includes(lower)
  );
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export function getMuscleGroups(): MuscleGroup[] {
  return [...new Set(EXERCISES.map(e => e.muscleGroup))];
}

export function filterByEquipment(equipment: Equipment): Exercise[] {
  return EXERCISES.filter(e => e.equipment.includes(equipment));
}

export function generateProgram(
  goals: { muscleGroups: MuscleGroup[]; level: ExerciseLevel; equipment: Equipment[]; sessionsPerWeek: number },
): Exercise[] {
  const available = EXERCISES.filter(e =>
    goals.muscleGroups.includes(e.muscleGroup) &&
    e.equipment.some(eq => goals.equipment.includes(eq))
  );

  // Pick highest-evidence exercise per muscle group
  const selected = new Map<MuscleGroup, Exercise>();
  for (const group of goals.muscleGroups) {
    const candidates = available
      .filter(e => e.muscleGroup === group && e.level !== 'advanced') // avoid advanced by default
      .sort((a, b) => b.evidence - a.evidence);
    if (candidates.length > 0) selected.set(group, candidates[0]);
  }

  return [...selected.values()];
}

export function getSFRRatingColor(sfr: SFRRating): string {
  switch (sfr) {
    case 'high': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-red-400';
  }
}

export function getLevelLabel(level: ExerciseLevel): string {
  switch (level) {
    case 'novice': return 'Novice — safe for beginners';
    case 'intermediate': return 'Intermediate — requires control';
    case 'advanced': return 'Advanced — experienced only';
  }
}
