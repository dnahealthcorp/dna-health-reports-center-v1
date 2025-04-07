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

// Add the missing savePDFFile function
export const savePDFFile = async ({
  patientId,
  fileName,
  pdfData,
  formId
}: {
  patientId: string;
  fileName: string;
  pdfData: string;
  formId?: string;
}): Promise<PDFFile | null> => {
  try {
    // Use pdfData to generate URL or save actual data (simplified here)
    // In a real implementation, this might upload to storage
    const url = `data:application/pdf;base64,${pdfData.substring(0, 20)}...`;
    
    // Create a new PDF reference in the database
    const pdfFile = await savePDFReference(patientId, fileName, url);
    
    // If formId is provided, update the form record
    if (formId) {
      await supabase
        .from('forms')
        .update({
          pdf_exported: true,
          status: 'completed',
          status_updated_at: new Date().toISOString()
        })
        .eq('id', formId);
    }
    
    return pdfFile;
  } catch (error) {
    console.error("Error saving PDF file:", error);
    return null;
  }
};
