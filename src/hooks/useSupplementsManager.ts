
import { PatientFormData } from "@/types";

export const useSupplementsManager = (
  formData: PatientFormData | null,
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData | null>>
) => {
  const handleAddSupplement = () => {
    if (!formData) return;
    
    const newSupplement = {
      id: `temp-${Date.now()}`,
      supplementId: "",
      dosage: "",
      source: "",
    };
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        supplements: [...(prev.supplements || []), newSupplement]
      };
    });
  };

  const handleRemoveSupplement = (index: number) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedSupplements = [...(prev.supplements || [])];
      updatedSupplements.splice(index, 1);
      
      return {
        ...prev,
        supplements: updatedSupplements
      };
    });
  };

  const handleSupplementChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedSupplements = [...(prev.supplements || [])];
      updatedSupplements[index] = {
        ...updatedSupplements[index],
        [field]: value
      };
      
      return {
        ...prev,
        supplements: updatedSupplements
      };
    });
  };

  return {
    handleAddSupplement,
    handleRemoveSupplement,
    handleSupplementChange
  };
};
