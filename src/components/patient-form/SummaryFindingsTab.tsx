import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PatientFormData } from "@/types";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Edit, ChevronDown, ArrowLeft, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { ExportToPdf } from "@/components/ui/export-to-pdf";

interface SummaryFindingsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

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
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [richTextFields, setRichTextFields] = useState<Record<string, boolean>>({});

  const handleSelectChange = (field: string, value: string) => {
    if (value === "free-text") {
      setEditingFields(prev => ({ ...prev, [field]: true }));
      return;
    }
    
    handleInputChange("summaryFindings", field, value);
    setEditingFields(prev => ({ ...prev, [field]: false }));
    setRichTextFields(prev => ({ ...prev, [field]: false }));
  };

  const isCustomValue = (field: SummaryFindingField, value: string) => {
    return value !== "" && !predefinedOptions[field].includes(value);
  };

  const toggleRichText = (field: string) => {
    setRichTextFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const returnToSelect = (field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: false }));
    setRichTextFields(prev => ({ ...prev, [field]: false }));
  };

  const exportAllFindings = () => {
    const allHtml = Object.entries(formData.summaryFindings || {})
      .filter(([_, value]) => value)
      .map(([field, value]) => {
        const displayName = field === 'glucoseMetabolism' ? 'Glucose Metabolism' : 
                           field === 'vitaminsMinerals' ? 'Vitamins/Minerals' : 
                           field === 'ironProfile' ? 'Iron Profile' : 
                           field === 'sexHormones' ? 'Sex Hormones' : 
                           field === 'kidneyFunctionElectrolytes' ? 'Kidney Function and Electrolytes' : 
                           field === 'liverFunctions' ? 'Liver Functions' : 
                           field === 'tumorMarkers' ? 'Tumor Markers' : 
                           field === 'bloodCounts' ? 'Blood Counts' : 
                           field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        return `<h2>${displayName}</h2>${value}`;
      })
      .join('<hr />');
    
    return `<h1>Summary of Findings</h1>${allHtml}`;
  };

  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Summary of Findings</CardTitle>
          <CardDescription>
            Record patient's health parameters and findings
          </CardDescription>
        </div>
        <ExportToPdf
          html={exportAllFindings()}
          fileName="summary-findings.pdf"
          css={`
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
            }
            h1 {
              color: #99BC44;
              text-align: center;
              margin-bottom: 20px;
            }
            h2 {
              color: #333;
              background: #f5f5f5;
              padding: 5px 10px;
              border-left: 4px solid #99BC44;
            }
            hr {
              margin: 20px 0;
              border: none;
              border-top: 1px dashed #ccc;
            }
          `}
          buttonText="Export All Findings"
        />
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
                const isRichText = richTextFields[field];
                
                return (
                  <tr key={field}>
                    <td className="px-4 py-2 border bg-gray-50 w-1/4 text-left">
                      {field === 'glucoseMetabolism' ? 'Glucose Metabolism' : 
                       field === 'vitaminsMinerals' ? 'Vitamins/Minerals' : 
                       field === 'ironProfile' ? 'Iron Profile' : 
                       field === 'sexHormones' ? 'Sex Hormones' : 
                       field === 'kidneyFunctionElectrolytes' ? 'Kidney Function and Electrolytes' : 
                       field === 'liverFunctions' ? 'Liver Functions' : 
                       field === 'tumorMarkers' ? 'Tumor Markers' : 
                       field === 'bloodCounts' ? 'Blood Counts' : 
                       field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </td>
                    <td className="px-4 py-2 border">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => returnToSelect(field)}
                              disabled={!canEditDoctorSection}
                              className="flex items-center gap-1 text-xs"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" /> Back to options
                            </Button>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleRichText(field)}
                                disabled={!canEditDoctorSection}
                                className="text-xs"
                              >
                                {isRichText ? "Simple Editor" : "Rich Text Editor"}
                              </Button>
                              
                              {isRichText && value && (
                                <ExportToPdf 
                                  html={value} 
                                  fileName={`${field}.pdf`} 
                                  buttonText="PDF"
                                  className="text-xs"
                                />
                              )}
                            </div>
                          </div>
                          
                          {isRichText ? (
                            <RichTextEditor
                              value={value}
                              onChange={(newValue) => handleInputChange("summaryFindings", field, newValue)}
                              disabled={!canEditDoctorSection}
                              className="min-h-[100px]"
                              showExportToPdf={true}
                              pdfFileName={`${field}.pdf`}
                            />
                          ) : (
                            <Textarea 
                              value={value} 
                              onChange={e => handleInputChange("summaryFindings", field, e.target.value)} 
                              disabled={!canEditDoctorSection}
                              className="border-0 p-0 min-h-[60px]" 
                              placeholder="Enter custom text"
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
                              <SelectValue placeholder="Select an option or enter custom text" />
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
                                  [Free Text Option]
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {canEditDoctorSection && value && !isEditing && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                              {value && (
                                <ExportToPdf 
                                  html={value} 
                                  fileName={`${field}.pdf`} 
                                  className="p-1 rounded-full hover:bg-gray-100"
                                  buttonText=""
                                >
                                  <FileDown className="h-4 w-4 text-gray-500" />
                                </ExportToPdf>
                              )}
                              <button 
                                className="p-1 rounded-full hover:bg-gray-100"
                                onClick={() => setEditingFields(prev => ({ ...prev, [field]: true }))}
                                type="button"
                              >
                                <Edit className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
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
