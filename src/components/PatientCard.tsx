
import React from "react";
import { Patient } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deletePatient } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";

interface PatientCardProps {
  patient: Patient;
  onDelete?: (patientId: string) => void;
  onEdit?: (patient: Patient) => void;
}

const PatientCard = ({ patient, onDelete, onEdit }: PatientCardProps) => {
  const { toast } = useToast();
  const statusMap = {
    "nurse-pending": {
      label: "Nurse Review",
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    "doctor-pending": {
      label: "Doctor Review",
      color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    "completed": {
      label: "Completed",
      color: "bg-green-100 text-green-700 border-green-200"
    }
  };
  
  const status = statusMap[patient.status];
  const formattedDate = new Date(patient.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleDelete = async () => {
    try {
      await deletePatient(patient.id);
      toast({
        title: "Patient deleted",
        description: `${patient.name} has been removed from the system.`,
      });
      if (onDelete) {
        onDelete(patient.id);
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Could not delete patient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(patient);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] h-full">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">
                MRN: {patient.medicalRecordNumber}
              </p>
            </div>
            <Badge className={cn("font-normal", status.color)}>
              {status.label}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground gap-3">
            <span>{patient.gender}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
            <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 px-5 bg-muted/30 border-t text-sm">
          <span className="text-muted-foreground">Updated {formattedDate}</span>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleEdit}>
                    <Edit size={16} className="text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit patient</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {patient.name}'s record? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Link to={`/patients/${patient.id}`} className="text-primary flex items-center gap-1 font-medium ml-2">
              View
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientCard;
