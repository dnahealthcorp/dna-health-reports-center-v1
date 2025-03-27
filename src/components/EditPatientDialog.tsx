
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types";
import { updatePatient } from "@/services/databaseService";

interface EditPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (patient: Patient) => void;
}

const EditPatientDialog = ({ patient, open, onOpenChange, onUpdate }: EditPatientDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState<Partial<Patient>>({
    name: "",
    dateOfBirth: "",
    gender: ""
  });

  useEffect(() => {
    if (patient) {
      setPatientData({
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender
      });
    }
  }, [patient, open]);

  const handleChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!patient) return;
    
    // Validate
    if (!patientData.name || !patientData.dateOfBirth || !patientData.gender) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preserve the original status
      const updatedPatient: Patient = {
        ...patient,
        name: patientData.name || patient.name,
        dateOfBirth: patientData.dateOfBirth || patient.dateOfBirth,
        gender: patientData.gender || patient.gender,
        lastUpdated: new Date().toISOString()
      };

      // Update patient in database
      await updatePatient(updatedPatient);

      setIsLoading(false);
      onUpdate(updatedPatient);
      onOpenChange(false);
      
      toast({
        title: "Patient updated",
        description: `${updatedPatient.name}'s information has been updated successfully`
      });
    } catch (error) {
      console.error("Error updating patient:", error);
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to update patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Update the patient's information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input 
              id="edit-name" 
              value={patientData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter patient name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-dob">Date of Birth</Label>
            <Input 
              id="edit-dob" 
              type="date"
              value={patientData.dateOfBirth || ""}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-gender">Gender</Label>
            <Select 
              value={patientData.gender || ""}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger id="edit-gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-mrn">Medical Record Number</Label>
            <Input 
              id="edit-mrn" 
              value={patient?.medicalRecordNumber || ""}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
