
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "./userService";
import { getPatientById } from "./patientService";

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
