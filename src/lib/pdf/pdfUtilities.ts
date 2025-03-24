
import { jsPDF } from "jspdf";
import { Medication, FollowUp } from "@/types";
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
  doc.setFont("Montserrat", "bold");
  
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
  medications: { medicationId: string; dosage: string; frequency?: string; notes?: string; supplementId?: string; source?: string }[],
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
    const medication = allMedications.find(m => 
      m.id === (med.medicationId || med.supplementId)
    );
    
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
      margin: { left: margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [153, 188, 68],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
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
      margin: { left: margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [153, 188, 68],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });
    
    // Get the last y position after the table is drawn
    const lastY = (doc as any).lastAutoTable.finalY;
    return lastY + 10;
  }
  
  return y;
};
