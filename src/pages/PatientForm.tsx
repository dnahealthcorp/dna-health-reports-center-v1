
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
  updatePatient,
  savePDFReference
} from "@/services/databaseService";
import { 
  Patient, 
  Medication, 
  User, 
  PatientFormData 
} from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { generatePDF } from "@/lib/pdfService";

// Import refactored components
import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { VitalsTab } from "@/components/patient-form/VitalsTab";
import { SummaryFindingsTab } from "@/components/patient-form/SummaryFindingsTab";
import { MedicationsTab } from "@/components/patient-form/MedicationsTab";
import { NotesRecommendationsTab } from "@/components/patient-form/NotesRecommendationsTab";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { NotFoundState } from "@/components/patient-form/NotFoundState";
import { calculateBMI, calculateAge } from "@/components/patient-form/utils";
import { InsulinResistanceTab } from "@/components/patient-form/InsulinResistanceTab";
import { CardiovascularRiskTab } from "@/components/patient-form/CardiovascularRiskTab";
import { DoctorRecommendationsTab } from "@/components/patient-form/DoctorRecommendationsTab";
import { FollowUpTab } from "@/components/patient-form/FollowUpTab";

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
  }, [id, navigate, toast]);

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

  const handleExportPDF = async () => {
    if (!formData || !patient) return;
    
    try {
      // Generate the PDF
      const fileName = await generatePDF(formData, medications);
      
      toast({
        title: "PDF Generated",
        description: "Patient report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Could not generate PDF",
        variant: "destructive"
      });
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

  const canEditNurseSection = currentUser?.role === "nurse" && 
    (patient?.status === "nurse-pending" || patient?.status === "completed");
  
  const canEditDoctorSection = currentUser?.role === "doctor" && 
    (patient?.status === "doctor-pending" || patient?.status === "completed");

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
