
// Export all services from one central location

// Base service exports
export { safeJsonArrayConversion, toJson, safeJsonArray } from './baseService';

// Patient service exports
export { 
  getPatients, 
  getPatientById, 
  addPatient, 
  updatePatient, 
  deletePatient, 
  getPatientFormData, 
  savePatientFormData,
  generateMRN 
} from './patientService';

// Medication service exports
export { 
  getMedications, 
  addMedication, 
  updateMedication, 
  deleteMedication 
} from './medicationService';

// User service exports
export { 
  getUsers, 
  getCurrentUser, 
  setCurrentUser, 
  logoutUser, 
  loginUser 
} from './userService';

// PDF service exports
export { 
  savePDFReference, 
  getPDFFiles, 
  getPDFFilesByPatientId 
} from './pdfService';
