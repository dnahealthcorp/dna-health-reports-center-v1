
import { PatientFormData, Medication } from "@/types";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import parse from 'html-react-parser';
import { createRoot } from 'react-dom/client';
import { isHtml } from "@/types/medical";

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
  tempDiv.innerHTML = html;
  
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

// Helper to determine if a field should be rendered as HTML in the PDF
const shouldRenderAsHtml = (field: string, content: string): boolean => {
  // Fields that should be rendered as HTML, focusing on summary findings
  const htmlFields = [
    'glucoseMetabolism', 'proteins', 'lipidProfile', 'inflammation',
    'metabolic', 'homocysteine', 'vitaminsMinerals', 'ironProfile',
    'sexHormones', 'kidneyFunctionElectrolytes', 'liverFunctions',
    'tumorMarkers', 'bloodCounts'
  ];
  
  return htmlFields.includes(field) && isHtml(content);
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
  
  // Doctor Recommendations Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Doctor Recommendations', 20, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 290);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  let doctorRecommendationsData = [
    ['Exercise Recommendations', formData.exerciseRecommendations],
    ['Nutrition Recommendations', formData.nutritionRecommendations.nutritionalStyle],
    ['Sleep Stress Recommendations', formData.sleepStressRecommendations.sleep]
  ];
  
  autoTable(doc, {
    body: doctorRecommendationsData,
    startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 310,
    theme: 'plain',
    margin: { left: 20 },
    columnStyles: { 0: { fontStyle: 'bold' } }
  });
  
  // Nurse Notes Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Nurse Notes', 20, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 340);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(formData.nurseNotes, 20, doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 350);
  
  // Doctor Notes Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  const doctorNotesY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 30 : 370;
  doc.text('Doctor Notes', 20, doctorNotesY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(formData.doctorNotes, 20, doctorNotesY + 10);
  
  // Diagnosis Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  const diagnosisY = doctorNotesY + 30;
  doc.text('Diagnosis', 20, diagnosisY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(formData.diagnosis, 20, diagnosisY + 10);
  
  // Treatment Plan Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  const treatmentPlanY = diagnosisY + 30;
  doc.text('Treatment Plan', 20, treatmentPlanY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(formData.treatmentPlan, 20, treatmentPlanY + 10);

  // Custom HTML cell renderer for autoTable
  const renderHtml = (cell: any, data: any): void => {
    if (!cell.raw || typeof cell.raw !== 'string' || !isHtml(cell.raw)) {
      return;
    }

    // Parse HTML content
    const cellHtml = cell.raw;
    const doc = data.doc;
    
    // Get current position
    const { x, y } = data.cursor;
    
    // Create parser options to handle HTML conversion
    const parseOptions = {
      replace: (domNode: any) => {
        if (domNode.type === 'tag') {
          // Handle different HTML tags
          switch (domNode.name) {
            case 'strong':
            case 'b':
              doc.setFont(undefined, 'bold');
              break;
            case 'em':
            case 'i':
              doc.setFont(undefined, 'italic');
              break;
            case 'u':
              // Underline is handled differently
              break;
            case 'li':
              // Handle list items with bullets/numbers
              doc.text('• ', x + 5, y + 5);
              doc.text(htmlToText(domNode.children[0]?.data || ''), x + 10, y + 5);
              break;
            case 'ul':
            case 'ol':
              // Handle lists
              break;
            case 'p':
              // Handle paragraphs
              doc.text(htmlToText(domNode.children[0]?.data || ''), x + 5, y + 5);
              break;
            default:
              break;
          }
        }
      }
    };
    
    // Parse and render HTML content
    const parsedHtml = parse(cellHtml, parseOptions);
  };
  
  // Render the summary findings section with HTML support
  const renderSummaryFindings = (doc: ExtendedJsPDF, pageWidth: number, formData: PatientFormData) => {
    // Set appropriate spacing for the section
    const startY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 400;
    
    // Section title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary of Findings', 20, startY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Table headers and data
    const tableData: Array<[string, string]> = [];
    
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
          tableData.push([formatFieldName(field), ensureString(value)]);
        }
      }
    }
    
    // Render the table with HTML support
    autoTable(doc, {
      startY: startY + 10,
      head: [['Parameter', 'Key Finding']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      didDrawCell: (data) => {
        // Only process the content cells (not headers)
        if (data.section === 'body' && data.column.index === 1 && data.cell.raw) {
          const cellValue = ensureString(data.cell.raw);
          
          // Check if this is HTML content
          if (isHtml(cellValue)) {
            // Clear the cell's default content
            const { x, y, width, height } = data.cell;
            data.doc.setFillColor(255, 255, 255);
            data.doc.rect(x, y, width, height, 'F');
            
            // Create a cell renderer specifically for HTML
            data.doc.setFontSize(10);
            
            // Handle basic HTML parsing manually
            let currentY = y + 5;
            let currentText = '';
            let isBold = false;
            let isItalic = false;
            
            // Split the HTML by tags - ensure it's a string first
            const stringCellValue = String(cellValue);
            const parts = stringCellValue.split(/<[^>]*>/);
            
            // Filter out empty parts and process each text chunk
            parts.filter(part => part.trim()).forEach(part => {
              // Set font style based on tags
              const fontStyle = (isBold && isItalic) ? 'bolditalic' : 
                                isBold ? 'bold' : 
                                isItalic ? 'italic' : 'normal';
              
              data.doc.setFont(undefined, fontStyle);
              
              // Wrap text to fit in cell
              const textLines = data.doc.splitTextToSize(part, width - 10);
              
              // Render each line
              textLines.forEach((line: string) => {
                if (currentY + 5 <= y + height - 5) { // Ensure we don't overflow
                  data.doc.text(line, x + 5, currentY);
                  currentY += 7; // Line height
                }
              });
              
              // Toggle styling for next section
              if (part.includes('strong') || part.includes('b>')) {
                isBold = !isBold;
              }
              if (part.includes('em') || part.includes('i>')) {
                isItalic = !isItalic;
              }
            });
            
            // Reset font
            data.doc.setFont(undefined, 'normal');
          }
        }
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 5,
      },
      margin: { left: 20, right: 20 }
    });
  };
  
  // Add the modified summary findings section with HTML support
  renderSummaryFindings(doc, pageWidth, formData);
  
  // Add the current date to the report
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(`Report generated on: ${currentDate}`, 20, doc.internal.pageSize.getHeight() - 20);
  
  // Add page numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  // Return the PDF as a blob
  return doc.output('blob');
};
