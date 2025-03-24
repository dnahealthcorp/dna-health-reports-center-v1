
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Patient } from "@/types";
import { UserPlus } from "lucide-react";
import * as databaseService from "@/services/databaseService";

interface AddPatientDialogProps {
  onAddPatient: (patient: Patient) => void;
}

const AddPatientDialog = ({ onAddPatient }: AddPatientDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [patientData, setPatientData] = useState({
    name: "",
    dateOfBirth: "",
    gender: ""
  });

  const handleChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
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
      // Auto-generate MRN
      const medicalRecordNumber = databaseService.generateMRN();

      // Create new patient
      const newPatient: Patient = {
        id: `p${Date.now()}`,
        name: patientData.name,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        medicalRecordNumber,
        lastUpdated: new Date().toISOString(),
        status: 'nurse-pending'
      };

      // Save patient to database
      await databaseService.addPatient(newPatient);

      // Initialize form data for the new patient
      await databaseService.getPatientFormData(newPatient.id);

      setIsLoading(false);
      onAddPatient(newPatient);
      setPatientData({
        name: "",
        dateOfBirth: "",
        gender: ""
      });
      setOpen(false);
      
      toast({
        title: "Patient added",
        description: `${newPatient.name} has been added successfully with MRN: ${medicalRecordNumber}`
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus size={16} />
          <span>Add New Patient</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient details to create a new record
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={patientData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter patient name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input 
              id="dob" 
              type="date"
              value={patientData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={patientData.gender}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger id="gender">
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
            <Label htmlFor="mrn">Medical Record Number</Label>
            <Input 
              id="mrn" 
              value="Will be auto-generated"
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;
