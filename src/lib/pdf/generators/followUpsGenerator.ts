
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FollowUp } from '@/types';

export const generateFollowUps = (
  pdf: jsPDF,
  followUps: FollowUp[],
  leftMargin: number,
  startY: number
) => {
  const validFollowUps = followUps.filter(fu => fu.withDoctor || fu.forReason || fu.date);
  
  if (validFollowUps.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Follow-ups and Referrals", leftMargin, startY);
    
    autoTable(pdf, {
      startY: startY + 5,
      head: [['Doctor', 'Reason', 'Date']],
      body: validFollowUps.map(fu => [fu.withDoctor || 'N/A', fu.forReason || 'N/A', fu.date || 'N/A']),
      margin: { left: leftMargin },
      styles: { fontSize: 10, font: "helvetica" },
      headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255], fontStyle: 'bold' },
    });
    
    return (pdf as any).lastAutoTable.finalY + 10;
  }
  
  return startY;
};
