
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useMedicationHandlers } from "@/hooks/useMedicationHandlers";
import { useSupplementHandlers } from "@/hooks/useSupplementHandlers";
import { useFollowUpHandlers } from "@/hooks/useFollowUpHandlers";
import { usePDFExport } from "@/hooks/usePDFExport";

// Import refactored components
import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { PatientFormTabs } from "@/components/patient-form/PatientFormTabs";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { NotFoundState } from "@/components/patient-form/NotFoundState";

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use custom hooks
  const {
    patient,
    medications,
    formData,
    isLoading,
    isSaving,
    setFormData,
    handleSave,
    handleInputChange
  } = usePatientForm(id);
  
  const { 
    handleAddMedication, 
    handleRemoveMedication, 
    handleMedicationChange 
  } = useMedicationHandlers(formData, setFormData);
  
  const { 
    handleAddSupplement, 
    handleRemoveSupplement, 
    handleSupplementChange 
  } = useSupplementHandlers(formData, setFormData);
  
  const { 
    handleAddFollowUp, 
    handleRemoveFollowUp, 
    handleFollowUpChange 
  } = useFollowUpHandlers(formData, setFormData);
  
  const { handleExportPDF } = usePDFExport();

  // All users can now edit all sections
  const canEdit = true;

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
          handleExportPDF={() => handleExportPDF(formData, medications)}
          handleSave={handleSave}
          isSaving={isSaving}
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
          handleSave={handleSave}
          isSaving={isSaving}
          canEdit={canEdit}
        />
      </div>
    </Layout>
  );
};

export default PatientForm;
