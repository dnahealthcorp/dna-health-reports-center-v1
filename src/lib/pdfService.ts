
// Entry point for PDF service - redirects to the new modular implementation
import { PatientFormData, Medication } from "@/types";
import { generatePDF as generatePDFImpl } from "./pdf/pdfGenerator";
import { getPatientById, getCurrentUser, savePDFReference, updatePatient } from "@/services/databaseService";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<string> => {
  try {
    // Get patient and user information for the PDF
    const patient = await getPatientById(formData.patientInfo.medicalRecordNumber);
    const currentUser = await getCurrentUser();
    
    // Make sure patient info is properly set in form data
    if (patient && (!formData.patientInfo.name || formData.patientInfo.name.trim() === '')) {
      formData.patientInfo.name = patient.name;
    }
    
    // Format the current date as YYYY-MM-DD for consistent naming
    const currentDate = new Date().toISOString().slice(0, 10);
    
    // Format the filename according to requirements: patient's_name's Health Screening - Date
    // Handle apostrophe formatting for names ending with 's'
    let fileName = "";
    const uniqueID = uuidv4().slice(0, 8); // Use UUID for truly unique identifiers
    
    if (patient) {
      const patientName = patient.name.replace(/\s+/g, '_');
      const apostrophe = patientName.endsWith('s') ? "'" : "'s";
      fileName = `${patientName}${apostrophe} Health Screening - ${currentDate}.pdf`;
      
      try {
        // Generate the PDF with the correct filename format
        const pdfBlob = await generatePDFImpl(formData, medications);
        
        // Upload the PDF to Supabase Storage with a unique path to prevent caching
        const pdfPath = `${patient.id}/${fileName.split('.')[0]}_${uniqueID}.pdf`;
        
        // Make sure the storage bucket exists and has public access
        try {
          const { data: bucketData, error: bucketError } = await supabase
            .storage
            .getBucket('pdf_files');
            
          if (bucketError && bucketError.message.includes('not found')) {
            // If bucket doesn't exist, create it
            await supabase.storage.createBucket('pdf_files', { public: true });
            console.log("Created new pdf_files bucket");
          } else if (bucketData && !bucketData.public) {
            // If bucket exists but isn't public, make it public
            const { error: updateBucketError } = await supabase
              .storage
              .updateBucket('pdf_files', { public: true });
              
            if (updateBucketError) {
              console.error("Error updating bucket to public:", updateBucketError);
            }
          }
        } catch (bucketErr) {
          console.error("Error checking/creating bucket:", bucketErr);
        }
        
        // Try multiple times to upload the file in case of RLS policy issues
        let uploadAttempts = 0;
        let storageData;
        let storageError;
        
        while (uploadAttempts < 3) {
          uploadAttempts++;
          
          // Try to upload the file
          const uploadResult = await supabase
            .storage
            .from('pdf_files')
            .upload(pdfPath, pdfBlob, {
              contentType: 'application/pdf',
              upsert: true
            });
            
          storageData = uploadResult.data;
          storageError = uploadResult.error;
          
          if (!storageError) break;
          
          console.log(`Upload attempt ${uploadAttempts} failed. Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
        }
          
        if (storageError) {
          console.error("Error uploading PDF to storage after multiple attempts:", storageError);
          
          // Even if upload failed, we can still download the PDF locally
          const downloadFileName = `${fileName.split('.')[0]}_${uniqueID}.pdf`;
          await downloadPDF(pdfBlob, downloadFileName);
          
          return fileName;
        }
        
        // Get the public URL for the file with a cache-busting parameter
        const { data: publicUrlData } = supabase
          .storage
          .from('pdf_files')
          .getPublicUrl(pdfPath);
          
        // Add a timestamp to the URL to prevent caching
        const publicUrl = publicUrlData.publicUrl + `?t=${uniqueID}`;
        
        // Now save the reference with the unique filename and URL to the database
        // IMPORTANT: Always create a new PDF reference, never update existing ones
        await savePDFReference(patient.id, fileName, publicUrl);
        
        // Update the patient's pdf_exported flag to true and set status to completed
        const updatedPatient = {
          ...patient,
          pdf_exported: true,
          status: 'completed' as 'completed',
          lastUpdated: new Date().toISOString()
        };
        
        await updatePatient(updatedPatient);
        
        // Call update_patient_statuses database function to update status immediately
        try {
          const { error } = await supabase.rpc('update_patient_statuses');
          if (error) {
            console.error("Error calling update_patient_statuses:", error);
          }
        } catch (funcError) {
          console.error("Failed to call update_patient_statuses function:", funcError);
        }
        
        // Create a download-specific filename with a timestamp to force browser to download a new copy
        const downloadFileName = `${fileName.split('.')[0]}_${uniqueID}.pdf`;
        await downloadPDF(pdfBlob, downloadFileName);
        
        return fileName;
      } catch (err) {
        console.error("Error updating patient or PDF references:", err);
        throw err;
      }
    } else {
      // Fallback filename if no patient is found - should rarely happen in normal operation
      fileName = `Health_Screening-${currentDate}_${uniqueID}.pdf`;
    }
    
    // For debugging
    console.log("PDF generated successfully with data:", {
      patientName: formData.patientInfo.name,
      medicationsCount: medications.length,
      supplementsCount: formData.supplements?.length || 0,
      currentUser: currentUser?.name,
      pdfExported: patient?.pdf_exported,
      status: patient?.status,
      fileName: fileName,
      uniqueID: uniqueID,
      doctorName: formData.doctorName || "Not specified"
    });
    
    return fileName;
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Return a default filename in case of error
    return `Error_Report_${Date.now()}.pdf`;
  }
};

// Helper function to download PDF - made async to ensure it completes
const downloadPDF = async (pdfBlob: Blob, fileName: string): Promise<void> => {
  try {
    // Create a blob URL from the generated PDF blob directly
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Create a temporary anchor element for download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    // Append to the document, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Release the blob URL to prevent memory leaks - but only after a delay
    // to ensure download has started
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 3000); // Extended timeout to ensure download starts completely
  } catch (downloadError) {
    console.error("Error downloading PDF:", downloadError);
  }
};
