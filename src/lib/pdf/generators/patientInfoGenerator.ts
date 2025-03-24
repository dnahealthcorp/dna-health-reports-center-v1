
import { jsPDF } from 'jspdf';
import { PatientFormData } from '@/types';
import { calculateAge } from '../pdfUtilities';

export const generatePatientInfo = (
  pdf: jsPDF, 
  patientInfo: PatientFormData['patientInfo'],
  leftMargin: number,
  topMargin: number
) => {
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Patient Information", leftMargin, topMargin + 30);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  const patientName = patientInfo.name || "N/A";
  const patientDOB = patientInfo.dateOfBirth ? new Date(patientInfo.dateOfBirth).toLocaleDateString() : "N/A";
  const patientAge = patientInfo.dateOfBirth ? calculateAge(patientInfo.dateOfBirth) : "N/A";
  const patientGender = patientInfo.gender || "N/A";
  const patientMRN = patientInfo.medicalRecordNumber || "N/A";
  
  pdf.text(`Name: ${patientName}`, leftMargin, topMargin + 40);
  pdf.text(`Date of Birth: ${patientDOB} (Age: ${patientAge})`, leftMargin, topMargin + 45);
  pdf.text(`Gender: ${patientGender}`, leftMargin, topMargin + 50);
  pdf.text(`Medical Record Number: ${patientMRN}`, leftMargin, topMargin + 55);
};
