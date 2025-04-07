
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/patient-form/LoadingState";
import { useToast } from "@/hooks/use-toast";
import { getFormById, getHealthScreeningDataByFormId, updateFormStatus } from "@/services/formService";
import { getPatientById } from "@/services/patientService";
import { Patient, PDFData } from "@/types";
import { VitalsTab } from "@/components/patient-form/VitalsTab";
import { SummaryFindingsTab } from "@/components/patient-form/SummaryFindingsTab";
import { MedicationsTab } from "@/components/patient-form/MedicationsTab";
import { SupplementsTab } from "@/components/patient-form/SupplementsTab";
import { NotesRecommendationsTab } from "@/components/patient-form/NotesRecommendationsTab";
import { DoctorRecommendationsTab } from "@/components/patient-form/DoctorRecommendationsTab";
import { FollowUpTab } from "@/components/patient-form/FollowUpTab";
import { InsulinResistanceTab } from "@/components/patient-form/InsulinResistanceTab";
import { CardiovascularRiskTab } from "@/components/patient-form/CardiovascularRiskTab";
import { PatientHeader } from "@/components/patient-form/PatientHeader";
import { PatientInfoCard } from "@/components/patient-form/PatientInfoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { savePDFFile } from "@/services/pdfService";

const ExecutiveHealthScreeningForm = () => {
  const { formTypeSlug, formId } = useParams<{ formTypeSlug: string; formId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [form, setForm] = useState<any | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState("vitals");

  useEffect(() => {
    const loadFormData = async () => {
      if (!formId) return;
      
      setIsLoading(true);
      try {
        // 1. Load form details
        const formDetails = await getFormById(formId);
        if (!formDetails) {
          toast({
            title: "Error",
            description: "Form not found",
            variant: "destructive",
          });
          navigate("/patients");
          return;
        }
        setForm(formDetails);
        
        // 2. Load patient details
        const patientDetails = await getPatientById(formDetails.patient_id);
        if (!patientDetails) {
          toast({
            title: "Error",
            description: "Patient not found",
            variant: "destructive",
          });
          navigate("/patients");
          return;
        }
        setPatient(patientDetails);
        
        // 3. Load form-specific data based on form type
        if (formTypeSlug === "executive-health-screening") {
          const healthScreeningData = await getHealthScreeningDataByFormId(formId);
          if (healthScreeningData) {
            // Process data for the form
            const processedData = {
              vitals: healthScreeningData.vitals || {},
              summaryFindings: healthScreeningData.summary_findings || {},
              medications: healthScreeningData.medications || [],
              supplements: healthScreeningData.supplements || [],
              nurseNotes: healthScreeningData.nurse_notes || "",
              doctorNotes: healthScreeningData.doctor_notes || "",
              diagnosis: healthScreeningData.diagnosis || "",
              treatmentPlan: healthScreeningData.treatment_plan || "",
              showInsulinResistance: healthScreeningData.show_insulin_resistance || false,
              nutritionRecommendations: healthScreeningData.nutrition_recommendations || {},
              exerciseDetail: healthScreeningData.exercise_detail || {},
              sleepStressRecommendations: healthScreeningData.sleep_stress_recommendations || {},
              followUps: healthScreeningData.follow_ups || [],
              doctorName: healthScreeningData.doctor_name || "",
              patientInfo: {
                name: patientDetails.name,
                dateOfBirth: patientDetails.dateOfBirth,
                gender: patientDetails.gender,
                medicalRecordNumber: patientDetails.medicalRecordNumber,
              },
            };
            setFormData(processedData);
          } else {
            // Create default data structure if no data found
            setFormData({
              vitals: {},
              summaryFindings: {},
              medications: [],
              supplements: [],
              nurseNotes: "",
              doctorNotes: "",
              diagnosis: "",
              treatmentPlan: "",
              showInsulinResistance: false,
              nutritionRecommendations: {},
              exerciseDetail: {},
              sleepStressRecommendations: {},
              followUps: [],
              doctorName: "",
              patientInfo: {
                name: patientDetails.name,
                dateOfBirth: patientDetails.dateOfBirth,
                gender: patientDetails.gender,
                medicalRecordNumber: patientDetails.medicalRecordNumber,
              },
            });
          }
        }
        // Add cases for other form types here when we support them
      } catch (error) {
        console.error("Error loading form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [formId, formTypeSlug, navigate, toast]);

  const handleSave = async () => {
    if (!formId || !formData || !formTypeSlug) return;
    
    setIsSaving(true);
    try {
      if (formTypeSlug === "executive-health-screening") {
        // Map the form data back to the database structure
        const healthScreeningData = {
          vitals: formData.vitals,
          summary_findings: formData.summaryFindings,
          medications: formData.medications,
          supplements: formData.supplements,
          nurse_notes: formData.nurseNotes,
          doctor_notes: formData.doctorNotes,
          diagnosis: formData.diagnosis,
          treatment_plan: formData.treatmentPlan,
          show_insulin_resistance: formData.showInsulinResistance,
          nutrition_recommendations: formData.nutritionRecommendations,
          exercise_detail: formData.exerciseDetail,
          sleep_stress_recommendations: formData.sleepStressRecommendations,
          follow_ups: formData.followUps,
          doctor_name: formData.doctorName,
          last_updated: new Date().toISOString(),
        };
        
        // Update the health screening data
        const { error } = await supabase
          .from("health_screening_data")
          .update(healthScreeningData)
          .eq("form_id", formId);
          
        if (error) throw error;
        
        // Update the form's last_updated timestamp
        await supabase
          .from("forms")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", formId);
      }
      // Add cases for other form types here
      
      toast({
        title: "Success",
        description: "Form data saved successfully",
      });
    } catch (error) {
      console.error("Error saving form data:", error);
      toast({
        title: "Error",
        description: "Failed to save form data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!formId || !patient || !formData) return;
    
    setIsExportingPDF(true);
    try {
      // Import PDF generator
      const { generatePDF } = await import("@/lib/pdf/pdfGenerator");
      
      // Generate PDF
      const pdfData = await generatePDF(formData);
      const fileName = `${patient.name.replace(/\s+/g, "-")}-${formTypeSlug}-${new Date().toISOString().split("T")[0]}.pdf`;
      
      // Save PDF to database using the updated savePDFFile function
      const pdfInfo: PDFData = {
        patientId: patient.id,
        fileName,
        pdfData,
        formId: formId,
      };
      
      const savedFile = await savePDFFile(pdfInfo);
      
      if (!savedFile) {
        throw new Error("Failed to save PDF file");
      }
      
      // Update form's pdf_exported status
      await supabase
        .from("forms")
        .update({
          pdf_exported: true,
          status: 'completed',
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", formId);
      
      // Update form state
      setForm({
        ...form,
        pdf_exported: true,
        status: 'completed',
      });
      
      toast({
        title: "PDF Generated",
        description: "PDF has been generated and saved successfully",
      });
      
      // Open PDF in new tab
      const pdfUrl = savedFile.url;
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Update form data handler
  const updateFormData = (updates: Partial<any>) => {
    setFormData((prevData: any) => ({
      ...prevData,
      ...updates,
    }));
  };

  if (isLoading || !form || !patient || !formData) {
    return <LoadingState />;
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/patients/${patient.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to patient
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {form.formType?.title || "Form"} - {patient.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={handleGeneratePDF} disabled={isExportingPDF}>
            <FileText className="mr-2 h-4 w-4" />
            {isExportingPDF ? "Generating..." : "Generate PDF"}
          </Button>
        </div>
      </div>

      <PatientHeader 
        patient={patient} 
        handleSave={handleSave}
        handleExportPDF={handleGeneratePDF}
        isSaving={isSaving}
        isExportingPDF={isExportingPDF}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <PatientInfoCard patient={patient} />
        </div>

        <div className="md:col-span-9">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="w-full sm:w-auto flex-wrap">
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

            <TabsContent value="vitals" className="pt-4">
              <VitalsTab
                vitals={formData.vitals}
                onVitalsChange={(vitals) => updateFormData({ vitals })}
              />
            </TabsContent>

            <TabsContent value="summary" className="pt-4">
              <SummaryFindingsTab
                summaryFindings={formData.summaryFindings}
                onSummaryChange={(summaryFindings) =>
                  updateFormData({ summaryFindings })
                }
                onToggleInsulinResistance={(showInsulinResistance) =>
                  updateFormData({ showInsulinResistance })
                }
                showInsulinResistance={formData.showInsulinResistance}
              />
            </TabsContent>

            <TabsContent value="medications" className="pt-4">
              <MedicationsTab
                medications={formData.medications}
                onMedicationsChange={(medications) =>
                  updateFormData({ medications })
                }
              />
            </TabsContent>

            <TabsContent value="supplements" className="pt-4">
              <SupplementsTab
                supplements={formData.supplements}
                onSupplementsChange={(supplements) =>
                  updateFormData({ supplements })
                }
              />
            </TabsContent>

            <TabsContent value="insulin" className="pt-4">
              {formData.showInsulinResistance && (
                <InsulinResistanceTab 
                  formData={formData}
                  handleInputChange={(section, field, value) => {
                    // Simple wrapper to match the expected interface
                    if (field === "showInsulinResistance") {
                      updateFormData({ showInsulinResistance: value });
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
                onNurseNotesChange={(nurseNotes) =>
                  updateFormData({ nurseNotes })
                }
                doctorNotes={formData.doctorNotes}
                onDoctorNotesChange={(doctorNotes) =>
                  updateFormData({ doctorNotes })
                }
                diagnosis={formData.diagnosis}
                onDiagnosisChange={(diagnosis) =>
                  updateFormData({ diagnosis })
                }
                treatmentPlan={formData.treatmentPlan}
                onTreatmentPlanChange={(treatmentPlan) =>
                  updateFormData({ treatmentPlan })
                }
              />
            </TabsContent>

            <TabsContent value="doctor" className="pt-4">
              <DoctorRecommendationsTab
                nutritionRecommendations={formData.nutritionRecommendations}
                onNutritionRecommendationsChange={(nutritionRecommendations) =>
                  updateFormData({ nutritionRecommendations })
                }
                exerciseDetail={formData.exerciseDetail}
                onExerciseDetailChange={(exerciseDetail) =>
                  updateFormData({ exerciseDetail })
                }
                sleepStressRecommendations={formData.sleepStressRecommendations}
                onSleepStressRecommendationsChange={(sleepStressRecommendations) =>
                  updateFormData({ sleepStressRecommendations })
                }
                doctorName={formData.doctorName}
                onDoctorNameChange={(doctorName) =>
                  updateFormData({ doctorName })
                }
              />
            </TabsContent>

            <TabsContent value="followup" className="pt-4">
              <FollowUpTab
                followUps={formData.followUps}
                onFollowUpsChange={(followUps) =>
                  updateFormData({ followUps })
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHealthScreeningForm;
