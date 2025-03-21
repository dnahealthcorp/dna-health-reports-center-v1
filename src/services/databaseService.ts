
import { Patient, PatientFormData, Medication, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Initialize mock data for development
const initializeStorage = async () => {
  try {
    // Import mock data
    const mockData = await import("@/lib/mockData");
    
    // Check if we already have data in Supabase
    const { data: existingPatients } = await supabase
      .from('patients')
      .select('id')
      .limit(1);
    
    // If no data exists, seed the database with mock data
    if (!existingPatients || existingPatients.length === 0) {
      // Create mock users
      for (const user of mockData.mockUsers) {
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email
          });
        
        if (error) console.error("Error seeding user:", error);
      }
      
      // Create mock patients
      for (const patient of mockData.mockPatients) {
        const { data: newPatient, error } = await supabase
          .from('patients')
          .insert({
            id: patient.id,
            name: patient.name,
            date_of_birth: patient.dateOfBirth,
            gender: patient.gender,
            medical_record_number: patient.medicalRecordNumber,
            status: patient.status,
            last_updated: patient.lastUpdated
          })
          .select()
          .single();
        
        if (error) {
          console.error("Error seeding patient:", error);
        } else if (newPatient) {
          // Create form data for this patient
          const formData = await mockData.getPatientFormData(patient.id);
          await savePatientFormData(patient.id, formData);
        }
      }
      
      // Create mock medications
      for (const medication of mockData.mockMedications) {
        const { error } = await supabase
          .from('medications')
          .insert({
            id: medication.id,
            name: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            notes: medication.notes,
            type: medication.type,
            link: medication.link
          });
        
        if (error) console.error("Error seeding medication:", error);
      }
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
};

// Initialize on module import
initializeStorage();

// Patient operations
export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('last_updated', { ascending: false });
  
  if (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
  
  return data.map(patient => ({
    id: patient.id,
    name: patient.name,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    medicalRecordNumber: patient.medical_record_number,
    lastUpdated: patient.last_updated,
    status: patient.status
  }));
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  let query = supabase.from('patients').select('*');
  
  // Check if id is a MRN or a UUID
  if (id.startsWith('MRN-')) {
    query = query.eq('medical_record_number', id);
  } else {
    query = query.eq('id', id);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error("Error fetching patient:", error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    medicalRecordNumber: data.medical_record_number,
    lastUpdated: data.last_updated,
    status: data.status
  };
};

export const addPatient = async (patient: Patient): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      id: patient.id,
      name: patient.name,
      date_of_birth: patient.dateOfBirth,
      gender: patient.gender,
      medical_record_number: patient.medicalRecordNumber,
      status: patient.status,
      last_updated: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    medicalRecordNumber: data.medical_record_number,
    lastUpdated: data.last_updated,
    status: data.status
  };
};

export const updatePatient = async (patient: Patient): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .update({
      name: patient.name,
      date_of_birth: patient.dateOfBirth,
      gender: patient.gender,
      medical_record_number: patient.medicalRecordNumber,
      status: patient.status,
      last_updated: new Date().toISOString()
    })
    .eq('id', patient.id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    medicalRecordNumber: data.medical_record_number,
    lastUpdated: data.last_updated,
    status: data.status
  };
};

export const deletePatient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
};

// Form data operations
export const getPatientFormData = async (patientId: string): Promise<PatientFormData | null> => {
  const { data, error } = await supabase
    .from('patient_form_data')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching patient form data:", error);
    return null;
  }
  
  if (!data) {
    // Create a new empty form data if none exists
    const patient = await getPatientById(patientId);
    if (!patient) return null;
    
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
        weight: ''
      },
      summaryFindings: {
        glucoseMetabolism: '',
        lipidProfile: '',
        inflammation: '',
        uricAcid: '',
        vitamins: '',
        minerals: '',
        sexHormones: '',
        renalLiverFunction: '',
        cancerMarkers: ''
      },
      medications: [],
      exerciseRecommendations: '',
      nurseNotes: '',
      doctorNotes: '',
      diagnosis: '',
      treatmentPlan: '',
      showInsulinResistance: false,
      nutritionRecommendations: {
        nutritionalPlan: '',
        proteinConsumption: '',
        omissions: '',
        additionalConsiderations: ''
      },
      exerciseDetail: {
        focusOn: '',
        walking: '',
        avoid: '',
        tracking: ''
      },
      sleepStressRecommendations: {
        sleep: '',
        stress: ''
      },
      followUps: []
    };
    
    await savePatientFormData(patientId, emptyFormData);
    return emptyFormData;
  }
  
  // Convert from database format to application format
  return {
    patientInfo: {
      name: data.patient?.name || '',
      dateOfBirth: data.patient?.date_of_birth || '',
      gender: data.patient?.gender || '',
      medicalRecordNumber: data.patient?.medical_record_number || ''
    },
    vitals: data.vitals || {
      bloodPressure: '',
      height: '',
      weight: ''
    },
    summaryFindings: data.summary_findings || {
      glucoseMetabolism: '',
      lipidProfile: '',
      inflammation: '',
      uricAcid: '',
      vitamins: '',
      minerals: '',
      sexHormones: '',
      renalLiverFunction: '',
      cancerMarkers: ''
    },
    medications: data.medications || [],
    exerciseRecommendations: data.exercise_recommendations || '',
    nurseNotes: data.nurse_notes || '',
    doctorNotes: data.doctor_notes || '',
    diagnosis: data.diagnosis || '',
    treatmentPlan: data.treatment_plan || '',
    showInsulinResistance: data.show_insulin_resistance || false,
    nutritionRecommendations: data.nutrition_recommendations || {
      nutritionalPlan: '',
      proteinConsumption: '',
      omissions: '',
      additionalConsiderations: ''
    },
    exerciseDetail: data.exercise_detail || {
      focusOn: '',
      walking: '',
      avoid: '',
      tracking: ''
    },
    sleepStressRecommendations: data.sleep_stress_recommendations || {
      sleep: '',
      stress: ''
    },
    followUps: data.follow_ups || []
  };
};

