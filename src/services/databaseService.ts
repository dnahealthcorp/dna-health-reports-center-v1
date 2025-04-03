// Database service implementation using Supabase
import { 
  Patient, PatientFormData, User, PDFFile, Json,
  isVital, isSummaryFinding, isNutritionRecommendation, isExerciseRecommendation,
  isSleepStressRecommendation, isFollowUp, isMedicationItem, isSupplementItem,
  MedicationItem, SupplementItem, Vital, SummaryFinding, FollowUp,
  NutritionRecommendation, ExerciseRecommendation, SleepStressRecommendation,
  toJson, safeJsonArray, Medication
} from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Initialize with mock data for fallback
const initializeFromMockData = async () => {
  try {
    // Import mock data only if needed
    const mockData = await import("@/lib/mockData");
    return {
      mockPatients: mockData.mockPatients,
      mockMedications: mockData.mockMedications,
      mockUsers: mockData.mockUsers,
      getPatientFormData: mockData.getPatientFormData
    };
  } catch (error) {
    console.error("Failed to initialize mock data:", error);
    return {
      mockPatients: [],
      mockMedications: [],
      mockUsers: [],
      getPatientFormData: () => Promise.resolve(null)
    };
  }
};

// Helper function to convert snake_case database objects to camelCase application objects
const mapPatientFromDB = (dbPatient: any): Patient => {
  return {
    id: dbPatient.id,
    name: dbPatient.name,
    dateOfBirth: dbPatient.date_of_birth,
    gender: dbPatient.gender,
    medicalRecordNumber: dbPatient.medical_record_number,
    lastUpdated: dbPatient.last_updated,
    status: dbPatient.status,
    pdfFiles: dbPatient.pdfFiles || undefined,
    created_at: dbPatient.created_at,
    pdf_exported: dbPatient.pdf_exported,
    status_updated_at: dbPatient.status_updated_at,
    created_by: dbPatient.created_by,
    createdByName: dbPatient.users?.name || "Unknown"
  };
};

const mapUserFromDB = (dbUser: any): User => {
  // Ensure role is one of the allowed values
  let role: 'nurse' | 'doctor' | 'admin' = 'nurse'; // Default
  
  if (dbUser.role === 'nurse' || dbUser.role === 'doctor' || dbUser.role === 'admin') {
    role = dbUser.role as 'nurse' | 'doctor' | 'admin';
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: role
  };
};

const mapMedicationFromDB = (dbMedication: any): Medication => {
  return {
    id: dbMedication.id,
    name: dbMedication.name,
    dosage: dbMedication.dosage,
    notes: dbMedication.notes || undefined,
    type: dbMedication.type as 'medication' | 'supplement',
    link: dbMedication.link || undefined
  };
};

// Function to safely convert JSON values to typed arrays with improved type safety
function safeJsonArrayConversion<T>(jsonArray: Json | null | undefined, typeGuard: (item: any) => boolean): T[] {
  if (!jsonArray || !Array.isArray(jsonArray)) {
    return [];
  }
  
  // Filter the array first to get only items that pass the type guard
  const filteredArray = jsonArray.filter(item => typeGuard(item));
  
  // Then do a type assertion to T[] since we've verified the types
  return filteredArray as unknown as T[];
}

