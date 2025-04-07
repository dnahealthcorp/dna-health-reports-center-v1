
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientFormData } from "@/types";
import { Heart } from "lucide-react";

interface CardiovascularRiskTabProps {
  formData: PatientFormData;
  canEditDoctorSection: boolean;
}

export const CardiovascularRiskTab = ({
  formData,
  canEditDoctorSection
}: CardiovascularRiskTabProps) => {
  const isMale = formData.patientInfo.gender === 'Male';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-medium">
          <Heart className="h-5 w-5 text-primary mr-2" />
          Cardiovascular Risk (*Apo B : Apo A1 ratio)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 px-4 bg-primary text-primary-foreground font-medium text-sm"></th>
                <th className="text-left py-2 px-4 bg-primary text-primary-foreground font-medium text-sm">Low risk</th>
                <th className="text-left py-2 px-4 bg-primary text-primary-foreground font-medium text-sm">Moderate risk</th>
                <th className="text-left py-2 px-4 bg-primary text-primary-foreground font-medium text-sm">High risk</th>
              </tr>
            </thead>
            <tbody>
              <tr className={isMale ? "bg-yellow-50" : ""}>
                <td className="border py-2 px-4 bg-muted/50 font-medium text-sm">Men</td>
                <td className="border py-2 px-4 text-sm">0.30-to-0.69</td>
                <td className="border py-2 px-4 text-sm">0.70-to-0.89</td>
                <td className="border py-2 px-4 text-sm">0.90-to-1.2</td>
              </tr>
              <tr className={!isMale ? "bg-yellow-50" : ""}>
                <td className="border py-2 px-4 bg-muted/50 font-medium text-sm">Women</td>
                <td className="border py-2 px-4 text-sm">0.30-to-0.59</td>
                <td className="border py-2 px-4 text-sm">0.60-to-0.79</td>
                <td className="border py-2 px-4 text-sm">0.80-to-1.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          The highlighted row indicates the relevant risk categories based on the patient's gender.
          This will be included in the patient's PDF report.
        </p>
      </CardContent>
    </Card>
  );
};
