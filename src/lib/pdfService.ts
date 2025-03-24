
import { PatientFormData, Medication, PDFFile } from "@/types";
import { jsPDF } from "jspdf";
import { savePDFReference } from "@/services/databaseService";
import autoTable from "jspdf-autotable";
import { logoToDataURL } from "./pdf/logoRenderer";
import { formatSection, formatMedication, formatFollowUps } from "./pdf/pdfUtilities";

// Function to generate PDF based on patient data
export const generatePDF = async (
  data: PatientFormData,
  medications: Medication[]
): Promise<string> => {
  try {
    // Create a new PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoHeight = 20;
    const margin = 20;
    let y = 15;

    // Add logo (DNA Health logo)
    const logoDataUrl = await logoToDataURL();
    doc.addImage(logoDataUrl, "PNG", margin, y, 40, logoHeight);
    y += logoHeight + 10;

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Report", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Patient Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${data.patientInfo.name}`, margin, y);
    y += 7;
    
    // Format date to display in a readable format (MM/DD/YYYY)
    let birthDate = data.patientInfo.dateOfBirth;
    try {
      const date = new Date(data.patientInfo.dateOfBirth);
      birthDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    doc.text(`Date of Birth: ${birthDate}`, margin, y);
    y += 7;
    doc.text(`Gender: ${data.patientInfo.gender}`, margin, y);
    y += 7;
    doc.text(`Medical Record Number: ${data.patientInfo.medicalRecordNumber}`, margin, y);
    y += 15;

    // Vitals
    formatSection(doc, "Vitals", [
      { label: "Height", value: data.vitals.height },
      { label: "Weight", value: data.vitals.weight },
      { label: "Blood Pressure", value: data.vitals.bloodPressure },
      { label: "Heart Rate", value: data.vitals.heartRate },
      { label: "Temperature", value: data.vitals.temperature },
      { label: "Respiratory Rate", value: data.vitals.respiratoryRate },
      { label: "Oxygen Saturation", value: data.vitals.oxygenSaturation }
    ], margin, y);
    y += 70;

    // Summary Findings
    formatSection(doc, "Summary Findings", [
      { label: "Glucose Metabolism", value: data.summaryFindings.glucoseMetabolism },
      { label: "Lipid Profile", value: data.summaryFindings.lipidProfile },
      { label: "Inflammation", value: data.summaryFindings.inflammation },
      { label: "Uric Acid", value: data.summaryFindings.uricAcid },
      { label: "Vitamins", value: data.summaryFindings.vitamins },
      { label: "Minerals", value: data.summaryFindings.minerals },
      { label: "Sex Hormones", value: data.summaryFindings.sexHormones },
      { label: "Renal & Liver Function", value: data.summaryFindings.renalLiverFunction },
      { label: "Cancer Markers", value: data.summaryFindings.cancerMarkers }
    ], margin, y);
    y += 100;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Medications
    formatMedication(doc, "Medications", data.medications, medications, margin, y);
    y += 70;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Supplements
    if (data.supplements && data.supplements.length > 0) {
      formatMedication(doc, "Supplements", data.supplements, medications, margin, y);
      y += 70;
    }

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Recommendations
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations", margin, y);
    y += 10;

    // Nutrition Recommendations
    if (data.nutritionRecommendations) {
      doc.setFont("helvetica", "bold");
      doc.text("Nutrition", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      
      if (data.nutritionRecommendations.nutritionalPlan) {
        doc.text(`Nutritional Plan: ${data.nutritionRecommendations.nutritionalPlan}`, margin, y);
        y += 7;
      }
      
      if (data.nutritionRecommendations.proteinConsumption) {
        doc.text(`Protein Consumption: ${data.nutritionRecommendations.proteinConsumption}`, margin, y);
        y += 7;
      }
      
      if (data.nutritionRecommendations.omissions) {
        doc.text(`Omissions: ${data.nutritionRecommendations.omissions}`, margin, y);
        y += 7;
      }
      
      if (data.nutritionRecommendations.additionalConsiderations) {
        doc.text(`Additional Considerations: ${data.nutritionRecommendations.additionalConsiderations}`, margin, y);
        y += 10;
      }
    }

    // Exercise Recommendations
    if (data.exerciseDetail) {
      doc.setFont("helvetica", "bold");
      doc.text("Exercise", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      
      if (data.exerciseDetail.focusOn) {
        doc.text(`Focus On: ${data.exerciseDetail.focusOn}`, margin, y);
        y += 7;
      }
      
      if (data.exerciseDetail.walking) {
        doc.text(`Walking: ${data.exerciseDetail.walking}`, margin, y);
        y += 7;
      }
      
      if (data.exerciseDetail.avoid) {
        doc.text(`Avoid: ${data.exerciseDetail.avoid}`, margin, y);
        y += 7;
      }
      
      if (data.exerciseDetail.tracking) {
        doc.text(`Tracking: ${data.exerciseDetail.tracking}`, margin, y);
        y += 10;
      }
    }

    // Sleep & Stress Recommendations
    if (data.sleepStressRecommendations) {
      doc.setFont("helvetica", "bold");
      doc.text("Sleep & Stress", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      
      if (data.sleepStressRecommendations.sleep) {
        doc.text(`Sleep: ${data.sleepStressRecommendations.sleep}`, margin, y);
        y += 7;
      }
      
      if (data.sleepStressRecommendations.stress) {
        doc.text(`Stress: ${data.sleepStressRecommendations.stress}`, margin, y);
        y += 10;
      }
    }

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Doctor Notes & Diagnosis
    if (data.doctorNotes || data.diagnosis || data.treatmentPlan) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Doctor Assessment", margin, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      
      if (data.diagnosis) {
        doc.text(`Diagnosis: ${data.diagnosis}`, margin, y);
        y += 10;
      }
      
      if (data.treatmentPlan) {
        doc.text(`Treatment Plan: ${data.treatmentPlan}`, margin, y);
        y += 10;
      }
      
      if (data.doctorNotes) {
        doc.text(`Additional Notes: ${data.doctorNotes}`, margin, y);
        y += 15;
      }
    }

    // Follow-ups
    if (data.followUps && data.followUps.length > 0) {
      formatFollowUps(doc, data.followUps, margin, y);
    }

    // Generate current date & time for filename
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10);
    const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const filename = `patient_report_${data.patientInfo.medicalRecordNumber}_${dateString}_${timeString}.pdf`;
    
    // Save PDF 
    doc.save(filename);
    
    // Store PDF reference in database
    const patientId = data?.patientInfo?.medicalRecordNumber?.split('-')[1] || 'unknown';
    await savePDFReference(patientId, filename);
    
    return filename;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
