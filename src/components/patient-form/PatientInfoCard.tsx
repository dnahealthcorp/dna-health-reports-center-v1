
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientFormData } from "@/types";
import { format } from "date-fns";

interface PatientInfoCardProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditNurseSection: boolean;
}

export const PatientInfoCard = ({
  formData,
  handleInputChange,
  canEditNurseSection
}: PatientInfoCardProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
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
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={formData.patientInfo.name}
                onChange={(e) => handleInputChange("patientInfo", "name", e.target.value)}
                disabled={!canEditNurseSection}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input 
                id="dob"
                value={formatDate(formData.patientInfo.dateOfBirth)}
                disabled={true}
                className="bg-muted/30"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.patientInfo.gender}
                onValueChange={(value) => handleInputChange("patientInfo", "gender", value)}
                disabled={!canEditNurseSection}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrn">Medical Record Number</Label>
              <Input 
                id="mrn"
                value={formData.patientInfo.medicalRecordNumber}
                disabled={true}
                className="bg-muted/30"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
