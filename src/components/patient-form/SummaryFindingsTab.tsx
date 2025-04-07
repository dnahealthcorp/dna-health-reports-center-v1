
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { SummaryFindingsTable } from "./summary-findings/SummaryFindingsTable";

interface SummaryFindingsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

export const SummaryFindingsTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: SummaryFindingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Summary of Findings</span>
          {canEditDoctorSection && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {}}
              className="text-xs"
            >
              <Edit className="h-3 w-3 mr-1" /> Edit All
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Record patient's health parameters and findings with rich text formatting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SummaryFindingsTable 
          formData={formData}
          handleInputChange={handleInputChange}
          canEditDoctorSection={canEditDoctorSection}
        />
      </CardContent>
    </Card>
  );
};
