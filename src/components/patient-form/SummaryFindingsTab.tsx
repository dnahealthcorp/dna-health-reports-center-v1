
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientFormData } from "@/types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftCircle, Edit, Eye, EyeOff, ListRestart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RichTextEditor, { sanitizeContent } from "../rich-text/RichTextEditor";
import RichTextDisplay from "../rich-text/RichTextDisplay";

interface SummaryFindingsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

// Predefined options for each summary finding field with HTML content
const predefinedOptions = {
  glucoseMetabolism: [
    "<p>Optimal glucose metabolism.</p>",
    "<p>Elevated HbA1c of [xxx]%, with high fasting glucose, indicates a prediabetic state, accompanied by low QUICKI and dHOMA2-S scores, suggestive of insulin resistance.</p><p><strong>Contributing Factors:</strong></p><ul><li>High intake of refined carbohydrates</li><li>Irregular and late meal timing</li><li>Elevated cortisol levels</li></ul>"
  ],
  proteins: [
    "<p>All protein markers within optimal range.</p>",
    "<p>Albumin slightly below optimal, indicating potential nutritional deficiency.</p>"
  ],
  lipidProfile: [
    "<p>Optimal lipid profile.</p>",
    "<p>Elevated total cholesterol (TC) and LDL, with normal HDL and triglycerides.</p>",
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
    "<p>Elevated ferritin with normal iron suggests inflammatory process.</p>"
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
  // State to track which fields are in editing mode
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [previewMode, setPreviewMode] = useState<Record<string, boolean>>({});
  // Track the last selected option for each field to enable "revert to options" feature
  const [lastSelectedOption, setLastSelectedOption] = useState<Record<string, string>>({});

  // Handle select change with special handling for rich text editor option
  const handleSelectChange = (field: string, value: string) => {
    if (value === "rich-text-editor") {
      // Enable editing mode for this field
      setEditingFields(prev => ({ ...prev, [field]: true }));
      // Keep the current value when switching to rich text editor
      return;
    }
    
    // For predefined options, update the form data and exit editing mode
    handleInputChange("summaryFindings", field, sanitizeContent(value));
    setEditingFields(prev => ({ ...prev, [field]: false }));
    
    // Store the last selected option
    setLastSelectedOption(prev => ({ ...prev, [field]: value }));
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

  // Switch back from rich text editor to predefined options
  const switchToOptions = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: false }));
    
    // If there was a previously selected option, restore it
    if (lastSelectedOption[field]) {
      handleInputChange("summaryFindings", field, lastSelectedOption[field]);
    }
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
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => togglePreview(field)}
                                  title={isPreviewActive ? "Edit" : "Preview"}
                                >
                                  {isPreviewActive ? (
                                    <Edit className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => switchToOptions(field)}
                                  title="Revert to Options"
                                >
                                  <ListRestart className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {isEditing ? (
                          <div>
                            {isPreviewActive ? (
                              <div className="border rounded-md p-3 min-h-[100px] bg-gray-50">
                                <RichTextDisplay content={value} />
                              </div>
                            ) : (
                              <RichTextEditor
                                content={value}
                                onChange={(html) => handleInputChange("summaryFindings", field, html)}
                                disabled={!canEditDoctorSection}
                                placeholder="Enter rich text content here..."
                              />
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
                                  <div className="py-1 pr-8">
                                    <RichTextDisplay
                                      content={value.length > 150 ? `${value.substring(0, 150)}...` : value}
                                    />
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Select an option or use the rich text editor" />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                {options.map((option, index) => (
                                  <SelectItem key={index} value={option} className="py-2 min-h-[40px]">
                                    <RichTextDisplay 
                                      content={option.length > 100 ? `${option.substring(0, 100)}...` : option}
                                      className="text-sm"
                                    />
                                  </SelectItem>
                                ))}
                                <SelectItem value="rich-text-editor" className="font-medium text-primary">
                                  <div className="flex items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    [Rich Text Editor]
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