export const savePatientFormData = async (patientId: string, formData: PatientFormData): Promise<PatientFormData> => {
  // Check if form data already exists
  const { data: existingData } = await supabase
    .from('patient_form_data')
    .select('id')
    .eq('patient_id', patientId)
    .maybeSingle();
  
  const formDataToSave = {
    patient_id: patientId,
    vitals: formData.vitals,
    summary_findings: formData.summaryFindings,
    medications: formData.medications,
    supplements: formData.supplements,
    exercise_recommendations: formData.exerciseRecommendations,
    nurse_notes: formData.nurseNotes,
    doctor_notes: formData.doctorNotes,
    diagnosis: formData.diagnosis,
    treatment_plan: formData.treatmentPlan,
    show_insulin_resistance: formData.showInsulinResistance,
    nutrition_recommendations: formData.nutritionRecommendations,
    exercise_detail: formData.exerciseDetail,
    sleep_stress_recommendations: formData.sleepStressRecommendations,
    follow_ups: formData.followUps,
    last_updated: new Date().toISOString()
  };
  
  let error;
  if (existingData) {
    // Update existing form data
    const result = await supabase
      .from('patient_form_data')
      .update(formDataToSave)
      .eq('id', existingData.id);
    
    error = result.error;
  } else {
    // Insert new form data
    const result = await supabase
      .from('patient_form_data')
      .insert(formDataToSave);
    
    error = result.error;
  }
  
  if (error) {
    console.error("Error saving patient form data:", error);
    throw error;
  }
  
  // Update patient's last updated timestamp
  await supabase
    .from('patients')
    .update({ last_updated: new Date().toISOString() })
    .eq('id', patientId);
  
  return formData;
};

// Medication operations
export const getMedications = async (): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*');
  
  if (error) {
    console.error("Error fetching medications:", error);
    return [];
  }
  
  return data.map(med => ({
    id: med.id,
    name: med.name,
    dosage: med.dosage,
    frequency: med.frequency,
    notes: med.notes,
    type: med.type as 'medication' | 'supplement',
    link: med.link
  }));
};

export const addMedication = async (medication: Medication): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      notes: medication.notes,
      type: medication.type,
      link: medication.link
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error adding medication:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dosage: data.dosage,
    frequency: data.frequency,
    notes: data.notes,
    type: data.type as 'medication' | 'supplement',
    link: data.link
  };
};

export const updateMedication = async (medication: Medication): Promise<Medication> => {
  const { data, error } = await supabase
    .from('medications')
    .update({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      notes: medication.notes,
      type: medication.type,
      link: medication.link
    })
    .eq('id', medication.id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating medication:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    dosage: data.dosage,
    frequency: data.frequency,
    notes: data.notes,
    type: data.type as 'medication' | 'supplement',
    link: data.link
  };
};

export const deleteMedication = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting medication:", error);
    throw error;
  }
};

// User operations
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  
  return data.map(user => ({
    id: user.id,
    name: user.name,
    role: user.role as 'nurse' | 'doctor' | 'admin',
    email: user.email
  }));
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  
  if (error || !data) {
    console.error("Error fetching current user:", error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    role: data.role as 'nurse' | 'doctor' | 'admin',
    email: data.email
  };
};

export const setCurrentUser = async (user: User): Promise<User> => {
  // In Supabase, this would update the user's profile
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email
    });
  
  if (error) {
    console.error("Error setting current user:", error);
    throw error;
  }
  
  return user;
};

export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error || !data.user) {
    console.error("Error signing in:", error);
    return null;
  }
  
  return getCurrentUser();
};

// PDF file operations
export const savePDFReference = async (patientId: string, fileName: string): Promise<any> => {
  const currentUser = await getCurrentUser();
  
  const pdfFile = {
    patient_id: patientId,
    file_name: fileName,
    created_by: currentUser?.id,
    url: fileName // In a real app, this would be a URL to the file in storage
  };
  
  const { data, error } = await supabase
    .from('pdf_files')
    .insert(pdfFile)
    .select()
    .single();
  
  if (error) {
    console.error("Error saving PDF reference:", error);
    throw error;
  }
  
  return {
    id: data.id,
    patientId: data.patient_id,
    fileName: data.file_name,
    createdAt: data.created_at,
    createdBy: data.created_by,
    url: data.url
  };
};

export const getPDFFiles = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('pdf_files')
    .select('*');
  
  if (error) {
    console.error("Error fetching PDF files:", error);
    return [];
  }
  
  return data.map(pdf => ({
    id: pdf.id,
    patientId: pdf.patient_id,
    fileName: pdf.file_name,
    createdAt: pdf.created_at,
    createdBy: pdf.created_by,
    url: pdf.url
  }));
};

export const getPDFFilesByPatientId = async (patientId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('pdf_files')
    .select('*')
    .eq('patient_id', patientId);
  
  if (error) {
    console.error("Error fetching PDF files for patient:", error);
    return [];
  }
  
  return data.map(pdf => ({
    id: pdf.id,
    patientId: pdf.patient_id,
    fileName: pdf.file_name,
    createdAt: pdf.created_at,
    createdBy: pdf.created_by,
    url: pdf.url
  }));
};

// Generate a unique MRN
export const generateMRN = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let mrn = "MRN-";
  for (let i = 0; i < 8; i++) {
    mrn += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return mrn;
};
