
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, ArrowUpRight } from "lucide-react";
import PatientCard from "@/components/PatientCard";
import AddPatientDialog from "@/components/AddPatientDialog";
import EditPatientDialog from "@/components/EditPatientDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPatients, deletePatient } from "@/services/databaseService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
import { Patient } from "@/types";

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await getPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({
          title: "Error loading patients",
          description: "Could not load patients from the database. Please check your connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();

    // Subscribe to realtime changes
    const channel = supabase.channel('patients-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'patients'
    }, payload => {
      console.log('Change received!', payload);
      fetchPatients();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  const handleAddPatient = (newPatient: Patient) => {
    // The new patient should have In-review as default status
    const patientWithDefaultStatus = {
      ...newPatient,
      status: "nurse-pending" // This will be displayed as "In-review"
    };
    setPatients(prev => [patientWithDefaultStatus, ...prev]);
  };
  
  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      toast({
        title: "Patient deleted",
        description: "The patient record has been deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error deleting patient",
        description: "Could not delete the patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingPatientId(null);
    }
  };
  
  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(patient => patient.id === updatedPatient.id ? updatedPatient : patient));
    setEditingPatient(null);
  };
  
  const openDeleteDialog = (patientId: string) => {
    setDeletingPatientId(patientId);
    setIsDeleteDialogOpen(true);
  };

  // Filter patients based on search query
  const filteredPatients = searchQuery && patients ? patients.filter(patient => patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase())) : patients;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nurse-pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In-review</Badge>;
      case 'doctor-pending':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Doctor Review</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-left">Patients</h1>
          <p className="text-muted-foreground mt-1">
            View and manage patient forms
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="view-mode" checked={viewMode === 'cards'} onCheckedChange={checked => setViewMode(checked ? 'cards' : 'table')} />
            <label htmlFor="view-mode">Card View</label>
          </div>
          <AddPatientDialog onAddPatient={handleAddPatient} />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder="Search patients by name or medical record number..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {/* Patient Display */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-lg border border-border p-5 h-40 animate-pulse">
              <div className="h-5 bg-muted/50 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted/50 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-muted/50 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredPatients && filteredPatients.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map(patient => (
              <PatientCard 
                key={patient.id} 
                patient={patient} 
                onDelete={() => openDeleteDialog(patient.id)} 
                onEdit={handleEditPatient} 
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MRN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map(patient => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.medicalRecordNumber}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEditPatient(patient)} title="Edit patient">
                          <Edit size={18} />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => openDeleteDialog(patient.id)} title="Delete patient">
                          <Trash2 size={18} />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => navigate(`/patients/${patient.id}`)} title="View patient">
                          <ArrowUpRight size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No patients found</p>
          {searchQuery && (
            <p className="text-sm">
              Try adjusting your search or{" "}
              <button className="text-primary" onClick={() => setSearchQuery("")}>
                clear the search
              </button>
            </p>
          )}
        </div>
      )}
      
      {/* Edit Patient Dialog */}
      <EditPatientDialog 
        patient={editingPatient} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        onUpdate={handleUpdatePatient} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this patient record? This action cannot be undone.
              All patient data, forms, and reports will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingPatientId && handleDeletePatient(deletingPatientId)} 
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Patients;
