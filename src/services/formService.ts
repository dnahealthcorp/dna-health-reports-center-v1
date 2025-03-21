
import { PatientFormData } from "@/types";
import { getPatientFormData as getFormData } from "./formRetrievalService";
import { savePatientFormData as saveFormData } from "./formSavingService";

// Re-export the form service functions
export const getPatientFormData = getFormData;
export const savePatientFormData = saveFormData;
