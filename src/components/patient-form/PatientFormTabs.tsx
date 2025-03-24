
import React from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { VitalsTab } from "./VitalsTab";
import { SummaryFindingsTab } from "./SummaryFindingsTab";
import { MedicationsTab } from "./MedicationsTab";
import { SupplementsTab } from "./SupplementsTab";
import { NotesRecommendationsTab } from "./NotesRecommendationsTab";
import { InsulinResistanceTab } from "./InsulinResistanceTab";
import { CardiovascularRiskTab } from "./CardiovascularRiskTab";
import { DoctorRecommendationsTab } from "./DoctorRecommendationsTab";
import { FollowUpTab } from "./FollowUpTab";
import { PatientFormData, Medication } from "@/types";
import { calculateBMI, calculateAge } from "./utils";

interface PatientFormTabsProps {
  formData: PatientFormData;
  medications: Medication[];
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string | boolean) => void;
  handleAddMedication: () => void;
  handleRemoveMedication: (index: number) => void;
  handleMedicationChange: (index: number, field: string, value: string) => void;
  handleAddSupplement: () => void;
  handleRemoveSupplement: (index: number) => void;
  handleSupplementChange: (index: number, field: string, value: string) => void;
  handleFollowUpChange: (index: number, field: string, value: string) => void;
  handleAddFollowUp: () => void;
  handleRemoveFollowUp: (index: number) => void;
  handleSave: () => void;
  isSaving: boolean;
  canEdit: boolean;
}

export const PatientFormTabs: React.FC<PatientFormTabsProps> = ({
  formData,
  medications,
  handleInputChange,
  handleAddMedication,
  handleRemoveMedication,
  handleMedicationChange,
  handleAddSupplement,
  handleRemoveSupplement,
  handleSupplementChange,
  handleFollowUpChange,
  handleAddFollowUp,
  handleRemoveFollowUp,
  handleSave,
  isSaving,
  canEdit
}) => {
  return (
    <Tabs defaultValue="vitals" className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <TabsList className="mb-6 flex flex-wrap">
        <TabsTrigger value="vitals">Vitals</TabsTrigger>
        <TabsTrigger value="summaryFindings">Summary Findings</TabsTrigger>
        <TabsTrigger value="insulinResistance">Insulin Resistance</TabsTrigger>
        <TabsTrigger value="cardiovascularRisk">Cardiovascular Risk</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
        <TabsTrigger value="supplements">Supplements</TabsTrigger>
        <TabsTrigger value="docRecommendations">Doctor Recommendations</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="followUps">Follow-ups</TabsTrigger>
      </TabsList>
      
      <TabsContent value="vitals" className="mt-0">
        <VitalsTab 
          formData={formData}
          handleInputChange={handleInputChange}
          canEditNurseSection={canEdit}
          calculateAge={calculateAge}
          calculateBMI={calculateBMI}
        />
      </TabsContent>

      <TabsContent value="summaryFindings" className="mt-0">
        <SummaryFindingsTab 
          formData={formData}
          handleInputChange={handleInputChange}
          canEditDoctorSection={canEdit}
        />
      </TabsContent>
      
      <TabsContent value="insulinResistance" className="mt-0">
        <InsulinResistanceTab
          formData={formData}
          handleInputChange={handleInputChange}
          canEditDoctorSection={canEdit}
        />
      </TabsContent>
      
      <TabsContent value="cardiovascularRisk" className="mt-0">
        <CardiovascularRiskTab
          formData={formData}
          canEditDoctorSection={canEdit}
        />
      </TabsContent>
      
      <TabsContent value="medications" className="mt-0">
        <MedicationsTab 
          formData={formData}
          medications={medications.filter(med => med.type === 'medication')}
          handleAddMedication={handleAddMedication}
          handleRemoveMedication={handleRemoveMedication}
          handleMedicationChange={handleMedicationChange}
          canEditNurseSection={canEdit}
        />
      </TabsContent>
      
      <TabsContent value="supplements" className="mt-0">
        <SupplementsTab 
          formData={formData}
          medications={medications}
          handleAddSupplement={handleAddSupplement}
          handleRemoveSupplement={handleRemoveSupplement}
          handleSupplementChange={handleSupplementChange}
          canEdit={canEdit}
        />
      </TabsContent>
      
      <TabsContent value="docRecommendations" className="mt-0">
        <DoctorRecommendationsTab
          formData={formData}
          handleInputChange={handleInputChange}
          canEditDoctorSection={canEdit}
        />
      </TabsContent>
      
      <TabsContent value="notes" className="mt-0">
        <NotesRecommendationsTab 
          formData={formData}
          handleInputChange={handleInputChange}
          canEditNurseSection={canEdit}
          canEditDoctorSection={canEdit}
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
          canEditDoctorSection={canEdit}
        />
      </TabsContent>
    </Tabs>
  );
};
