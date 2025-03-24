
import { Medication, Patient, PatientFormData, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock medications data
export const mockMedications: Medication[] = [
  {
    id: "med1",
    name: "Metformin",
    dosage: "500mg twice daily",
    type: "medication",
    notes: "Take with food"
  },
  {
    id: "med2",
    name: "Lisinopril",
    dosage: "10mg daily",
    type: "medication",
    notes: "Take in the morning"
  },
  {
    id: "med3",
    name: "Atorvastatin",
    dosage: "20mg daily",
    type: "medication",
    notes: "Take in the evening"
  },
  {
    id: "med4",
    name: "Aspirin",
    dosage: "81mg daily",
    type: "medication",
    notes: "Take with food"
  },
  {
    id: "supp1",
    name: "Vitamin D",
    dosage: "2000 IU daily",
    type: "supplement"
  },
  {
    id: "supp2",
    name: "Omega-3 Fish Oil",
    dosage: "1000mg daily",
    type: "supplement"
  },
  {
    id: "supp3",
    name: "Magnesium Glycinate",
    dosage: "400mg before bed",
    type: "supplement",
    notes: "Good for sleep"
  },
  {
    id: "supp4",
    name: "Zinc",
    dosage: "15mg daily",
    type: "supplement",
    notes: "Take with food"
  },
  {
    id: "supp5",
    name: "Vitamin B Complex",
    dosage: "1 tablet daily",
    type: "supplement"
  },
  {
    id: "supp6",
    name: "Berberine",
    dosage: "500mg three times daily",
    type: "supplement",
    notes: "Take with meals for blood sugar management"
  }
];

// Mock patients data
export const mockPatients: Patient[] = [
  {
    id: "patient1",
    name: "John Doe",
    dateOfBirth: "1970-05-15",
    gender: "Male",
    medicalRecordNumber: "MRN-12345678",
    lastUpdated: new Date().toISOString(),
    status: "nurse-pending"
  },
  {
    id: "patient2",
    name: "Jane Smith",
    dateOfBirth: "1985-08-22",
    gender: "Female",
    medicalRecordNumber: "MRN-23456789",
    lastUpdated: new Date().toISOString(),
    status: "doctor-pending"
  },
  {
    id: "patient3",
    name: "Michael Johnson",
    dateOfBirth: "1965-01-10",
    gender: "Male",
    medicalRecordNumber: "MRN-34567890",
    lastUpdated: new Date().toISOString(),
    status: "completed"
  }
];

// Mock users data
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Nurse Nancy",
    email: "nurse@example.com",
    role: "nurse"
  },
  {
    id: "user2",
    name: "Dr. Smith",
    email: "doctor@example.com",
    role: "doctor"
  },
  {
    id: "user3",
    name: "Admin Alex",
    email: "admin@example.com",
    role: "admin"
  }
];

// Mock patient form data function
export const getPatientFormData = (patientId: string): Promise<PatientFormData | null> => {
  const patient = mockPatients.find(p => p.id === patientId);
  
  if (!patient) {
    return Promise.resolve(null);
  }
  
  const patientMedications = [
    {
      id: uuidv4(),
      medicationId: "med1",
      dosage: "500mg twice daily"
    },
    {
      id: uuidv4(),
      medicationId: "med2",
      dosage: "20mg at night"
    }
  ];
  
  const supplements = [
    {
      id: uuidv4(),
      supplementId: "supp1",
      dosage: "2000 IU",
      source: "Thorne"
    },
    {
      id: uuidv4(),
      supplementId: "supp2",
      dosage: "1000mg",
      source: "Nordic Naturals"
    }
  ];
  
  const mockFormData: PatientFormData = {
    patientInfo: {
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalRecordNumber: patient.medicalRecordNumber
    },
    vitals: {
      bloodPressure: "120/80",
      height: "172",
      weight: "70",
      heartRate: "78",
      temperature: "36.6",
      respiratoryRate: "16",
      oxygenSaturation: "98"
    },
    summaryFindings: {
      glucoseMetabolism: "Normal fasting glucose. HbA1c is 5.4%.",
      lipidProfile: "Total cholesterol: 180 mg/dL, LDL: 100 mg/dL, HDL: 55 mg/dL, Triglycerides: 120 mg/dL",
      inflammation: "CRP: 1.2 mg/L, ESR: 10 mm/hr",
      uricAcid: "5.2 mg/dL",
      vitamins: "Vitamin D: 35 ng/mL, B12: 450 pg/mL",
      minerals: "Iron: 85 μg/dL, Magnesium: 2.1 mg/dL, Zinc: 90 μg/dL",
      sexHormones: "Normal for age",
      renalLiverFunction: "BUN: 15 mg/dL, Creatinine: 0.9 mg/dL, eGFR: >90 mL/min, AST: 22 U/L, ALT: 25 U/L",
      cancerMarkers: "Within normal limits"
    },
    medications: patientMedications,
    supplements: supplements,
    exerciseRecommendations: "30 minutes of moderate activity 5 times per week",
    nurseNotes: "Patient reports occasional headaches, otherwise feeling well",
    doctorNotes: "Patient is in good health. Continue current management plan.",
    diagnosis: "Essential hypertension, well-controlled",
    treatmentPlan: "Continue current medications. Follow up in 6 months.",
    showInsulinResistance: false,
    nutritionRecommendations: {
      nutritionalPlan: "Mediterranean diet with emphasis on whole foods",
      proteinConsumption: "1g per kg of body weight daily",
      omissions: "Limit processed foods and added sugars",
      additionalConsiderations: "Patient has lactose intolerance - recommend plant-based alternatives"
    },
    exerciseDetail: {
      focusOn: "Aerobic exercise and strength training",
      walking: "10,000 steps daily",
      avoid: "High-impact activities due to knee pain",
      tracking: "Recommend using fitness tracker app"
    },
    sleepStressRecommendations: {
      sleep: "Aim for 7-8 hours of sleep. Practice good sleep hygiene.",
      stress: "Daily meditation for 10 minutes. Consider yoga."
    },
    followUps: [
      {
        withDoctor: "Dr. Smith",
        forReason: "Blood pressure check",
        date: "2023-09-15"
      },
      {
        withDoctor: "Dr. Jones",
        forReason: "Annual physical",
        date: "2023-12-10"
      }
    ]
  };
  
  return Promise.resolve(mockFormData);
};
