
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient, PatientFormData } from "@/types";

interface PatientInfoCardProps {
  formData?: PatientFormData;
  patient?: Patient;
  handleInputChange?: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditNurseSection?: boolean;
}

export const PatientInfoCard = ({
  formData,
  patient
}: PatientInfoCardProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Create a patientInfo object that works with either data source
  const patientInfo = formData?.patientInfo || {
    name: patient?.name || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    medicalRecordNumber: patient?.medicalRecordNumber || ""
  };

  return (
    <Card className="animate-fade-in-up mb-6">
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
        <CardDescription>
          Basic patient information and demographics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base">{patientInfo.name || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p className="text-base">{formatDate(patientInfo.dateOfBirth) || "Not specified"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p className="text-base">{patientInfo.gender || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Medical Record Number</p>
              <p className="text-base">{patientInfo.medicalRecordNumber || "Not specified"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
