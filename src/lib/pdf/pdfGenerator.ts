
import { PatientFormData, Medication } from "@/types";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { isHtml, sanitizeHtml } from "@/types/medical";

// Define a custom interface for jsPDF with lastAutoTable property
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

// Helper function to convert HTML to plain text for contexts where HTML isn't supported
const htmlToText = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizeHtml(html);
  
  // Get the text content and preserve some formatting
  const text = tempDiv.textContent || tempDiv.innerText || '';
  
  return text;
};

// The function that fixes the .toString() error by ensuring the value is a string
const ensureString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    // If it's an array, join its elements with a comma
    return value.map(item => ensureString(item)).join(', ');
  }
  // For any other type, convert it to string
  return String(value);
};

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<Blob> => {
  const doc = new jsPDF() as ExtendedJsPDF;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Function to add a header to each page
  const addHeader = (doc: ExtendedJsPDF, text: string) => {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(text, pageWidth / 2, 10, { align: 'center' });
  };
  
  // Function to add a footer to each page
  const addFooter = (doc: ExtendedJsPDF, pageNumber: number, totalPages: number) => {
    doc.setFontSize(10);
    doc.setTextColor(40);
    const footerText = `Page ${pageNumber} of ${totalPages}`;
    doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  };
  
  // Add header and patient info
  addHeader(doc, "Health Screening Report");
  
  // Patient Information Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Patient Information', 20, 20);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  let patientInfo = [
    ['Name', formData.patientInfo.name],
    ['Date of Birth', formData.patientInfo.dateOfBirth],
    ['Gender', formData.patientInfo.gender],
    ['Medical Record Number', formData.patientInfo.medicalRecordNumber]
  ];
  
  autoTable(doc, {
    body: patientInfo,
    startY: 30,
    theme: 'plain',
    margin: { left: 20 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
  
  // Vitals Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Vitals', 20, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 80);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  let vitalsData = [
    ['Blood Pressure', formData.vitals.bloodPressure],
    ['Height', formData.vitals.height],
    ['Weight', formData.vitals.weight],
    ['Heart Rate', formData.vitals.heartRate || 'N/A'],
    ['Temperature', formData.vitals.temperature || 'N/A'],
    ['Respiratory Rate', formData.vitals.respiratoryRate || 'N/A'],
    ['Oxygen Saturation', formData.vitals.oxygenSaturation || 'N/A']
  ];
  
  autoTable(doc, {
    body: vitalsData,
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 100,
    theme: 'plain',
    margin: { left: 20 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
  
  // Medications Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Medications', 20, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 150);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  let medicationsData = formData.medications.map(med => {
    const medication = medications.find(m => m.id === med.medicationId);
    return [medication ? medication.name : 'Unknown', med.dosage, med.frequency];
  });
  
  if (medicationsData.length === 0) {
    medicationsData = [['No medications listed', '', '']];
  }
  
  autoTable(doc, {
    head: [['Medication', 'Dosage', 'Frequency']],
    body: medicationsData,
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 170,
    theme: 'grid',
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    margin: { left: 20 }
  });
  
  // Supplements Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Supplements', 20, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 220);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  let supplementsData = (formData.supplements || []).map(supplement => {
    const medication = medications.find(m => m.id === supplement.supplementId);
    return [medication ? medication.name : 'Unknown', supplement.dosage, supplement.source];
  });
  
  if (supplementsData.length === 0) {
    supplementsData = [['No supplements listed', '', '']];
  }
  
  autoTable(doc, {
    head: [['Supplement', 'Dosage', 'Source']],
    body: supplementsData,
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 240,
    theme: 'grid',
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    margin: { left: 20 }
  });
  
  // Summary Findings Section - Fixed to properly handle HTML content
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  const summaryFindingsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 290;
  doc.text('Summary of Findings', 20, summaryFindingsY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  // Process summary findings into data for autoTable
  const summaryFindingsData: Array<[string, string]> = [];
  
  // Format field keys to display names
  const formatFieldName = (field: string): string => {
    if (field === 'glucoseMetabolism') return 'Glucose Metabolism';
    if (field === 'vitaminsMinerals') return 'Vitamins/Minerals';
    if (field === 'ironProfile') return 'Iron Profile';
    if (field === 'sexHormones') return 'Sex Hormones';
    if (field === 'kidneyFunctionElectrolytes') return 'Kidney Function and Electrolytes';
    if (field === 'liverFunctions') return 'Liver Functions';
    if (field === 'tumorMarkers') return 'Tumor Markers';
    if (field === 'bloodCounts') return 'Blood Counts';
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };
  
  // Add summary findings data
  if (formData.summaryFindings) {
    for (const [field, value] of Object.entries(formData.summaryFindings)) {
      if (value) {
        // Handle HTML content by converting to plain text
        const displayValue = isHtml(value) ? htmlToText(value) : ensureString(value);
        summaryFindingsData.push([formatFieldName(field), displayValue]);
      }
    }
  }
  
  if (summaryFindingsData.length === 0) {
    summaryFindingsData.push(['No findings', '']);
  }
  
  autoTable(doc, {
    head: [['Parameter', 'Key Finding']],
    body: summaryFindingsData,
    startY: summaryFindingsY + 10,
    theme: 'grid',
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    styles: {
      overflow: 'linebreak',
      cellPadding: 5,
    },
    margin: { left: 20 }
  });
  
  // Doctor Recommendations Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  const recommendationsY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 350;
  doc.text('Doctor Recommendations', 20, recommendationsY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  // Process nutrition recommendations
  const nutritionRecommendations = [
    ['Nutritional Style', formData.nutritionRecommendations?.nutritionalStyle || 'N/A'],
    ['Protein Consumption', formData.nutritionRecommendations?.proteinConsumption || 'N/A'],
    ['Eating Window', formData.nutritionRecommendations?.eatingWindow || 'N/A'],
    ['Limitations', formData.nutritionRecommendations?.limitations || 'N/A'],
    ['Additional Considerations', formData.nutritionRecommendations?.additionalConsiderations || 'N/A']
  ];
  
  autoTable(doc, {
    head: [['Nutrition Recommendations', '']],
    body: nutritionRecommendations,
    startY: recommendationsY + 10,
    theme: 'grid',
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: 20 }
  });
  
  // Exercise Recommendations
  const exerciseRecommendations = [
    ['Focus On', formData.exerciseDetail?.focusOn || 'N/A'],
    ['Walking', formData.exerciseDetail?.walking || 'N/A'],
    ['Rest & Recovery', formData.exerciseDetail?.restRecovery || 'N/A'],
    ['Tracking', formData.exerciseDetail?.tracking || 'N/A']
  ];
  
  autoTable(doc, {
    head: [['Exercise Recommendations', '']],
    body: exerciseRecommendations,
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 400,
    theme: 'grid',
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: 20 }
  });
  
  // Sleep & Stress Recommendations
  const sleepStressRecommendations = [
    ['Sleep', formData.sleepStressRecommendations?.sleep || 'N/A'],
    ['Stress', formData.sleepStressRecommendations?.stress || 'N/A']
  ];
  
  autoTable(doc, {
    head: [['Sleep & Stress Recommendations', '']],
    body: sleepStressRecommendations,
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 450,
    theme: 'grid',
    headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: 20 }
  });
  
  // Follow-up Section
  if (formData.followUps && formData.followUps.length > 0) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const followupY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 500;
    doc.text('Follow-up Appointments', 20, followupY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const followUpsData = formData.followUps.map(followUp => [
      followUp.withDoctor || 'N/A',
      followUp.forReason || 'N/A',
      followUp.date || 'N/A'
    ]);
    
    autoTable(doc, {
      head: [['Doctor', 'Reason', 'Date']],
      body: followUpsData,
      startY: followupY + 10,
      theme: 'grid',
      headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
      margin: { left: 20 }
    });
  }
  
  // Diagnosis Section
  if (formData.diagnosis) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const diagnosisY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 520;
    doc.text('Diagnosis', 20, diagnosisY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Handle multi-line text for diagnosis
    const diagnosisText = formData.diagnosis;
    const textLines = doc.splitTextToSize(diagnosisText, pageWidth - 40);
    doc.text(textLines, 20, diagnosisY + 10);
  }
  
  // Treatment Plan Section
  if (formData.treatmentPlan) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    let treatmentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 30 : 550;
    
    // If we just rendered diagnosis text, add more space
    if (formData.diagnosis) {
      treatmentY += 20;
    }
    
    doc.text('Treatment Plan', 20, treatmentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Handle multi-line text for treatment plan
    const treatmentText = formData.treatmentPlan;
    const textLines = doc.splitTextToSize(treatmentText, pageWidth - 40);
    doc.text(textLines, 20, treatmentY + 10);
  }
  
  // Doctor and Nurse Notes
  if (formData.doctorNotes || formData.nurseNotes) {
    doc.addPage();
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Clinical Notes', 20, 20);
    
    // Nurse Notes
    if (formData.nurseNotes) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Nurse Notes', 20, 35);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      const nurseNotesText = formData.nurseNotes;
      const nurseLines = doc.splitTextToSize(nurseNotesText, pageWidth - 40);
      doc.text(nurseLines, 20, 45);
    }
    
    // Doctor Notes
    if (formData.doctorNotes) {
      const doctorY = formData.nurseNotes ? 70 : 35;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Doctor Notes', 20, doctorY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      const doctorNotesText = formData.doctorNotes;
      const doctorLines = doc.splitTextToSize(doctorNotesText, pageWidth - 40);
      doc.text(doctorLines, 20, doctorY + 10);
    }
  }
  
  // Add the current date to the report
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(`Report generated on: ${currentDate}`, 20, doc.internal.pageSize.getHeight() - 20);
  
  // Add doctor signature if provided
  if (formData.doctorName) {
    const lastPage = (doc as any).internal.getNumberOfPages();
    doc.setPage(lastPage);
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Generated by Dr. ${formData.doctorName}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
  }
  
  // Add page numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  // Return the PDF as a blob
  return doc.output('blob');
};
