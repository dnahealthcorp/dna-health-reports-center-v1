import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { calculateAge, convertToKg, calculateBMI, addPageNumber } from "./pdfUtilities";
import { addLogoToPage } from "./logoRenderer";
import * as databaseService from "@/services/databaseService";

/**
 * Draws the footer on the current page.
 * Footer text: "Executive Summary | DNA Health" in 14px helvetica regular.
 */
function addFooter(doc: jsPDF, pageWidth: number): void { 
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("Executive Summary | DNA Health", pageWidth / 2, pageHeight - 10, { align: "center" });
}

/**
 * Checks if there’s enough vertical space on the current page.
 * If not, draws a footer, adds a new page (with logo), and resets currentY.
 */
function ensureSpace(doc: jsPDF, currentY: number, neededHeight: number, topMargin = 20, pageWidth: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 15; // adjust as needed
  if (currentY + neededHeight > pageHeight - bottomMargin) {
    // Draw footer on the current page before adding new page
    addFooter(doc, pageWidth);
    doc.addPage();
    addLogoToPage(doc);
    return topMargin;
  }
  return currentY;
}

/**
 * Section 1: Images on the first page.
 * Displays 3 images and then forces a page break.
 */
function generateImagesSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number
): number {
  const blockHeight = 150; // estimated height for images section
  currentY = ensureSpace(doc, currentY, blockHeight, 20, pageWidth);
  const imageWidth = 100;
  const imageHeight = 66;
  const imageStartX = (pageWidth - imageWidth) / 2;

  try {
    // First image: 6 out of 10 causes
    doc.addImage("/assets/picture1.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    // Second image: 3% healthcare expenditure
    doc.addImage("/assets/picture2.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    // Third image: 90% healthcare expenditure
    doc.addImage("/assets/picture3.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
  } catch (error) {
    console.error("Error adding images to PDF:", error);
  }

  addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  return currentY;
}

/**
 * Section 2: Introduction & Greeting.
 * Starts on a new page.
 */
function generateIntroductionSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  // Title: "Your step towards optimal health."
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  const line1Part1 = "Your step towards ";
  const line1Part2 = "optimal health";
  const line1Part3 = ".";
  const line1Full = line1Part1 + line1Part2 + line1Part3;
  const line1Width = doc.getTextWidth(line1Full);
  const centerX = pageWidth / 2;
  const line1StartX = centerX - (line1Width / 2);
  const line1Y = currentY + 15;
  let currentX = line1StartX;
  doc.setTextColor(100, 100, 100);
  doc.text(line1Part1, currentX, line1Y);
  currentX += doc.getTextWidth(line1Part1);
  doc.setTextColor(153, 188, 68);
  doc.text(line1Part2, currentX, line1Y);
  currentX += doc.getTextWidth(line1Part2);
  doc.setTextColor(100, 100, 100);
  doc.text(line1Part3, currentX, line1Y);
  currentY = line1Y + 10;

  // Greeting and introduction text
  doc.setFontSize(10);
  const greeting = `Dear ${formData.patientInfo.name || "Patient"},`;
  doc.text(greeting, contentMargin, currentY);
  currentY += 6;
  const introLines = [
    "It has been a pleasure to welcome you to our Clinic. The entire DNA Health team feels privileged",
    "to be a part of your journey to wellness and longevity."
  ];
  introLines.forEach(line => {
    doc.text(line, contentMargin, currentY, { maxWidth: contentWidth, align: "left" });
    currentY += 6;
  });
  return currentY + 10;
}

/**
 * Section 3: Vital Signs Table.
 */
function generateVitalsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  currentY = ensureSpace(doc, currentY, 15, 20, pageWidth);
  doc.text("Key vital signs", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Vitals", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Value", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Target Range", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]
    ],
    body: [
      ["Date of Birth", formData.patientInfo.dateOfBirth ? new Date(formData.patientInfo.dateOfBirth).toLocaleDateString() : "-", "-"],
      ["Age (years)", calculateAge(formData.patientInfo.dateOfBirth), "-"],
      ["Blood Pressure", formData.vitals.bloodPressure || "-", "120/60-140/85"],
      ["Height (cm)", formData.vitals.height || "-", "-"],
      ["Weight (Kg)", convertToKg(formData.vitals.weight) || "-", "-"],
      ["Body Mass Index", calculateBMI(formData.vitals.height, formData.vitals.weight), "18.5 – 25.9"]
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 4: Summary of Findings.
 */
function generateSummarySection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  currentY = ensureSpace(doc, currentY, 60, 20, pageWidth);
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
      ]
    ],
    body: [
      ["Glucose Metabolism", formData.summaryFindings.glucoseMetabolism || ""],
      ["Lipid Profile", formData.summaryFindings.lipidProfile || ""],
      ["Inflammation", formData.summaryFindings.inflammation || ""],
      ["Uric Acid", formData.summaryFindings.uricAcid || ""],
      ["Vitamins", formData.summaryFindings.vitamins || ""],
      ["Minerals", formData.summaryFindings.minerals || ""],
      ["Sex Hormones", formData.summaryFindings.sexHormones || ""],
      ["Renal & Liver Function", formData.summaryFindings.renalLiverFunction || ""],
      ["Cancer markers", formData.summaryFindings.cancerMarkers || ""]
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 5: Insulin Resistance & Cardiovascular Risk.
 */
function generateInsulinCardioSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  if (formData.showInsulinResistance === true) {
    doc.setFontSize(12);
    doc.setTextColor(153, 188, 68);
    doc.setFont("helvetica", "bold");
    currentY = ensureSpace(doc, currentY, 80, 20, pageWidth);
    doc.text("Insulin Resistance (Metabolic Syndrome)", contentMargin, currentY);
    currentY += 10;
    try {
      doc.addImage("/assets/insulin resistance.jpg", "JPEG", contentMargin, currentY, contentWidth, 60);
    } catch (error) {
      console.error("Error adding insulin resistance image:", error);
    }
    currentY += 60;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Figure 1: Insulin resistance and resulting metabolic disturbance", pageWidth / 2, currentY, { align: "center" });
    currentY += 10;
  }
  // Cardiovascular risk table
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  currentY = ensureSpace(doc, currentY, 20, 20, pageWidth);
  doc.text("Cardiovascular risk (*Apo B : Apo A1 ratio)", contentMargin, currentY);
  currentY += 5;
  
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } },
        { content: "Low risk", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } },
        { content: "Moderate risk", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } },
        { content: "High risk", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      // Highlight the appropriate row based on gender:
      ["Men", "0.30-to-0.69", "0.70-to-0.89", "0.90-to-1.2"],
      ["Women", "0.30-to-0.59", "0.60-to-0.79", "0.80-to-1.00"]
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 40, fillColor: [240, 250, 230] },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawCell: (data) => {
      if (data.section === "body") {
        const rowIndex = data.row.index;
        // Highlight "Men" row if gender is male; otherwise, highlight "Women"
        if ((formData.patientInfo.gender === "Male" && rowIndex === 0) ||
            (formData.patientInfo.gender === "Female" && rowIndex === 1)) {
          doc.setFillColor(255, 255, 200);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
          doc.setTextColor(60, 60, 60);
          doc.text(
            data.cell.text,
            data.cell.x + data.cell.padding("left"),
            data.cell.y + data.cell.padding("top") + data.cell.contentHeight / 2 + 1
          );
        }
      }
    },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 6: Doctor's Recommendations (Nutrition).
 */
function generateDoctorsRecommendationsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  currentY = ensureSpace(doc, currentY, 20, 20, pageWidth);
  doc.text("Doctors Recommendations", contentMargin, currentY);
  currentY += 8;
  
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Nutrition", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Style (nutritional plan)", formData.nutritionRecommendations?.nutritionalPlan || ""],
      ["Protein Consumption", formData.nutritionRecommendations?.proteinConsumption || ""],
      ["Omissions", formData.nutritionRecommendations?.omissions || ""],
      ["Additional Considerations", formData.nutritionRecommendations?.additionalConsiderations || ""]
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 7: Exercise and Sleep/Stress Recommendations.
 */
function generateExerciseSleepSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  // Exercise recommendations table
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Exercise", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Focus on", formData.exerciseDetail?.focusOn || ""],
      ["Walking", formData.exerciseDetail?.walking || ""],
      ["Avoid", formData.exerciseDetail?.avoid || ""],
      ["Tracking", formData.exerciseDetail?.tracking || ""]
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Sleep and Stress recommendations table
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Sleep and Stress", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Sleep", formData.sleepStressRecommendations?.sleep || ""],
      ["Stress", formData.sleepStressRecommendations?.stress || ""]
    ],
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 8: Medications and Supplements.
 */
function generateMedicationsSupplementsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData,
  medications: Medication[]
): number {
  // Medications title
  doc.setFontSize(12);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  currentY = ensureSpace(doc, currentY, 20, 20, pageWidth);
  doc.text("Medications", contentMargin, currentY);
  currentY += 8;
  
  const medicationRows = formData.medications.map(med => {
    const medication = medications.find(m => m.id === med.medicationId);
    return [
      medication?.name || "",
      med.dosage || "",
      "Prescription"
    ];
  }).filter(row => row[0] || row[1]);
  
  if (medicationRows.length === 0) {
    medicationRows.push(["No medications prescribed", "", ""]);
  }
  
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Medications", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Dosage", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Type", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: medicationRows,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Supplements title
  doc.setFontSize(12);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  currentY = ensureSpace(doc, currentY, 20, 20, pageWidth);
  doc.text("Supplements", contentMargin, currentY);
  currentY += 8;
  
  const supplementRows = (formData.supplements || []).map(sup => {
    const supplement = medications.find(m => m.id === sup.supplementId);
    return [
      supplement?.name || "",
      sup.dosage || "",
      sup.source || ""
    ];
  }).filter(row => row[0] || row[1] || row[2]);
  
  if (supplementRows.length === 0) {
    supplementRows.push(["No supplements recommended", "", ""]);
  }
  
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "Supplements", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Dosage", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Source", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: supplementRows,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 9: Follow-ups and Referrals plus Signature.
 */
function generateFollowUpsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  doc.setFontSize(12);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  currentY = ensureSpace(doc, currentY, 20, 20, pageWidth);
  doc.text("Follow-ups and referrals", contentMargin, currentY);
  currentY += 8;
  
  const followUpRows = (formData.followUps || []).map(followUp => [
    followUp.withDoctor || "",
    followUp.forReason || "",
    followUp.date || ""
  ]).filter(row => row[0] || row[1] || row[2]);
  
  if (followUpRows.length === 0) {
    followUpRows.push(["No follow-ups scheduled", "", ""]);
  }
  
  autoTable(doc, {
    startY: currentY,
    head: [
      [
        { content: "With", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "For", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Date", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: followUpRows,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: () => {
      addFooter(doc, pageWidth);
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  // Closing & Signature
  doc.setFontSize(10);
  doc.setTextColor(100,100,100);
  doc.setFont("helvetica", "normal");
  doc.text("Kind Regards,", contentMargin, currentY);
  currentY += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Dr Eslam Yakout", contentMargin, currentY);
  currentY += 10;
  return currentY;
}

/**
 * Main PDF Generator.
 */
export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<string> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  doc.setFont("helvetica");
  
  const pageWidth = doc.internal.pageSize.getWidth();  // 210 mm for A4
  const contentMargin = 20;
  const contentWidth = pageWidth - contentMargin * 2;
  
  // Start at a top margin (e.g., 30 mm)
  let currentY = 30;
  
  // Section 1: Images on the first page.
  currentY = generateImagesSection(doc, currentY, pageWidth, contentMargin, contentWidth);
  
  // Force a page break after images so Section 2 starts on a new page.
  addFooter(doc, pageWidth); // Add footer to the first page before breaking
  doc.addPage();
  addLogoToPage(doc);
  currentY = 30; // reset vertical position
  
  // Section 2: Introduction & Greeting.
  currentY = generateIntroductionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Section 3: Vital Signs.
  currentY = generateVitalsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Section 4: Summary Findings.
  currentY = generateSummarySection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Section 5: Insulin Resistance & Cardiovascular Risk.
  currentY = generateInsulinCardioSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Section 6: Doctor's Recommendations (Nutrition).
  currentY = generateDoctorsRecommendationsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Section 7: Exercise and Sleep/Stress Recommendations.
  currentY = generateExerciseSleepSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  // Section 8: Medications and Supplements.
  currentY = generateMedicationsSupplementsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, medications);
  
  // Section 9: Follow-ups and Referrals.
  currentY = generateFollowUpsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  
  const patientName = formData.patientInfo.name?.replace(/\s+/g, "_") || "Patient";
  const fileName = `${patientName}_Medical_Report.pdf`;
  doc.save(fileName);
  
  if (formData.patientInfo.medicalRecordNumber) {
    await databaseService.savePDFReference(formData.patientInfo.medicalRecordNumber, fileName);
  }
  
  return fileName;
};
