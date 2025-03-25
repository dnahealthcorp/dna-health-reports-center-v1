
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { calculateAge, convertToKg, calculateBMI, drawStatBox, addPageNumber } from "./pdfUtilities";
import { addLogoToPage } from "./logoRenderer";
import * as databaseService from "@/services/databaseService";

/**
 * Generates the first page of the PDF with health statistics
 */
const generateFirstPage = (doc: jsPDF, pageWidth: number, contentMargin: number, contentWidth: number) => {
  addLogoToPage(doc);
  
  // Add images instead of statistic boxes - centered on page
  const imageWidth = 100;
  const imageHeight = 66;  // Set a fixed height to maintain aspect ratio
  const imageStartX = (pageWidth - imageWidth) / 2;
  
  try {
    // First image: 6 out of 10 causes
    doc.addImage("/assets/picture1.png", "PNG", imageStartX, 50, imageWidth, imageHeight);
    
    // Second image: 3% healthcare expenditure 
    doc.addImage("/assets/picture2.png", "PNG", imageStartX, 120, imageWidth, imageHeight);
    
    // Third image: 90% healthcare expenditure
    doc.addImage("/assets/picture3.png", "PNG", imageStartX, 190, imageWidth, imageHeight);
  } catch (error) {
    console.error("Error adding images to PDF:", error);
    // Fallback to text if images fail to load
    drawStatBox(doc, "6 out of 10 causes\nof death are\npreventable", 60, contentMargin, contentWidth, pageWidth);
    drawStatBox(doc, "We only spend 3%\nof our health care\nexpenditure on\nprevention", 110, contentMargin, contentWidth, pageWidth);
    drawStatBox(doc, "90% of our health\ncare expenditure\noccurs in the last 3\nyears of our lives", 160, contentMargin, contentWidth, pageWidth);
  }
  
  // Add page number
  addPageNumber(doc, 1, pageWidth);
};

/**
 * Generates the second page with introduction and vital signs
 * Returns the current Y position after the vital signs table for dynamic content flow
 */
