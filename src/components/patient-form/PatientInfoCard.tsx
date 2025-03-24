
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientFormData } from "@/types";

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
                type="date"
                value={formData.patientInfo.dateOfBirth}
                onChange={(e) => handleInputChange("patientInfo", "dateOfBirth", e.target.value)}
                disabled={!canEditNurseSection}
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
                onChange={(e) => handleInputChange("patientInfo", "medicalRecordNumber", e.target.value)}
                disabled={!canEditNurseSection}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
