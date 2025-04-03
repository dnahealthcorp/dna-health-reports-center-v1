
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PatientFormData } from "@/types";

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
        <CardTitle>Summary of Findings</CardTitle>
        <CardDescription>
          Record patient's health parameters and findings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left px-4 py-2 border">Parameters</th>
                <th className="text-left px-4 py-2 border">Key findings and next steps</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border bg-gray-50 w-1/4">Glucose Metabolism</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.glucoseMetabolism || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "glucoseMetabolism", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                    placeholder="What's good – what's not so good and next steps"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Proteins</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.proteins || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "proteins", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Lipid Profile</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.lipidProfile || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "lipidProfile", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Inflammation</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.inflammation || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "inflammation", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Metabolic</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.metabolic || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "metabolic", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Homocysteine</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.homocysteine || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "homocysteine", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Vitamins/Minerals</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.vitaminsMinerals || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "vitaminsMinerals", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Iron Profile</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.ironProfile || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "ironProfile", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Sex Hormones</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.sexHormones || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "sexHormones", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Kidney Function and Electrolytes</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.kidneyFunctionElectrolytes || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "kidneyFunctionElectrolytes", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Liver Functions</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.liverFunctions || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "liverFunctions", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Tumor Markers</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.tumorMarkers || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "tumorMarkers", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border bg-gray-50">Blood Counts</td>
                <td className="px-4 py-2 border">
                  <Textarea 
                    value={formData.summaryFindings?.bloodCounts || ''}
                    onChange={(e) => handleInputChange("summaryFindings", "bloodCounts", e.target.value)}
                    disabled={!canEditDoctorSection}
                    className="border-0 p-0 min-h-[60px]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