const generateSecondPage = (doc: jsPDF, formData: PatientFormData, pageWidth: number, contentMargin: number, contentWidth: number) => {
  const { patientInfo, vitals } = formData;
  
  doc.addPage();
  addLogoToPage(doc);
  
  // Common settings
  doc.setFont("Calibri", "bold");
  doc.setFontSize(22);

  // --------------------
  // LINE 1: "Your step towards optimal health."
  // --------------------
  const line1Part1 = "Your step towards ";
  const line1Part2 = "optimal health";
  const line1Part3 = ".";

  const line1Full = line1Part1 + line1Part2 + line1Part3;
  const line1Width = doc.getTextWidth(line1Full);

  // Center horizontally
  const centerX = pageWidth / 2;
  // The left edge of the text is half the total width to the left of center
  const line1StartX = centerX - (line1Width / 2);
  const line1Y = 45; // vertical position

  let currentX = line1StartX;

  // Part 1 (gray)
  doc.setTextColor(100, 100, 100);  // gray
  doc.text(line1Part1, currentX, line1Y);
  currentX += doc.getTextWidth(line1Part1);

  // Part 2 (green)
  doc.setTextColor(153, 188, 68);   // #99bc44
  doc.text(line1Part2, currentX, line1Y);
  currentX += doc.getTextWidth(line1Part2);

  // Part 3 (gray)
  doc.setTextColor(100, 100, 100);
  doc.text(line1Part3, currentX, line1Y);

  // --------------------
  // LINE 2: "Our approach is proactive, rather than reactive,"
  // --------------------
  const line2 = "Our approach is proactive, rather than reactive,";
  const line2Width = doc.getTextWidth(line2);
  const line2StartX = centerX - (line2Width / 2);
  const line2Y = 55;

  doc.setTextColor(100, 100, 100);
  doc.text(line2, line2StartX, line2Y);

  // --------------------
  // LINE 3: "giving you control of your health throughout your life."
  // (with "control of your health" in green)
  // --------------------
  const line3Part1 = "giving you ";
  const line3Part2 = "control of your health";
  const line3Part3 = " throughout your life.";

  const line3Full = line3Part1 + line3Part2 + line3Part3;
  const line3Width = doc.getTextWidth(line3Full);
  const line3StartX = centerX - (line3Width / 2);
  const line3Y = 65;

  let currentX3 = line3StartX;

  // Part 1 (gray)
  doc.setTextColor(100, 100, 100);
  doc.text(line3Part1, currentX3, line3Y);
  currentX3 += doc.getTextWidth(line3Part1);

  // Part 2 (green)
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.text(line3Part2, currentX3, line3Y);
  currentX3 += doc.getTextWidth(line3Part2);

  // Part 3 (gray)
  doc.setTextColor(100, 100, 100);
  doc.text(line3Part3, currentX3, line3Y);

  // Greeting
  doc.setFontSize(10);
  const greeting = `Dear ${patientInfo.name || "Patient"},`;
  doc.text(greeting, contentMargin, 95);
  
  doc.text("It has been a pleasure to welcome you to our Clinic. The entire DNA Health team feels privileged to be a", contentMargin, 105);
  doc.text("part of your journey to wellness and longevity.", contentMargin, 112);
  
  // Key vital signs table
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Key vital signs", contentMargin, 130);
  
  // Vital signs table with proper width
  let finalY = 0;
  autoTable(doc, {
    startY: 135,
    head: [
      [
        { content: 'Vitals', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Value', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Target Range', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: [
      ['Date of Birth', patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth).toLocaleDateString() : '-', '-'],
      ['Age (years)', calculateAge(patientInfo.dateOfBirth), '-'],
      ['Blood Pressure', vitals.bloodPressure || '-', '120/60-140/85'],
      ['Height (cm)', vitals.height || '-', '-'],
      ['Weight (Kg)', convertToKg(vitals.weight) || '-', '-'],
      ['Body Mass Index', calculateBMI(vitals.height, vitals.weight), '18.5 – 25.9']
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 }
    },
    margin: { left: 30, right: 0},
    didDrawPage: (data) => {
      // Add page number
      addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Return the current Y position after the table for dynamic flow
  return finalY + 10; // Add some padding after the table
};

/**
 * Generates the summary findings section
 * Returns the current Y position after the section for dynamic content flow
 */
const generateSummaryFindings = (doc: jsPDF, formData: PatientFormData, startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const { summaryFindings } = formData;
  const minRequiredHeight = 200; // Estimated minimum height needed for this section
  
  // Check if there's enough space on the current page
  if (startY + minRequiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Summary of findings
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, startY);
  
  // Summary findings table with proper width
  let finalY = 0;
  autoTable(doc, {
    startY: startY + 5,
    head: [
      [
        { content: 'Parameters', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Key findings and next steps', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: [
      ['Glucose Metabolism', summaryFindings?.glucoseMetabolism || ''],
      ['Lipid Profile', summaryFindings?.lipidProfile || ''],
      ['Inflammation', summaryFindings?.inflammation || ''],
      ['Uric Acid', summaryFindings?.uricAcid || ''],
      ['Vitamins', summaryFindings?.vitamins || ''],
      ['Minerals', summaryFindings?.minerals || ''],
      ['Sex Hormones', summaryFindings?.sexHormones || ''],
      ['Renal & Liver Function', summaryFindings?.renalLiverFunction || ''],
      ['Cancer markers', summaryFindings?.cancerMarkers || '']
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: 'helvetica',
      overflow: 'linebreak',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Return the current Y position after the table for dynamic flow
  return finalY + 10; // Add some padding after the table
};

/**
 * Generates the Insulin Resistance section
 * Returns the current Y position after the section for dynamic content flow
 */
const generateInsulinResistance = (doc: jsPDF, formData: PatientFormData, startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const showInsulinResistance = formData.showInsulinResistance === true;
  
  // Skip if not enabled
  if (!showInsulinResistance) return startY;
  
  const requiredHeight = 120; // Estimated height needed for this section
  
  // Check if there's enough space on the current page
  if (startY + requiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Insulin Resistance section
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Insulin Resistance (Metabolic Syndrome)", contentMargin, startY);
  
  // Add the specified insulin resistance image
  doc.addImage("/assets/insulin resistance.jpg", "JPEG", contentMargin, startY + 10, contentWidth, 60);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Figure 1: Insulin resistance and resulting metabolic disturbance", pageWidth / 2, startY + 75, { align: "center" });
  
  // Return the current Y position after the section for dynamic flow
  return startY + 85;
};

/**
 * Generates the Cardiovascular risk section
 * Returns the current Y position after the section for dynamic content flow
 */
const generateCardiovascularRisk = (doc: jsPDF, formData: PatientFormData, startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const requiredHeight = 100; // Estimated height needed for this section
  
  // Check if there's enough space on the current page
  if (startY + requiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Cardiovascular risk table
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Cardiovascular risk (*Apo B : Apo A1 ratio)", contentMargin, startY);
  
  // Determine which row to highlight based on gender
  const isMale = formData.patientInfo.gender === 'Male';
  
  let finalY = 0;
  autoTable(doc, {
    startY: startY + 5,
    head: [
      [
        { content: '', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Low risk', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Moderate risk', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'High risk', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: [
      ['Men', '0.30-to-0.69', '0.70-to-0.89', '0.90-to-1.2'],
      ['Women', '0.30-to-0.59', '0.60-to-0.79', '0.80-to-1.00']
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 40, fillColor: [240, 250, 230] },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 }
    },
    didDrawCell: (data) => {
      // Highlight the row based on gender
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        if ((isMale && rowIndex === 0) || (!isMale && rowIndex === 1)) {
          doc.setFillColor(255, 255, 200); // Light yellow highlight
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Re-draw text since we covered it with the highlight
          doc.setTextColor(60, 60, 60);
          doc.text(
            data.cell.text,
            data.cell.x + data.cell.padding('left'),
            data.cell.y + data.cell.padding('top') + data.cell.contentHeight / 2 + 1
          );
        }
      }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Return the current Y position after the table for dynamic flow
  return finalY + 10;
};

/**
 * Generates the Nutrition Recommendations section
 * Returns the current Y position after the section for dynamic content flow
 */
const generateNutritionRecommendations = (doc: jsPDF, formData: PatientFormData, startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const requiredHeight = 150; // Estimated height needed for this section
  
  // Check if there's enough space on the current page
  if (startY + requiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Doctor's Recommendations
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Doctors Recommendations", contentMargin, startY);
  
  // Nutrition recommendations table
  let finalY = 0;
  autoTable(doc, {
    startY: startY + 10,
    head: [
      [
        { content: 'Nutrition', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Recommendations', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: [
      ['Style (nutritional plan)', formData.nutritionRecommendations?.nutritionalPlan || ''],
      ['Protein Consumption', formData.nutritionRecommendations?.proteinConsumption || ''],
      ['Omissions', formData.nutritionRecommendations?.omissions || ''],
      ['Additional Considerations', formData.nutritionRecommendations?.additionalConsiderations || '']
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak',
      minCellHeight: 20,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Return the current Y position after the table for dynamic flow
  return finalY + 10;
};

/**
 * Generates the Exercise and Sleep/Stress recommendations sections
 * Returns the current Y position after the section for dynamic content flow
 */
const generateExerciseAndSleepRecommendations = (doc: jsPDF, formData: PatientFormData, startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const requiredHeight = 200; // Estimated height needed for both sections
  
  // Check if there's enough space on the current page
  if (startY + requiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Exercise recommendations table
  let exerciseTableEndY = 0;
  autoTable(doc, {
    startY: startY,
    head: [
      [
        { content: 'Exercise', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Recommendations', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: [
      ['Focus on', formData.exerciseDetail?.focusOn || ''],
      ['Walking', formData.exerciseDetail?.walking || ''],
      ['Avoid', formData.exerciseDetail?.avoid || ''],
      ['Tracking', formData.exerciseDetail?.tracking || '']
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak',
      minCellHeight: 20,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      exerciseTableEndY = data.cell.y + data.cell.height;
    }
  });
  
  // Add some spacing between tables
  const sleepStartY = exerciseTableEndY + 15;
  
  // Check if there's enough space for the sleep/stress table
  if (sleepStartY + 100 > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  } else {
    startY = sleepStartY;
  }
  
  // Sleep and stress recommendations table
  let finalY = 0;
  autoTable(doc, {
    startY: startY,
    head: [
      [
        { content: 'Sleep and Stress', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Recommendations', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: [
      ['Sleep', formData.sleepStressRecommendations?.sleep || ''],
      ['Stress', formData.sleepStressRecommendations?.stress || '']
    ],
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      overflow: 'linebreak',
      minCellHeight: 20,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: contentWidth - 50 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Return the current Y position after the table for dynamic flow
  return finalY + 10;
};

/**
 * Generates the Medications and Supplements sections
 * Returns the current Y position after the section for dynamic content flow
 */
const generateMedicationsAndSupplements = (doc: jsPDF, formData: PatientFormData, medications: Medication[], startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const requiredHeight = 200; // Estimated height needed for both sections
  
  // Check if there's enough space on the current page
  if (startY + requiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Medications title
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Medications", contentMargin, startY);
  
  // Medications table with actual patient medications - only include non-empty rows
  const medicationRows = formData.medications
    .map(med => {
      const medication = medications.find(m => m.id === med.medicationId);
      return [
        medication?.name || '',
        med.dosage || '',
        'Prescription'
      ];
    })
    .filter(row => row[0] || row[1]); // Filter out empty rows
  
  // If no medications, add a single example row
  if (medicationRows.length === 0) {
    medicationRows.push(
      ['No medications prescribed', '', '']
    );
  }
  
  let medicationsTableEndY = 0;
  autoTable(doc, {
    startY: startY + 10,
    head: [
      [
        { content: 'Medications', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Dosage', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Type', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: medicationRows,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      medicationsTableEndY = data.cell.y + data.cell.height;
    }
  });
  
  // Add some spacing between tables
  const supplementsStartY = medicationsTableEndY + 15;
  
  // Check if there's enough space for the supplements table
  if (supplementsStartY + 100 > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  } else {
    startY = supplementsStartY;
  }
  
  // Supplements title
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Supplements", contentMargin, startY);
  
  // Get supplements from formData or use defaults - only include non-empty rows
  const supplementRows = (formData.supplements || [])
    .map(sup => {
      const supplement = medications.find(m => m.id === sup.supplementId);
      return [
        supplement?.name || '',
        sup.dosage || '',
        sup.source || ''
      ];
    })
    .filter(row => row[0] || row[1] || row[2]); // Filter out empty rows
  
  // If no supplements, add a single row
  if (supplementRows.length === 0) {
    supplementRows.push(
      ['No supplements recommended', '', '']
    );
  }
  
  let finalY = 0;
  autoTable(doc, {
    startY: startY + 10,
    head: [
      [
        { content: 'Supplements', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Dosage', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Source', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: supplementRows,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Return the current Y position after the table for dynamic flow
  return finalY + 10;
};

/**
 * Generates the Follow-ups section
 * Returns the current Y position after the section for dynamic content flow
 */
const generateFollowUps = (doc: jsPDF, formData: PatientFormData, startY: number, contentMargin: number, contentWidth: number, pageWidth: number, maxY: number) => {
  const requiredHeight = 150; // Estimated height needed for this section
  
  // Check if there's enough space on the current page
  if (startY + requiredHeight > maxY) {
    doc.addPage();
    addLogoToPage(doc);
    startY = 45; // Reset Y position for new page
    addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
  }
  
  // Follow-ups and referrals
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFont("helvetica", "bold");
  doc.text("Follow-ups and referrals", contentMargin, startY);
  
  // Get follow-ups from form data or use defaults - only include non-empty rows
  const followUpRows = (formData.followUps || [])
    .map(followUp => [
      followUp.withDoctor || '',
      followUp.forReason || '',
      followUp.date || ''
    ])
    .filter(row => row[0] || row[1] || row[2]); // Filter out empty rows
  
  // If no follow-ups, add a single row
  if (followUpRows.length === 0) {
    followUpRows.push(
      ['No follow-ups scheduled', '', '']
    );
  }
  
  let finalY = 0;
  autoTable(doc, {
    startY: startY + 10,
    head: [
      [
        { content: 'With', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'For', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
        { content: 'Date', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
      ]
    ],
    body: followUpRows,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica',
      textColor: [60, 60, 60]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240, 250, 230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and page number when a new page starts
      if (data.pageNumber > 1) {
        addLogoToPage(doc);
        addPageNumber(doc, doc.getNumberOfPages(), pageWidth);
      }
    },
    didParseCell: (data) => {
      finalY = data.cell.y + data.cell.height;
    }
  });
  
  // Closing and signature
  finalY += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Kind Regards,", contentMargin, finalY);
  doc.setFont("helvetica", "bold");
  doc.text("Dr Eslam Yakout", contentMargin, finalY + 10);
  
  return finalY + 20;
};

/**
 * Generate a complete PDF report for a patient with dynamic pagination
 */
export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<string> => {
  const { patientInfo } = formData;
  
  // Create a new PDF document - using A4 size with mm units
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  // Use Helvetica font throughout
  doc.setFont("helvetica");
  
  // A4 dimensions: 210mm x 297mm
  const pageWidth = 210;
  const contentMargin = 20; // Margin on both sides
  const contentWidth = pageWidth - (contentMargin * 2);
  const maxY = 270; // Maximum Y position before needing a new page, leaving space for footer
  
  // Generate first page with statistics
  generateFirstPage(doc, pageWidth, contentMargin, contentWidth);
  
  // Generate second page with intro and vital signs - returns current Y position
  let currentY = generateSecondPage(doc, formData, pageWidth, contentMargin, contentWidth);
  
  // Now dynamically flow content based on available space
  currentY = generateSummaryFindings(doc, formData, currentY, contentMargin, contentWidth, pageWidth, maxY);
  currentY = generateInsulinResistance(doc, formData, currentY, contentMargin, contentWidth, pageWidth, maxY);
  currentY = generateCardiovascularRisk(doc, formData, currentY, contentMargin, contentWidth, pageWidth, maxY);
  currentY = generateNutritionRecommendations(doc, formData, currentY, contentMargin, contentWidth, pageWidth, maxY);
  currentY = generateExerciseAndSleepRecommendations(doc, formData, currentY, contentMargin, contentWidth, pageWidth, maxY);
  currentY = generateMedicationsAndSupplements(doc, formData, medications, currentY, contentMargin, contentWidth, pageWidth, maxY);
  currentY = generateFollowUps(doc, formData, currentY, contentMargin, contentWidth, pageWidth, maxY);
  
  // Generate file name
  const fileName = `${patientInfo.name?.replace(/\s+/g, '_') || 'Patient'}_Medical_Report.pdf`;
  
  // Save the PDF
  doc.save(fileName);
  
  // Save the PDF reference to the database
  if (patientInfo.medicalRecordNumber) {
    await databaseService.savePDFReference(patientInfo.medicalRecordNumber, fileName);
  }
  
  return fileName;
};
