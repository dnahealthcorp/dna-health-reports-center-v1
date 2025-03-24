
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  getPatientById, 
  getMedications, 
  getCurrentUser, 
  getPatientFormData,
  savePatientFormData,
  updatePatient
} from "@/services";
import { Patient, Medication, User, PatientFormData } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const usePatientForm = (patientId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<PatientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        const [patientData, medsData, userData, formDataResult] = await Promise.all([
          getPatientById(patientId),
          getMedications(),
          getCurrentUser(),
          getPatientFormData(patientId)
        ]);
        
        if (!patientData) {
          toast({
            title: "Patient not found",
            description: "The patient you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate("/patients");
          return;
        }
        
        setPatient(patientData);
        setMedications(medsData);
        setCurrentUser(userData);
        setFormData(formDataResult);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        toast({
          title: "Error",
          description: "Could not load patient data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Subscribe to realtime changes for the patient form data
    const channel = supabase
      .channel('form-data-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'patient_form_data',
        filter: `patient_id=eq.${patientId}`
      }, (payload) => {
        console.log('Form data updated:', payload);
        // Refresh the form data
        getPatientFormData(patientId as string).then(data => setFormData(data));
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, navigate, toast]);

  const handleSave = async () => {
    if (!formData || !patient) return;
    
    setIsSaving(true);
    
    try {
      // Save form data
      await savePatientFormData(patient.id, formData);
      
      // Update patient status if needed
      let updatedStatus = patient.status;
      
      if (currentUser?.role === "nurse" && patient?.status === "nurse-pending") {
        updatedStatus = "doctor-pending";
      } else if (currentUser?.role === "doctor" && patient?.status === "doctor-pending") {
        updatedStatus = "completed";
      }
      
      if (updatedStatus !== patient.status) {
        const updatedPatient = {
          ...patient,
          status: updatedStatus
        };
        
        await updatePatient(updatedPatient);
        setPatient(updatedPatient);
      }
      
      toast({
        title: "Form saved",
        description: "Patient form has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Could not save patient form",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  return {
    patient,
    medications,
    currentUser,
    formData,
    isLoading,
    isSaving,
    setFormData,
    handleSave,
    handleInputChange
  };
};
