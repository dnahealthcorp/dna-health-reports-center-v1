
import { PatientFormData, Medication, PDFFile, SupplementItem } from "@/types";
import { jsPDF } from "jspdf";
import { savePDFReference } from "@/services/databaseService";
import autoTable from "jspdf-autotable";
import { logoToDataURL } from "./pdf/logoRenderer";

// Function to add a title to the PDF with specific font size
const addTitle = (doc: jsPDF, text: string, x: number, y: number, fontSize: number = 32, align: "left" | "center" | "right" = "center") => {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "bold");
  doc.text(text, x, y, { align });
  return y + fontSize / 2; // Return the new y position
};

// Format a section with label-value pairs
const formatSection = (
  doc: jsPDF,
  title: string,
  items: { label: string; value: string | number }[],
  margin: number,
  startY: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, startY);
  startY += 10;

  doc.setFont("helvetica", "normal");
  items.forEach(item => {
    doc.text(`${item.label}: ${item.value}`, margin, startY);
    startY += 7;
  });

  return startY;
};

// Format medications or supplements table
const formatMedication = (
  doc: jsPDF,
  title: string,
  items: { medicationId?: string; supplementId?: string; dosage: string; frequency?: string; source?: string; notes?: string }[],
  medications: Medication[],
  margin: number,
  startY: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, startY);
  startY += 10;

  if (!items || items.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.text("No items prescribed", margin, startY);
    return startY + 10;
  }

  // Set up table data
  const tableHead = [["Name", "Dosage", items[0].frequency !== undefined ? "Frequency" : "Source", "Notes"]];
  const tableBody = items.map(item => {
    const id = item.medicationId || item.supplementId || "";
    const med = medications.find(m => m.id === id);
    const name = med ? med.name : "Unknown";
    return [
      name,
      item.dosage || "",
      item.frequency || item.source || "",
      item.notes || ""
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: startY,
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
      0: { cellWidth: 100 },
      1: { cellWidth: 80 },
      2: { cellWidth: 80 },
      3: { cellWidth: 'auto' }
    },
    tableWidth: 'auto',
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Format follow-ups table
const formatFollowUps = (
  doc: jsPDF,
  followUps: { withDoctor: string; forReason: string; date: string }[],
  margin: number,
  startY: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Follow-up Appointments", margin, startY);
  startY += 10;

  if (!followUps || followUps.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.text("No follow-up appointments scheduled", margin, startY);
    return startY + 10;
  }

  // Set up table data
  const tableHead = [["Doctor", "Reason", "Date"]];
  const tableBody = followUps.map(followUp => [
    followUp.withDoctor || "",
    followUp.forReason || "",
    followUp.date || ""
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: startY,
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
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 80 }
    },
    tableWidth: 'auto',
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Create a summary findings table
const createSummaryFindingsTable = (
  doc: jsPDF,
  summaryFindings: any,
  margin: number,
  startY: number
): number => {
  if (!summaryFindings) return startY;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Summary Findings", margin, startY);
  startY += 10;

  const tableHead = [["Test", "Result", "Optimal Range"]];
  const tableBody = [
    ["Cholesterol", summaryFindings.cholesterol || "N/A", "< 200 mg/dL"],
    ["Triglycerides", summaryFindings.triglycerides || "N/A", "< 150 mg/dL"],
    ["HDL", summaryFindings.hdl || "N/A", "> 40 mg/dL"],
    ["LDL", summaryFindings.ldl || "N/A", "< 100 mg/dL"],
    ["Glucose", summaryFindings.glucose || "N/A", "70-99 mg/dL"],
    ["HbA1c", summaryFindings.hba1c || "N/A", "< 5.7%"],
    ["Insulin", summaryFindings.insulin || "N/A", "< 25 mIU/L"],
    ["Liver Enzymes", summaryFindings.liverEnzymes || "N/A", "AST < 40 U/L, ALT < 56 U/L"],
    ["Vitamin D", summaryFindings.vitaminD || "N/A", "30-100 ng/mL"],
    ["Vitamin B12", summaryFindings.vitaminB12 || "N/A", "300-900 pg/mL"],
    ["Homocysteine", summaryFindings.homocysteine || "N/A", "< 15 μmol/L"],
    ["hsCRP", summaryFindings.hsCRP || "N/A", "< 3.0 mg/L"]
  ];

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: startY,
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
      0: { cellWidth: 100, fillColor: [240, 248, 225] },
      1: { cellWidth: 100 },
      2: { cellWidth: 'auto' }
    },
    tableWidth: 'auto',
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Create cardiovascular risk table
const createCardiovascularRiskTable = (
  doc: jsPDF,
  gender: string,
  margin: number,
  startY: number
): number => {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Cardiovascular Risk Assessment", margin, startY);
  startY += 10;

  const tableHead = [["Risk Factor", "Status", "Recommendation"]];
  const tableBody = [
    ["Blood Pressure", "Normal", "Maintain healthy lifestyle"],
    ["Cholesterol", "Borderline", "Mediterranean diet, exercise"],
    ["Family History", gender === "Male" ? "Father with CVD" : "Mother with CVD", "Regular check-ups"],
    ["Smoking", "Non-smoker", "Continue abstaining"],
    ["Physical Activity", "Low", "150 min/week moderate activity"],
    ["Body Weight", "Overweight", "Aim for 5-10% weight loss"]
  ];

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: startY,
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
      1: { cellWidth: 80 },
      2: { cellWidth: 'auto' }
    },
    tableWidth: 'auto',
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

// Create nutrition recommendations table
const createNutritionRecommendationsTable = (
  doc: jsPDF,
  nutritionRecommendations: any,
  margin: number,
  startY: number
): number => {
  if (!nutritionRecommendations) return startY;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Nutrition Recommendations", margin, startY);
  startY += 10;

  const tableHead = [["Category", "Recommendations"]];
  const tableBody = [
    ["Diet Type", nutritionRecommendations.dietType || ""],
    ["Foods to Include", nutritionRecommendations.include || ""],
    ["Foods to Limit", nutritionRecommendations.limit || ""],
    ["Foods to Avoid", nutritionRecommendations.avoid || ""],
    ["Meal Frequency", nutritionRecommendations.mealFrequency || ""],
    ["Hydration", nutritionRecommendations.hydration || ""]
  ];

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: startY,
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

  return (doc as any).lastAutoTable.finalY + 10;
};

// Function to generate PDF based on patient data
export const generatePDF = async (
  data: PatientFormData,
  medications: Medication[]
): Promise<string> => {
  try {
    // Create a new PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoHeight = 20;
    const margin = 20;
    let y = 15;

    // Add logo (DNA Health logo)
    const logoDataUrl = await logoToDataURL();
    try {
      doc.addImage(logoDataUrl, "SVG", margin, y, 40, logoHeight);
      console.log("Logo added to PDF");
    } catch (logoError) {
      console.error("Error adding logo, trying fallback:", logoError);
      // Add a text fallback if image fails
      doc.text("DNA Health", margin, y + 10);
    }
    y += logoHeight + 15;

    // Title with larger font (32px)
    y = addTitle(doc, "Patient Report", pageWidth / 2, y, 32);
    y += 20;

    // Patient Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${data.patientInfo?.name || ""}`, margin, y);
    y += 7;
    
    // Format date to display in a readable format (MM/DD/YYYY)
    let birthDate = data.patientInfo?.dateOfBirth || "";
    try {
      if (birthDate) {
        const date = new Date(birthDate);
        birthDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    doc.text(`Date of Birth: ${birthDate}`, margin, y);
    y += 7;
    doc.text(`Gender: ${data.patientInfo?.gender || ""}`, margin, y);
    y += 7;
    doc.text(`Medical Record Number: ${data.patientInfo?.medicalRecordNumber || ""}`, margin, y);
    y += 15;

    // Vitals
    if (data.vitals) {
      y = formatSection(doc, "Vitals", [
        { label: "Height", value: data.vitals.height || "" },
        { label: "Weight", value: data.vitals.weight || "" },
        { label: "Blood Pressure", value: data.vitals.bloodPressure || "" },
        { label: "Heart Rate", value: data.vitals.heartRate || "" },
        { label: "Temperature", value: data.vitals.temperature || "" },
        { label: "Respiratory Rate", value: data.vitals.respiratoryRate || "" },
        { label: "Oxygen Saturation", value: data.vitals.oxygenSaturation || "" }
      ], margin, y);
    }
    y += 20;

    // Add page number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("1", pageWidth / 2, pageHeight - 10, { align: "center" });

    // Next page - Summary Findings Table
    doc.addPage();
    y = 20;

    // Add subtitle with specific font size (26px)
    y = addTitle(doc, "Your step towards optimal health", pageWidth / 2, y, 26, "center");
    doc.setTextColor(153, 188, 68); // #99bc44
    y += 20;

    // Reset text color for the rest of the content
    doc.setTextColor(0, 0, 0);

    // Create summary findings table
    y = createSummaryFindingsTable(doc, data.summaryFindings, margin, y);

    // Add page number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("2", pageWidth / 2, pageHeight - 10, { align: "center" });

    // Next page - Cardiovascular Risk
    if (y > pageHeight - 100) {
      doc.addPage();
      y = 20;
    } else {
      y += 20;
    }

    // Create cardiovascular risk table
    y = createCardiovascularRiskTable(doc, data.patientInfo?.gender || "Female", margin, y);

    // Add page number for the current page
    const currentPage = doc.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(currentPage.toString(), pageWidth / 2, pageHeight - 10, { align: "center" });

    // Next page - Medications
    doc.addPage();
    y = 20;

    // Medications
    if (data.medications && data.medications.length > 0) {
      y = formatMedication(doc, "Medications", data.medications, medications, margin, y);
    } else {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Medications", margin, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text("No medications prescribed", margin, y);
      y += 20;
    }

    // Add page number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("4", pageWidth / 2, pageHeight - 10, { align: "center" });

    // Next page - Supplements
    if (data.supplements && data.supplements.length > 0) {
      doc.addPage();
      y = 20;
      y = formatMedication(doc, "Supplements", data.supplements, medications, margin, y);
      
      // Add page number
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("5", pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    // Next page - Recommendations
    doc.addPage();
    y = 20;

    // Create nutrition recommendations table
    if (data.nutritionRecommendations) {
      y = createNutritionRecommendationsTable(doc, data.nutritionRecommendations, margin, y);
    }

    // Exercise Recommendations
    if (data.exerciseDetail) {
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 20;
      } else {
        y += 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Exercise Recommendations", margin, y);
      y += 10;

      // Set up table data for exercise
      const tableHead = [["Exercise", "Details"]];
      const tableBody = [
        ["Focus On", data.exerciseDetail.focusOn || ""],
        ["Walking", data.exerciseDetail.walking || ""],
        ["Avoid", data.exerciseDetail.avoid || ""],
        ["Tracking", data.exerciseDetail.tracking || ""]
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
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Sleep & Stress Recommendations
    if (data.sleepStressRecommendations) {
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 20;
      } else {
        y += 10;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Sleep & Stress Recommendations", margin, y);
      y += 10;

      // Set up table data for sleep & stress
      const tableHead = [["Category", "Recommendations"]];
      const tableBody = [
        ["Sleep", data.sleepStressRecommendations.sleep || ""],
        ["Stress", data.sleepStressRecommendations.stress || ""]
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
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Add current page number
    const pageNum = doc.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(pageNum.toString(), pageWidth / 2, pageHeight - 10, { align: "center" });

    // Doctor Notes & Diagnosis
    if (data.doctorNotes || data.diagnosis || data.treatmentPlan) {
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 20;
      } else {
        y += 10;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Doctor Assessment", margin, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      
      // Set up table data for doctor assessment
      const tableHead = [["Category", "Details"]];
      const tableBody = [];
      
      if (data.diagnosis) {
        tableBody.push(["Diagnosis", data.diagnosis]);
      }
      
      if (data.treatmentPlan) {
        tableBody.push(["Treatment Plan", data.treatmentPlan]);
      }
      
      if (data.doctorNotes) {
        tableBody.push(["Additional Notes", data.doctorNotes]);
      }
      
      if (tableBody.length > 0) {
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
        y = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add current page number
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(pageNum.toString(), pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    // Follow-ups
    if (data.followUps && data.followUps.length > 0) {
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 20;
      } else {
        y += 10;
      }
      
      formatFollowUps(doc, data.followUps, margin, y);
      
      // Add current page number
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(pageNum.toString(), pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    // Generate current date & time for filename
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10);
    const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const filename = `patient_report_${data.patientInfo?.medicalRecordNumber || 'unknown'}_${dateString}_${timeString}.pdf`;
    
    // Save PDF 
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Store PDF reference in database
    const patientId = data?.patientInfo?.medicalRecordNumber?.split('-')[1] || 'unknown';
    await savePDFReference(patientId, filename);
    
    return filename;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