// Patient operations
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        users:created_by (
          name
        )
      `)
      .order('last_updated', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Map database format to application format
    return (data || []).map(mapPatientFromDB);
  } catch (error) {
    console.error("Error getting patients from Supabase:", error);
    
    // Fallback to mock data
    const { mockPatients } = await initializeFromMockData();
    return mockPatients;
  }
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    // First try by ID
    let { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // If not found by ID, try by medical record number
      const { data: mrnData, error: mrnError } = await supabase
        .from('patients')
        .select('*')
        .eq('medical_record_number', id)
        .single();
        
      if (mrnError) {
        throw mrnError;
      }
      
      data = mrnData;
    }
    
    return data ? mapPatientFromDB(data) : null;
  } catch (error) {
    console.error(`Error getting patient by ID ${id} from Supabase:`, error);
    
    // Fallback to mock data
    const { mockPatients } = await initializeFromMockData();
    return mockPatients.find(p => p.id === id || p.medicalRecordNumber === id) || null;
  }
};

export const addPatient = async (patient: Patient): Promise<Patient> => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    // Make sure patient has an ID if not provided
    const patientWithId = {
      ...patient,
      id: patient.id || uuidv4()
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        id: patientWithId.id,
        name: patientWithId.name,
        date_of_birth: patientWithId.dateOfBirth,
        gender: patientWithId.gender,
        medical_record_number: patientWithId.medicalRecordNumber,
        last_updated: new Date().toISOString(),
        status: patientWithId.status,
        created_at: new Date().toISOString(),
        pdf_exported: false,
        created_by: currentUser?.id || null
      }])
      .select();
    
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    
    // Create an empty form data for this patient
    await createEmptyPatientFormData(patientWithId.id);
    
    // Add the createdByName for display purposes
    patientWithId.createdByName = currentUser?.name || "Unknown";
    
    return patientWithId;
  } catch (error) {
    console.error("Error adding patient to Supabase:", error);
    throw error;
  }
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
  try {
    const { error } = await supabase
      .from('patients')
      .update({
        name: patient.name,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        medical_record_number: patient.medicalRecordNumber,
        last_updated: new Date().toISOString(),
        status: patient.status,
        pdf_exported: patient.pdf_exported
      })
      .eq('id', patient.id);
    
    if (error) {
      throw error;
    }
    
    return patient;
  } catch (error) {
    console.error(`Error updating patient ${patient.id} in Supabase:`, error);
    throw error;
  }
};

export const deletePatient = async (id: string): Promise<void> => {
  try {
    console.log(`DatabaseService: Starting deletion process for patient with ID: ${id}`);
    
    // Step 1: Delete patient form data
    const { error: formError } = await supabase
      .from('patient_form_data')
      .delete()
      .eq('patient_id', id);
      
    if (formError) {
      console.error(`DatabaseService: Error deleting form data for patient ${id}:`, formError);
      throw new Error(`Failed to delete patient form data: ${formError.message}`);
    }
    
    console.log(`DatabaseService: Successfully deleted form data for patient ${id}`);
    
    // Step 2: Delete any PDF files associated with the patient
    const { error: pdfError } = await supabase
      .from('pdf_files')
      .delete()
      .eq('patient_id', id);
      
    if (pdfError) {
      console.error(`DatabaseService: Error deleting PDF files for patient ${id}:`, pdfError);
      // We'll continue with patient deletion even if PDF deletion fails
      // but we log the error for debugging purposes
    } else {
      console.log(`DatabaseService: Successfully deleted any PDF files for patient ${id}`);
    }
    
    // Step 3: Delete the patient record itself
    const { error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (patientError) {
      console.error(`DatabaseService: Error in final patient deletion step for ${id}:`, patientError);
      throw new Error(`Failed to delete patient record: ${patientError.message}`);
    }
    
    console.log(`DatabaseService: Successfully deleted patient with ID: ${id}`);
  } catch (error) {
    console.error(`DatabaseService: Error deleting patient ${id} from Supabase:`, error);
    throw error; // Re-throw to allow calling code to handle the error
  }
};

// Create empty form data for a new patient
const createEmptyPatientFormData = async (patientId: string): Promise<void> => {
  try {
    const patient = await getPatientById(patientId);
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    const emptyFormData: PatientFormData = {
      patientInfo: {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      },
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
    
    await savePatientFormData(patientId, emptyFormData);
  } catch (error) {
    console.error(`Error creating empty form data for patient ${patientId}:`, error);
    throw error;
  }
};

// Form data operations
export const getPatientFormData = async (patientId: string): Promise<PatientFormData | null> => {
  try {
    const { data, error } = await supabase
      .from('patient_form_data')
      .select('*')
      .eq('patient_id', patientId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Set up default values
    const defaultVitals: Vital = {
      bloodPressure: '',
      height: '',
      weight: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    };
    
    const defaultSummaryFindings: SummaryFinding = {
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
    };
    
    const defaultNutritionRecs: NutritionRecommendation = {
      nutritionalStyle: '',
      proteinConsumption: '',
      eatingWindow: '',
      limitations: '',
      additionalConsiderations: ''
    };
    
    const defaultExerciseDetail: ExerciseRecommendation = {
      focusOn: '',
      walking: '',
      restRecovery: '',
      tracking: ''
    };
    
    const defaultSleepStressRecs: SleepStressRecommendation = {
      sleep: '',
      stress: ''
    };
    
    // Safely check and convert the JSON fields with proper type handling
    const vitals = data.vitals && typeof data.vitals === 'object' && isVital(data.vitals)
      ? data.vitals
      : defaultVitals;
      
    const summaryFindings = data.summary_findings && typeof data.summary_findings === 'object' && isSummaryFinding(data.summary_findings)
      ? data.summary_findings
      : defaultSummaryFindings;
    
    const medications = safeJsonArrayConversion<MedicationItem>(
      data.medications as Json, 
      isMedicationItem
    );
    
    const supplements = safeJsonArrayConversion<SupplementItem>(
      data.supplements as Json,
      isSupplementItem
    );
    
    const nutritionRecommendations = data.nutrition_recommendations && typeof data.nutrition_recommendations === 'object' && isNutritionRecommendation(data.nutrition_recommendations)
      ? data.nutrition_recommendations
      : defaultNutritionRecs;
    
    const exerciseDetail = data.exercise_detail && typeof data.exercise_detail === 'object' && isExerciseRecommendation(data.exercise_detail)
      ? data.exercise_detail
      : defaultExerciseDetail;
    
    const sleepStressRecommendations = data.sleep_stress_recommendations && typeof data.sleep_stress_recommendations === 'object' && isSleepStressRecommendation(data.sleep_stress_recommendations)
      ? data.sleep_stress_recommendations
      : defaultSleepStressRecs;
    
    const followUps = safeJsonArrayConversion<FollowUp>(
      data.follow_ups as Json,
      isFollowUp
    );
    
    // Fix: Safely handle doctor_name by checking if it exists in the data object
    // If it doesn't exist or is null, default to empty string
    const doctorName = 'doctor_name' in data ? data.doctor_name || '' : '';
    
    const formData: PatientFormData = {
      patientInfo: {
        name: '',
        dateOfBirth: '',
        gender: '',
        medicalRecordNumber: ''
      },
      vitals,
      summaryFindings,
      medications,
      supplements,
      exerciseRecommendations: data.exercise_recommendations || '',
      nurseNotes: data.nurse_notes || '',
      doctorNotes: data.doctor_notes || '',
      diagnosis: data.diagnosis || '',
      treatmentPlan: data.treatment_plan || '',
      doctorName: doctorName,
      showInsulinResistance: Boolean(data.show_insulin_resistance),
      nutritionRecommendations,
      exerciseDetail,
      sleepStressRecommendations,
      followUps
    };
    
    // Get patient info
    const patient = await getPatientById(patientId);
    if (patient) {
      formData.patientInfo = {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      };
    }
    
    return formData;
  } catch (error) {
    console.error(`Error getting form data for patient ${patientId} from Supabase:`, error);
    
    // Fallback to mock data
    const { getPatientFormData: getMockPatientFormData } = await initializeFromMockData();
    return getMockPatientFormData(patientId);
  }
};

export const savePatientFormData = async (patientId: string, formData: PatientFormData): Promise<PatientFormData> => {
  try {
    // Check if record exists
    const { data, error: checkError } = await supabase
      .from('patient_form_data')
      .select('id')
      .eq('patient_id', patientId);
      
    if (checkError) {
      throw checkError;
    }
    
    // Convert form data to database format - casting complex objects to JSON
    const dbFormData = {
      patient_id: patientId,
      vitals: toJson(formData.vitals),
      summary_findings: toJson(formData.summaryFindings),
      medications: safeJsonArray(formData.medications),
      supplements: safeJsonArray(formData.supplements || []),
      exercise_recommendations: formData.exerciseRecommendations,
      nurse_notes: formData.nurseNotes,
      doctor_notes: formData.doctorNotes,
      doctor_name: formData.doctorName,
      diagnosis: formData.diagnosis,
      treatment_plan: formData.treatmentPlan,
      show_insulin_resistance: formData.showInsulinResistance,
      nutrition_recommendations: toJson(formData.nutritionRecommendations),
      exercise_detail: toJson(formData.exerciseDetail),
      sleep_stress_recommendations: toJson(formData.sleepStressRecommendations),
      follow_ups: safeJsonArray(formData.followUps),
      last_updated: new Date().toISOString()
    };
    
    // Insert or update
    let error;
    if (data && data.length > 0) {
      // Update
      const { error: updateError } = await supabase
        .from('patient_form_data')
        .update(dbFormData)
        .eq('patient_id', patientId);
        
      error = updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('patient_form_data')
        .insert([dbFormData]);
        
      error = insertError;
    }
    
    if (error) {
      throw error;
    }
    
    // Update last updated time on patient
    const patient = await getPatientById(patientId);
    if (patient) {
      patient.lastUpdated = new Date().toISOString();
      await updatePatient(patient);
    }
    
    return formData;
  } catch (error) {
    console.error(`Error saving form data for patient ${patientId} to Supabase:`, error);
    throw error;
  }
};

// Medication operations
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    // Transform from database schema to application schema
    const medications: Medication[] = (data || []).map(mapMedicationFromDB);
    
    return medications;
  } catch (error) {
    console.error("Error getting medications from Supabase:", error);
    
    // Fallback to mock data
    const { mockMedications } = await initializeFromMockData();
    return mockMedications;
  }
};

export const addMedication = async (medication: Medication): Promise<Medication> => {
  try {
    // Make sure medication has an ID if not provided
    const medicationWithId = {
      ...medication,
      id: medication.id || uuidv4()
    };
    
    const { error } = await supabase
      .from('medications')
      .insert({
        id: medicationWithId.id,
        name: medicationWithId.name,
        dosage: medicationWithId.dosage,
        notes: medicationWithId.notes,
        type: medicationWithId.type,
        link: medicationWithId.link
      });
    
    if (error) {
      throw error;
    }
    
    return medicationWithId;
  } catch (error) {
    console.error("Error adding medication to Supabase:", error);
    throw error;
  }
};

export const updateMedication = async (medication: Medication): Promise<Medication> => {
  try {
    const { error } = await supabase
      .from('medications')
      .update({
        name: medication.name,
        dosage: medication.dosage,
        notes: medication.notes,
        type: medication.type,
        link: medication.link
      })
      .eq('id', medication.id);
    
    if (error) {
      throw error;
    }
    
    return medication;
  } catch (error) {
    console.error(`Error updating medication ${medication.id} in Supabase:`, error);
    throw error;
  }
};

export const deleteMedication = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting medication ${id} from Supabase:`, error);
    throw error;
  }
};

