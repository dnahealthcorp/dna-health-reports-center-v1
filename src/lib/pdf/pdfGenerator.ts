import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { calculateAge, convertToKg, calculateBMI } from "./pdfUtilities";
import { addLogoToPage } from "./logoRenderer";

/**
 * Utility function to strip HTML tags but preserve paragraph breaks and lists
 */
function parseHtml(html: string): string {
  if (!html) return "";
  
  // If no HTML tags, return as is
  if (!/<\/?[a-z][\s\S]*>/i.test(html)) return html;
  
  // Otherwise, handle HTML formatting
  let parsed = html
    // Convert paragraph breaks
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, "\n")
    
    // Convert line breaks
    .replace(/<br\s*\/?>/g, "\n")
    
    // Convert lists
    .replace(/<\/?ul>/g, "\n")
    .replace(/<\/?ol>/g, "\n")
    .replace(/<li>/g, "• ")
    .replace(/<\/li>/g, "\n")
    
    // Convert bold and emphasis
    .replace(/<(strong|b)>(.*?)<\/(strong|b)>/g, "$2")
    .replace(/<(em|i)>(.*?)<\/(em|i)>/g, "$2")
    
    // Remove any remaining tags
    .replace(/<[^>]+>/g, "")
    
    // Normalize spacing
    .replace(/\n{3,}/g, "\n\n");
  
  return parsed.trim();
}

/**
 * Draws the footer on the current page.
 * Footer text: "Executive Summary | DNA Health" in 8px helvetica regular,
 * right aligned, color #a5a4a4.
 */
function addFooter(doc: jsPDF, pageWidth: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#a5a4a4");
  // Right align, 10mm from the bottom
  doc.text("Executive Summary | DNA Health", pageWidth - 10, pageHeight - 10, { align: "right" });
}

/**
 * Checks if there's enough vertical space on the current page.
 * If not, draws a footer, adds a new page (with header logo), and resets currentY to topMargin.
 */
function ensureSpace(
  doc: jsPDF,
  currentY: number,
  neededHeight: number,
  topMargin = 40,
  pageWidth: number
): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 15;
  if (currentY + neededHeight > pageHeight - bottomMargin) {
    addFooter(doc, pageWidth);
    doc.addPage();
    addLogoToPage(doc);
    return topMargin;
  }
  return currentY;
}

/**
 * Add multi-line text to the document with proper wrapping and paging
 */
function addMultiPageText(
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  options: { maxWidth?: number, align?: string } = {}, 
  topMargin = 40,
  pageWidth: number
): number {
  if (!text) return y;
  
  const maxWidth = options.maxWidth || (pageWidth - (x * 2));
  const lineHeight = 5; // mm
  
  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;
  
  for (let i = 0; i < lines.length; i++) {
    // Check if we need a new page
    currentY = ensureSpace(doc, currentY, lineHeight, topMargin, pageWidth);
    
    // Add the text line
    doc.text(lines[i], x, currentY, options);
    currentY += lineHeight;
  }
  
  return currentY;
}

/**
 * Section 1: Images on the first page (cover).
 * Includes logo on the first page, no page number shown.
 */
function generateImagesSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number
): number {
  // Add logo on the very first page
  addLogoToPage(doc);

  const blockHeight = 150;
  currentY = ensureSpace(doc, currentY, blockHeight, 40, pageWidth);

  const imageWidth = 100;
  const imageHeight = 66;
  const imageStartX = (pageWidth - imageWidth) / 2;

  try {
    doc.addImage("/assets/picture1.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    doc.addImage("/assets/picture2.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
    doc.addImage("/assets/picture3.png", "PNG", imageStartX, currentY, imageWidth, imageHeight);
    currentY += imageHeight + 10;
  } catch (error) {
    console.error("Error adding images to PDF:", error);
  }
  return currentY;
}

/**
 * Section 2: Introduction & Greeting.
 * Reduced top spacing for "Your step towards optimal health."
 */
function generateIntroductionSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  // Title line: "Your step towards optimal health."
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  const title = "Your step towards optimal health.";
  const titleWidth = doc.getTextWidth(title);
  const centerX = pageWidth / 2;
  const titleY = currentY + 5; // reduced top spacing
  const titleX = centerX - (titleWidth / 2);
  doc.setTextColor(100, 100, 100);
  doc.text(title, titleX, titleY);
  currentY = titleY + 10;

  // Multi-line approach text
  doc.setFontSize(18);
  doc.setFont("Helvetica", "bold");

  const line1 = "Our approach is proactive, rather than reactive,";
  const line2Part1 = "giving you ";
  const line2Part2 = "control of your health";
  const line2Part3 = " throughout";
  const line3 = "your life.";

  const line1Width = doc.getTextWidth(line1);
  const line1X = centerX - line1Width / 2;
  doc.setTextColor(100, 100, 100);
  doc.text(line1, line1X, currentY);
  currentY += 10;

  // line2
  const line2Full = line2Part1 + line2Part2 + line2Part3;
  const line2Width = doc.getTextWidth(line2Full);
  const line2X = centerX - line2Width / 2;
  let segX = line2X;

  doc.setTextColor(100, 100, 100);
  doc.text(line2Part1, segX, currentY);
  segX += doc.getTextWidth(line2Part1);

  doc.setTextColor(153, 188, 68);
  doc.text(line2Part2, segX, currentY);
  segX += doc.getTextWidth(line2Part2);

  doc.setTextColor(100, 100, 100);
  doc.text(line2Part3, segX, currentY);
  currentY += 10;

  // line3
  const line3Width = doc.getTextWidth(line3);
  const line3X = centerX - line3Width / 2;
  doc.text(line3, line3X, currentY);
  currentY += 10;

  // Greeting & intro text
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
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
 * Section 3: Vital Signs Table (striped).
 * Headings 14px
 */
function generateVitalsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 15, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Key vital signs", contentMargin, currentY);
  currentY += 8;

  const colWidth = contentWidth / 3;
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
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
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: colWidth, fillColor: [240, 250, 230] },
      1: { cellWidth: colWidth },
      2: { cellWidth: colWidth }
    },
    margin: { left: contentMargin, right: contentMargin }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 4: Summary of Findings (striped).
 */
