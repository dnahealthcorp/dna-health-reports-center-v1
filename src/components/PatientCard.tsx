import React from 'react';
import { Link } from 'react-router-dom';
import { Patient } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { deletePatient, updatePatient } from "@/services";
import { Badge } from "@/components/ui/badge";

interface PatientCardProps {
  patient: Patient;
  onUpdate: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

const PatientCard = ({ patient, onUpdate, onDelete }: PatientCardProps) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(patient.name);
  const [dateOfBirth, setDateOfBirth] = useState(patient.dateOfBirth);
  const [gender, setGender] = useState(patient.gender);
  const [medicalRecordNumber, setMedicalRecordNumber] = useState(
    patient.medicalRecordNumber
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updatedPatient = {
        ...patient,
        name,
        dateOfBirth,
        gender,
        medicalRecordNumber,
      };
      await updatePatient(updatedPatient);
      onUpdate(updatedPatient);
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deletePatient(patient.id);
      onDelete(patient.id);
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{patient.name}</CardTitle>
            <CardDescription>
              MRN: {patient.medicalRecordNumber}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Link to={`/patients/${patient.id}`}>
              <Button variant="ghost" size="icon">
                <FileText className="h-4 w-4" />
                <span className="sr-only">View Form</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleEditClick}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">DOB:</span>{" "}
            {formatDate(patient.dateOfBirth)}
          </div>
          <div>
            <span className="text-muted-foreground">Gender:</span>{" "}
            {patient.gender}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              patient.status === "completed"
                ? "outline"
                : patient.status === "nurse-pending"
                ? "secondary"
                : "default"
            }
            className="capitalize"
          >
            {patient.status.replace("-", " ")}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {patient.lastUpdated && `Updated ${formatDate(patient.lastUpdated)}`}
        </div>
      </CardFooter>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>
              Make changes to the patient's information here. Click save when
              you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateOfBirth" className="text-right">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender
              </Label>
              <Input
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medicalRecordNumber" className="text-right">
                Medical Record Number
              </Label>
              <Input
                id="medicalRecordNumber"
                value={medicalRecordNumber}
                onChange={(e) => setMedicalRecordNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {patient.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PatientCard;
