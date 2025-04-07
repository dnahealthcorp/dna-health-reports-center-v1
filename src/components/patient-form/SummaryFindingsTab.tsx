
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientFormData } from "@/types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Edit, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor, RichTextViewer } from "@/components/ui/rich-text-editor";
import { isHtml, sanitizeHtml } from "@/types/medical";

interface SummaryFindingsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

// Predefined options for each summary finding field with HTML formatting
const predefinedOptions = {
  glucoseMetabolism: [
    "<p>Optimal glucose metabolism.</p>",
    "<p><strong>Elevated HbA1c of [xxx]%</strong>, with high fasting glucose, indicates a prediabetic state, accompanied by low QUICKI and dHOMA2-S scores, suggestive of insulin resistance.</p><p><strong>Contributing Factors:</strong></p><ul><li>High intake of refined carbohydrates</li><li>Irregular and late meal timing</li><li>Elevated cortisol levels</li></ul>",
  ],
  proteins: [
    "<p>All protein markers within optimal range.</p>",
    "<p>Albumin slightly below optimal, indicating potential nutritional deficiency.</p>"
  ],
  lipidProfile: [
    "<p>Optimal lipid profile.</p>",
    "<p><strong>Elevated total cholesterol (TC)</strong> and LDL, with normal HDL and triglycerides.</p>",
    "<p>Low HDL with elevated triglycerides, suggesting metabolic syndrome pattern.</p>"
  ],
  inflammation: [
    "<p>No signs of systemic inflammation.</p>",
    "<p>Elevated high-sensitivity CRP indicating low-grade inflammation.</p>"
  ],
  metabolic: [
    "<p>Metabolic markers within normal ranges.</p>",
    "<p>Multiple metabolic markers outside optimal ranges, suggesting metabolic stress.</p>"
  ],
  homocysteine: [
    "<p>Homocysteine within optimal range.</p>",
    "<p>Elevated homocysteine levels indicating potential methylation issues.</p>"
  ],
  vitaminsMinerals: [
    "<p>Optimal vitamin and mineral status.</p>",
    "<p>Vitamin D deficiency with suboptimal magnesium levels.</p>"
  ],
  ironProfile: [
    "<p>Iron markers within optimal ranges.</p>",
    "<p><strong>Elevated ferritin</strong> with normal iron suggests inflammatory process.</p>"
  ],
  sexHormones: [
    "<p>Sex hormones within age-appropriate ranges.</p>",
    "<p>Low testosterone with elevated estradiol, suggesting aromatase activity.</p>"
  ],
  kidneyFunctionElectrolytes: [
    "<p>Kidney function and electrolytes within normal limits.</p>",
    "<p>Elevated BUN and creatinine suggesting reduced kidney function.</p>"
  ],
  liverFunctions: [
    "<p>Liver enzymes within optimal ranges.</p>",
    "<p>Mildly elevated AST and ALT suggesting hepatic stress.</p>"
  ],
  tumorMarkers: [
    "<p>All tumor markers within normal range.</p>",
    "<p>Slightly elevated PSA requiring follow-up.</p>"
  ],
  bloodCounts: [
    "<p>Complete blood count within normal parameters.</p>",
    "<p>Mild anemia with reduced hemoglobin and hematocrit.</p>"
  ]
};

type SummaryFindingField = keyof typeof predefinedOptions;