function generateSummarySection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 60, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

  // Create a summary table with HTML content properly parsed
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } },
        { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Glucose Metabolism", parseHtml(formData.summaryFindings.glucoseMetabolism || "")],
      ["Proteins", parseHtml(formData.summaryFindings.proteins || "")],
      ["Lipid Profile", parseHtml(formData.summaryFindings.lipidProfile || "")],
      ["Inflammation", parseHtml(formData.summaryFindings.inflammation || "")],
      ["Metabolic", parseHtml(formData.summaryFindings.metabolic || "")],
      ["Homocysteine", parseHtml(formData.summaryFindings.homocysteine || "")],
      ["Vitamins/Minerals", parseHtml(formData.summaryFindings.vitaminsMinerals || "")],
      ["Iron Profile", parseHtml(formData.summaryFindings.ironProfile || "")],
      ["Sex Hormones", parseHtml(formData.summaryFindings.sexHormones || "")],
      ["Kidney Function and Electrolytes", parseHtml(formData.summaryFindings.kidneyFunctionElectrolytes || "")],
      ["Liver Functions", parseHtml(formData.summaryFindings.liverFunctions || "")],
      ["Tumor Markers", parseHtml(formData.summaryFindings.tumorMarkers || "")],
      ["Blood Counts", parseHtml(formData.summaryFindings.bloodCounts || "")]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60, 60, 60]
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
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 5: Insulin Resistance & Cardiovascular Risk (striped).
 * Reapply heading style after ensureSpace
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
    currentY = ensureSpace(doc, currentY, 80, 40, pageWidth);
    doc.setFontSize(14);
    doc.setTextColor(153, 188, 68);
    doc.setFont("helvetica", "bold");
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

  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Cardiovascular risk (*Apo B : Apo A1 ratio)", contentMargin, currentY);
  currentY += 5;

  doc.setFontSize(10);
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Low risk", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Moderate risk", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "High risk", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Men", "0.30-to-0.69", "0.70-to-0.89", "0.90-to-1.2"],
      ["Women", "0.30-to-0.59", "0.60-to-0.79", "0.80-to-1.00"]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawCell: (data) => {
      if (data.section === "body") {
        const rowIndex = data.row.index;
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
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 6: Doctor's Recommendations (Nutrition), striped.
 */
function generateDoctorsRecommendationsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  doc.text("Doctors Recommendations", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Nutrition", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Nutritional Style", parseHtml(formData.nutritionRecommendations?.nutritionalStyle || "")],
      ["Protein Consumption", parseHtml(formData.nutritionRecommendations?.proteinConsumption || "")],
      ["Eating Window", parseHtml(formData.nutritionRecommendations?.eatingWindow || "")],
      ["Limitations", parseHtml(formData.nutritionRecommendations?.limitations || "")],
      ["Additional Considerations", parseHtml(formData.nutritionRecommendations?.additionalConsiderations || "")]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 7: Exercise and Sleep/Stress Recommendations, striped.
 */
function generateExerciseSleepSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  // Title for Exercise
  doc.text("Exercise", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Exercise", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Focus on", parseHtml(formData.exerciseDetail?.focusOn || "")],
      ["Walking", parseHtml(formData.exerciseDetail?.walking || "")],
      ["Rest/Recovery", parseHtml(formData.exerciseDetail?.restRecovery || "")],
      ["Tracking", parseHtml(formData.exerciseDetail?.tracking || "")]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  // Title for Sleep & Stress
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  doc.text("Sleep and Stress", contentMargin, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "Sleep and Stress", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Recommendations", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: [
      ["Sleep", parseHtml(formData.sleepStressRecommendations?.sleep || "")],
      ["Stress", parseHtml(formData.sleepStressRecommendations?.stress || "")]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 8: Medications and Supplements, striped.
 * Re-apply heading style after ensureSpace for "Supplements"
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
  // Medications
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
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
    theme: "grid",
    head: [
      [
        { content: "Medications", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Dosage", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Type", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: medicationRows,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Supplements
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14); // reapply heading style
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
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
    theme: "grid",
    head: [
      [
        { content: "Supplements", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Dosage", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Source", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: supplementRows,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

/**
 * Section 9: Follow-ups and Referrals plus Signature, striped.
 * After the table, we add the requested links, then the signature.
 */
function generateFollowUpsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData
): number {
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
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
    theme: "grid",
    head: [
      [
        { content: "With", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "For", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Date", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: followUpRows,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo to each new page
      if (data.pageCount > 1 && data.cursor.y < 40) {
        addLogoToPage(doc);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // === Add the requested links here ===
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  
  // We'll do them as small link texts. 
  const guides = [
    "Guide to Intermittent Fasting",
    "Guide to Carbohydrates and Protein",
    "Guide to Meditation",
    "Guide to Sleep",
    "Guide to Anti-inflammatory Foods",
    "Guide to Homocystein"
  ];

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100,100,100);
  doc.text("Additional Guides:", contentMargin, currentY);
  currentY += 6;

  // We'll render each as a link to "#"
  guides.forEach((guide) => {
    // Use doc.textWithLink for clickable link (all pointing to "#")
    doc.setTextColor(0, 0, 255); // typical link color
    doc.textWithLink(guide, contentMargin, currentY, { url: "#" });
    currentY += 6;
  });

  currentY += 6; // extra spacing before signature

  // Signature with dynamic doctor name
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth);
  doc.setFontSize(10);
  doc.setTextColor(100,100,100);
  doc.setFont("helvetica", "normal");
  doc.text("Kind Regards,", contentMargin, currentY);
  currentY += 6;
  doc.setFont("helvetica", "bold");
  
  // Use the dynamic doctor name from the form or a default if not provided
  const doctorName = formData.doctorName || "Doctor";
  doc.text(doctorName, contentMargin, currentY);
  currentY += 10;

  return currentY;
}

/**
 * Main PDF Generator.
 */
export const generatePDF = async (
  formData: PatientFormData,
  medications: Medication[]
): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  doc.setFont("helvetica");

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm for A4
  const contentMargin = 20;
  const contentWidth = pageWidth - contentMargin * 2;

  // Setup consistent page formatting (headers/footers)
  doc.setProperties({
    title: `Health Screening for ${formData.patientInfo.name || "Patient"}`,
    subject: "Health Screening Report",
    author: "DNA Health Clinic",
    creator: "DNA Health System"
  });

  // Start at 40mm from the top for extra spacing
  let currentY = 40;

  // 1) First page (cover) with images (and logo), no page number
  currentY = generateImagesSection(doc, currentY, pageWidth, contentMargin, contentWidth);

  // Force new page after cover
  addFooter(doc, pageWidth); // Footer on cover
  doc.addPage();
  addLogoToPage(doc);
  currentY = 40; // reset Y

  // 2) Introduction & Greeting
  currentY = generateIntroductionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 3) Vital Signs
  currentY = generateVitalsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 4) Summary Findings
  currentY = generateSummarySection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 5) Insulin Resistance & Cardiovascular Risk
  currentY = generateInsulinCardioSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 6) Doctor's Recommendations
  currentY = generateDoctorsRecommendationsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 7) Exercise & Sleep/Stress
  currentY = generateExerciseSleepSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // 8) Medications & Supplements
  currentY = generateMedicationsSupplementsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData, medications);

  // 9) Follow-ups (plus new links, then signature)
  currentY = generateFollowUpsSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  // Add footer to the final page
  addFooter(doc, pageWidth);

  // Return the PDF as a Blob instead of saving it
  return doc.output('blob');
};
