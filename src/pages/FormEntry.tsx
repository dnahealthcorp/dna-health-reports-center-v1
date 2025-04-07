import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  getPatientById, 
  getMedications, 
  getCurrentUser, 
  getPatientFormData,
  savePatientFormData,
  updatePatient
} from "@/services/databaseService";
import { 
  Patient, 
  Medication, 
  User
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdfService";
import { savePDFFile } from "@/services/pdfService";
import { patientToFormData, convertMedicationItems } from "@/lib/medicationUtils";

import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { VitalsTab } from "@/components/patient-form/VitalsTab";
import { SummaryFindingsTab } from "@/components/patient-form/SummaryFindingsTab";
import { MedicationsTab } from "@/components/patient-form/MedicationsTab";
import { SupplementsTab } from "@/components/patient-form/SupplementsTab";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { NotFoundState } from "@/components/patient-form/NotFoundState";
import { InsulinResistanceTab } from "@/components/patient-form/InsulinResistanceTab";
import { CardiovascularRiskTab } from "@/components/patient-form/CardiovascularRiskTab";
import { DoctorRecommendationsTab } from "@/components/patient-form/DoctorRecommendationsTab";
import { FollowUpTab } from "@/components/patient-form/FollowUpTab";
import { NotesRecommendationsTab } from "@/components/patient-form/NotesRecommendationsTab";

// Create a dedicated import for calculateBMI and calculateAge functions
import { calculateBMI, calculateAge } from "@/components/patient-form/utils";
import { supabase } from "@/integrations/supabase/client";

const FormEntry = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [patientData, medsData, userData, formDataResult] = await Promise.all([
          getPatientById(id),
          getMedications(),
          getCurrentUser(),
          getPatientFormData(id)
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
        
        // If no form data exists, create form data from patient
        if (!formDataResult) {
          const defaultFormData = patientToFormData(patientData);
          setFormData(defaultFormData);
        } else {
          setFormData(formDataResult);
        }
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
    
    // Set up realtime subscriptions for both form data and patient changes
    const formChannel = supabase
      .channel('form-data-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'patient_form_data',
        filter: `patient_id=eq.${id}`
      }, (payload) => {
        console.log('Form data updated:', payload);
        getPatientFormData(id as string).then(data => {
          if (data) setFormData(data);
        });
      })
      .subscribe();
      
    const patientChannel = supabase
      .channel('patient-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'patients',
        filter: `id=eq.${id}`
      }, (payload) => {
        console.log('Patient data updated:', payload);
        getPatientById(id as string).then(data => {
          if (data) setPatient(data);
        });
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(formChannel);
      supabase.removeChannel(patientChannel);
    };
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!formData || !patient) return;
    
    setIsSaving(true);
    
    try {
      formData.patientInfo = {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      };
      
      await savePatientFormData(patient.id, formData);
      
      let updatedStatus = patient.status;
      
      if (currentUser?.role === "nurse" && patient.status === 'in-process') {
        updatedStatus = 'in-process';
      } else if (currentUser?.role === "doctor" && patient.status === 'in-process') {
        updatedStatus = 'completed';
      }
      
      if (updatedStatus !== patient.status) {
        const updatedPatient = {
          ...patient,
          status: updatedStatus,
          lastUpdated: new Date().toISOString()
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

  const handleExportPDF = async () => {
    if (!formData || !patient) return;
    
    setIsSaving(true);
    
    try {
      formData.patientInfo = {
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        medicalRecordNumber: patient.medicalRecordNumber
      };
      
      await savePatientFormData(patient.id, formData);
      setIsSaving(false);
      
      setIsExportingPDF(true);
      
      const fileName = await generatePDF(formData, medications);
      await savePDFFile(patient.id, fileName, fileName); // Pass the filename twice, second one as URL
      
      const refreshedPatient = await getPatientById(patient.id);
      if (refreshedPatient) {
        setPatient(refreshedPatient);
      }
      
      toast({
        title: "PDF Generated",
        description: `"${fileName}" has been generated and patient status updated to completed`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Could not generate PDF",
        variant: "destructive"
      });
    } finally {
      setIsExportingPDF(false);
      setIsSaving(false);
    }
  };

  // We'll use individual state handlers for each section to keep the code clear
  const handleVitalsChange = (vitals: any) => {
    setFormData((prev: any) => ({
      ...prev,
      vitals
    }));
  };

  const handleSummaryChange = (summaryFindings: any) => {
    setFormData((prev: any) => ({
      ...prev,
      summaryFindings
    }));
  };

  const handleToggleInsulinResistance = (showInsulinResistance: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      showInsulinResistance
    }));
  };

  const handleMedicationsChange = (medications: any) => {
    setFormData((prev: any) => ({
      ...prev,
      medications
    }));
  };

  const handleSupplementsChange = (supplements: any) => {
    setFormData((prev: any) => ({
      ...prev,
      supplements
    }));
  };

  const handleNurseNotesChange = (nurseNotes: string) => {
    setFormData((prev: any) => ({
      ...prev,
      nurseNotes
    }));
  };

  const handleDoctorNotesChange = (doctorNotes: string) => {
    setFormData((prev: any) => ({
      ...prev,
      doctorNotes
    }));
  };

  const handleDiagnosisChange = (diagnosis: string) => {
    setFormData((prev: any) => ({
      ...prev,
      diagnosis
    }));
  };

  const handleTreatmentPlanChange = (treatmentPlan: string) => {
    setFormData((prev: any) => ({
      ...prev,
      treatmentPlan
    }));
  };

  const handleNutritionRecommendationsChange = (nutritionRecommendations: any) => {
    setFormData((prev: any) => ({
      ...prev,
      nutritionRecommendations
    }));
  };

  const handleExerciseDetailChange = (exerciseDetail: any) => {
    setFormData((prev: any) => ({
      ...prev,
      exerciseDetail
    }));
  };

  const handleSleepStressRecommendationsChange = (sleepStressRecommendations: any) => {
    setFormData((prev: any) => ({
      ...prev,
      sleepStressRecommendations
    }));
  };

  const handleDoctorNameChange = (doctorName: string) => {
    setFormData((prev: any) => ({
      ...prev,
      doctorName
    }));
  };

  const handleFollowUpsChange = (followUps: any) => {
    setFormData((prev: any) => ({
      ...prev,
      followUps
    }));
  };

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
          handleExportPDF={handleExportPDF}
          handleSave={handleSave}
          isSaving={isSaving}
          isExportingPDF={isExportingPDF}
        />

        <PatientInfoCard 
          patient={patient}
          formData={formData}
        />

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
              value="notesRecommendations" 
              className="rounded-md flex-grow text-gray-600 data-[state=active]:bg-white data-[state=active]:text-primary"
            >
              Notes & Recommendations
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
              vitals={formData.vitals}
              onVitalsChange={handleVitalsChange}
              canEditNurseSection={canEdit}
              calculateAge={calculateAge}
              calculateBMI={calculateBMI}
            />
          </TabsContent>

          <TabsContent value="summaryFindings" className="mt-0">
            <SummaryFindingsTab 
              formData={formData}
              summaryFindings={formData.summaryFindings}
              onSummaryChange={handleSummaryChange}
              onToggleInsulinResistance={handleToggleInsulinResistance}
              showInsulinResistance={formData.showInsulinResistance}
              canEditDoctorSection={canEdit}
            />
          </TabsContent>
          
          <TabsContent value="insulinResistance" className="mt-0">
            <InsulinResistanceTab
              formData={formData}
              handleInputChange={(section, field, value) => {
                if (field === "showInsulinResistance") {
                  handleToggleInsulinResistance(value as boolean);
                }
              }}
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
              handleAddMedication={() => {
                const newMed = {
                  id: `temp-${Date.now()}`,
                  medicationId: "",
                  dosage: "",
                  frequency: "",
                };
                handleMedicationsChange([...formData.medications, newMed]);
              }}
              handleRemoveMedication={(index) => {
                const updated = [...formData.medications];
                updated.splice(index, 1);
                handleMedicationsChange(updated);
              }}
              handleMedicationChange={(index, field, value) => {
                const updated = [...formData.medications];
                updated[index] = {
                  ...updated[index],
                  [field]: value
                };
                handleMedicationsChange(updated);
              }}
              canEditNurseSection={canEdit}
            />
          </TabsContent>
          
          <TabsContent value="supplements" className="mt-0">
            <SupplementsTab 
              formData={formData}
              medications={medications}
              handleAddSupplement={() => {
                const newSupplement = {
                  id: `temp-${Date.now()}`,
                  supplementId: "",
                  dosage: "",
                  source: "",
                };
                handleSupplementsChange([...formData.supplements, newSupplement]);
              }}
              handleRemoveSupplement={(index) => {
                const updated = [...formData.supplements];
                updated.splice(index, 1);
                handleSupplementsChange(updated);
              }}
              handleSupplementChange={(index, field, value) => {
                const updated = [...formData.supplements];
                updated[index] = {
                  ...updated[index],
                  [field]: value
                };
                handleSupplementsChange(updated);
              }}
              canEdit={canEdit}
            />
          </TabsContent>
          
          <TabsContent value="notesRecommendations" className="mt-0">
            <NotesRecommendationsTab 
              nurseNotes={formData.nurseNotes}
              onNurseNotesChange={handleNurseNotesChange}
              doctorNotes={formData.doctorNotes}
              onDoctorNotesChange={handleDoctorNotesChange}
              diagnosis={formData.diagnosis}
              onDiagnosisChange={handleDiagnosisChange}
              treatmentPlan={formData.treatmentPlan}
              onTreatmentPlanChange={handleTreatmentPlanChange}
              canEditNurseSection={canEdit}
              canEditDoctorSection={canEdit}
            />
          </TabsContent>
          
          <TabsContent value="docRecommendations" className="mt-0">
            <DoctorRecommendationsTab
              nutritionRecommendations={formData.nutritionRecommendations}
              onNutritionRecommendationsChange={handleNutritionRecommendationsChange}
              exerciseDetail={formData.exerciseDetail}
              onExerciseDetailChange={handleExerciseDetailChange}
              sleepStressRecommendations={formData.sleepStressRecommendations}
              onSleepStressRecommendationsChange={handleSleepStressRecommendationsChange}
              doctorName={formData.doctorName}
              onDoctorNameChange={handleDoctorNameChange}
              canEditDoctorSection={canEdit}
            />
          </TabsContent>
          
          <TabsContent value="followUps" className="mt-0">
            <FollowUpTab
              followUps={formData.followUps}
              onFollowUpsChange={handleFollowUpsChange}
              canEditDoctorSection={canEdit}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FormEntry;
