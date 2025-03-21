
import { PatientFormData } from "@/types";

export const useFormModification = (
  formData: PatientFormData | null,
  setFormData: React.Dispatch<React.SetStateAction<PatientFormData | null>>
) => {
  if (!formData) {
    return {
      handleInputChange: () => {},
      handleAddMedication: () => {},
      handleRemoveMedication: () => {},
      handleMedicationChange: () => {},
      handleAddFollowUp: () => {},
      handleRemoveFollowUp: () => {},
      handleFollowUpChange: () => {}
    };
  }

  const handleInputChange = (section: keyof PatientFormData | "", field: string, value: string | boolean) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      if (section === "patientInfo" || section === "vitals" || section === "summaryFindings" || 
          section === "nutritionRecommendations" || section === "exerciseDetail" || 
          section === "sleepStressRecommendations") {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleAddMedication = () => {
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

  const handleAddFollowUp = () => {
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
    handleInputChange,
    handleAddMedication,
    handleRemoveMedication,
    handleMedicationChange,
    handleAddFollowUp,
    handleRemoveFollowUp,
    handleFollowUpChange
  };
};
