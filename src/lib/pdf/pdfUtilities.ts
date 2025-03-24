
import { jsPDF } from "jspdf";
import { Medication, FollowUp, MedicationItem, SupplementItem } from "@/types";
import autoTable from "jspdf-autotable";

/**
 * Calculates age from date of birth
 */
export const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return '-';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

/**
 * Converts weight to kg if needed
 */
export const convertToKg = (weight: string): string => {
  if (!weight) return '-';
  
  const numWeight = parseFloat(weight);
  if (isNaN(numWeight)) return '-';
  
  if (weight.toLowerCase().includes('lb')) {
    return (numWeight * 0.45359237).toFixed(1);
  }
  
  return numWeight.toFixed(1);
};

/**
 * Calculates BMI based on height and weight
 */
export const calculateBMI = (height: string, weight: string): string => {
  if (!height || !weight) return '-';
  
  // Handle height in different formats
  let heightInMeters = 0;
  if (height.includes("'")) {
    // Format like 5'10"
    const parts = height.replace(/"/g, '').split("'");
    const feet = parseFloat(parts[0]);
    const inches = parseFloat(parts[1] || '0');
    heightInMeters = ((feet * 12) + inches) * 0.0254;
  } else {
    // Assume height is in cm
    heightInMeters = parseFloat(height) / 100;
  }
  
  // Convert weight to kg if it's in lbs
  const weightInKg = parseFloat(convertToKg(weight));
  
  if (isNaN(heightInMeters) || isNaN(weightInKg) || heightInMeters === 0) return '-';
  
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

/**
 * Draw a stat box with rounded corners
 */
export const drawStatBox = (doc: jsPDF, text: string, y: number, contentMargin: number, contentWidth: number, pageWidth: number) => {
  // Draw rounded rectangle
  doc.setDrawColor(153, 188, 68); // #99bc44
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(1);
  doc.roundedRect(contentMargin, y, contentWidth, 40, 5, 5, 'FD');
  
  // Add text
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  
  // Split text into lines and center
  const lines = doc.splitTextToSize(text, contentWidth - 20);
  const lineHeight = 7;
  const totalTextHeight = lines.length * lineHeight;
  const startY = y + (40 - totalTextHeight) / 2;
  
  lines.forEach((line: string, index: number) => {
    doc.text(line, pageWidth / 2, startY + (index * lineHeight), { align: "center" });
  });
};

/**
 * Add page number to the current page
 */
export const addPageNumber = (doc: jsPDF, pageNumber: number, pageWidth: number) => {
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(pageNumber.toString(), pageWidth / 2, 280, { align: "center" });
};

/**
 * Format a section of the PDF with label-value pairs
 */
export const formatSection = (
  doc: jsPDF,
  title: string,
  items: { label: string; value: string }[],
  margin: number,
  y: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  
  items.forEach(item => {
    if (item.value) {
      doc.text(`${item.label}: ${item.value}`, margin, y);
      y += 7;
    }
  });
  
  // Return the new y position
  return y;
};

/**
 * Format medications section in the PDF
 */
export const formatMedication = (
  doc: jsPDF,
  title: string,
  medications: MedicationItem[] | SupplementItem[] | any[], // Accept both types
  allMedications: Medication[],
  margin: number,
  y: number
): number => {
  if (!medications || medications.length === 0) {
    return y;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);
  y += 10;
  
  // Set up table data
  const tableColumn = ["Name", "Dosage", "Frequency/Notes"];
  const tableRows: string[][] = [];
  
  medications.forEach(med => {
    // Check if it's a medication or supplement by looking at the properties
    const itemId = med.medicationId || med.supplementId;
    
    const medication = allMedications.find(m => m.id === itemId);
    
    if (medication) {
      const dosage = med.dosage || "-";
      const frequencyOrNotes = med.frequency || med.notes || med.source || "-";
      
      tableRows.push([medication.name, dosage, frequencyOrNotes]);
    }
  });
  
  if (tableRows.length > 0) {
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [153, 188, 68],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      tableWidth: 'auto',
    });
    
    // Get the last y position after the table is drawn
    const lastY = (doc as any).lastAutoTable.finalY;
    return lastY + 10;
  }
  
  return y;
};

/**
 * Format follow-ups section in the PDF
 */
