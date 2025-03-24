
import { PatientFormData, Medication, PDFFile, SupplementItem } from "@/types";
import { jsPDF } from "jspdf";
import { savePDFReference } from "@/services/databaseService";
import autoTable from "jspdf-autotable";
import { logoToDataURL } from "./pdf/logoRenderer";
import { calculateAge, calculateBMI } from "@/components/patient-form/utils";

// Helper function to add a page number to the PDF
const addPageNumber = (doc: jsPDF, pageNum: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(pageNum.toString(), pageWidth / 2, pageHeight - 10, { align: "center" });
};

// Helper function to create styled boxes for statistics
const drawStatBox = (doc: jsPDF, text: string, yPosition: number, margin: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - (margin * 2);
  const boxHeight = 30;
  
  // Box border
  doc.setDrawColor(153, 188, 68); // Green color (#99bc44)
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, boxWidth, boxHeight, 5, 5, 'D');
  
  // Text content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(153, 188, 68);
  doc.text(text, pageWidth / 2, yPosition + 17, { align: 'center' });
};

// Helper to convert height to cm if needed
const ensureHeightInCm = (height: string): string => {
  if (!height) return "";
  
  // Check if height contains feet/inches format (e.g., "5'10")
  if (height.includes("'")) {
    const parts = height.split("'");
    const feet = parseInt(parts[0]);
    const inches = parts.length > 1 ? parseInt(parts[1]) : 0;
    
    // Convert to cm (1 foot = 30.48 cm, 1 inch = 2.54 cm)
    const cm = (feet * 30.48) + (inches * 2.54);
    return `${Math.round(cm)}`;
  }
  
  return height;
};

// Helper to convert weight to kg if needed
const ensureWeightInKg = (weight: string): string => {
  if (!weight) return "";
  
  // If weight contains "lbs", convert to kg
  if (weight.toLowerCase().includes("lb")) {
    const lbs = parseFloat(weight.replace(/[^\d.-]/g, ''));
    const kg = lbs * 0.45359237;
    return `${Math.round(kg * 10) / 10}`;
  }
  
  return weight;
};

