
import { Patient } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Edit, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SortField = 'lastUpdated' | 'status' | 'name';
type SortDirection = 'asc' | 'desc';

interface PatientTableProps {
  patients: Patient[];
  sortField: SortField;
  sortDirection: SortDirection;
  currentUserId: string | null;
  onSort: (field: SortField) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
}

const PatientTable = ({
  patients,
  sortField,
  sortDirection,
  currentUserId,
  onSort,
  onEdit,
  onDelete
}: PatientTableProps) => {
  const navigate = useNavigate();

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp size={14} className="inline ml-1" /> 
      : <ArrowDown size={14} className="inline ml-1" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-process':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Process</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Late</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Process</Badge>;
    }
  };

  const canDeletePatient = (patientCreatedBy: string | undefined | null): boolean => {
    if (!currentUserId || !patientCreatedBy) return false;
    return currentUserId === patientCreatedBy;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MRN</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort('name')}>
              Name {getSortIcon('name')}
            </TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort('status')}>
              Status {getSortIcon('status')}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => onSort('lastUpdated')}>
              Last Updated {getSortIcon('lastUpdated')}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map(patient => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">{patient.medicalRecordNumber}</TableCell>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.createdByName || "Unknown"}</TableCell>
              <TableCell>{getStatusBadge(patient.status)}</TableCell>
              <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => onEdit(patient)}>
                    <Edit size={16} />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => navigate(`/patients/${patient.id}`)}>
                    <Eye size={16} />
                    <span className="sr-only">View</span>
                  </Button>
                  
                  {canDeletePatient(patient.created_by) ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
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
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600" 
                            onClick={() => onDelete(patient.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="outline" disabled className="text-muted-foreground">
                            <Trash2 size={16} />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You can only delete patients you created</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientTable;
