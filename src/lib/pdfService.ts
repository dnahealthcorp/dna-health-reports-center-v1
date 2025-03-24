
import { PatientFormData, Medication, PDFFile } from "@/types";
import { jsPDF } from "jspdf";
import { savePDFReference } from "@/services/databaseService";
import autoTable from "jspdf-autotable";
import { logoToDataURL } from "./pdf/logoRenderer";
import { 
  formatSection, 
  formatMedication, 
  formatFollowUps, 
  createSummaryFindingsTable,
  createCardiovascularRiskTable,
  createNutritionRecommendationsTable,
  addTitle
} from "./pdf/pdfUtilities";

// Function to generate PDF based on patient data
export const generatePDF = async (
  data: PatientFormData,
  medications: Medication[]
): Promise<string> => {
  try {
    // Create a new PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoHeight = 20;
    const margin = 20;
    let y = 15;

    // Add logo (DNA Health logo)
    const logoDataUrl = await logoToDataURL();
    doc.addImage(logoDataUrl, "PNG", margin, y, 40, logoHeight);
    y += logoHeight + 15;

    // Title with larger font (32px)
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Report", pageWidth / 2, y, { align: "center" });
    y += 25;

    // Patient Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${data.patientInfo.name}`, margin, y);
    y += 7;
    
    // Format date to display in a readable format (MM/DD/YYYY)
    let birthDate = data.patientInfo.dateOfBirth;
    try {
      const date = new Date(data.patientInfo.dateOfBirth);
      birthDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    doc.text(`Date of Birth: ${birthDate}`, margin, y);
    y += 7;
    doc.text(`Gender: ${data.patientInfo.gender}`, margin, y);
    y += 7;
    doc.text(`Medical Record Number: ${data.patientInfo.medicalRecordNumber}`, margin, y);
    y += 15;

    // Vitals
    formatSection(doc, "Vitals", [
      { label: "Height", value: data.vitals.height },
      { label: "Weight", value: data.vitals.weight },
      { label: "Blood Pressure", value: data.vitals.bloodPressure },
      { label: "Heart Rate", value: data.vitals.heartRate },
      { label: "Temperature", value: data.vitals.temperature },
      { label: "Respiratory Rate", value: data.vitals.respiratoryRate },
      { label: "Oxygen Saturation", value: data.vitals.oxygenSaturation }
    ], margin, y);
    y += 70;

    // Add page number
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("1", pageWidth / 2, pageHeight - 10, { align: "center" });

    // Next page - Summary Findings Table
    doc.addPage();
    y = 20;

    // Add subtitle with specific font size (26px)
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(153, 188, 68); // #99bc44
    doc.text("Your step towards optimal health", pageWidth / 2, y, { align: "center" });
    y += 20;

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
    y = createCardiovascularRiskTable(doc, data.patientInfo.gender, margin, y);

    // Add page number for the current page
    const currentPage = Math.ceil(y / pageHeight);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(currentPage.toString(), pageWidth / 2, pageHeight - 10, { align: "center" });

    // Next page - Medications
    doc.addPage();
    y = 20;

    // Medications
    y = formatMedication(doc, "Medications", data.medications, medications, margin, y);

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
    y = createNutritionRecommendationsTable(doc, data.nutritionRecommendations, margin, y);

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
    const filename = `patient_report_${data.patientInfo.medicalRecordNumber}_${dateString}_${timeString}.pdf`;
    
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
