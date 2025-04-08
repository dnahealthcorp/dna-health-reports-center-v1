// PDF-related database operations
import { PDFFile } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from "./userService";

export const savePDFReference = async (patientId: string, fileName: string, fileUrl?: string): Promise<PDFFile> => {
  try {
    // Generate a proper UUID using uuidv4 instead of a timestamp string
    const id = uuidv4();
    const currentUser = await getCurrentUser();
    
    const newPDFFile: PDFFile = {
      id,
      patient_id: patientId,
      file_name: fileName,
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || "Unknown",
      url: fileUrl || fileName
    };
    
    // Make sure we're using a valid UUID for patientId, not a medical record number
    const { getPatientById } = await import('./patientService');
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    // IMPORTANT: Always create a new entry for each PDF generation
    // This ensures we keep a history of all generated PDFs
    const { error } = await supabase
      .from('pdf_files')
      .insert([{
        id: newPDFFile.id,
        patient_id: patient.id, // Use the actual patient UUID, not the MRN
        file_name: newPDFFile.file_name,
        created_at: newPDFFile.created_at,
        created_by: currentUser?.id || null,
        url: newPDFFile.url
      }]);
    
    if (error) {
      console.error("Error creating new PDF reference:", error);
      throw error;
    }
    
    console.log(`New PDF reference created for patient ${patientId} with filename ${fileName}`);
    
    return newPDFFile;
  } catch (error) {
    console.error(`Error saving PDF reference for patient ${patientId} to Supabase:`, error);
    throw error;
  }
};

/**
 * Helper function to strip HTML tags from a string
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '');
};

/**
 * Browser-compatible function to convert HTML to pdfMake format
 * This preserves rich text formatting without requiring Node.js modules
 */
export const htmlToFormattedText = (html: string): any => {
  if (!html || html === '') return '';
  
  try {
    // Use browser's built-in DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Use html-to-pdfmake with browser's document
    const htmlToPdfmake = require('html-to-pdfmake');
    const content = htmlToPdfmake(html, {
      window: window,
      defaultStyles: {
        b: { bold: true },
        strong: { bold: true },
        i: { italics: true },
        em: { italics: true },
        u: { decoration: 'underline' },
        s: { decoration: 'lineThrough' }
      }
    });
    
    return content;
  } catch (error) {
    console.error("Error converting HTML to formatted text:", error);
    // Fallback to simple text
    return stripHtml(html);
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
      patient_id: item.patient_id,
      file_name: item.file_name,
      created_at: item.created_at,
      created_by: item.users?.name || "Unknown",
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
      patient_id: item.patient_id,
      file_name: item.file_name,
      created_at: item.created_at,
      created_by: item.users?.name || "Unknown",
      url: item.url
    }));
    
    return pdfFiles;
  } catch (error) {
    console.error(`Error getting PDF files for patient ${patientId} from Supabase:`, error);
    return [];
  }
};

// Export generatePDF to prevent import errors
export { generatePDF } from "@/lib/pdf/pdfGenerator";
