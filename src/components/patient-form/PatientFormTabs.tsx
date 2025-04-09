
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { VitalsTab } from "@/components/patient-form/VitalsTab";
import { SummaryFindingsTab } from "@/components/patient-form/SummaryFindingsTab";
import { MedicationsTab } from "@/components/patient-form/MedicationsTab";
import { SupplementsTab } from "@/components/patient-form/SupplementsTab";
import { InsulinResistanceTab } from "@/components/patient-form/InsulinResistanceTab";
import { CardiovascularRiskTab } from "@/components/patient-form/CardiovascularRiskTab";
import { DoctorRecommendationsTab } from "@/components/patient-form/DoctorRecommendationsTab";
import { FollowUpTab } from "@/components/patient-form/FollowUpTab";
import { PatientFormData, Medication } from "@/types";
import { calculateBMI, calculateAge } from "@/components/patient-form/utils";

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
  canEdit
}) => {
  return (
    <Tabs defaultValue="vitals" className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <TabsList className="mb-6 flex flex-wrap w-full bg-gray-300 p-1 rounded-lg">
        <TabsTrigger 
          value="vitals" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Vitals
        </TabsTrigger>
        <TabsTrigger 
          value="summaryFindings" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Summary Findings
        </TabsTrigger>
        <TabsTrigger 
          value="insulinResistance" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Insulin Resistance
        </TabsTrigger>
        <TabsTrigger 
          value="cardiovascularRisk" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Cardiovascular Risk
        </TabsTrigger>
        <TabsTrigger 
          value="medications" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Medications
        </TabsTrigger>
        <TabsTrigger 
          value="supplements" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Supplements
        </TabsTrigger>
        <TabsTrigger 
          value="docRecommendations" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Doctor Recommendations
        </TabsTrigger>
        <TabsTrigger 
          value="followUps" 
          className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
        >
          Follow-ups
        </TabsTrigger>
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
