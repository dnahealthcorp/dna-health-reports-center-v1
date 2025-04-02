
import { useState } from "react";
import { FormInstance } from "@/types/multiforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateFormStatus } from "@/services/formService";
import { Printer, Save } from "lucide-react";

interface HealthScreeningFormProps {
  form: FormInstance;
}

const HealthScreeningForm = ({ form }: HealthScreeningFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // For now just update the status to in-process
      await updateFormStatus(form.id, 'in-process');
      
      toast({
        title: "Form Saved",
        description: "Health screening form has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Could not save form",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Health Screening</h2>
          <p className="text-muted-foreground">
            Status: <span className="capitalize">{form.status}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the Health Screening form content. The existing PatientForm layout and components
            would be integrated here, but pulling data from the health_screening_data table instead.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vitals section will be displayed here, similar to the existing PatientForm component.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Summary findings content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthScreeningForm;
