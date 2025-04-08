
import { PatientFormData, Medication } from "@/types";
import { savePDFReference } from "@/services/pdfService";
import { generatePDF } from "@/lib/pdf/pdfGenerator";
import { prepareHtmlForPdf } from "@/lib/pdf/richTextUtils";

export const generateAndSavePDF = async (formData: PatientFormData, medications: Medication[], patientId: string): Promise<string> => {
  try {
    // Prepare form data by processing HTML fields for all rich text fields
    const processedFormData = {
      ...formData,
      summaryFindings: {
        glucoseMetabolism: formData.summaryFindings.glucoseMetabolism || '',
        proteins: formData.summaryFindings.proteins || '',
        lipidProfile: formData.summaryFindings.lipidProfile || '',
        inflammation: formData.summaryFindings.inflammation || '',
        metabolic: formData.summaryFindings.metabolic || '',
        homocysteine: formData.summaryFindings.homocysteine || '',
        vitaminsMinerals: formData.summaryFindings.vitaminsMinerals || '',
        ironProfile: formData.summaryFindings.ironProfile || '',
        sexHormones: formData.summaryFindings.sexHormones || '',
        kidneyFunctionElectrolytes: formData.summaryFindings.kidneyFunctionElectrolytes || '',
        liverFunctions: formData.summaryFindings.liverFunctions || '',
        tumorMarkers: formData.summaryFindings.tumorMarkers || '',
        bloodCounts: formData.summaryFindings.bloodCounts || ''
      },
      nutritionRecommendations: {
        nutritionalStyle: formData.nutritionRecommendations?.nutritionalStyle || '',
        proteinConsumption: formData.nutritionRecommendations?.proteinConsumption || '',
        eatingWindow: formData.nutritionRecommendations?.eatingWindow || '',
        limitations: formData.nutritionRecommendations?.limitations || '',
        additionalConsiderations: formData.nutritionRecommendations?.additionalConsiderations || ''
      },
      exerciseDetail: {
        focusOn: formData.exerciseDetail?.focusOn || '',
        walking: formData.exerciseDetail?.walking || '',
        restRecovery: formData.exerciseDetail?.restRecovery || '',
        tracking: formData.exerciseDetail?.tracking || ''
      },
      sleepStressRecommendations: {
        sleep: formData.sleepStressRecommendations?.sleep || '',
        stress: formData.sleepStressRecommendations?.stress || ''
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
export { generatePDF } from "@/lib/pdf/pdfGenerator";
