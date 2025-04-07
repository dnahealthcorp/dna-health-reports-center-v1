
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotesRecommendationsTabProps {
  nurseNotes?: string;
  doctorNotes?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  onNurseNotesChange?: (notes: string) => void;
  onDoctorNotesChange?: (notes: string) => void;
  onDiagnosisChange?: (diagnosis: string) => void;
  onTreatmentPlanChange?: (plan: string) => void;
  canEditNurseSection?: boolean;
  canEditDoctorSection?: boolean;
}

export const NotesRecommendationsTab = ({
  nurseNotes = "",
  doctorNotes = "",
  diagnosis = "",
  treatmentPlan = "",
  onNurseNotesChange,
  onDoctorNotesChange,
  onDiagnosisChange,
  onTreatmentPlanChange,
  canEditNurseSection,
  canEditDoctorSection
}: NotesRecommendationsTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="nurseNotes">
          <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="nurseNotes">Nurse Notes</TabsTrigger>
            <TabsTrigger value="doctorNotes">Doctor Notes</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="treatmentPlan">Treatment Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nurseNotes">
            <div className="space-y-4">
              <Label htmlFor="nurseNotes">Nurse Notes</Label>
              <Textarea 
                id="nurseNotes" 
                value={nurseNotes} 
                onChange={(e) => onNurseNotesChange && onNurseNotesChange(e.target.value)}
                disabled={!canEditNurseSection}
                placeholder="Enter nurse notes here"
                className="min-h-[300px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="doctorNotes">
            <div className="space-y-4">
              <Label htmlFor="doctorNotes">Doctor Notes</Label>
              <Textarea 
                id="doctorNotes" 
                value={doctorNotes} 
                onChange={(e) => onDoctorNotesChange && onDoctorNotesChange(e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter doctor notes here"
                className="min-h-[300px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="diagnosis">
            <div className="space-y-4">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea 
                id="diagnosis" 
                value={diagnosis} 
                onChange={(e) => onDiagnosisChange && onDiagnosisChange(e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter diagnosis here"
                className="min-h-[300px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="treatmentPlan">
            <div className="space-y-4">
              <Label htmlFor="treatmentPlan">Treatment Plan</Label>
              <Textarea 
                id="treatmentPlan" 
                value={treatmentPlan} 
                onChange={(e) => onTreatmentPlanChange && onTreatmentPlanChange(e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter treatment plan here"
                className="min-h-[300px]"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
