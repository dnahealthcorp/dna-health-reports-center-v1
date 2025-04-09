
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { getMedications } from "@/services/databaseService";
import { Medication } from "@/types";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { NotFoundState } from "@/components/patient-form/NotFoundState";
import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { PatientFormTabs } from "@/components/patient-form/PatientFormTabs";
import { supabase } from "@/integrations/supabase/client";

// Import custom hooks
import { usePatientData } from "@/hooks/usePatientData";
import { usePatientFormData } from "@/hooks/usePatientFormData";
import { useMedicationsManager } from "@/hooks/useMedicationsManager";
import { useSupplementsManager } from "@/hooks/useSupplementsManager";
import { useFollowUpsManager } from "@/hooks/useFollowUpsManager";
import { usePdfExporter } from "@/hooks/usePdfExporter";

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  const [medications, setMedications] = useState<Medication[]>([]);
  
  // Use custom hooks
  const { patient, currentUser, isLoading: isPatientLoading, setPatient } = usePatientData(id);
  const { 
    formData, 
    isLoading: isFormLoading, 
    isSaving,
    setFormData, 
    handleInputChange,
    saveForm
  } = usePatientFormData(id, patient);
  
  const { handleAddMedication, handleRemoveMedication, handleMedicationChange } = 
    useMedicationsManager(formData, setFormData);
    
  const { handleAddSupplement, handleRemoveSupplement, handleSupplementChange } = 
    useSupplementsManager(formData, setFormData);
    
  const { handleAddFollowUp, handleRemoveFollowUp, handleFollowUpChange } = 
    useFollowUpsManager(formData, setFormData);
    
  const { isExportingPDF, exportStatus, handleExportPDF } = 
    usePdfExporter(id, patient, setPatient, formData, saveForm);
  
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const medsData = await getMedications();
        setMedications(medsData);
      } catch (error) {
        console.error("Error fetching medications:", error);
      }
    };
    
    fetchMedications();
    
    // Set up realtime subscription for PDF files changes
    if (id) {
      const pdfFilesChannel = supabase
        .channel('pdf-files-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'pdf_files',
          filter: `patient_id=eq.${id}`
        }, (payload) => {
          console.log('PDF files updated in PatientForm:', payload);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(pdfFilesChannel);
      };
    }
  }, [id]);

  const isLoading = isPatientLoading || isFormLoading;
  const canEdit = true; // We could add role-based editing permissions here

  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (!patient || !formData) {
    return (
      <Layout>
        <NotFoundState />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <PatientHeader 
          patient={patient}
          handleExportPDF={() => handleExportPDF(medications)}
          handleSave={saveForm}
          isSaving={isSaving}
          isExportingPDF={isExportingPDF}
          exportStatus={exportStatus}
        />

        <PatientInfoCard 
          formData={formData}
          handleInputChange={handleInputChange}
          canEditNurseSection={canEdit}
        />

        <PatientFormTabs
          formData={formData}
          medications={medications}
          handleInputChange={handleInputChange}
          handleAddMedication={handleAddMedication}
          handleRemoveMedication={handleRemoveMedication}
          handleMedicationChange={handleMedicationChange}
          handleAddSupplement={handleAddSupplement}
          handleRemoveSupplement={handleRemoveSupplement}
          handleSupplementChange={handleSupplementChange}
          handleFollowUpChange={handleFollowUpChange}
          handleAddFollowUp={handleAddFollowUp}
          handleRemoveFollowUp={handleRemoveFollowUp}
          canEdit={canEdit}
        />
      </div>
    </Layout>
  );
};

export default PatientForm;
