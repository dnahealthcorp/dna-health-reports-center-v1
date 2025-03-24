
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircleUser, PlusCircle, FilePlus2 } from "lucide-react";
import { Patient } from '@/types';

interface PatientHeaderProps {
  patient: Patient;
  handleExportPDF: () => void;
  handleSave: () => void;
  isSaving: boolean;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  handleExportPDF,
  handleSave,
  isSaving
}) => {
  return (
    <Card className="mb-6 border-0 shadow-md">
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <CircleUser size={48} className="text-primary" />
          <div>
            <h2 className="text-2xl font-bold">{patient.name || "Unnamed Patient"}</h2>
            <p className="text-muted-foreground">
              MRN: {patient.medicalRecordNumber} · 
              Last Updated: {new Date(patient.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportPDF}
          >
            <FilePlus2 size={16} />
            Export PDF
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            <PlusCircle size={16} />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
