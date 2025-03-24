
import { Medication, Patient, User, SummaryFinding, NutritionRecommendation, ExerciseRecommendation, SleepStressRecommendation, FollowUp } from "@/types";

export const mockMedications: Medication[] = [
  {
    id: "med1",
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "3 times daily",
    notes: "Take with food",
    type: "medication"
  },
  {
    id: "med2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    notes: "Take in the morning",
    type: "medication"
  },
  {
    id: "med3",
    name: "Metformin",
    dosage: "1000mg",
    frequency: "Twice daily",
    notes: "Take with meals",
    type: "medication"
  },
  {
    id: "med4",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    type: "medication"
  },
  {
    id: "med5",
    name: "Albuterol",
    dosage: "2 puffs",
    frequency: "Every 4-6 hours as needed",
    type: "medication"
  },
  {
    id: "med6",
    name: "Sertraline",
    dosage: "50mg",
    frequency: "Once daily",
    notes: "Take in the morning",
    type: "medication"
  },
  {
    id: "med7",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 6 hours as needed",
    notes: "Take with food",
    type: "medication"
  },
  {
    id: "med8",
    name: "Levothyroxine",
    dosage: "75mcg",
    frequency: "Once daily on empty stomach",
    type: "medication"
  },
  {
    id: "sup1",
    name: "Biogena Multispektrum",
    dosage: "2 capsules once daily in the morning (am)",
    frequency: "Once daily",
    notes: "",
    type: "supplement"
  },
  {
    id: "sup2",
    name: "Biogena Omni Lactis",
    dosage: "2 capsules once daily with food (any time)",
    frequency: "Once daily",
    notes: "",
    type: "supplement"
  }
];

export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "Jane Smith",
    dateOfBirth: "1985-04-12",
    gender: "Female",
    medicalRecordNumber: "MRN78901",
    lastUpdated: "2023-11-15T09:30:00",
    status: "nurse-pending"
  },
  {
    id: "p2",
    name: "John Doe",
    dateOfBirth: "1978-08-23",
    gender: "Male",
    medicalRecordNumber: "MRN12345",
    lastUpdated: "2023-11-14T14:45:00",
    status: "doctor-pending"
  },
  {
    id: "p3",
    name: "Emily Johnson",
    dateOfBirth: "1992-01-30",
    gender: "Female",
    medicalRecordNumber: "MRN45678",
    lastUpdated: "2023-11-13T11:15:00",
    status: "completed"
  },
  {
    id: "p4",
    name: "Michael Chen",
    dateOfBirth: "1965-11-08",
    gender: "Male",
    medicalRecordNumber: "MRN34567",
    lastUpdated: "2023-11-15T16:20:00",
    status: "nurse-pending"
  },
  {
    id: "p5",
    name: "Sarah Wilson",
    dateOfBirth: "1990-07-17",
    gender: "Female",
    medicalRecordNumber: "MRN23456",
    lastUpdated: "2023-11-14T10:10:00",
    status: "doctor-pending"
  }
];

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Dr. Elizabeth Taylor",
    role: "doctor",
    email: "elizabeth.taylor@hospital.com"
  },
  {
    id: "u2",
    name: "Nurse Richard Brown",
    role: "nurse",
    email: "richard.brown@hospital.com"
  },
  {
    id: "u3",
    name: "Admin User",
    role: "admin",
    email: "admin@hospital.com"
  }
];

export const getPatients = () => {
  return Promise.resolve(mockPatients);
};

export const getPatientById = (id: string) => {
  const patient = mockPatients.find(p => p.id === id);
  return Promise.resolve(patient);
};

export const getMedications = () => {
  return Promise.resolve(mockMedications);
};

export const getCurrentUser = () => {
  // For demo purposes, we'll default to nurse
  return Promise.resolve(mockUsers[1]);
};

export const getPatientFormData = (patientId: string) => {
  // Initialize empty SummaryFinding object
  const emptySummaryFinding: SummaryFinding = {
    glucoseMetabolism: '',
    lipidProfile: '',
    inflammation: '',
    uricAcid: '',
    vitamins: '',
    minerals: '',
    sexHormones: '',
    renalLiverFunction: '',
    cancerMarkers: ''
  };

  const emptyNutritionRecommendation: NutritionRecommendation = {
    nutritionalPlan: '',
    proteinConsumption: '',
    omissions: '',
    additionalConsiderations: ''
  };

  const emptyExerciseRecommendation: ExerciseRecommendation = {
    focusOn: '',
    walking: '',
    avoid: '',
    tracking: ''
  };

  const emptySleepStressRecommendation: SleepStressRecommendation = {
    sleep: '',
    stress: ''
  };

  const emptyFollowUp: FollowUp = {
    withDoctor: 'Dr Nas',
    forReason: 'Follow up',
    date: '23/10/2025'
  };

  // Mock form data for a patient
  return Promise.resolve({
    patientInfo: {
      name: mockPatients.find(p => p.id === patientId)?.name || "",
      dateOfBirth: mockPatients.find(p => p.id === patientId)?.dateOfBirth || "",
      gender: mockPatients.find(p => p.id === patientId)?.gender || "",
      medicalRecordNumber: mockPatients.find(p => p.id === patientId)?.medicalRecordNumber || ""
    },
    vitals: {
      bloodPressure: "120/80",
      height: "5'10\"",
      weight: "170"
    },
    summaryFindings: emptySummaryFinding,
    medications: [
      {
        id: "pm1",
        medicationId: "med1",
        dosage: "500mg",
        frequency: "3 times daily",
        notes: "Take with food"
      }
    ],
    supplements: [
      {
        id: "ps1",
        supplementId: "sup1",
        dosage: "2 capsules once daily in the morning (am)",
        source: "Clinic"
      }
    ],
    exerciseRecommendations: "30 minutes of moderate activity 5 days per week",
    nurseNotes: "Patient reports occasional headaches in the morning",
    doctorNotes: "",
    diagnosis: "",
    treatmentPlan: "",
    showInsulinResistance: false,
    nutritionRecommendations: emptyNutritionRecommendation,
    exerciseDetail: emptyExerciseRecommendation,
    sleepStressRecommendations: emptySleepStressRecommendation,
    followUps: [emptyFollowUp]
  });
};