export const SummaryFindingsTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: SummaryFindingsTabProps) => {
  // State to track which fields are being edited
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

  // Handle select change with special handling for templates
  const handleSelectChange = (field: string, value: string) => {
    if (value === "free-text") {
      // Enable editing mode for this field
      setEditingFields(prev => ({ ...prev, [field]: true }));
      return;
    }
    
    // For predefined options, update the form data with sanitized HTML
    handleInputChange("summaryFindings", field, sanitizeHtml(value));
  };

  // Handle rich text editor changes
  const handleEditorChange = (field: string, html: string) => {
    handleInputChange("summaryFindings", field, sanitizeHtml(html));
  };

  // Format field labels
  const formatFieldLabel = (field: string): string => {
    if (field === 'glucoseMetabolism') return 'Glucose Metabolism';
    if (field === 'vitaminsMinerals') return 'Vitamins/Minerals';
    if (field === 'ironProfile') return 'Iron Profile';
    if (field === 'sexHormones') return 'Sex Hormones';
    if (field === 'kidneyFunctionElectrolytes') return 'Kidney Function and Electrolytes';
    if (field === 'liverFunctions') return 'Liver Functions';
    if (field === 'tumorMarkers') return 'Tumor Markers';
    if (field === 'bloodCounts') return 'Blood Counts';
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Check if a value already has HTML formatting
  const isValueHtml = (field: SummaryFindingField): boolean => {
    const value = formData.summaryFindings?.[field] || '';
    return isHtml(value);
  };

  return <Card>
      <CardHeader>
        <CardTitle>Summary of Findings</CardTitle>
        <CardDescription>
          Record patient's health parameters and findings with rich text formatting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left px-4 py-2 border">Parameters</th>
                <th className="text-left px-4 py-2 border">Key findings</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(predefinedOptions).map(([field, options]) => {
                const value = formData.summaryFindings?.[field as SummaryFindingField] || '';
                const isEditing = editingFields[field] || isValueHtml(field as SummaryFindingField);
                
                return (
                  <tr key={field}>
                    <td className="px-4 py-2 border bg-gray-50 w-1/4 text-left">
                      {formatFieldLabel(field)}
                    </td>
                    <td className="px-4 py-2 border">
                      {isEditing ? (
                        <div className="relative">
                          <RichTextEditor
                            content={value}
                            onChange={(html) => handleEditorChange(field, html)}
                            editable={canEditDoctorSection}
                            placeholder={`Enter ${formatFieldLabel(field)} findings...`}
                          />
                          {canEditDoctorSection && (
                            <div className="flex justify-end mt-2">
                              <Select
                                onValueChange={(value) => handleSelectChange(field, value)}
                              >
                                <SelectTrigger className="w-auto">
                                  <span className="flex items-center text-xs">
                                    <ChevronDown className="mr-1 h-4 w-4" />
                                    Select template
                                  </span>
                                </SelectTrigger>
                                <SelectContent align="end">
                                  {options.map((option, index) => (
                                    <SelectItem key={index} value={option} className="max-w-[400px]">
                                      <div className="line-clamp-1">
                                        {option.replace(/<[^>]*>/g, '').substring(0, 60)}
                                        {option.replace(/<[^>]*>/g, '').length > 60 ? '...' : ''}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <Select
                            disabled={!canEditDoctorSection}
                            value={value || ""}
                            onValueChange={(val) => handleSelectChange(field, val)}
                          >
                            <SelectTrigger className={cn(
                              "w-full border-0 p-0 min-h-[100px] h-auto text-left",
                              "focus:ring-0 focus:ring-offset-0",
                              value ? "text-foreground" : "text-muted-foreground"
                            )}>
                              <SelectValue placeholder="Select an option or enter custom text" />
                            </SelectTrigger>
                            <SelectContent>
                              {options.map((option, index) => (
                                <SelectItem key={index} value={option} className="max-w-[400px]">
                                  <div className="line-clamp-1">
                                    {option.replace(/<[^>]*>/g, '').substring(0, 60)}
                                    {option.replace(/<[^>]*>/g, '').length > 60 ? '...' : ''}
                                  </div>
                                </SelectItem>
                              ))}
                              <SelectItem value="free-text" className="font-medium text-primary">
                                <div className="flex items-center">
                                  <Edit className="mr-1 h-4 w-4" />
                                  Use Rich Text Editor
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {canEditDoctorSection && value && !isEditing && (
                            <button 
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                              onClick={() => setEditingFields(prev => ({ ...prev, [field]: true }))}
                              type="button"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>;
};
