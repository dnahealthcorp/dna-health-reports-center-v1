import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { calculateAge, convertToKg, calculateBMI } from "./pdfUtilities";
import { addLogoToPage, convertHtmlToFormattedText } from "./logoRenderer";
import * as databaseService from "@/services/databaseService";
import { CellHookData } from "jspdf-autotable"; // ✅ Fix: Import correct type

// ... [rest of your code remains unchanged until the affected part] ...

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

  const processedSummaryFindings = {
    glucoseMetabolism: convertHtmlToFormattedText(formData.summaryFindings.glucoseMetabolism),
    proteins: convertHtmlToFormattedText(formData.summaryFindings.proteins),
    lipidProfile: convertHtmlToFormattedText(formData.summaryFindings.lipidProfile),
    inflammation: convertHtmlToFormattedText(formData.summaryFindings.inflammation),
    metabolic: convertHtmlToFormattedText(formData.summaryFindings.metabolic),
    homocysteine: convertHtmlToFormattedText(formData.summaryFindings.homocysteine),
    vitaminsMinerals: convertHtmlToFormattedText(formData.summaryFindings.vitaminsMinerals),
    ironProfile: convertHtmlToFormattedText(formData.summaryFindings.ironProfile),
    sexHormones: convertHtmlToFormattedText(formData.summaryFindings.sexHormones),
    kidneyFunctionElectrolytes: convertHtmlToFormattedText(formData.summaryFindings.kidneyFunctionElectrolytes),
    liverFunctions: convertHtmlToFormattedText(formData.summaryFindings.liverFunctions),
    tumorMarkers: convertHtmlToFormattedText(formData.summaryFindings.tumorMarkers),
    bloodCounts: convertHtmlToFormattedText(formData.summaryFindings.bloodCounts)
  };

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
      ["Glucose Metabolism", processedSummaryFindings.glucoseMetabolism || ""],
      ["Proteins", processedSummaryFindings.proteins || ""],
      ["Lipid Profile", processedSummaryFindings.lipidProfile || ""],
      ["Inflammation", processedSummaryFindings.inflammation || ""],
      ["Metabolic", processedSummaryFindings.metabolic || ""],
      ["Homocysteine", processedSummaryFindings.homocysteine || ""],
      ["Vitamins/Minerals", processedSummaryFindings.vitaminsMinerals || ""],
      ["Iron Profile", processedSummaryFindings.ironProfile || ""],
      ["Sex Hormones", processedSummaryFindings.sexHormones || ""],
      ["Kidney Function & Electrolytes", processedSummaryFindings.kidneyFunctionElectrolytes || ""],
      ["Liver Functions", processedSummaryFindings.liverFunctions || ""],
      ["Tumor Markers", processedSummaryFindings.tumorMarkers || ""],
      ["Blood Counts", processedSummaryFindings.bloodCounts || ""]
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
    didDrawCell: (data: CellHookData) => {
      if (data.section === 'body' && data.column.index === 1) {
        const textPadding = 2;
        const lineHeight = 5;
        let lines: string[] = [];

        if (typeof data.cell.text === 'string') {
          lines = data.cell.text.split('\n');
        } else if (Array.isArray(data.cell.text)) {
          lines = (data.cell.text as any[]).map(item => String(item));
        } else {
          lines = [String(data.cell.text)];
        }

        let yOffset = textPadding;
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        for (const line of lines) {
          if (line.trim()) {
            doc.text(line.trim(), data.cell.x + data.cell.padding('left'), data.cell.y + yOffset + data.cell.padding('top'));
            yOffset += lineHeight;
          } else {
            yOffset += lineHeight / 2;
          }
        }

        return true;
      }
      return false;
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  return currentY;
}

// ... rest of the generatePDF and other sections stay unchanged ...
