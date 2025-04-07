
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PatientFormData, Vital } from "@/types";

interface VitalsTabProps {
  formData?: PatientFormData;
  handleInputChange?: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditNurseSection?: boolean;
  calculateAge?: (dateOfBirth: string) => number;
  calculateBMI?: (height: string, weight: string) => string;
  vitals?: Vital;
  onVitalsChange?: (vitals: any) => void;
}

export const VitalsTab = ({
  formData,
  handleInputChange,
  canEditNurseSection,
  calculateAge,
  calculateBMI,
  vitals,
  onVitalsChange
}: VitalsTabProps) => {
  // Use either formData.vitals or the directly provided vitals
  const vitalData = vitals || (formData ? formData.vitals : null);
  
  const handleVitalChange = (field: string, value: string) => {
    if (handleInputChange) {
      handleInputChange("vitals", field, value);
    } else if (onVitalsChange && vitalData) {
      onVitalsChange({
        ...vitalData,
        [field]: value
      });
    }
  };

  // If no vitals data is available, show a placeholder
  if (!vitalData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No vitals data available</p>
        </CardContent>
      </Card>
    );
  }

  // Age calculation if formData and calculateAge function are available
  let age = null;
  if (formData?.patientInfo?.dateOfBirth && calculateAge) {
    age = calculateAge(formData.patientInfo.dateOfBirth);
  }

  // BMI calculation if height, weight and calculateBMI function are available
  let bmi = null;
  if (vitalData.height && vitalData.weight && calculateBMI) {
    bmi = calculateBMI(vitalData.height, vitalData.weight);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <div>
            <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
            <Input 
              id="bloodPressure"
              value={vitalData.bloodPressure || ""}
              onChange={(e) => handleVitalChange("bloodPressure", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 120/80"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input 
              id="heartRate"
              value={vitalData.heartRate || ""}
              onChange={(e) => handleVitalChange("heartRate", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 70"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="respiratoryRate">Respiratory Rate (bpm)</Label>
            <Input 
              id="respiratoryRate"
              value={vitalData.respiratoryRate || ""}
              onChange={(e) => handleVitalChange("respiratoryRate", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 16"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="temperature">Temperature (°C)</Label>
            <Input 
              id="temperature"
              value={vitalData.temperature || ""}
              onChange={(e) => handleVitalChange("temperature", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 36.8"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
            <Input 
              id="oxygenSaturation"
              value={vitalData.oxygenSaturation || ""}
              onChange={(e) => handleVitalChange("oxygenSaturation", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 98"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input 
              id="height"
              value={vitalData.height || ""}
              onChange={(e) => handleVitalChange("height", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 175"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg / lbs)</Label>
            <Input 
              id="weight"
              value={vitalData.weight || ""}
              onChange={(e) => handleVitalChange("weight", e.target.value)}
              disabled={!canEditNurseSection}
              placeholder="e.g., 70kg or 154lbs"
              className="mt-1.5"
            />
          </div>
          
          {(age !== null || bmi !== null) && (
            <div className="md:col-span-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Calculated Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {age !== null && (
                  <div>
                    <Label>Age</Label>
                    <p className="mt-1 text-muted-foreground">{age} years</p>
                  </div>
                )}
                {bmi !== null && (
                  <div>
                    <Label>BMI</Label>
                    <p className="mt-1 text-muted-foreground">{bmi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
