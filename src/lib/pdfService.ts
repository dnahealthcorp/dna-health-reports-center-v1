
import { PatientFormData, Medication } from "@/types";
import { savePDFReference } from "@/services/pdfService";
import { generatePDF } from "@/lib/pdf/pdfGenerator";
import { prepareHtmlForPdf } from "@/lib/pdf/richTextUtils";

export const generateAndSavePDF = async (formData: PatientFormData, medications: Medication[], patientId: string): Promise<string> => {
  try {
    // Prepare form data by processing HTML fields
    const processedFormData = {
      ...formData,
      summaryFindings: {
        glucoseMetabolism: prepareHtmlForPdf(formData.summaryFindings.glucoseMetabolism || ''),
        proteins: prepareHtmlForPdf(formData.summaryFindings.proteins || ''),
        lipidProfile: prepareHtmlForPdf(formData.summaryFindings.lipidProfile || ''),
        inflammation: prepareHtmlForPdf(formData.summaryFindings.inflammation || ''),
        metabolic: prepareHtmlForPdf(formData.summaryFindings.metabolic || ''),
        homocysteine: prepareHtmlForPdf(formData.summaryFindings.homocysteine || ''),
        vitaminsMinerals: prepareHtmlForPdf(formData.summaryFindings.vitaminsMinerals || ''),
        ironProfile: prepareHtmlForPdf(formData.summaryFindings.ironProfile || ''),
        sexHormones: prepareHtmlForPdf(formData.summaryFindings.sexHormones || ''),
        kidneyFunctionElectrolytes: prepareHtmlForPdf(formData.summaryFindings.kidneyFunctionElectrolytes || ''),
        liverFunctions: prepareHtmlForPdf(formData.summaryFindings.liverFunctions || ''),
        tumorMarkers: prepareHtmlForPdf(formData.summaryFindings.tumorMarkers || ''),
        bloodCounts: prepareHtmlForPdf(formData.summaryFindings.bloodCounts || '')
      }
    };
    
    // Step 1: Generate the PDF content with processed HTML
    const pdfBlob = await generatePDF(processedFormData, medications);
    
    // Step 2: Create a filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const patientName = formData.patientInfo.name.replace(/\s+/g, '_');
    const fileName = `${patientName}_summary_${timestamp}.pdf`;
    
    // Step 3: Save the PDF reference to the database
    // This creates an entry in the pdf_files table but doesn't handle actual file storage
    await savePDFReference(patientId, fileName);
    
    // Step 4: Create a download link and trigger download (if in browser environment)
    if (typeof window !== 'undefined') {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    return fileName;
  } catch (error) {
    console.error("Error generating and saving PDF:", error);
    throw error;
  }
};

// Re-export the generatePDF function from pdfGenerator
// This ensures that components importing from pdfService can access this function
export { generatePDF } from "@/lib/pdf/pdfGenerator";
