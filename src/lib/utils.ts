
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the missing function for date formatting
export function formatDateForDatabase(date: Date): string {
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}
