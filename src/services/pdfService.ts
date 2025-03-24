
import { PDFFile } from "@/types";
import { supabase } from "./baseService";
import { getCurrentUser } from "./userService";

export const savePDFReference = async (patientId: string, fileName: string): Promise<PDFFile> => {
  try {
    const id = `pdf-${Date.now()}`;
    const currentUser = await getCurrentUser();
    
    const newPDFFile: PDFFile = {
      id,
      patientId,
      fileName,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || "Unknown",
      url: fileName
    };
    
    const { error } = await supabase
      .from('pdf_files')
      .insert([{
        id: newPDFFile.id,
        patient_id: newPDFFile.patientId,
        file_name: newPDFFile.fileName,
        created_at: newPDFFile.createdAt,
        created_by: currentUser?.id || null,
        url: newPDFFile.url
      }]);
    
    if (error) {
      throw error;
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
