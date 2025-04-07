
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
    'inflammation' in json
  );
}

export function isNutritionRecommendation(json: any): json is NutritionRecommendation {
  return (
    json &&
    typeof json === 'object' &&
    'nutritionalStyle' in json
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

// Helper function to sanitize HTML (basic implementation)
export function sanitizeHtml(html: string): string {
  // In a production app, you'd want to use a proper HTML sanitizer
  // like DOMPurify, but for this example, we'll use a simple implementation
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// Helper function to determine if text is HTML
export function isHtml(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(text);
}
