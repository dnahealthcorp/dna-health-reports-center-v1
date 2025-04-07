
// src/lib/pdf/pdfGenerator.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { calculateAge, convertToKg, calculateBMI } from "./pdfUtilities";
import { 
  addLogoToPage, 
  convertHtmlToFormattedText, 
  addFooterToPage, 
  addMultiPageText 
} from "./logoRenderer";

function ensureSpace(doc: jsPDF, currentY: number, neededHeight: number, topMargin = 40, pageWidth: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 20;
  if (currentY + neededHeight > pageHeight - bottomMargin) {
    addFooterToPage(doc, pageWidth);
    doc.addPage();
    addLogoToPage(doc); // make sure this adds a well-sized logo
    return topMargin;
  }
  return currentY;
}

function generateImagesSection(doc: jsPDF, currentY: number, pageWidth: number): number {
  addLogoToPage(doc); // first page only

  const imageWidth = 100;
  const imageHeight = 66;
  const imageStartX = (pageWidth - imageWidth) / 2;
  const gap = 10;

  ["/assets/picture1.png", "/assets/picture2.png", "/assets/picture3.png"].forEach((src) => {
    try {
      doc.addImage(src, "PNG", imageStartX, currentY, imageWidth, imageHeight);
      currentY += imageHeight + gap;
    } catch (err) {
      console.error("Error loading image:", src);
    }
  });

  return currentY;
}

function generateIntroductionSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  const title = "Your step towards optimal health.";
  const centerX = pageWidth / 2;
  const titleY = currentY + 5;
  const titleWidth = doc.getTextWidth(title);
  doc.setTextColor(100, 100, 100);
  doc.text(title, centerX - titleWidth / 2, titleY);
  currentY = titleY + 10;

  const lines = [
    "Our approach is proactive, rather than reactive,",
    "giving you ",
    "control of your health",
    " throughout",
    "your life."
  ];

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  const line1 = lines[0];
  doc.setTextColor(100, 100, 100);
  doc.text(line1, centerX - doc.getTextWidth(line1) / 2, currentY);
  currentY += 10;

  const part1 = lines[1];
  const part2 = lines[2];
  const part3 = lines[3];
  let segX = centerX - (doc.getTextWidth(part1 + part2 + part3) / 2);

  doc.setTextColor(100, 100, 100);
  doc.text(part1, segX, currentY);
  segX += doc.getTextWidth(part1);

  doc.setTextColor(153, 188, 68);
  doc.text(part2, segX, currentY);
  segX += doc.getTextWidth(part2);

  doc.setTextColor(100, 100, 100);
  doc.text(part3, segX, currentY);
  currentY += 10;

  const line3 = lines[4];
  doc.text(line3, centerX - doc.getTextWidth(line3) / 2, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text(`Dear ${formData.patientInfo.name || "Patient"},`, contentMargin, currentY);
  currentY += 6;

  const intro = [
    "It has been a pleasure to welcome you to our Clinic. The entire DNA Health team feels privileged",
    "to be a part of your journey to wellness and longevity."
  ];

  doc.setFont("helvetica", "normal");
  intro.forEach(line => {
    doc.text(line, contentMargin, currentY, { maxWidth: contentWidth });
    currentY += 6;
  });

  return currentY + 10;
}

function formatSummaryText(text?: string): string {
  return convertHtmlToFormattedText(text || "");
}

function generateSummarySection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  currentY = ensureSpace(doc, currentY, 60, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

  const summaryFields = [
    { name: "Glucose Metabolism", value: formatSummaryText(formData.summaryFindings.glucoseMetabolism) },
    { name: "Proteins", value: formatSummaryText(formData.summaryFindings.proteins) },
    { name: "Lipid Profile", value: formatSummaryText(formData.summaryFindings.lipidProfile) },
    { name: "Inflammation", value: formatSummaryText(formData.summaryFindings.inflammation) },
    { name: "Metabolic", value: formatSummaryText(formData.summaryFindings.metabolic) },
    { name: "Homocysteine", value: formatSummaryText(formData.summaryFindings.homocysteine) },
    { name: "Vitamins/Minerals", value: formatSummaryText(formData.summaryFindings.vitaminsMinerals) },
    { name: "Iron Profile", value: formatSummaryText(formData.summaryFindings.ironProfile) },
    { name: "Sex Hormones", value: formatSummaryText(formData.summaryFindings.sexHormones) },
    { name: "Kidney Function & Electrolytes", value: formatSummaryText(formData.summaryFindings.kidneyFunctionElectrolytes) },
    { name: "Liver Functions", value: formatSummaryText(formData.summaryFindings.liverFunctions) },
    { name: "Tumor Markers", value: formatSummaryText(formData.summaryFindings.tumorMarkers) },
    { name: "Blood Counts", value: formatSummaryText(formData.summaryFindings.bloodCounts) }
  ];
  
  // Filter out empty fields
  const body = summaryFields
    .filter(field => field.value && field.value.trim() !== '')
    .map(field => [field.name, field.value]);

  // Use autoTable with willDrawCell callback for pagination
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [[
      { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
      { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
    ]],
    body,
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: "helvetica",
      textColor: [60, 60, 60],
      overflow: 'linebreak',
      cellWidth: 'auto'
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: function(data) {
      // Add logo and header to each new page
      addLogoToPage(doc);
      // Add footer to each page
      addFooterToPage(doc, pageWidth);
    },
    didParseCell: function(data) {
      // Format the text for readability
      if (data.section === 'body' && data.column.index === 1) {
        data.cell.text = String(data.cell.text).split('\n').filter(line => line.trim() !== '');
      }
    }
  });

  // Get the final Y position after the table
  return (doc as any).lastAutoTable.finalY + 10;
}

function generateMedicationsSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData, medications: Medication[]): number {
  // Ensure we have enough space or move to next page
  currentY = ensureSpace(doc, currentY, 40, 40, pageWidth);
  
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Medications", contentMargin, currentY);
  currentY += 8;

  if (!formData.medications || formData.medications.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "italic");
    doc.text("No medications prescribed.", contentMargin, currentY);
    return currentY + 10;
  }

  const medsData = formData.medications.map(med => {
    const medicationInfo = medications.find(m => m.id === med.medicationId);
    return [
      medicationInfo?.name || "Unknown Medication",
      med.dosage || "-",
      med.frequency || "-"
    ];
  });

  if (medsData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [[
        { content: "Medication", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Dosage", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Frequency", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]],
      body: medsData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: "helvetica",
        textColor: [60, 60, 60]
      },
      margin: { left: contentMargin, right: contentMargin },
      didDrawPage: function(data) {
        // Add logo and header to each new page
        addLogoToPage(doc);
        // Add footer to each page
        addFooterToPage(doc, pageWidth);
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  return currentY;
}

function generateSupplementsSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData, medications: Medication[]): number {
  // Ensure we have enough space or move to next page
  currentY = ensureSpace(doc, currentY, 40, 40, pageWidth);
  
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Recommended Supplements", contentMargin, currentY);
  currentY += 8;

  if (!formData.supplements || formData.supplements.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "italic");
    doc.text("No supplements recommended.", contentMargin, currentY);
    return currentY + 10;
  }

  const supplementsData = formData.supplements.map(supp => {
    const supplementInfo = medications.find(m => m.id === supp.supplementId);
    return [
      supplementInfo?.name || "Unknown Supplement",
      supp.dosage || "-",
      supp.source || "-"
    ];
  });

  if (supplementsData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [[
        { content: "Supplement", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Dosage", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Source/Brand", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]],
      body: supplementsData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: "helvetica",
        textColor: [60, 60, 60]
      },
      margin: { left: contentMargin, right: contentMargin },
      didDrawPage: function(data) {
        // Add logo and header to each new page
        addLogoToPage(doc);
        // Add footer to each page
        addFooterToPage(doc, pageWidth);
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  return currentY;
}

function generateNutritionSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  // Ensure we have enough space or move to next page
  currentY = ensureSpace(doc, currentY, 40, 40, pageWidth);
  
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Nutrition Recommendations", contentMargin, currentY);
  currentY += 8;

  if (!formData.nutritionRecommendations) {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "italic");
    doc.text("No nutrition recommendations provided.", contentMargin, currentY);
    return currentY + 10;
  }

  const { nutritionalStyle, proteinConsumption, eatingWindow, limitations, additionalConsiderations } = formData.nutritionRecommendations;
  
  const nutritionFields = [
    { name: "Nutritional Style", value: formatSummaryText(nutritionalStyle) },
    { name: "Protein Consumption", value: formatSummaryText(proteinConsumption) },
    { name: "Eating Window", value: formatSummaryText(eatingWindow) },
    { name: "Limitations", value: formatSummaryText(limitations) },
    { name: "Additional Considerations", value: formatSummaryText(additionalConsiderations) }
  ].filter(field => field.value && field.value.trim() !== '');

  if (nutritionFields.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [[
        { content: "Category", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Recommendation", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]],
      body: nutritionFields.map(field => [field.name, field.value]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: "helvetica",
        textColor: [60, 60, 60],
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 50, fillColor: [240, 250, 230] },
        1: { cellWidth: contentWidth - 50 }
      },
      margin: { left: contentMargin, right: contentMargin },
      didDrawPage: function(data) {
        // Add logo and header to each new page
        addLogoToPage(doc);
        // Add footer to each page
        addFooterToPage(doc, pageWidth);
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "italic");
    doc.text("No nutrition recommendations provided.", contentMargin, currentY);
    currentY += 10;
  }
  
  return currentY;
}

function generateExerciseSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  // Ensure we have enough space or move to next page
  currentY = ensureSpace(doc, currentY, 40, 40, pageWidth);
  
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Exercise Recommendations", contentMargin, currentY);
  currentY += 8;

  if (!formData.exerciseRecommendations && (!formData.exerciseDetail || Object.values(formData.exerciseDetail).every(value => !value))) {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "italic");
    doc.text("No exercise recommendations provided.", contentMargin, currentY);
    return currentY + 10;
  }

  // General exercise recommendations
  if (formData.exerciseRecommendations) {
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    
    // Use multi-page text function to handle overflow
    currentY = addMultiPageText(
      doc, 
      formatSummaryText(formData.exerciseRecommendations), 
      currentY, 
      contentMargin, 
      contentWidth, 
      pageWidth
    );
  }

  // Detailed exercise recommendations
  if (formData.exerciseDetail && Object.values(formData.exerciseDetail).some(value => value)) {
    const { focusOn, walking, restRecovery, tracking } = formData.exerciseDetail;
    
    const exerciseFields = [
      { name: "Focus On", value: formatSummaryText(focusOn) },
      { name: "Walking", value: formatSummaryText(walking) },
      { name: "Rest/Recovery", value: formatSummaryText(restRecovery) },
      { name: "Tracking", value: formatSummaryText(tracking) }
    ].filter(field => field.value && field.value.trim() !== '');

    if (exerciseFields.length > 0) {
      // Ensure we have enough space for the table
      currentY = ensureSpace(doc, currentY, 30, 40, pageWidth);
      
      autoTable(doc, {
        startY: currentY,
        head: [[
          { content: "Category", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
          { content: "Recommendation", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
        ]],
        body: exerciseFields.map(field => [field.name, field.value]),
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
          font: "helvetica",
          textColor: [60, 60, 60],
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 50, fillColor: [240, 250, 230] },
          1: { cellWidth: contentWidth - 50 }
        },
        margin: { left: contentMargin, right: contentMargin },
        didDrawPage: function(data) {
          // Add logo and header to each new page
          addLogoToPage(doc);
          // Add footer to each page
          addFooterToPage(doc, pageWidth);
        }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
  }
  
  return currentY;
}

function generateFollowUpSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  // Only generate section if we have follow-ups
  if (!formData.followUps || formData.followUps.length === 0) {
    return currentY;
  }

  // Ensure we have enough space or move to next page
  currentY = ensureSpace(doc, currentY, 40, 40, pageWidth);
  
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Follow-up Appointments", contentMargin, currentY);
  currentY += 8;

  const followUpsData = formData.followUps.map(followUp => [
    followUp.withDoctor || "-",
    followUp.forReason || "-",
    followUp.date || "-"
  ]);

  if (followUpsData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [[
        { content: "Doctor", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Reason", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Date", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]],
      body: followUpsData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: "helvetica",
        textColor: [60, 60, 60]
      },
      margin: { left: contentMargin, right: contentMargin },
      didDrawPage: function(data) {
        // Add logo and header to each new page
        addLogoToPage(doc);
        // Add footer to each page
        addFooterToPage(doc, pageWidth);
      }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }
  
  return currentY;
}

function generateDoctorNotes(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  if (!formData.doctorNotes || formData.doctorNotes.trim() === '') {
    return currentY;
  }

  // Ensure we have enough space or move to next page
  currentY = ensureSpace(doc, currentY, 40, 40, pageWidth);
  
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Additional Doctor Notes", contentMargin, currentY);
  currentY += 8;

  // Use multi-page text function to handle overflow
  currentY = addMultiPageText(
    doc, 
    formatSummaryText(formData.doctorNotes), 
    currentY, 
    contentMargin, 
    contentWidth, 
    pageWidth
  );
  
  return currentY;
}

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<Blob> => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("helvetica");

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentMargin = 20;
  const contentWidth = pageWidth - contentMargin * 2;
  let currentY = 40;

  // Add logo to the first page
  addLogoToPage(doc);
  
  // Generate introduction and content sections
  currentY = generateIntroductionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  currentY = generateSummarySection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  currentY = generateMedicationsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, medications);
  currentY = generateSupplementsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, medications);
  currentY = generateNutritionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  currentY = generateExerciseSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  currentY = generateFollowUpSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  currentY = generateDoctorNotes(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Add footer to the last page
  addFooterToPage(doc, pageWidth);
  
  // Generate the blob without duplicating the download
  const blob = doc.output("blob");
  
  return blob;
};
