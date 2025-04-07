
import { Label } from "@/components/ui/label";
import { PatientFormData } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dna } from "lucide-react";

interface InsulinResistanceTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string | boolean) => void;
  canEditDoctorSection: boolean;
}

export const InsulinResistanceTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: InsulinResistanceTabProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dna className="h-5 w-5 text-primary" />
              <Label htmlFor="insulin-resistance" className="text-lg font-medium">
                Include Insulin Resistance Section in Report
              </Label>
            </div>
            <Switch
              id="insulin-resistance"
              checked={formData.showInsulinResistance}
              onCheckedChange={(checked) => handleInputChange("", "showInsulinResistance", checked)}
              disabled={!canEditDoctorSection}
            />
          </div>
          
          {formData.showInsulinResistance && (
            <div className="mt-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Preview of Insulin Resistance Section</h3>
                <img 
                  src="/assets/insulin resistance.jpg" 
                  alt="Insulin resistance diagram" 
                  className="w-full max-w-2xl mx-auto mb-2"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Figure 1: Insulin resistance and resulting metabolic disturbance
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This section will be included in the patient's PDF report. It provides valuable information 
                about insulin resistance and its relationship to metabolic syndrome.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
