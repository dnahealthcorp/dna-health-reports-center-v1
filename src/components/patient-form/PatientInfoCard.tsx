
import React from "react";
import { PatientFormData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";

interface PatientInfoCardProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string | boolean) => void;
  canEditNurseSection: boolean;
}

export const PatientInfoCard = ({
  formData,
  handleInputChange,
  canEditNurseSection,
}: PatientInfoCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP"); // Localized date format (e.g., April 29, 2023)
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
      <CardHeader className="pb-3">
        <CardTitle>Patient Information</CardTitle>
        <CardDescription>
          Basic patient information and demographics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h3>
            <p className="text-base">{formData.patientInfo?.name || "Not provided"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Gender</h3>
            <p className="text-base">{formData.patientInfo?.gender || "Not provided"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</h3>
            <p className="text-base">
              {formData.patientInfo?.dateOfBirth 
                ? formatDate(formData.patientInfo.dateOfBirth) 
                : "Not provided"}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Medical Record Number</h3>
            <p className="text-base">{formData.patientInfo?.medicalRecordNumber || "Not provided"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
