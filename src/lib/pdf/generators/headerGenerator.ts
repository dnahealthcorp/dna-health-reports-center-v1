
import { jsPDF } from 'jspdf';
import { renderLogo } from '../logoRenderer';

export const generateHeader = async (pdf: jsPDF, leftMargin: number, topMargin: number) => {
  try {
    // Render Logo
    await renderLogo(pdf, leftMargin, topMargin, 40);
  } catch (error) {
    console.error("Error rendering logo on PDF:", error);
    // Continue without the logo if there's an error
  }
  
  // Add header text
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("PATIENT REPORT", leftMargin + 50, topMargin + 10);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("DNA Health Corp", leftMargin + 50, topMargin + 15);
  pdf.text("Generated: " + new Date().toLocaleDateString(), leftMargin + 50, topMargin + 20);
};
