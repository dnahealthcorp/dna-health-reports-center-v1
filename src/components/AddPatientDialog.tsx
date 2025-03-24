
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Patient } from "@/types";
import { addPatient, generateMRN } from "@/services/databaseService";

interface AddPatientDialogProps {
  onAddPatient: (patient: Patient) => void;
}

const AddPatientDialog = ({ onAddPatient }: AddPatientDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  
  const [patientData, setPatientData] = useState({
    name: "",
    gender: "",
    medicalRecordNumber: generateMRN()
  });

  const handleChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!patientData.name) {
      toast({
        title: "Missing information",
        description: "Please enter the patient's name",
        variant: "destructive"
      });
      return;
    }

    if (!patientData.gender) {
      toast({
        title: "Missing information",
        description: "Please select the patient's gender",
        variant: "destructive"
      });
      return;
    }

    if (!date) {
      toast({
        title: "Missing information",
        description: "Please select the patient's date of birth",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format date as ISO string yyyy-MM-dd
      const formattedDate = date.toISOString().split('T')[0];
      
      const newPatient: Patient = {
        id: "", // Will be set by addPatient
        name: patientData.name,
        dateOfBirth: formattedDate,
        gender: patientData.gender,
        medicalRecordNumber: patientData.medicalRecordNumber,
        status: "nurse-pending",
        lastUpdated: new Date().toISOString()
      };

      // Add patient to database
      const addedPatient = await addPatient(newPatient);
      
      setOpen(false);
      onAddPatient(addedPatient);
      
      // Reset form
      setPatientData({
        name: "",
        gender: "",
        medicalRecordNumber: generateMRN()
      });
      setDate(undefined);
      
      toast({
        title: "Patient added",
        description: `${addedPatient.name} has been added successfully`
      });
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Failed to add patient",
        description: "There was an error adding the patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Patient</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's information below
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
              value={patientData.medicalRecordNumber}
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