// User operations
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return (data || []).map(mapUserFromDB);
  } catch (error) {
    console.error("Error getting users from Supabase:", error);
    
    // Fallback to mock data
    const { mockUsers } = await initializeFromMockData();
    return mockUsers;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Get authentication state
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      return null;
    }
    
    // Get user from our users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.session.user.id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data ? mapUserFromDB(data) : null;
  } catch (error) {
    console.error("Error getting current user from Supabase:", error);
    
    // Fallback to first user in mock data
    const { mockUsers } = await initializeFromMockData();
    return mockUsers[0] || null;
  }
};

export const setCurrentUser = async (user: User): Promise<User> => {
  try {
    // Verify user has a valid UUID
    if (!user.id || user.id.trim() === '') {
      throw new Error('User ID cannot be empty');
    }
    
    // Check if user exists
    const { data, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id);
      
    if (checkError) {
      throw checkError;
    }
    
    // Insert or update
    let error;
    if (data && data.length > 0) {
      // Update
      console.log('Updating existing user:', user);
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          role: user.role
        })
        .eq('id', user.id);
        
      error = updateError;
    } else {
      // Insert
      console.log('Creating new user:', user);
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: new Date().toISOString()
        }]);
        
      error = insertError;
    }
    
    if (error) {
      console.error('Error in database operation:', error);
      throw error;
    }
    
    return user;
  } catch (error) {
    console.error("Error setting current user in Supabase:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error logging out user from Supabase:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      return null;
    }
    
    // Get user from our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      throw userError;
    }
    
    return userData ? mapUserFromDB(userData) : null;
  } catch (error) {
    console.error("Error logging in user with Supabase:", error);
    return null;
  }
};

