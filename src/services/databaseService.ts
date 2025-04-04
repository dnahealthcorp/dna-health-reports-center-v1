
// Database service implementation using Supabase
// This file now serves as a central export point for all database services

// Re-export all services
export * from './userService';
export * from './patientService';
export * from './formService';
export * from './medicationService';
export * from './pdfService';

// Initialize with mock data for fallback
import { initializeMockData } from "@/lib/mockData";
export { initializeMockData };
