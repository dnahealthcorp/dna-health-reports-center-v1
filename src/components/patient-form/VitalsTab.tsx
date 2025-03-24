
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PatientFormData } from "@/types";

interface VitalsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditNurseSection: boolean;
  calculateAge: (dateOfBirth: string) => string;
  calculateBMI: (height: string, weight: string) => string;
}

export const VitalsTab = ({
  formData,
  handleInputChange,
  canEditNurseSection,
  calculateAge,
  calculateBMI
}: VitalsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Vital Signs</CardTitle>
        <CardDescription>
          Record patient's vital signs and measurements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left px-4 py-2 border">Vitals</th>
                <th className="text-left px-4 py-2 border">Value</th>
                <th className="text-left px-4 py-2 border">Target Range</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Date of Birth</td>
                <td className="px-4 py-2 border">
                  <Input 
                    type="date"
                    value={formData.patientInfo.dateOfBirth}
                    onChange={(e) => handleInputChange("patientInfo", "dateOfBirth", e.target.value)}
                    disabled={!canEditNurseSection}
                    className="border-0 p-0 h-auto"
                  />
                </td>
                <td className="px-4 py-2 border">-</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Age (years)</td>
                <td className="px-4 py-2 border">{calculateAge(formData.patientInfo.dateOfBirth)}</td>
                <td className="px-4 py-2 border">-</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Blood Pressure (mmHg)</td>
                <td className="px-4 py-2 border">
                  <Input 
                    value={formData.vitals.bloodPressure}
                    onChange={(e) => handleInputChange("vitals", "bloodPressure", e.target.value)}
                    disabled={!canEditNurseSection}
                    placeholder="e.g. 120/80"
                    className="border-0 p-0 h-auto"
                  />
                </td>
                <td className="px-4 py-2 border">120/60-140/85</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Height (cm)</td>
                <td className="px-4 py-2 border">
                  <Input 
                    value={formData.vitals.height}
                    onChange={(e) => handleInputChange("vitals", "height", e.target.value)}
                    disabled={!canEditNurseSection}
                    className="border-0 p-0 h-auto"
                  />
                </td>
                <td className="px-4 py-2 border">-</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Weight (Kg)</td>
                <td className="px-4 py-2 border">
                  <Input 
                    value={formData.vitals.weight}
                    onChange={(e) => handleInputChange("vitals", "weight", e.target.value)}
                    disabled={!canEditNurseSection}
                    className="border-0 p-0 h-auto"
                  />
                </td>
                <td className="px-4 py-2 border">-</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Body Mass Index</td>
                <td className="px-4 py-2 border">{calculateBMI(formData.vitals.height, formData.vitals.weight)}</td>
                <td className="px-4 py-2 border">18.5 – 25.9</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
