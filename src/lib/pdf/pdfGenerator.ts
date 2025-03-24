
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PatientFormData, Medication } from '@/types';
import { renderLogo } from './logoRenderer';
import { calculateAge, createMedicationList, formatMedicationSection } from './pdfUtilities';

// Create PDF Generator
export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<Uint8Array> => {
  // Create new PDF document using Helvetica font
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Set font to Helvetica
  pdf.setFont("helvetica");
  
  // Reduce top margin
  const topMargin = 10; // Reduced from default
  const leftMargin = 15;
  const pageWidth = 210; // A4 width in mm
  const contentWidth = pageWidth - (leftMargin * 2);
  
  // Render Logo
  await renderLogo(pdf, leftMargin, topMargin, 40);
  
  // Add header text
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT REPORT", leftMargin + 50, topMargin + 10);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("DNA Health Corp", leftMargin + 50, topMargin + 15);
  pdf.text("Generated: " + new Date().toLocaleDateString(), leftMargin + 50, topMargin + 20);
  
  // Patient information
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Patient Information", leftMargin, topMargin + 30);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const patientInfo = formData.patientInfo;
  const patientName = patientInfo.name || "N/A";
  const patientDOB = patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth).toLocaleDateString() : "N/A";
  const patientAge = patientInfo.dateOfBirth ? calculateAge(patientInfo.dateOfBirth) : "N/A";
  const patientGender = patientInfo.gender || "N/A";
  const patientMRN = patientInfo.medicalRecordNumber || "N/A";
  
  pdf.text(`Name: ${patientName}`, leftMargin, topMargin + 40);
  pdf.text(`Date of Birth: ${patientDOB} (Age: ${patientAge})`, leftMargin, topMargin + 45);
  pdf.text(`Gender: ${patientGender}`, leftMargin, topMargin + 50);
  pdf.text(`Medical Record Number: ${patientMRN}`, leftMargin, topMargin + 55);
  
  // Vitals
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Vitals", leftMargin, topMargin + 65);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const vitals = formData.vitals;
  if (vitals) {
    let yPos = topMargin + 75;
    if (vitals.height) pdf.text(`Height: ${vitals.height}`, leftMargin, yPos), yPos += 5;
    if (vitals.weight) pdf.text(`Weight: ${vitals.weight}`, leftMargin, yPos), yPos += 5;
    if (vitals.bloodPressure) pdf.text(`Blood Pressure: ${vitals.bloodPressure}`, leftMargin, yPos), yPos += 5;
    if (vitals.heartRate) pdf.text(`Heart Rate: ${vitals.heartRate}`, leftMargin, yPos), yPos += 5;
    if (vitals.temperature) pdf.text(`Temperature: ${vitals.temperature}`, leftMargin, yPos), yPos += 5;
    if (vitals.respiratoryRate) pdf.text(`Respiratory Rate: ${vitals.respiratoryRate}`, leftMargin, yPos), yPos += 5;
    if (vitals.oxygenSaturation) pdf.text(`Oxygen Saturation: ${vitals.oxygenSaturation}`, leftMargin, yPos), yPos += 5;
  }
  
  // Summary Findings
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Summary Findings", leftMargin, topMargin + 110);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const findings = formData.summaryFindings;
  if (findings) {
    let yPos = topMargin + 120;
    if (findings.glucoseMetabolism) pdf.text(`Glucose Metabolism: ${findings.glucoseMetabolism}`, leftMargin, yPos), yPos += 5;
    if (findings.lipidProfile) pdf.text(`Lipid Profile: ${findings.lipidProfile}`, leftMargin, yPos), yPos += 5;
    if (findings.inflammation) pdf.text(`Inflammation: ${findings.inflammation}`, leftMargin, yPos), yPos += 5;
    if (findings.uricAcid) pdf.text(`Uric Acid: ${findings.uricAcid}`, leftMargin, yPos), yPos += 5;
    if (findings.vitamins) pdf.text(`Vitamins: ${findings.vitamins}`, leftMargin, yPos), yPos += 5;
    if (findings.minerals) pdf.text(`Minerals: ${findings.minerals}`, leftMargin, yPos), yPos += 5;
    if (findings.sexHormones) pdf.text(`Sex Hormones: ${findings.sexHormones}`, leftMargin, yPos), yPos += 5;
    if (findings.renalLiverFunction) pdf.text(`Renal/Liver Function: ${findings.renalLiverFunction}`, leftMargin, yPos), yPos += 5;
    if (findings.cancerMarkers) pdf.text(`Cancer Markers: ${findings.cancerMarkers}`, leftMargin, yPos), yPos += 5;
  }
  
  // Add new page for medications and recommendations
  pdf.addPage();
  
  // Medications
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Medications", leftMargin, topMargin + 10);
  
  // Format medication section to include only items with data
  const medicationList = formData.medications.filter(med => med.medicationId || med.dosage || med.frequency);
  
  if (medicationList.length > 0) {
    // Create a formatted list of medications for the PDF
    const medList = createMedicationList(medicationList, medications);
    
    autoTable(pdf, {
      startY: topMargin + 15,
      head: [['Medication', 'Dosage', 'Frequency']],
      body: medList.map(med => [med.name || 'N/A', med.dosage || 'N/A', med.frequency || 'N/A']),
      margin: { left: leftMargin },
      styles: { fontSize: 10, font: "helvetica" },
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text("No medications prescribed", leftMargin, topMargin + 20);
  }
  
  // Supplements
  const yPosAfterMeds = medicationList.length > 0 ? 
    (pdf as any).lastAutoTable.finalY + 10 : 
    topMargin + 25;
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Supplements", leftMargin, yPosAfterMeds);
  
  // Only include supplements with actual data
  const supplementsList = (formData.supplements || []).filter(sup => sup.supplementId || sup.dosage || sup.source);
  
  if (supplementsList.length > 0) {
    const supList = createMedicationList(supplementsList, medications);
    
    autoTable(pdf, {
      startY: yPosAfterMeds + 5,
      head: [['Supplement', 'Dosage', 'Source']],
      body: supList.map(sup => [sup.name || 'N/A', sup.dosage || 'N/A', sup.source || 'N/A']),
      margin: { left: leftMargin },
      styles: { fontSize: 10, font: "helvetica" },
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.text("No supplements recommended", leftMargin, yPosAfterMeds + 10);
  }
  
  // Recommendations
  const yPosAfterSupplements = supplementsList.length > 0 ? 
    (pdf as any).lastAutoTable.finalY + 10 : 
    yPosAfterMeds + 15;
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Recommendations", leftMargin, yPosAfterSupplements);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  let yPos = yPosAfterSupplements + 10;
  
  // Nutrition Recommendations
  if (formData.nutritionRecommendations && Object.values(formData.nutritionRecommendations).some(val => val && val.trim() !== '')) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Nutrition", leftMargin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 5;
    
    const nutrition = formData.nutritionRecommendations;
    if (nutrition.nutritionalPlan) pdf.text(`Plan: ${nutrition.nutritionalPlan}`, leftMargin, yPos), yPos += 5;
    if (nutrition.proteinConsumption) pdf.text(`Protein: ${nutrition.proteinConsumption}`, leftMargin, yPos), yPos += 5;
    if (nutrition.omissions) pdf.text(`Omissions: ${nutrition.omissions}`, leftMargin, yPos), yPos += 5;
    if (nutrition.additionalConsiderations) pdf.text(`Additional: ${nutrition.additionalConsiderations}`, leftMargin, yPos), yPos += 10;
  }
  
  // Exercise Recommendations
  if (formData.exerciseDetail && Object.values(formData.exerciseDetail).some(val => val && val.trim() !== '')) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Exercise", leftMargin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 5;
    
    const exercise = formData.exerciseDetail;
    if (exercise.focusOn) pdf.text(`Focus on: ${exercise.focusOn}`, leftMargin, yPos), yPos += 5;
    if (exercise.walking) pdf.text(`Walking: ${exercise.walking}`, leftMargin, yPos), yPos += 5;
    if (exercise.avoid) pdf.text(`Avoid: ${exercise.avoid}`, leftMargin, yPos), yPos += 5;
    if (exercise.tracking) pdf.text(`Tracking: ${exercise.tracking}`, leftMargin, yPos), yPos += 10;
  }
  
  // Sleep and Stress Recommendations
  if (formData.sleepStressRecommendations && Object.values(formData.sleepStressRecommendations).some(val => val && val.trim() !== '')) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Sleep & Stress", leftMargin, yPos);
    pdf.setFont("helvetica", "normal");
    yPos += 5;
    
    const sleepStress = formData.sleepStressRecommendations;
    if (sleepStress.sleep) pdf.text(`Sleep: ${sleepStress.sleep}`, leftMargin, yPos), yPos += 5;
    if (sleepStress.stress) pdf.text(`Stress Management: ${sleepStress.stress}`, leftMargin, yPos), yPos += 10;
  }
  
  // Follow-ups and Referrals
  const followUps = formData.followUps || [];
  
  // Only include follow-ups with actual data
  const validFollowUps = followUps.filter(fu => fu.withDoctor || fu.forReason || fu.date);
  
  if (validFollowUps.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Follow-ups and Referrals", leftMargin, yPos);
    
    autoTable(pdf, {
      startY: yPos + 5,
      head: [['Doctor', 'Reason', 'Date']],
      body: validFollowUps.map(fu => [fu.withDoctor || 'N/A', fu.forReason || 'N/A', fu.date || 'N/A']),
      margin: { left: leftMargin },
      styles: { fontSize: 10, font: "helvetica" },
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
  }
  
  // Notes
  if (formData.nurseNotes || formData.doctorNotes) {
    const yPosAfterFollowUps = validFollowUps.length > 0 ? 
      (pdf as any).lastAutoTable.finalY + 10 : 
      yPos;
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes", leftMargin, yPosAfterFollowUps);
    
    pdf.setFontSize(10);
    
    let notesYPos = yPosAfterFollowUps + 10;
    
    if (formData.nurseNotes) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Nurse Notes:", leftMargin, notesYPos);
      pdf.setFont("helvetica", "normal");
      notesYPos += 5;
      pdf.text(formData.nurseNotes, leftMargin, notesYPos);
      notesYPos += 10;
    }
    
    if (formData.doctorNotes) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Doctor Notes:", leftMargin, notesYPos);
      pdf.setFont("helvetica", "normal");
      notesYPos += 5;
      pdf.text(formData.doctorNotes, leftMargin, notesYPos);
    }
  }
  
  // Reduce bottom margin by ending the document at a good position
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("© DNA Health Corp", contentWidth / 2 + leftMargin - 15, 285);
  
  // Return PDF as Uint8Array
  return pdf.output('arraybuffer');
};
