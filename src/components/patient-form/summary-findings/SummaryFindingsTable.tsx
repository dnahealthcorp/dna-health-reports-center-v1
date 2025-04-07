
import React from "react";
import { PatientFormData } from "@/types";
import { SummaryFindingField } from "./SummaryFindingField";
import { predefinedOptions } from "./PredefinedOptions";

interface SummaryFindingsTableProps {
  formData: PatientFormData;
  handleInputChange: (section: keyof PatientFormData | "", field: string, value: string) => void;
  canEditDoctorSection: boolean;
}

export const SummaryFindingsTable = ({
  formData,
  handleInputChange,
  canEditDoctorSection
}: SummaryFindingsTableProps) => {
  const handleFieldChange = (field: string, value: string) => {
    handleInputChange("summaryFindings", field, value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            <th className="text-left px-4 py-2 border">Parameters</th>
            <th className="text-left px-4 py-2 border">Key findings</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(predefinedOptions).map((field) => (
            <SummaryFindingField
              key={field}
              field={field as SummaryFindingField}
              value={formData.summaryFindings?.[field as keyof typeof predefinedOptions] || ''}
              onChange={handleFieldChange}
              canEdit={canEditDoctorSection}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
