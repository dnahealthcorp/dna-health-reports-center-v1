
import { Medication, MedicationItem } from "@/types";

/**
 * Converts MedicationItem[] to Medication[] for compatibility with components
 * that expect full Medication objects
 */
export const convertMedicationItems = (
  medicationItems: MedicationItem[], 
  availableMedications: Medication[]
): Medication[] => {
  return medicationItems.map(item => {
    const foundMed = availableMedications.find(m => m.id === item.medicationId);
    if (foundMed) {
      return foundMed;
    }
    // Create a placeholder medication if the actual one isn't found
    return {
      id: item.medicationId || "",
      name: "Unknown Medication",
      dosage: item.dosage || "",
      notes: "",
      type: "medication",
      link: ""
    };
  });
};

/**
 * Helper function to convert patient data to form data when needed
 */
export const patientToFormData = (patient: any): any => {
  if (!patient) return null;
  
  return {
    patientInfo: {
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalRecordNumber: patient.medicalRecordNumber
    },
    // Add default empty values for other required fields
    vitals: {
      bloodPressure: '',
      height: '',
      weight: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    summaryFindings: {
      glucoseMetabolism: '',
      proteins: '',
      lipidProfile: '',
      inflammation: '',
      metabolic: '',
      homocysteine: '',
      vitaminsMinerals: '',
      ironProfile: '',
      sexHormones: '',
      kidneyFunctionElectrolytes: '',
      liverFunctions: '',
      tumorMarkers: '',
      bloodCounts: ''
    },
    medications: [],
    supplements: [],
    exerciseRecommendations: '',
    nurseNotes: '',
    doctorNotes: '',
    diagnosis: '',
    treatmentPlan: '',
    doctorName: '',
    showInsulinResistance: false,
    nutritionRecommendations: {
      nutritionalStyle: '',
      proteinConsumption: '',
      eatingWindow: '',
      limitations: '',
      additionalConsiderations: ''
    },
    exerciseDetail: {
      focusOn: '',
      walking: '',
      restRecovery: '',
      tracking: ''
    },
    sleepStressRecommendations: {
      sleep: '',
      stress: ''
    },
    followUps: []
  };
};
