
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  getPatientById, 
  getMedications, 
  getCurrentUser, 
  getPatientFormData
} from "@/services/databaseService";
import { Patient, Medication, User, PatientFormData } from "@/types";

export const usePatientFormData = (patientId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<PatientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  }, [patientId, navigate, toast]);
  
  const canEditNurseSection = currentUser?.role === "nurse" && 
    (patient?.status === "nurse-pending" || patient?.status === "completed");
  
  const canEditDoctorSection = currentUser?.role === "doctor" && 
    (patient?.status === "doctor-pending" || patient?.status === "completed");

  return {
    patient,
    setPatient,
    medications,
    currentUser,
    formData,
    setFormData,
    isLoading,
    canEditNurseSection,
    canEditDoctorSection
  };
};
