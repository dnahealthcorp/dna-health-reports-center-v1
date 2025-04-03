
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { Medication, PatientFormData } from "@/types";

interface MedicationsTabProps {
  formData: PatientFormData;
  medications: Medication[];
  handleAddMedication: () => void;
  handleRemoveMedication: (index: number) => void;
  handleMedicationChange: (index: number, field: string, value: string) => void;
  canEditNurseSection: boolean;
}

export const MedicationsTab = ({
  formData,
  medications,
  handleAddMedication,
  handleRemoveMedication,
  handleMedicationChange,
  canEditNurseSection
}: MedicationsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medications</CardTitle>
        <CardDescription>
          Manage patient's medications and dosages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formData.medications.length > 0 ? (
          <div className="space-y-6">
            {formData.medications.map((med, index) => (
              <div key={med.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                <div className="space-y-2">
                  <Label htmlFor={`med-${index}-name`}>Medication</Label>
                  <Select 
                    value={med.medicationId}
                    onValueChange={(value) => handleMedicationChange(index, "medicationId", value)}
                    disabled={!canEditNurseSection}
                  >
                    <SelectTrigger id={`med-${index}-name`}>
                      <SelectValue placeholder="Select medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.map((medication) => (
                        <SelectItem key={medication.id} value={medication.id}>
                          {medication.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`med-${index}-dosage`}>Dosage</Label>
                  <Input 
                    id={`med-${index}-dosage`}
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                    disabled={!canEditNurseSection}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`med-${index}-notes`}>Notes</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id={`med-${index}-notes`}
                      value={med.notes || ""}
                      onChange={(e) => handleMedicationChange(index, "notes", e.target.value)}
                      disabled={!canEditNurseSection}
                    />
                    {canEditNurseSection && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMedication(index)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Removed the medication information links as requested */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No medications added
          </div>
        )}
        
        {canEditNurseSection && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddMedication}
            className="mt-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
