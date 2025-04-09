
import { useState } from "react";
import { PatientFormData } from "@/types";

export const useMedicationsManager = (
  formData: PatientFormData | null,
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData | null>>
) => {
  const handleAddMedication = () => {
    if (!formData) return;
    
    const newMed = {
      id: `temp-${Date.now()}`,
      medicationId: "",
      dosage: "",
      frequency: "",
    };
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        medications: [...prev.medications, newMed]
      };
    });
  };

  const handleRemoveMedication = (index: number) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedMeds = [...prev.medications];
      updatedMeds.splice(index, 1);
      
      return {
        ...prev,
        medications: updatedMeds
      };
    });
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedMeds = [...prev.medications];
      updatedMeds[index] = {
        ...updatedMeds[index],
        [field]: value
      };
      
      return {
        ...prev,
        medications: updatedMeds
      };
    });
  };
  
  return {
    handleAddMedication,
    handleRemoveMedication,
    handleMedicationChange
  };
};