// PDF file operations
export const savePDFReference = async (patientId: string, fileName: string): Promise<PDFFile> => {
  try {
    // Generate a proper UUID using uuidv4 instead of a timestamp string
    const id = uuidv4();
    const currentUser = await getCurrentUser();
    
    const newPDFFile: PDFFile = {
      id,
      patientId,
      fileName,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || "Unknown",
      url: fileName
    };
    
    // Make sure we're using a valid UUID for patientId, not a medical record number
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    // Check if a similar PDF reference already exists to avoid duplicates
    const { data: existingPDFs } = await supabase
      .from('pdf_files')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('file_name', fileName);
      
    // Only insert if no duplicate exists
    if (!existingPDFs || existingPDFs.length === 0) {
      const { error } = await supabase
        .from('pdf_files')
        .insert([{
          id: newPDFFile.id,
          patient_id: patient.id, // Use the actual patient UUID, not the MRN
          file_name: newPDFFile.fileName,
          created_at: newPDFFile.createdAt,
          created_by: currentUser?.id || null,
          url: newPDFFile.url
        }]);
      
      if (error) {
        throw error;
      }
    } else {
      console.log(`PDF reference already exists for patient ${patientId} with filename ${fileName}, skipping duplicate insert`);
    }
    
    return newPDFFile;
  } catch (error) {
    console.error(`Error saving PDF reference for patient ${patientId} to Supabase:`, error);
    throw error;
  }
};

