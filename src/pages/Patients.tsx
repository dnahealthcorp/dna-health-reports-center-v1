import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Patient } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, Eye } from "lucide-react";
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

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
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
    setPatients(prev => [newPatient, ...prev]);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await deletePatient(patientId);
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      toast({
        title: "Patient deleted",
        description: "Patient record has been removed successfully",
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive"
      });
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

  const filteredPatients = searchQuery && patients ? patients.filter(patient => patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase())) : patients;

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

  return <Layout>
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

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search patients by name or medical record number..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {isLoading ? <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => <div key={index} className="rounded-lg border border-border p-5 h-40 animate-pulse">
                <div className="h-5 bg-muted/50 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted/50 rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-muted/50 rounded w-full"></div>
              </div>)}
          </div> : filteredPatients && filteredPatients.length > 0 ? viewMode === 'cards' ? <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map(patient => <PatientCard key={patient.id} patient={patient} onDelete={handleDeletePatient} onEdit={handleEditPatient} />)}
            </div> : <div className="rounded-md border">
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
                  {filteredPatients.map(patient => <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.medicalRecordNumber}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(patient.status)}</TableCell>
                      <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleEditPatient(patient)}>
                            <Edit size={16} />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => navigate(`/patients/${patient.id}`)}>
                            <Eye size={16} />
                            <span className="sr-only">View</span>
                          </Button>
                          
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
                                  onClick={() => handleDeletePatient(patient.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div> : <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No patients found</p>
            {searchQuery && <p className="text-sm">
                Try adjusting your search or{" "}
                <button className="text-primary" onClick={() => setSearchQuery("")}>
                  clear the search
                </button>
              </p>}
          </div>}
        
        <EditPatientDialog patient={editingPatient} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onUpdate={handleUpdatePatient} />
      </div>
    </Layout>;
};

export default Patients;
