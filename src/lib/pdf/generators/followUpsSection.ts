
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PatientFormData } from "@/types";
import { addLogoToPage } from "../logoRenderer";
import { addFooter, ensureSpace } from "./headerFooter";

/**
 * Section 9: Follow-ups and Referrals plus Signature, striped.
 * After the table, we add the requested links, then the signature.
 */
export function generateFollowUpsSection(
  doc: jsPDF,
  currentY: number,
  pageWidth: number,
  contentMargin: number,
  contentWidth: number,
  formData: PatientFormData,
  pageNumber: number
): number {
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth, pageNumber);
  doc.setFontSize(14);
  doc.setTextColor(153,188,68);
  doc.setFont("helvetica", "bold");
  doc.text("Follow-ups and referrals", contentMargin, currentY);
  currentY += 8;

  const followUpRows = (formData.followUps || []).map(followUp => [
    followUp.withDoctor || "",
    followUp.forReason || "",
    followUp.date || ""
  ]).filter(row => row[0] || row[1] || row[2]);

  if (followUpRows.length === 0) {
    followUpRows.push(["No follow-ups scheduled", "", ""]);
  }

  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    head: [
      [
        { content: "With", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "For", styles: { fillColor: [153,188,68], textColor: [255,255,255] } },
        { content: "Date", styles: { fillColor: [153,188,68], textColor: [255,255,255] } }
      ]
    ],
    body: followUpRows,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      font: "helvetica",
      textColor: [60,60,60]
    },
    bodyStyles: {
      fillColor: [255,255,255]
    },
    alternateRowStyles: {
      fillColor: [245,245,245]
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: [240,250,230] },
      1: { cellWidth: 90 },
      2: { cellWidth: 30 }
    },
    margin: { left: contentMargin, right: contentMargin },
    didDrawPage: (data) => {
      // Add logo and footer to each page
      addLogoToPage(doc);
      
      // Add footer only on completed pages
      if (data.pageNumber < doc.getNumberOfPages()) {
        addFooter(doc, pageWidth);
      }
    }
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // === Add the requested links here ===
  // We'll do them as small link texts. 
  const guides = [
    "Guide to Intermittent Fasting",
    "Guide to Carbohydrates and Protein",
    "Guide to Meditation",
    "Guide to Sleep",
    "Guide to Anti-inflammatory Foods",
    "Guide to Homocystein"
  ];

  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth, pageNumber);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100,100,100);
  doc.text("Additional Guides:", contentMargin, currentY);
  currentY += 6;

  // We'll render each as a link to "#"
  guides.forEach((guide) => {
    // Use doc.textWithLink for clickable link (all pointing to "#")
    doc.setTextColor(0, 0, 255); // typical link color
    doc.textWithLink(guide, contentMargin, currentY, { url: "#" });
    currentY += 6;
  });

  currentY += 6; // extra spacing before signature

  // Signature with dynamic doctor name
  currentY = ensureSpace(doc, currentY, 20, 40, pageWidth, pageNumber);
  doc.setFontSize(10);
  doc.setTextColor(100,100,100);
  doc.setFont("helvetica", "normal");
  doc.text("Kind Regards,", contentMargin, currentY);
  currentY += 6;
  doc.setFont("helvetica", "bold");
  
  // Use the dynamic doctor name from the form or a default if not provided
  const doctorName = formData.doctorName || "Doctor";
  doc.text(doctorName, contentMargin, currentY);
  currentY += 10;

  return currentY;
}
