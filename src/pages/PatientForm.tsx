
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { calculateBMI, calculateAge } from "@/components/patient-form/utils";

// Import refactored components
import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { VitalsTab } from "@/components/patient-form/VitalsTab";
import { SummaryFindingsTab } from "@/components/patient-form/SummaryFindingsTab";
import { MedicationsTab } from "@/components/patient-form/MedicationsTab";
import { NotesRecommendationsTab } from "@/components/patient-form/NotesRecommendationsTab";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { NotFoundState } from "@/components/patient-form/NotFoundState";
import { InsulinResistanceTab } from "@/components/patient-form/InsulinResistanceTab";
import { CardiovascularRiskTab } from "@/components/patient-form/CardiovascularRiskTab";
import { DoctorRecommendationsTab } from "@/components/patient-form/DoctorRecommendationsTab";
import { FollowUpTab } from "@/components/patient-form/FollowUpTab";

// Import the custom hooks
import { usePatientFormData } from "@/hooks/usePatientFormData";
import { useFormActions } from "@/hooks/useFormActions";
import { useFormModification } from "@/hooks/useFormModification";

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  
  // Use the custom hooks
  const {
    patient,
    setPatient,
    medications,
    currentUser,
    formData,
    setFormData,
    isLoading,
    canEditNurseSection,
    canEditDoctorSection
  } = usePatientFormData(id);
  
  const {
    handleSave,
    handleExportPDF,
    isSaving
  } = useFormActions(formData, setFormData, patient, setPatient, currentUser, medications);
  
  const {
    handleInputChange,
    handleAddMedication,
    handleRemoveMedication,
    handleMedicationChange,
    handleAddFollowUp,
    handleRemoveFollowUp,
    handleFollowUpChange
  } = useFormModification(formData, setFormData);

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
          handleExportPDF={handleExportPDF}
          handleSave={handleSave}
          isSaving={isSaving}
        />

        <PatientInfoCard 
          formData={formData}
          handleInputChange={handleInputChange}
          canEditNurseSection={canEditNurseSection}
        />

        <Tabs defaultValue="vitals" className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="summaryFindings">Summary Findings</TabsTrigger>
            <TabsTrigger value="insulinResistance">Insulin Resistance</TabsTrigger>
            <TabsTrigger value="cardiovascularRisk">Cardiovascular Risk</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="docRecommendations">Doctor Recommendations</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="followUps">Follow-ups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vitals" className="mt-0">
            <VitalsTab 
              formData={formData}
              handleInputChange={handleInputChange}
              canEditNurseSection={canEditNurseSection}
              calculateAge={calculateAge}
              calculateBMI={calculateBMI}
            />
          </TabsContent>

          <TabsContent value="summaryFindings" className="mt-0">
            <SummaryFindingsTab 
              formData={formData}
              handleInputChange={handleInputChange}
              canEditDoctorSection={canEditDoctorSection}
            />
          </TabsContent>
          
          <TabsContent value="insulinResistance" className="mt-0">
            <InsulinResistanceTab
              formData={formData}
              handleInputChange={handleInputChange}
              canEditDoctorSection={canEditDoctorSection}
            />
          </TabsContent>
          
          <TabsContent value="cardiovascularRisk" className="mt-0">
            <CardiovascularRiskTab
              formData={formData}
              canEditDoctorSection={canEditDoctorSection}
            />
          </TabsContent>
          
          <TabsContent value="medications" className="mt-0">
            <MedicationsTab 
              formData={formData}
              medications={medications}
              handleAddMedication={handleAddMedication}
              handleRemoveMedication={handleRemoveMedication}
              handleMedicationChange={handleMedicationChange}
              canEditNurseSection={canEditNurseSection}
            />
          </TabsContent>
          
          <TabsContent value="docRecommendations" className="mt-0">
            <DoctorRecommendationsTab
              formData={formData}
              handleInputChange={handleInputChange}
              canEditDoctorSection={canEditDoctorSection}
            />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-0">
            <NotesRecommendationsTab 
              formData={formData}
              handleInputChange={handleInputChange}
              canEditNurseSection={canEditNurseSection}
              canEditDoctorSection={canEditDoctorSection}
              handleSave={handleSave}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="followUps" className="mt-0">
            <FollowUpTab
              formData={formData}
              handleFollowUpChange={handleFollowUpChange}
              handleAddFollowUp={handleAddFollowUp}
              handleRemoveFollowUp={handleRemoveFollowUp}
              canEditDoctorSection={canEditDoctorSection}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PatientForm;
