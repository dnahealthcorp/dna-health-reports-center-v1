
import { useState, useEffect } from "react";
import { PatientFormData, Patient } from "@/types";
import { getPatientFormData, savePatientFormData } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePatientFormData = (patientId: string | undefined, patient: Patient | null) => {
  const [formData, setFormData] = useState<PatientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormData = async () => {
      if (!patientId) return;
      
      try {
        setIsLoading(true);
        const formDataResult = await getPatientFormData(patientId);
        
        if (!formDataResult) {
          const defaultFormData: PatientFormData = {
            patientInfo: {
              name: patient?.name || "",
              dateOfBirth: patient?.dateOfBirth || "",
              gender: patient?.gender || "",
              medicalRecordNumber: patient?.medicalRecordNumber || ""
            },
            vitals: { bloodPressure: '', height: '', weight: '' },
            summaryFindings: {
              glucoseMetabolism: '',
              proteins: '',
              lipidProfile: '',
              inflammation: '',
              metabolic: '',
              homocysteine: '',
              vitaminsMinerals: '',
              ironProfile: '',
              sexHormones: '',
              kidneyFunctionElectrolytes: '',
              liverFunctions: '',
              tumorMarkers: '',
              bloodCounts: ''
            },
            nutritionRecommendations: {
              nutritionalStyle: '',
              proteinConsumption: '',
              eatingWindow: '',
              limitations: '',
              additionalConsiderations: ''
            },
            exerciseDetail: {
              focusOn: '',
              walking: '',
              restRecovery: '',
              tracking: ''
            },
            sleepStressRecommendations: { sleep: '', stress: '' },
            medications: [],
            doctorName: '',
            exerciseRecommendations: '',
            nurseNotes: '',
            doctorNotes: '',
            diagnosis: '',
            treatmentPlan: '',
            showInsulinResistance: false,
            followUps: []
          };
          setFormData(defaultFormData);
        } else {
          const updatedFormData = {
            ...formDataResult,
            summaryFindings: {
              glucoseMetabolism: formDataResult.summaryFindings?.glucoseMetabolism || '',
              proteins: formDataResult.summaryFindings?.proteins || '',
              lipidProfile: formDataResult.summaryFindings?.lipidProfile || '',
              inflammation: formDataResult.summaryFindings?.inflammation || '',
              metabolic: formDataResult.summaryFindings?.metabolic || '',
              homocysteine: formDataResult.summaryFindings?.homocysteine || '',
              vitaminsMinerals: formDataResult.summaryFindings?.vitaminsMinerals || '',
              ironProfile: formDataResult.summaryFindings?.ironProfile || '',
              sexHormones: formDataResult.summaryFindings?.sexHormones || '',
              kidneyFunctionElectrolytes: formDataResult.summaryFindings?.kidneyFunctionElectrolytes || '',
              liverFunctions: formDataResult.summaryFindings?.liverFunctions || '',
              tumorMarkers: formDataResult.summaryFindings?.tumorMarkers || '',
              bloodCounts: formDataResult.summaryFindings?.bloodCounts || ''
            },
            nutritionRecommendations: {
              nutritionalStyle: formDataResult.nutritionRecommendations?.nutritionalStyle || '',
              proteinConsumption: formDataResult.nutritionRecommendations?.proteinConsumption || '',
              eatingWindow: formDataResult.nutritionRecommendations?.eatingWindow || '',
              limitations: formDataResult.nutritionRecommendations?.limitations || '',
              additionalConsiderations: formDataResult.nutritionRecommendations?.additionalConsiderations || ''
            },
            exerciseDetail: {
              focusOn: formDataResult.exerciseDetail?.focusOn || '',
              walking: formDataResult.exerciseDetail?.walking || '',
              restRecovery: formDataResult.exerciseDetail?.restRecovery || '',
              tracking: formDataResult.exerciseDetail?.tracking || ''
            },
            doctorName: formDataResult.doctorName || ''
          };
          setFormData(updatedFormData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Error",
          description: "Could not load form data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormData();
    
    // Set up realtime subscription for form data changes
    if (patientId) {
      const formChannel = supabase
        .channel('form-data-changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'patient_form_data',
          filter: `patient_id=eq.${patientId}`
        }, (payload) => {
          console.log('Form data updated:', payload);
          getPatientFormData(patientId).then(data => {
            if (data) setFormData(data);
          });
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(formChannel);
      };
    }
  }, [patientId, patient, toast]);

  const handleInputChange = (section: keyof PatientFormData | "", field: string, value: string | boolean) => {
    if (!formData) return;
    
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

  const saveForm = async () => {
    if (!formData || !patient || !patientId) return false;
    
    setIsSaving(true);
    
    try {
      formData.patientInfo = {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      };
      
      await savePatientFormData(patient.id, formData);
      
      toast({
        title: "Form saved",
        description: "Patient form has been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Could not save patient form",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    isLoading,
    isSaving,
    setFormData,
    handleInputChange,
    saveForm
  };
};
