
import { useState, useEffect } from "react";
import { Patient, User } from "@/types";
import { getPatientById, getCurrentUser } from "@/services/databaseService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePatientData = (patientId: string | undefined) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        setIsLoading(true);
        const [patientData, userData] = await Promise.all([
          getPatientById(patientId),
          getCurrentUser()
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
        setCurrentUser(userData);
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
    
    // Set up realtime subscription for patient changes
    if (patientId) {
      const patientChannel = supabase
        .channel('patient-changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'patients',
          filter: `id=eq.${patientId}`
        }, (payload) => {
          console.log('Patient data updated:', payload);
          getPatientById(patientId).then(data => {
            if (data) setPatient(data);
          });
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(patientChannel);
      };
    }
  }, [patientId, navigate, toast]);
  
  return {
    patient,
    currentUser,
    isLoading,
    setPatient
  };
};