export const getPDFFiles = async (): Promise<PDFFile[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select(`
        id,
        patient_id,
        file_name,
        created_at,
        url,
        users (name)
      `);
    
    if (error) {
      throw error;
    }
    
    // Transform from database schema to application schema
    const pdfFiles: PDFFile[] = (data || []).map(item => ({
      id: item.id,
      patientId: item.patient_id,
      fileName: item.file_name,
      createdAt: item.created_at,
      createdBy: item.users?.name || "Unknown",
      url: item.url
    }));
    
    return pdfFiles;
  } catch (error) {
    console.error("Error getting PDF files from Supabase:", error);
    return [];
  }
};

export const getPDFFilesByPatientId = async (patientId: string): Promise<PDFFile[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select(`
        id,
        patient_id,
        file_name,
        created_at,
        url,
        users (name)
      `)
      .eq('patient_id', patientId);
    
    if (error) {
      throw error;
    }
    
    // Transform from database schema to application schema
    const pdfFiles: PDFFile[] = (data || []).map(item => ({
      id: item.id,
      patientId: item.patient_id,
      fileName: item.file_name,
      createdAt: item.created_at,
      createdBy: item.users?.name || "Unknown",
      url: item.url
    }));
    
    return pdfFiles;
  } catch (error) {
    console.error(`Error getting PDF files for patient ${patientId} from Supabase:`, error);
    return [];
  }
};

// Generate a unique MRN
export const generateMRN = (): string => {
  try {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mrn = "MRN-";
    for (let i = 0; i < 8; i++) {
      mrn += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return mrn;
  } catch (error) {
    console.error("Error generating MRN:", error);
    return `MRN-${Date.now()}`;
  }
};
