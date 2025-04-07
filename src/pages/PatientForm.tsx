
import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Patient, PatientFormData, PDFData } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PatientHeader } from '@/components/patient-form/PatientHeader';
import { PatientInfoCard } from '@/components/patient-form/PatientInfoCard';
import { VitalsTab } from '@/components/patient-form/VitalsTab';
import { SummaryFindingsTab } from '@/components/patient-form/SummaryFindingsTab';
import { InsulinResistanceTab } from '@/components/patient-form/InsulinResistanceTab';
import { NotesRecommendationsTab } from '@/components/patient-form/NotesRecommendationsTab';
import { DoctorRecommendationsTab } from '@/components/patient-form/DoctorRecommendationsTab';
import { MedicationsTab } from '@/components/patient-form/MedicationsTab';
import { SupplementsTab } from '@/components/patient-form/SupplementsTab';
import { CardiovascularRiskTab } from '@/components/patient-form/CardiovascularRiskTab';
import { FollowUpTab } from '@/components/patient-form/FollowUpTab';
import { LoadingState } from '@/components/patient-form/LoadingState';
import { NotFoundState } from '@/components/patient-form/NotFoundState';
import FormsTab from '@/components/patient-form/FormsTab';
import { useToast } from '@/hooks/use-toast';
import { getPatientById } from '@/services/patientService';
import { getPatientFormData, savePatientFormData } from '@/services/formService';
import { generatePDF } from '@/lib/pdf/pdfGenerator';
import { savePDFFile } from '@/services/pdfService';
import { ArrowLeft, Save, FileText } from 'lucide-react';

const PatientForm = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('forms');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const hasId = id !== undefined;

  useEffect(() => {
    if (!hasId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const patientData = await getPatientById(id);
        if (!patientData) throw new Error("Patient not found");
        setPatient(patientData);
        
        const loadedFormData = await getPatientFormData(id);
        setFormData(loadedFormData);
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast({
          title: "Error",
          description: "Failed to load patient data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, hasId, toast]);
  
  const handleSave = async () => {
    if (!patient || !formData) return;
    
    setIsSaving(true);
    try {
      await savePatientFormData(patient.id, formData);
      toast({
        title: "Changes saved",
        description: "Patient information has been updated successfully."
      });
    } catch (error) {
      console.error("Error saving patient data:", error);
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGeneratePDF = async () => {
    if (!patient || !formData) return;
    
    setIsGeneratingPDF(true);
    try {
      const pdfData = await generatePDF(formData);
      const fileName = `${patient.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const pdfInfo: PDFData = {
        patientId: patient.id,
        fileName,
        pdfData,
      };
      
      const savedFile = await savePDFFile(pdfInfo);
      
      if (!savedFile) {
        throw new Error("Failed to save PDF file");
      }
      
      if (!patient.pdf_exported) {
        patient.pdf_exported = true;
        const { updatePatient } = await import('@/services/patientService');
        await updatePatient(patient);
      }
      
      toast({
        title: "PDF Generated",
        description: "PDF has been generated and saved successfully."
      });
      
      const pdfUrl = savedFile.url;
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate PDF file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const updateFormData = (updates: Partial<PatientFormData>) => {
    setFormData(prevData => {
      if (!prevData) return null;
      return { ...prevData, ...updates };
    });
  };

  if (!hasId) {
    return <Navigate to="/patients" />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!patient || !formData) {
    return <NotFoundState patientId={id} />;
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            to="/patients" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to patients
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
          </Button>
        </div>
      </div>
      
      <PatientHeader 
        patient={patient} 
        handleSave={handleSave}
        handleExportPDF={handleGeneratePDF}
        isSaving={isSaving}
        isExportingPDF={isGeneratingPDF}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <PatientInfoCard formData={formData} />
        </div>
        
        <div className="md:col-span-9">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="w-full sm:w-auto flex-wrap">
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
              <TabsTrigger value="summary">Summary Findings</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="supplements">Supplements</TabsTrigger>
              <TabsTrigger value="insulin" disabled={!formData.showInsulinResistance}>
                Insulin Resistance
              </TabsTrigger>
              <TabsTrigger value="cv-risk">CV Risk</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="doctor">Recommendations</TabsTrigger>
              <TabsTrigger value="followup">Follow Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forms" className="pt-4">
              <FormsTab patientId={patient.id} />
            </TabsContent>
            
            <TabsContent value="vitals" className="pt-4">
              <VitalsTab 
                vitals={formData.vitals}
                onVitalsChange={(vitals) => updateFormData({ vitals })}
              />
            </TabsContent>
            
            <TabsContent value="summary" className="pt-4">
              <SummaryFindingsTab 
                summaryFindings={formData.summaryFindings}
                onSummaryChange={(summaryFindings) => updateFormData({ summaryFindings })}
                onToggleInsulinResistance={(showInsulinResistance) => updateFormData({ showInsulinResistance })}
                showInsulinResistance={formData.showInsulinResistance}
              />
            </TabsContent>
            
            <TabsContent value="medications" className="pt-4">
              <MedicationsTab 
                medications={formData.medications}
                onMedicationsChange={(medications) => updateFormData({ medications })}
              />
            </TabsContent>
            
            <TabsContent value="supplements" className="pt-4">
              <SupplementsTab 
                supplements={formData.supplements || []}
                onSupplementsChange={(supplements) => updateFormData({ supplements })}
              />
            </TabsContent>
            
            <TabsContent value="insulin" className="pt-4">
              {formData.showInsulinResistance && (
                <InsulinResistanceTab 
                  formData={formData}
                  handleInputChange={(section, field, value) => {
                    if (field === "showInsulinResistance") {
                      updateFormData({ showInsulinResistance: value as boolean });
                    }
                  }}
                  canEditDoctorSection={true}
                />
              )}
            </TabsContent>
            
            <TabsContent value="cv-risk" className="pt-4">
              <CardiovascularRiskTab 
                patient={patient} 
                vitals={formData.vitals} 
              />
            </TabsContent>
            
            <TabsContent value="notes" className="pt-4">
              <NotesRecommendationsTab 
                nurseNotes={formData.nurseNotes}
                onNurseNotesChange={(nurseNotes) => updateFormData({ nurseNotes })}
                doctorNotes={formData.doctorNotes}
                onDoctorNotesChange={(doctorNotes) => updateFormData({ doctorNotes })}
                diagnosis={formData.diagnosis}
                onDiagnosisChange={(diagnosis) => updateFormData({ diagnosis })}
                treatmentPlan={formData.treatmentPlan}
                onTreatmentPlanChange={(treatmentPlan) => updateFormData({ treatmentPlan })}
              />
            </TabsContent>
            
            <TabsContent value="doctor" className="pt-4">
              <DoctorRecommendationsTab 
                nutritionRecommendations={formData.nutritionRecommendations}
                onNutritionRecommendationsChange={(nutritionRecommendations) => 
                  updateFormData({ nutritionRecommendations })}
                exerciseDetail={formData.exerciseDetail}
                onExerciseDetailChange={(exerciseDetail) => 
                  updateFormData({ exerciseDetail })}
                sleepStressRecommendations={formData.sleepStressRecommendations}
                onSleepStressRecommendationsChange={(sleepStressRecommendations) => 
                  updateFormData({ sleepStressRecommendations })}
                doctorName={formData.doctorName}
                onDoctorNameChange={(doctorName) => 
                  updateFormData({ doctorName })}
              />
            </TabsContent>
            
            <TabsContent value="followup" className="pt-4">
              <FollowUpTab 
                followUps={formData.followUps}
                onFollowUpsChange={(followUps) => updateFormData({ followUps })}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
