

// Re-export all types from individual files
export * from './patients';
export * from './medications';
export * from './medical';
export * from './users';
export * from './forms';
export * from './json';

// Add PDFData type for the PDF generation
export interface PDFData {
  patientId: string;
  fileName: string;
  pdfData: string;
  formId?: string;
}

// Add any utility types or functions that don't fit in other files
// This index file now serves as a central export point for all types

