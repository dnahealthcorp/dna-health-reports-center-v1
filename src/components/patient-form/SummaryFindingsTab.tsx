import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { PatientFormData } from "@/types";
import { cn } from "@/lib/utils";
import { Edit, List } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface SummaryFindingsTabProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

const predefinedOptions = {
  glucoseMetabolism: [
    "Optimal glucose metabolism.",
    "Elevated HbA1c of [xxx]%, with high fasting glucose, indicates a prediabetic state, accompanied by low QUICKI and dHOMA2-S scores, suggestive of insulin resistance."
  ],
  proteins: ["All protein markers within optimal range.", "Albumin slightly below optimal."],
  lipidProfile: ["Optimal lipid profile.", "Elevated total cholesterol."],
  inflammation: ["No signs of systemic inflammation.", "Elevated high-sensitivity CRP."],
  metabolic: ["Metabolic markers within normal ranges.", "Multiple markers outside optimal range."],
  homocysteine: ["Homocysteine within optimal range.", "Elevated homocysteine levels."],
  vitaminsMinerals: ["Optimal vitamin and mineral status.", "Vitamin D deficiency."],
  ironProfile: ["Iron markers within optimal ranges.", "Elevated ferritin."],
  sexHormones: ["Hormones within age-appropriate range.", "Low testosterone with elevated estradiol."],
  kidneyFunctionElectrolytes: ["Kidney function within limits.", "Elevated BUN/creatinine."],
  liverFunctions: ["Liver enzymes within range.", "Mildly elevated AST/ALT."],
  tumorMarkers: ["All tumor markers within normal range.", "Slightly elevated PSA."],
  bloodCounts: ["Blood count normal.", "Mild anemia detected."]
};

type SummaryFindingField = keyof typeof predefinedOptions;

export const SummaryFindingsTab = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: SummaryFindingsTabProps) => {
  const [useEditor, setUseEditor] = useState<Record<SummaryFindingField, boolean>>(
    Object.keys(predefinedOptions).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<SummaryFindingField, boolean>)
  );

  const toggleEditor = (field: SummaryFindingField) => {
    setUseEditor(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEditorChange = (field: SummaryFindingField, html: string) => {
    handleInputChange("summaryFindings", field, html);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary of Findings</CardTitle>
        <CardDescription>Record patient's health parameters and findings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left px-4 py-2 border w-1/4">Parameters</th>
                <th className="text-left px-4 py-2 border">Key findings</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(predefinedOptions).map(([field, options]) => {
                const fieldKey = field as SummaryFindingField;
                const value = formData.summaryFindings?.[fieldKey] || "";

                const editor = useEditor({
                  content: value,
                  extensions: [StarterKit],
                  onUpdate: ({ editor }) => {
                    handleEditorChange(fieldKey, editor.getHTML());
                  }
                });

                return (
                  <tr key={fieldKey}>
                    <td className="px-4 py-2 border bg-gray-50 text-left align-top">
                      <div className="flex items-center justify-between">
                        <span>{fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => toggleEditor(fieldKey)}
                          type="button"
                        >
                          {useEditor[fieldKey] ? <List className="mr-1 w-4 h-4" /> : <Edit className="mr-1 w-4 h-4" />}
                          {useEditor[fieldKey] ? "Select" : "Edit"}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-2 border align-top">
                      {useEditor[fieldKey] ? (
                        <div className="border rounded p-2">
                          {editor && <EditorContent editor={editor} />}
                        </div>
                      ) : (
                        <Select
                          value={value}
                          disabled={!canEditDoctorSection}
                          onValueChange={(val) => handleInputChange("summaryFindings", fieldKey, val)}
                        >
                          <SelectTrigger className="w-full h-auto min-h-[60px] p-2 text-left border">
                            <SelectValue placeholder="Select an option or switch to editor" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt, idx) => (
                              <SelectItem key={idx} value={opt}>
                                {opt.length > 60 ? `${opt.slice(0, 60)}...` : opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
