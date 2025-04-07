
// PDF-related database operations
import { PDFFile, Patient } from "@/types";
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
      url: fileUrl || fileName,
    };
    
    const { data, error } = await supabase
      .from('pdf_files')
      .insert(newPDFFile)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as PDFFile;
  } catch (error) {
    console.error(`Error saving PDF reference for patient ${patientId} to Supabase:`, error);
    throw error;
  }
};

export const savePDFFile = async (patientId: string, fileName: string, fileUrl?: string): Promise<PDFFile> => {
  return savePDFReference(patientId, fileName, fileUrl);
};

export const getPDFFilesByPatientId = async (patientId: string): Promise<PDFFile[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as PDFFile[];
  } catch (error) {
    console.error(`Error getting PDF files for patient ${patientId} from Supabase:`, error);
    return [];
  }
};