export const formatFollowUps = (
  doc: jsPDF,
  followUps: FollowUp[],
  margin: number,
  y: number
): number => {
  if (!followUps || followUps.length === 0) {
    return y;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Follow-Up Appointments", margin, y);
  y += 10;
  
  // Set up table data
  const tableColumn = ["With", "For", "Date"];
  const tableRows: string[][] = [];
  
  followUps.forEach(followUp => {
    tableRows.push([
      followUp.withDoctor || "-",
      followUp.forReason || "-",
      followUp.date || "-"
    ]);
  });
  
  if (tableRows.length > 0) {
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [153, 188, 68],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      tableWidth: 'auto',
    });
    
    // Get the last y position after the table is drawn
    const lastY = (doc as any).lastAutoTable.finalY;
    return lastY + 10;
  }
  
  return y;
};

/**
 * Creates a table from summary findings
 */
export const createSummaryFindingsTable = (
  doc: jsPDF,
  summaryFindings: any,
  margin: number,
  y: number
): number => {
  if (!summaryFindings) {
    return y;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", margin, y);
  y += 10;
  
  // Set up table data for summary findings
  const tableHead = [["Parameters", "Key findings and next steps"]];
  const tableBody = [
    ["Glucose Metabolism", summaryFindings.glucoseMetabolism || ""],
    ["Lipid Profile", summaryFindings.lipidProfile || ""],
    ["Inflammation", summaryFindings.inflammation || ""],
    ["Uric Acid", summaryFindings.uricAcid || ""],
    ["Vitamins", summaryFindings.vitamins || ""],
    ["Minerals", summaryFindings.minerals || ""],
    ["Sex Hormones", summaryFindings.sexHormones || ""],
    ["Renal & Liver Function", summaryFindings.renalLiverFunction || ""],
    ["Cancer markers", summaryFindings.cancerMarkers || ""]
  ];
  
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [153, 188, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 80, fillColor: [240, 248, 225] },
      1: { cellWidth: 'auto' }
    },
    tableWidth: 'auto',
  });
  
  // Get the last y position after the table is drawn
  const lastY = (doc as any).lastAutoTable.finalY;
  return lastY + 10;
};

/**
 * Creates cardiovascular risk table
 */
export const createCardiovascularRiskTable = (
  doc: jsPDF,
  gender: string,
  margin: number,
  y: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cardiovascular risk (*Apo B : Apo A1 ratio)", margin, y);
  y += 10;
  
  // Set up table data for cardiovascular risk
  const tableHead = [["", "Low risk", "Moderate risk", "High risk"]];
  const tableBody = [
    ["Men", "0.30-to-0.69", "0.70-to-0.89", "0.90-to-1.2"],
    ["Women", "0.30-to-0.59", "0.60-to-0.79", "0.80-to-1.00"]
  ];
  
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [153, 188, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 40, fillColor: [240, 248, 225] },
    },
    tableWidth: 'auto',
    didDrawCell: (data) => {
      // Highlight the row based on gender
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        if ((gender === 'Male' && rowIndex === 0) || 
            (gender !== 'Male' && rowIndex === 1)) {
          doc.setFillColor(255, 250, 205); // Light yellow highlight
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          // Redraw the cell text since it was covered by the highlight
          doc.setTextColor(0, 0, 0);
          doc.text(
            data.cell.text[0] || '',
            data.cell.x + data.cell.padding('left'),
            data.cell.y + data.cell.padding('top') + 4
          );
        }
      }
    }
  });
  
  // Get the last y position after the table is drawn
  const lastY = (doc as any).lastAutoTable.finalY;
  return lastY + 10;
};

/**
 * Creates nutrition recommendations table
 */
export const createNutritionRecommendationsTable = (
  doc: jsPDF,
  nutritionRecs: any,
  margin: number,
  y: number
): number => {
  if (!nutritionRecs) {
    return y;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Doctors Recommendations", margin, y);
  y += 10;
  
  // Set up table data for nutrition recommendations
  const tableHead = [["Nutrition", "Recommendations"]];
  const tableBody = [
    ["Style (nutritional plan)", nutritionRecs.nutritionalPlan || ""],
    ["Protein Consumption", nutritionRecs.proteinConsumption || ""],
    ["Omissions", nutritionRecs.omissions || ""],
    ["Additional Considerations", nutritionRecs.additionalConsiderations || ""]
  ];
  
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [153, 188, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 80, fillColor: [240, 248, 225] },
      1: { cellWidth: 'auto' }
    },
    tableWidth: 'auto',
  });
  
  // Get the last y position after the table is drawn
  const lastY = (doc as any).lastAutoTable.finalY;
  return lastY + 10;
};

/**
 * Add a title to the PDF with specific styling
 */
export const addTitle = (
  doc: jsPDF,
  text: string,
  y: number,
  fontSize: number = 32,
  pageWidth: number
): number => {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(153, 188, 68); // #99bc44
  doc.text(text, pageWidth / 2, y, { align: "center" });
  return y + fontSize / 2; // Return new y position
};
