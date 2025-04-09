
import { PatientFormData, Medication } from "@/types";
import { generatePDF } from "./core/pdfCore";
import { ensureStringArray, ensureString } from "./core/pdfUtils";

// Re-export the main generatePDF function and helper functions
export { generatePDF, ensureStringArray, ensureString };