// Generate PDF
export const generatePDF = async (
  data: PatientFormData,
  medications: Medication[]
): Promise<string> => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    // ---------- PAGE 1: Cover and Statistics ----------
    // Add DNA Health logo
    try {
      const logoDataUrl = await logoToDataURL();
      doc.addImage(logoDataUrl, "SVG", margin, 15, 40, 15);
    } catch (logoError) {
      console.error("Error adding logo, using text fallback:", logoError);
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DNA Health", margin, 20);
    }
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Report", pageWidth / 2, 60, { align: "center" });
    
    // Statistics boxes
    drawStatBox(doc, "6 out of 10 causes of death are preventable", 100, margin);
    drawStatBox(doc, "We only spend 3% of our health care expenditure on prevention", 140, margin);
    drawStatBox(doc, "90% of our health care expenditure occurs in the last 3 years of our lives", 180, margin);
    
    // Add page number
    addPageNumber(doc, 1);
    
    // ---------- PAGE 2: Patient Information and Vitals ----------
    doc.addPage();
    
    // Add DNA Health logo to new page
    try {
      const logoDataUrl = await logoToDataURL();
      doc.addImage(logoDataUrl, "SVG", margin, 15, 40, 15);
    } catch (logoError) {
      console.error("Error adding logo, using text fallback:", logoError);
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DNA Health", margin, 20);
    }
    
    // Title for second page
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(14);
    doc.text("Your step towards ", 70, 45);
    doc.setTextColor(153, 188, 68); // #99bc44
    doc.setFont("helvetica", "bold");
    doc.text("optimal health", 125, 45);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(".", 164, 45);
    
    // Introduction text
    doc.setFontSize(12);
    doc.text("Our approach is proactive, rather than reactive,", margin, 60);
    doc.text("giving you ", margin, 67);
    doc.setTextColor(153, 188, 68); // #99bc44
    doc.setFont("helvetica", "bold");
    doc.text("control of your health", 45, 67);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(" throughout your life.", 95, 67);
    
    // Greeting
    doc.setFontSize(10);
    doc.text("Dear", margin, 80);
    doc.text(`${data.patientInfo?.name || "Patient"},`, 35, 80);
    
    doc.text("It has been a pleasure to welcome you to our Clinic. The entire DNA Health team feels", margin, 90);
    doc.text("privileged to be a part of your journey to wellness and longevity.", margin, 97);
    
    // Key vital signs
    doc.setFontSize(12);
    doc.setTextColor(153, 188, 68); // #99bc44
    doc.setFont("helvetica", "bold");
    doc.text("Key vital signs", margin, 115);
    
    // Convert height and weight to standard units if needed
    const heightCm = ensureHeightInCm(data.vitals?.height || "");
    const weightKg = ensureWeightInKg(data.vitals?.weight || "");
    
    // Calculate BMI
    const bmi = calculateBMI(heightCm, weightKg);
    
    // Vitals table
    autoTable(doc, {
      startY: 120,
      head: [
        [
          { content: 'Vitals', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'Value', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'Target Range', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
        ]
      ],
      body: [
        ['Date of Birth', data.patientInfo?.dateOfBirth ? new Date(data.patientInfo.dateOfBirth).toLocaleDateString() : '-', '-'],
        ['Age (years)', calculateAge(data.patientInfo?.dateOfBirth), '-'],
        ['Blood Pressure', data.vitals?.bloodPressure || '-', '120/60-140/85'],
        ['Height (cm)', heightCm || '-', '-'],
        ['Weight (Kg)', weightKg || '-', '-'],
        ['Body Mass Index', bmi, '18.5 – 25.9']
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: 'helvetica',
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 50, fillColor: [240, 250, 230] },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 }
      },
      margin: { left: margin, right: margin }
    });
    
    // Add page number
    addPageNumber(doc, 2);
    
    // ---------- PAGE 3: Summary Findings ----------
    doc.addPage();
    
    // Add DNA Health logo to new page
    try {
      const logoDataUrl = await logoToDataURL();
      doc.addImage(logoDataUrl, "SVG", margin, 15, 40, 15);
    } catch (logoError) {
      console.error("Error adding logo, using text fallback:", logoError);
      doc.setTextColor(0, 51, 102);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DNA Health", margin, 20);
    }
    
    // Summary of findings
    doc.setFontSize(12);
    doc.setTextColor(153, 188, 68); // #99bc44
    doc.setFont("helvetica", "bold");
    doc.text("Summary of findings", margin, 45);
    
    // Summary findings table
    autoTable(doc, {
      startY: 50,
      head: [
        [
          { content: 'Parameters', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'Key findings and next steps', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
        ]
      ],
      body: [
        ['Glucose Metabolism', data.summaryFindings?.glucoseMetabolism || ''],
        ['Lipid Profile', data.summaryFindings?.lipidProfile || ''],
        ['Inflammation', data.summaryFindings?.inflammation || ''],
        ['Uric Acid', data.summaryFindings?.uricAcid || ''],
        ['Vitamins', data.summaryFindings?.vitamins || ''],
        ['Minerals', data.summaryFindings?.minerals || ''],
        ['Sex Hormones', data.summaryFindings?.sexHormones || ''],
        ['Renal & Liver Function', data.summaryFindings?.renalLiverFunction || ''],
        ['Cancer markers', data.summaryFindings?.cancerMarkers || '']
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        font: 'helvetica',
        overflow: 'linebreak',
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 50, fillColor: [240, 250, 230] },
        1: { cellWidth: pageWidth - 50 - (margin * 2) }
      },
      margin: { left: margin, right: margin }
    });
    
    // Add page number
    addPageNumber(doc, 3);
    
    // Continue with other pages following the same structure for medications, recommendations, etc.
    // ...
    
    // For example, if we need to add doctor recommendations on a new page:
    if (data.nutritionRecommendations || data.exerciseDetail || data.sleepStressRecommendations) {
      doc.addPage();
      
      // Add logo
      try {
        const logoDataUrl = await logoToDataURL();
        doc.addImage(logoDataUrl, "SVG", margin, 15, 40, 15);
      } catch (logoError) {
        doc.setTextColor(0, 51, 102);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DNA Health", margin, 20);
      }
      
      // Doctor's Recommendations
      doc.setFontSize(12);
      doc.setTextColor(153, 188, 68); // #99bc44
      doc.setFont("helvetica", "bold");
      doc.text("Doctor's Recommendations", margin, 45);
      
      let startY = 50;
      
      // Nutrition recommendations if available
      if (data.nutritionRecommendations) {
        autoTable(doc, {
          startY: startY,
          head: [
            [
              { content: 'Nutrition', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
              { content: 'Recommendations', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
            ]
          ],
          body: [
            ['Style (nutritional plan)', data.nutritionRecommendations?.nutritionalPlan || ''],
            ['Protein Consumption', data.nutritionRecommendations?.proteinConsumption || ''],
            ['Omissions', data.nutritionRecommendations?.omissions || ''],
            ['Additional Considerations', data.nutritionRecommendations?.additionalConsiderations || '']
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
            1: { cellWidth: pageWidth - 50 - (margin * 2) }
          },
          margin: { left: margin, right: margin }
        });
        
        startY = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Exercise recommendations if available
      if (data.exerciseDetail && startY < 160) {
        autoTable(doc, {
          startY: startY,
          head: [
            [
              { content: 'Exercise', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } },
              { content: 'Recommendations', styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255], fontStyle: 'bold' } }
            ]
          ],
          body: [
            ['Focus on', data.exerciseDetail?.focusOn || ''],
            ['Walking', data.exerciseDetail?.walking || ''],
            ['Avoid', data.exerciseDetail?.avoid || ''],
            ['Tracking', data.exerciseDetail?.tracking || '']
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
            1: { cellWidth: pageWidth - 50 - (margin * 2) }
          },
          margin: { left: margin, right: margin }
        });
        
        startY = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Add page number
      addPageNumber(doc, doc.getNumberOfPages());
    }
    
    // Generate filename
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10);
    const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const filename = `patient_report_${data.patientInfo?.medicalRecordNumber || 'unknown'}_${dateString}_${timeString}.pdf`;
    
    // Save PDF to file
    doc.save(filename);
    
    // Store PDF reference in database
    const patientId = data?.patientInfo?.medicalRecordNumber || 'unknown';
    await savePDFReference(patientId, filename);
    
    return filename;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
