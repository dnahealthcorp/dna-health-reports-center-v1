
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PatientFormData, SummaryFinding } from "@/types";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface SummaryFindingsTabProps {
  formData?: PatientFormData;
  handleInputChange?: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection?: boolean;
  summaryFindings?: SummaryFinding;
  onSummaryChange?: (summaryFindings: any) => void;
  onToggleInsulinResistance?: (showInsulinResistance: boolean) => void;
  showInsulinResistance?: boolean;
}

export const SummaryFindingsTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection,
  summaryFindings,
  onSummaryChange,
  onToggleInsulinResistance,
  showInsulinResistance: propShowInsulinResistance
}: SummaryFindingsTabProps) => {
  // Use either formData or the directly provided summaryFindings/showInsulinResistance
  const findings = summaryFindings || (formData ? formData.summaryFindings : null);
  const [localShowInsulinResistance, setLocalShowInsulinResistance] = useState(
    propShowInsulinResistance !== undefined ? propShowInsulinResistance : 
    formData ? formData.showInsulinResistance : false
  );
  
  const handleSummaryChange = (field: string, value: string) => {
    if (handleInputChange && formData) {
      handleInputChange("summaryFindings", field, value);
    } else if (onSummaryChange && findings) {
      onSummaryChange({
        ...findings,
        [field]: value
      });
    }
  };

  const handleToggleInsulinResistance = (checked: boolean) => {
    setLocalShowInsulinResistance(checked);
    if (handleInputChange) {
      handleInputChange("", "showInsulinResistance", checked);
    } else if (onToggleInsulinResistance) {
      onToggleInsulinResistance(checked);
    }
  };

  // If no findings data is available, show a placeholder
  if (!findings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No summary findings data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <Label htmlFor="insulin-resistance" className="cursor-pointer">
              Show Insulin Resistance Section on PDF
            </Label>
            <Switch
              id="insulin-resistance"
              checked={localShowInsulinResistance}
              onCheckedChange={handleToggleInsulinResistance}
              disabled={!canEditDoctorSection}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="glucoseMetabolism">Glucose Metabolism</Label>
              <Textarea
                id="glucoseMetabolism"
                value={findings.glucoseMetabolism || ""}
                onChange={(e) => handleSummaryChange("glucoseMetabolism", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for glucose metabolism"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="proteins">Proteins</Label>
              <Textarea
                id="proteins"
                value={findings.proteins || ""}
                onChange={(e) => handleSummaryChange("proteins", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for proteins"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="lipidProfile">Lipid Profile</Label>
              <Textarea
                id="lipidProfile"
                value={findings.lipidProfile || ""}
                onChange={(e) => handleSummaryChange("lipidProfile", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for lipid profile"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="inflammation">Inflammation</Label>
              <Textarea
                id="inflammation"
                value={findings.inflammation || ""}
                onChange={(e) => handleSummaryChange("inflammation", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for inflammation"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="metabolic">Metabolic</Label>
              <Textarea
                id="metabolic"
                value={findings.metabolic || ""}
                onChange={(e) => handleSummaryChange("metabolic", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for metabolic"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="homocysteine">Homocysteine</Label>
              <Textarea
                id="homocysteine"
                value={findings.homocysteine || ""}
                onChange={(e) => handleSummaryChange("homocysteine", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for homocysteine"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="vitaminsMinerals">Vitamins/Minerals</Label>
              <Textarea
                id="vitaminsMinerals"
                value={findings.vitaminsMinerals || ""}
                onChange={(e) => handleSummaryChange("vitaminsMinerals", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for vitamins and minerals"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="ironProfile">Iron Profile</Label>
              <Textarea
                id="ironProfile"
                value={findings.ironProfile || ""}
                onChange={(e) => handleSummaryChange("ironProfile", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for iron profile"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="sexHormones">Sex Hormones</Label>
              <Textarea
                id="sexHormones"
                value={findings.sexHormones || ""}
                onChange={(e) => handleSummaryChange("sexHormones", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for sex hormones"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="kidneyFunctionElectrolytes">Kidney Function and Electrolytes</Label>
              <Textarea
                id="kidneyFunctionElectrolytes"
                value={findings.kidneyFunctionElectrolytes || ""}
                onChange={(e) => handleSummaryChange("kidneyFunctionElectrolytes", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for kidney function and electrolytes"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="liverFunctions">Liver Functions</Label>
              <Textarea
                id="liverFunctions"
                value={findings.liverFunctions || ""}
                onChange={(e) => handleSummaryChange("liverFunctions", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for liver functions"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="tumorMarkers">Tumor Markers</Label>
              <Textarea
                id="tumorMarkers"
                value={findings.tumorMarkers || ""}
                onChange={(e) => handleSummaryChange("tumorMarkers", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for tumor markers"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            
            <div>
              <Label htmlFor="bloodCounts">Blood Counts</Label>
              <Textarea
                id="bloodCounts"
                value={findings.bloodCounts || ""}
                onChange={(e) => handleSummaryChange("bloodCounts", e.target.value)}
                disabled={!canEditDoctorSection}
                placeholder="Enter findings for blood counts"
                className="mt-1.5 min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
