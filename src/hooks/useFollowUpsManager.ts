
import { PatientFormData } from "@/types";

export const useFollowUpsManager = (
  formData: PatientFormData | null,
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData | null>>
) => {
  const handleAddFollowUp = () => {
    if (!formData) return;
    
    const newFollowUp = {
      withDoctor: "",
      forReason: "",
      date: ""
    };
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        followUps: [...(prev.followUps || []), newFollowUp]
      };
    });
  };

  const handleRemoveFollowUp = (index: number) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedFollowUps = [...(prev.followUps || [])];
      updatedFollowUps.splice(index, 1);
      
      return {
        ...prev,
        followUps: updatedFollowUps
      };
    });
  };

  const handleFollowUpChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedFollowUps = [...(prev.followUps || [])];
      updatedFollowUps[index] = {
        ...updatedFollowUps[index],
        [field]: value
      };
      
      return {
        ...prev,
        followUps: updatedFollowUps
      };
    });
  };

  return {
    handleAddFollowUp,
    handleRemoveFollowUp,
    handleFollowUpChange
  };
};
