
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PatientFormData } from "@/types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Edit, ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SummaryFindingsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

// Predefined options for each summary finding field
const predefinedOptions = {
  glucoseMetabolism: [
    "Optimal glucose metabolism.",
    "Elevated HbA1c of [xxx]%, with high fasting glucose, indicates a prediabetic state, accompanied by low QUICKI and dHOMA2-S scores, suggestive of insulin resistance. Contributing Factors: - High intake of refined carbohydrates - Irregular and late meal timing - Elevated cortisol levels",
  ],
  proteins: [
    "All protein markers within optimal range.",
    "Albumin slightly below optimal, indicating potential nutritional deficiency."
  ],
  lipidProfile: [
    "Optimal lipid profile.",
    "Elevated total cholesterol (TC) and LDL, with normal HDL and triglycerides.",
    "Low HDL with elevated triglycerides, suggesting metabolic syndrome pattern."
  ],
  inflammation: [
    "No signs of systemic inflammation.",
    "Elevated high-sensitivity CRP indicating low-grade inflammation."
  ],
  metabolic: [
    "Metabolic markers within normal ranges.",
    "Multiple metabolic markers outside optimal ranges, suggesting metabolic stress."
  ],
  homocysteine: [
    "Homocysteine within optimal range.",
    "Elevated homocysteine levels indicating potential methylation issues."
  ],
  vitaminsMinerals: [
    "Optimal vitamin and mineral status.",
    "Vitamin D deficiency with suboptimal magnesium levels."
  ],
  ironProfile: [
    "Iron markers within optimal ranges.",
    "Elevated ferritin with normal iron suggests inflammatory process."
  ],
  sexHormones: [
    "Sex hormones within age-appropriate ranges.",
    "Low testosterone with elevated estradiol, suggesting aromatase activity."
  ],
  kidneyFunctionElectrolytes: [
    "Kidney function and electrolytes within normal limits.",
    "Elevated BUN and creatinine suggesting reduced kidney function."
  ],
  liverFunctions: [
    "Liver enzymes within optimal ranges.",
    "Mildly elevated AST and ALT suggesting hepatic stress."
  ],
  tumorMarkers: [
    "All tumor markers within normal range.",
    "Slightly elevated PSA requiring follow-up."
  ],
  bloodCounts: [
    "Complete blood count within normal parameters.",
    "Mild anemia with reduced hemoglobin and hematocrit."
  ]
};

type SummaryFindingField = keyof typeof predefinedOptions;

export const SummaryFindingsTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: SummaryFindingsTabProps) => {
  // State to track which fields are in editing mode after selecting [Free Text Option]
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});

  // Handle select change with special handling for free text option
  const handleSelectChange = (field: string, value: string) => {
    if (value === "free-text") {
      // Enable editing mode for this field
      setEditingFields(prev => ({ ...prev, [field]: true }));
      // Default to current value or empty string when selecting free text option
      return;
    }
    
    // For predefined options, update the form data and exit editing mode
    handleInputChange("summaryFindings", field, value);
    setEditingFields(prev => ({ ...prev, [field]: false }));
  };

  // Check if a value matches any predefined option
  const isCustomValue = (field: SummaryFindingField, value: string) => {
    return value !== "" && !predefinedOptions[field].includes(value);
  };

  // Toggle preview mode for a specific field
  const togglePreview = (field: string) => {
    setPreviewMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getFormattedFieldName = (field: string) => {
    return field === 'glucoseMetabolism' ? 'Glucose Metabolism' : 
           field === 'vitaminsMinerals' ? 'Vitamins/Minerals' : 
           field === 'ironProfile' ? 'Iron Profile' : 
           field === 'sexHormones' ? 'Sex Hormones' : 
           field === 'kidneyFunctionElectrolytes' ? 'Kidney Function and Electrolytes' : 
           field === 'liverFunctions' ? 'Liver Functions' : 
           field === 'tumorMarkers' ? 'Tumor Markers' : 
           field === 'bloodCounts' ? 'Blood Counts' : 
           field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Add a helper message for Markdown
  const markdownHelperText = `
  **Formatting Guide:**
  - **Bold**: \`**text**\`
  - *Italic*: \`*text*\`
  - Bullet List: \`- item\`
  - Numbered List: \`1. item\`
  - Headers: \`# Heading\` or \`## Subheading\`
  - Line Break: Add two spaces at the end of a line
  `;

  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Summary of Findings</span>
          {canEditDoctorSection && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPreviewMode({})} 
              className="text-xs"
            >
              <Edit className="h-3 w-3 mr-1" /> Edit All
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Record patient's health parameters and findings with Markdown formatting
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
                const isCustom = isCustomValue(field as SummaryFindingField, value);
                const isEditing = editingFields[field] || isCustom;
                const isPreviewActive = previewMode[field];
                const fieldName = getFormattedFieldName(field);
                
                return (
                  <tr key={field}>
                    <td className="px-4 py-2 border bg-gray-50 w-1/4 text-left">
                      {fieldName}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="relative">
                        {canEditDoctorSection && (
                          <div className="absolute right-2 top-2 flex space-x-1 z-10">
                            {isEditing && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => togglePreview(field)}
                              >
                                {isPreviewActive ? (
                                  <Edit className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        {isEditing ? (
                          <div>
                            {isPreviewActive ? (
                              <div className="border rounded-md p-3 min-h-[100px] bg-gray-50">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]} 
                                  className="prose prose-sm max-w-none"
                                >
                                  {value}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <>
                                <Textarea 
                                  value={value} 
                                  onChange={e => handleInputChange("summaryFindings", field, e.target.value)} 
                                  disabled={!canEditDoctorSection}
                                  className="min-h-[100px] font-mono text-sm" 
                                  placeholder="Enter Markdown text here..."
                                />
                                <div className="mt-1 text-xs text-gray-500">
                                  <details>
                                    <summary className="cursor-pointer font-medium text-primary">Markdown Tips</summary>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none mt-2">
                                      {markdownHelperText}
                                    </ReactMarkdown>
                                  </details>
                                </div>
                              </>
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
                                "w-full border-0 p-0 min-h-[60px] h-auto text-left",
                                "focus:ring-0 focus:ring-offset-0",
                                value ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {value ? (
                                  <div className="py-1">
                                    <ReactMarkdown 
                                      remarkPlugins={[remarkGfm]}
                                      className="prose prose-sm max-w-none"
                                    >
                                      {value.length > 80 ? `${value.substring(0, 80)}...` : value}
                                    </ReactMarkdown>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Select an option or enter custom text" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {options.map((option, index) => (
                                  <SelectItem key={index} value={option}>
                                    {option.length > 60 ? `${option.substring(0, 60)}...` : option}
                                  </SelectItem>
                                ))}
                                <SelectItem value="free-text" className="font-medium text-primary">
                                  <div className="flex items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    [Markdown Editor]
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
                      </div>
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
