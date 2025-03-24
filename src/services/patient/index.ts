
// Export all patient-related services from one central location
export { 
  getPatients,
  getRecentPatients,
  getPatientById, 
  addPatient, 
  updatePatient, 
  deletePatient,
  getPatientByMedicalRecordNumber,
  generateMRN
} from './patientCore';

export { 
  getPatientFormData, 
  savePatientFormData, 
  createEmptyPatientFormData 
} from './patientFormData';
