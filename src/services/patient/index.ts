
// Export all patient-related services from one central location
export { 
  getPatients, 
  getPatientById, 
  addPatient, 
  updatePatient, 
  deletePatient 
} from './patientCore';

export { 
  getPatientFormData, 
  savePatientFormData, 
  createEmptyPatientFormData 
} from './patientFormData';

export { generateMRN } from './patientUtils';
