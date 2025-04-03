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
  User, 
  PatientFormData 
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdfService";

import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { VitalsTab } from "@/components/patient-form/VitalsTab";
import { SummaryFindingsTab } from "@/components/patient-form/SummaryFindingsTab";
import { MedicationsTab } from "@/components/patient-form/MedicationsTab";
import { SupplementsTab } from "@/components/patient-form/SupplementsTab";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { NotFoundState } from "@/components/patient-form/NotFoundState";
import { calculateBMI, calculateAge } from "@/components/patient-form/utils";
import { InsulinResistanceTab } from "@/components/patient-form/InsulinResistanceTab";
import { CardiovascularRiskTab } from "@/components/patient-form/CardiovascularRiskTab";
import { DoctorRecommendationsTab } from "@/components/patient-form/DoctorRecommendationsTab";
import { FollowUpTab } from "@/components/patient-form/FollowUpTab";
import { supabase } from "@/integrations/supabase/client";

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<PatientFormData | null>(null);
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
        
        if (!formDataResult) {
          const defaultFormData: PatientFormData = {
            patientInfo: {
              name: patientData.name,
              dateOfBirth: patientData.dateOfBirth,
              gender: patientData.gender,
              medicalRecordNumber: patientData.medicalRecordNumber
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
    
    const channel = supabase
      .channel('form-data-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'patient_form_data',
        filter: `patient_id=eq.${id}`
      }, (payload) => {
        console.log('Form data updated:', payload);
        getPatientFormData(id as string).then(data => setFormData(data));
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
        getPatientById(id as string).then(data => setPatient(data));
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
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

  const handleAddMedication = () => {
    if (!formData) return;
    
    const newMed = {
      id: `temp-${Date.now()}`,
      medicationId: "",
      dosage: "",
      frequency: "",
    };
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        medications: [...prev.medications, newMed]
      };
    });
  };

  const handleRemoveMedication = (index: number) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedMeds = [...prev.medications];
      updatedMeds.splice(index, 1);
      
      return {
        ...prev,
        medications: updatedMeds
      };
    });
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedMeds = [...prev.medications];
      updatedMeds[index] = {
        ...updatedMeds[index],
        [field]: value
      };
      
      return {
        ...prev,
        medications: updatedMeds
      };
    });
  };
  
  const handleAddSupplement = () => {
    if (!formData) return;
    
    const newSupplement = {
      id: `temp-${Date.now()}`,
      supplementId: "",
      dosage: "",
      source: "",
    };
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        supplements: [...(prev.supplements || []), newSupplement]
      };
    });
  };

  const handleRemoveSupplement = (index: number) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedSupplements = [...(prev.supplements || [])];
      updatedSupplements.splice(index, 1);
      
      return {
        ...prev,
        supplements: updatedSupplements
      };
    });
  };

  const handleSupplementChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedSupplements = [...(prev.supplements || [])];
      updatedSupplements[index] = {
        ...updatedSupplements[index],
        [field]: value
      };
      
      return {
        ...prev,
        supplements: updatedSupplements
      };
    });
  };

  const handleAddFollowUp = () => {
    if (!formData) return;
    
    const newFollowUp = {
      withDoctor: "",
      forReason: "",
      date: ""
    };
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        followUps: [...(prev.followUps || []), newFollowUp]
      };
    });
  };

  const handleRemoveFollowUp = (index: number) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedFollowUps = [...(prev.followUps || [])];
      updatedFollowUps.splice(index, 1);
      
      return {
        ...prev,
        followUps: updatedFollowUps
      };
    });
  };

  const handleFollowUpChange = (index: number, field: string, value: string) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const updatedFollowUps = [...(prev.followUps || [])];
      updatedFollowUps[index] = {
        ...updatedFollowUps[index],
        [field]: value
      };
      
      return {
        ...prev,
        followUps: updatedFollowUps
      };
    });
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
          formData={formData}
          handleInputChange={handleInputChange}
          canEditNurseSection={canEdit}
        />

        <Tabs defaultValue="vitals" className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="summaryFindings">Summary Findings</TabsTrigger>
            <TabsTrigger value="insulinResistance">Insulin Resistance</TabsTrigger>
            <TabsTrigger value="cardiovascularRisk">Cardiovascular Risk</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
            <TabsTrigger value="docRecommendations">Doctor Recommendations</TabsTrigger>
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
      </div>
    </Layout>
  );
};

export default PatientForm;
