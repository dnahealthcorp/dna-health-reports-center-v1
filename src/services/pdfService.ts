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
 * Helper function to convert HTML content to plain text
 * with formatting preserved (bold, italic, lists, etc.)
 * for use in PDF generation
 */
export const htmlToFormattedText = (html: string): string => {
  if (!html) return "";
  
  // Replace direct HTML tag sequences with special markers the PDF processor can understand
  // For bold text in jsPDF-AutoTable
  let processedText = html.replace(/<strong>|<b>/g, '<b>');
  processedText = processedText.replace(/<\/strong>|<\/b>/g, '</b>');
  
  // For italic text
  processedText = processedText.replace(/<em>|<i>/g, '<i>');
  processedText = processedText.replace(/<\/em>|<\/i>/g, '</i>');
  
  // For underline text
  processedText = processedText.replace(/<u>/g, '<u>');
  processedText = processedText.replace(/<\/u>/g, '</u>');
  
  // Replace <br>, <p>, <div> closing tags with new lines
  processedText = processedText.replace(/<br\s*\/?>/gi, '\n');
  processedText = processedText.replace(/<\/p>/gi, '\n');
  processedText = processedText.replace(/<\/div>/gi, '\n');
  
  // Replace list items with bullet points
  processedText = processedText.replace(/<li>/gi, '• ');
  processedText = processedText.replace(/<\/li>/gi, '\n');
  
  // Replace ordered list items with numbered points
  const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
  let olMatch;
  while ((olMatch = olRegex.exec(html)) !== null) {
    const listItems = olMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (listItems) {
      let numberedList = '';
      listItems.forEach((item, index) => {
        const content = item.replace(/<li[^>]*>([\s\S]*?)<\/li>/i, '$1');
        numberedList += `${index + 1}. ${content}\n`;
      });
      processedText = processedText.replace(olMatch[0], numberedList);
    }
  }
  
  // Remove paragraph and div opening tags and other remaining HTML tags
  // but leave our special markers alone
  const cleanupRegex = /<(?!\/?(b|i|u)>)[^>]+>/g;
  processedText = processedText.replace(cleanupRegex, '');
  
  // Fix multiple consecutive line breaks
  processedText = processedText.replace(/\n\s*\n/g, '\n\n');
  
  return processedText.trim();
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
