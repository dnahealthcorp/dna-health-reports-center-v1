
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MedicationItem, Medication } from '@/types';

export const generateMedications = (
  pdf: jsPDF,
  medications: MedicationItem[],
  allMedications: Medication[],
  leftMargin: number,
  startY: number
) => {
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Medications", leftMargin, startY);
  
  const medicationList = medications.filter(med => med.medicationId || med.dosage || med.notes);
  
  if (medicationList.length > 0) {
    const medList = medicationList.map(med => {
      const medication = allMedications.find(m => m.id === med.medicationId);
      return [
        medication?.name || 'N/A',
        med.dosage || 'N/A',
        med.notes || 'N/A'
      ];
    });
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Medication', 'Dosage', 'Notes']],
      body: medList,
      margin: { left: leftMargin },
      styles: { fontSize: 10, font: "helvetica" },
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
    
    return (pdf as any).lastAutoTable.finalY + 10;
  }
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.text("No medications prescribed", leftMargin, startY + 20);
  return startY + 25;
};
