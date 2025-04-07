
// Medical-related type definitions

export interface Vital {
  bloodPressure: string;
  height: string;
  weight: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
}

export interface SummaryFinding {
  glucoseMetabolism: string;
  proteins: string;
  lipidProfile: string;
  inflammation: string;
  metabolic: string;
  homocysteine: string;
  vitaminsMinerals: string;
  ironProfile: string;
  sexHormones: string;
  kidneyFunctionElectrolytes: string;
  liverFunctions: string;
  tumorMarkers: string;
  bloodCounts: string;
}

export interface NutritionRecommendation {
  nutritionalStyle: string;
  proteinConsumption: string;
  eatingWindow: string;
  limitations: string;
  additionalConsiderations: string;
}

export interface ExerciseRecommendation {
  focusOn: string;
  walking: string;
  restRecovery: string;
  tracking: string;
}

export interface SleepStressRecommendation {
  sleep: string;
  stress: string;
}

export interface FollowUp {
  withDoctor: string;
  forReason: string;
  date: string;
}

// Type guards for safer type checking
export function isVital(obj: any): obj is Vital {
  return obj && 
    typeof obj === 'object' && 
    'bloodPressure' in obj && 
    'height' in obj && 
    'weight' in obj;
}

export function isSummaryFinding(obj: any): obj is SummaryFinding {
  return obj && 
    typeof obj === 'object' && 
    'glucoseMetabolism' in obj && 
    'proteins' in obj &&
    'lipidProfile' in obj;
}

export function isNutritionRecommendation(obj: any): obj is NutritionRecommendation {
  return obj && 
    typeof obj === 'object' && 
    'nutritionalStyle' in obj && 
    'proteinConsumption' in obj &&
    'eatingWindow' in obj;
}

export function isExerciseRecommendation(obj: any): obj is ExerciseRecommendation {
  return obj && 
    typeof obj === 'object' && 
    'focusOn' in obj && 
    'walking' in obj &&
    'restRecovery' in obj && 
    'tracking' in obj;
}

export function isSleepStressRecommendation(obj: any): obj is SleepStressRecommendation {
  return obj && 
    typeof obj === 'object' && 
    'sleep' in obj && 
    'stress' in obj;
}

export function isFollowUp(obj: any): obj is FollowUp {
  return obj && 
    typeof obj === 'object' && 
    'withDoctor' in obj && 
    'forReason' in obj &&
    'date' in obj;
}
