
import React from "react";
import { Patient } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deletePatient } from "@/services/databaseService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface PatientCardProps {
  patient: Patient;
  onDelete?: (patientId: string) => void;
  onEdit?: (patient: Patient) => void;
}

const PatientCard = ({
  patient,
  onDelete,
  onEdit
}: PatientCardProps) => {
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    // Get the current user's ID from Supabase
    const checkCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id || null;
      setCurrentUserId(userId);
      
      // Check if the user can delete this patient
      // This is a UI-level check; the RLS policy is our ultimate security
      setCanDelete(userId === patient.created_by);
    };
    
    checkCurrentUser();
  }, [patient.created_by]);

  const statusMap = {
    "in-process": {
      label: "In Process",
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    "late": {
      label: "Late",
      color: "bg-red-100 text-red-700 border-red-200"
    },
    "completed": {
      label: "Completed",
      color: "bg-green-100 text-green-700 border-green-200"
    }
  };

  const status = statusMap[patient.status] || statusMap["in-process"];
  const formattedDate = new Date(patient.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleDelete = async () => {
    try {
      // Safety check - only attempt to delete if this is the user's patient
      if (!canDelete) {
        toast({
          title: "Permission denied",
          description: "You can only delete patients that you created.",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`PatientCard: Deleting patient with ID: ${patient.id}`);
      
      // Call the deletePatient function from databaseService
      await deletePatient(patient.id);
      
      console.log(`PatientCard: Successfully deleted patient with ID: ${patient.id}`);
      
      toast({
        title: "Patient deleted",
        description: `${patient.name} has been removed from the system.`
      });
      
      // Update UI if deletion was successful
      if (onDelete) {
        onDelete(patient.id);
      }
    } catch (error) {
      console.error("PatientCard: Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Could not delete patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(patient);
    }
  };

  return <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] h-full">
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
            <span>Created by: {patient.createdByName || "Unknown"}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-5 bg-muted/30 border-t text-sm py-[12px]">
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

            {canDelete ? (
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
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                      <Trash2 size={16} className="text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You can only delete patients you created</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Link to={`/patients/${patient.id}`} className="text-primary flex items-center gap-1 font-medium ml-2">
              View
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>;
};

export default PatientCard;
