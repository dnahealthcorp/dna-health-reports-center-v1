
import { supabase } from "@/integrations/supabase/client";
import { PDFData, PDFFile } from "@/types";

export const savePDFFile = async (pdfData: PDFData): Promise<PDFFile | null> => {
  try {
    // Convert base64 string to blob
    const base64Response = await fetch(`data:application/pdf;base64,${pdfData.pdfData}`);
    const blob = await base64Response.blob();
    
    // Generate a storage path for the PDF
    const timestamp = Date.now();
    const storagePath = `${pdfData.patientId}/${timestamp}_${pdfData.fileName}`;
    
    // Upload the blob to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('pdfs')
      .upload(storagePath, blob, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (storageError) {
      throw storageError;
    }
    
    // Get public URL
    const { data: publicUrlData } = await supabase.storage
      .from('pdfs')
      .getPublicUrl(storagePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Could not generate public URL");
    }
    
    // Save PDF reference to database
    const pdfEntry = {
      file_name: pdfData.fileName,
      patient_id: pdfData.patientId,
      form_id: pdfData.formId || null,
      url: publicUrlData.publicUrl,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('pdf_files')
      .insert([pdfEntry])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      patient_id: data.patient_id,
      form_id: data.form_id,
      file_name: data.file_name,
      url: data.url,
      created_at: data.created_at,
      created_by: data.created_by || "",
      // Add aliases for compatibility
      patientId: data.patient_id,
      fileName: data.file_name,
      createdAt: data.created_at,
      createdBy: data.created_by || ""
    };
  } catch (error) {
    console.error("Error saving PDF file:", error);
    return null;
  }
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
    
    return (data || []).map(file => ({
      id: file.id,
      patient_id: file.patient_id,
      form_id: file.form_id,
      file_name: file.file_name,
      url: file.url,
      created_at: file.created_at,
      created_by: file.created_by || "",
      // Add aliases for compatibility
      patientId: file.patient_id,
      fileName: file.file_name,
      createdAt: file.created_at,
      createdBy: file.created_by || ""
    }));
  } catch (error) {
    console.error(`Error fetching PDF files for patient ${patientId}:`, error);
    return [];
  }
};
