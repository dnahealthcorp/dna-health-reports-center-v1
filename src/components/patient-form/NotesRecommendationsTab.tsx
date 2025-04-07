
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { PatientFormData } from "@/types";

interface NotesRecommendationsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditNurseSection: boolean;
  canEditDoctorSection: boolean;
  handleSave: () => void;
  isSaving: boolean;
}

export const NotesRecommendationsTab = ({
  formData,
  handleInputChange,
  canEditNurseSection,
  canEditDoctorSection,
  handleSave,
  isSaving
}: NotesRecommendationsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes & Recommendations</CardTitle>
        <CardDescription>
          Add notes, exercise recommendations, and treatment plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="exerciseRecommendations">Exercise Recommendations</Label>
            <Textarea 
              id="exerciseRecommendations"
              value={formData.exerciseRecommendations}
              onChange={(e) => handleInputChange("" as keyof PatientFormData, "exerciseRecommendations", e.target.value)}
              disabled={!canEditNurseSection}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nurseNotes">
              Nurse Notes
              {!canEditNurseSection && <span className="text-muted-foreground ml-2 text-sm">(Read only)</span>}
            </Label>
            <Textarea 
              id="nurseNotes"
              value={formData.nurseNotes}
              onChange={(e) => handleInputChange("" as keyof PatientFormData, "nurseNotes", e.target.value)}
              disabled={!canEditNurseSection}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctorNotes">
              Doctor Notes
              {!canEditDoctorSection && <span className="text-muted-foreground ml-2 text-sm">(Read only)</span>}
            </Label>
            <Textarea 
              id="doctorNotes"
              value={formData.doctorNotes}
              onChange={(e) => handleInputChange("" as keyof PatientFormData, "doctorNotes", e.target.value)}
              disabled={!canEditDoctorSection}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="diagnosis">
              Diagnosis
              {!canEditDoctorSection && <span className="text-muted-foreground ml-2 text-sm">(Read only)</span>}
            </Label>
            <Textarea 
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange("" as keyof PatientFormData, "diagnosis", e.target.value)}
              disabled={!canEditDoctorSection}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">
              Treatment Plan
              {!canEditDoctorSection && <span className="text-muted-foreground ml-2 text-sm">(Read only)</span>}
            </Label>
            <Textarea 
              id="treatmentPlan"
              value={formData.treatmentPlan}
              onChange={(e) => handleInputChange("" as keyof PatientFormData, "treatmentPlan", e.target.value)}
              disabled={!canEditDoctorSection}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Form
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
