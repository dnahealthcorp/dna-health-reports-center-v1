
// Medical data related type definitions
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
  lipidProfile: string;
  inflammation: string;
  uricAcid: string;
  vitamins: string;
  minerals: string;
  sexHormones: string;
  renalLiverFunction: string;
  cancerMarkers: string;
}

export interface NutritionRecommendation {
  nutritionalPlan: string;
  proteinConsumption: string;
  omissions: string;
  additionalConsiderations: string;
}

export interface ExerciseRecommendation {
  focusOn: string;
  walking: string;
  avoid: string;
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

// Type guard functions
export function isVital(json: any): json is Vital {
  return (
    json &&
    typeof json === 'object' &&
    'bloodPressure' in json &&
    'height' in json &&
    'weight' in json
  );
}

export function isSummaryFinding(json: any): json is SummaryFinding {
  return (
    json &&
    typeof json === 'object' &&
    'glucoseMetabolism' in json &&
    'lipidProfile' in json &&
    'inflammation' in json &&
    'uricAcid' in json
  );
}

export function isNutritionRecommendation(json: any): json is NutritionRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'nutritionalPlan' in json
  );
}

export function isExerciseRecommendation(json: any): json is ExerciseRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'focusOn' in json
  );
}

export function isSleepStressRecommendation(json: any): json is SleepStressRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'sleep' in json &&
    'stress' in json
  );
}

export function isFollowUp(json: any): json is FollowUp {
  return (
    json &&
    typeof json === 'object' &&
    'withDoctor' in json &&
    'forReason' in json &&
    'date' in json
  );
}
