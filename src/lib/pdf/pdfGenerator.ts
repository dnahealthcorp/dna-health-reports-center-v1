// src/lib/pdf/pdfGenerator.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData, Medication } from "@/types";
import { calculateAge, convertToKg, calculateBMI } from "./pdfUtilities";
import { addLogoToPage, convertHtmlToFormattedText } from "./logoRenderer";

function addFooter(doc: jsPDF, pageWidth: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor("#a5a4a4");
  doc.text("Executive Summary | DNA Health", pageWidth - 10, pageHeight - 10, { align: "right" });
}

function ensureSpace(doc: jsPDF, currentY: number, neededHeight: number, topMargin = 40, pageWidth: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 15;
  if (currentY + neededHeight > pageHeight - bottomMargin) {
    addFooter(doc, pageWidth);
    doc.addPage();
    addLogoToPage(doc); // make sure this adds a well-sized logo
    return topMargin;
  }
  return currentY;
}

function generateImagesSection(doc: jsPDF, currentY: number, pageWidth: number): number {
  addLogoToPage(doc); // first page only

  const imageWidth = 100;
  const imageHeight = 66;
  const imageStartX = (pageWidth - imageWidth) / 2;
  const gap = 10;

  ["/assets/picture1.png", "/assets/picture2.png", "/assets/picture3.png"].forEach((src) => {
    try {
      doc.addImage(src, "PNG", imageStartX, currentY, imageWidth, imageHeight);
      currentY += imageHeight + gap;
    } catch (err) {
      console.error("Error loading image:", src);
    }
  });

  return currentY;
}

function generateIntroductionSection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  const title = "Your step towards optimal health.";
  const centerX = pageWidth / 2;
  const titleY = currentY + 5;
  const titleWidth = doc.getTextWidth(title);
  doc.setTextColor(100, 100, 100);
  doc.text(title, centerX - titleWidth / 2, titleY);
  currentY = titleY + 10;

  const lines = [
    "Our approach is proactive, rather than reactive,",
    "giving you ",
    "control of your health",
    " throughout",
    "your life."
  ];

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  const line1 = lines[0];
  doc.setTextColor(100, 100, 100);
  doc.text(line1, centerX - doc.getTextWidth(line1) / 2, currentY);
  currentY += 10;

  const part1 = lines[1];
  const part2 = lines[2];
  const part3 = lines[3];
  let segX = centerX - (doc.getTextWidth(part1 + part2 + part3) / 2);

  doc.setTextColor(100, 100, 100);
  doc.text(part1, segX, currentY);
  segX += doc.getTextWidth(part1);

  doc.setTextColor(153, 188, 68);
  doc.text(part2, segX, currentY);
  segX += doc.getTextWidth(part2);

  doc.setTextColor(100, 100, 100);
  doc.text(part3, segX, currentY);
  currentY += 10;

  const line3 = lines[4];
  doc.text(line3, centerX - doc.getTextWidth(line3) / 2, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text(`Dear ${formData.patientInfo.name || "Patient"},`, contentMargin, currentY);
  currentY += 6;

  const intro = [
    "It has been a pleasure to welcome you to our Clinic. The entire DNA Health team feels privileged",
    "to be a part of your journey to wellness and longevity."
  ];

  doc.setFont("helvetica", "normal");
  intro.forEach(line => {
    doc.text(line, contentMargin, currentY, { maxWidth: contentWidth });
    currentY += 6;
  });

  return currentY + 10;
}

function formatSummaryText(text?: string): string {
  return convertHtmlToFormattedText(text || "");
}

function generateSummarySection(doc: jsPDF, currentY: number, pageWidth: number, contentMargin: number, contentWidth: number, formData: PatientFormData): number {
  currentY = ensureSpace(doc, currentY, 60, 40, pageWidth);
  doc.setFontSize(14);
  doc.setTextColor(153, 188, 68);
  doc.setFont("helvetica", "bold");
  doc.text("Summary of findings", contentMargin, currentY);
  currentY += 8;

  const body = [
    ["Glucose Metabolism", formatSummaryText(formData.summaryFindings.glucoseMetabolism)],
    ["Proteins", formatSummaryText(formData.summaryFindings.proteins)],
    ["Lipid Profile", formatSummaryText(formData.summaryFindings.lipidProfile)],
    ["Inflammation", formatSummaryText(formData.summaryFindings.inflammation)],
    ["Metabolic", formatSummaryText(formData.summaryFindings.metabolic)],
    ["Homocysteine", formatSummaryText(formData.summaryFindings.homocysteine)],
    ["Vitamins/Minerals", formatSummaryText(formData.summaryFindings.vitaminsMinerals)],
    ["Iron Profile", formatSummaryText(formData.summaryFindings.ironProfile)],
    ["Sex Hormones", formatSummaryText(formData.summaryFindings.sexHormones)],
    ["Kidney Function & Electrolytes", formatSummaryText(formData.summaryFindings.kidneyFunctionElectrolytes)],
    ["Liver Functions", formatSummaryText(formData.summaryFindings.liverFunctions)],
    ["Tumor Markers", formatSummaryText(formData.summaryFindings.tumorMarkers)],
    ["Blood Counts", formatSummaryText(formData.summaryFindings.bloodCounts)]
  ];

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [[
      { content: "Parameter", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } },
      { content: "Key findings and next steps", styles: { fillColor: [153, 188, 68], textColor: [255, 255, 255] } }
    ]],
    body,
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
    margin: { left: contentMargin, right: contentMargin }
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

// You should continue defining other sections similar to above like:
// - generateVitalsSection
// - generateInsulinCardioSection
// - generateDoctorsRecommendationsSection
// - generateExerciseSleepSection
// - generateMedicationsSupplementsSection
// - generateFollowUpsSection

export const generatePDF = async (formData: PatientFormData, medications: Medication[]): Promise<Blob> => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("helvetica");

  const pageWidth = doc.internal.pageSize.getWidth();
  const contentMargin = 20;
  const contentWidth = pageWidth - contentMargin * 2;
  let currentY = 40;

  currentY = generateImagesSection(doc, currentY, pageWidth);

  addFooter(doc, pageWidth);
  doc.addPage();
  addLogoToPage(doc);
  currentY = 40;

  currentY = generateIntroductionSection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);
  // Add the rest of the sections like vital signs, summary, insulin, etc...
  currentY = generateSummarySection(doc, currentY, pageWidth, contentMargin, contentWidth, formData);

  const blob = doc.output("blob");
  const fileName = `${formData.patientInfo.name?.replace(/\s+/g, "_") || "Patient"}_Medical_Report.pdf`;
  doc.save(fileName);
  return blob;
};
