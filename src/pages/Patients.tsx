
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Patient } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, Eye, ArrowUp, ArrowDown } from "lucide-react";
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

// Sorting type definitions
type SortField = 'lastUpdated' | 'status' | 'name';
type SortDirection = 'asc' | 'desc';

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // Add sorting state
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const patientsData = await getPatients();
      // Apply sorting to the fetched data
      setPatients(sortPatients(patientsData));
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

  useEffect(() => {
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
  
  // Sort patients whenever sort criteria changes
  useEffect(() => {
    setPatients(sortPatients(patients));
  }, [sortField, sortDirection]);

  // Sort patients function
  const sortPatients = (patientsToSort: Patient[]) => {
    return [...patientsToSort].sort((a, b) => {
      switch (sortField) {
        case 'status':
          const statusOrder = { 'completed': 0, 'in-process': 1, 'late': 2 };
          const statusA = a.status as keyof typeof statusOrder;
          const statusB = b.status as keyof typeof statusOrder;
          const comparison = statusOrder[statusA] - statusOrder[statusB];
          return sortDirection === 'asc' ? comparison : -comparison;
        
        case 'name':
          const nameComparison = a.name.localeCompare(b.name);
          return sortDirection === 'asc' ? nameComparison : -nameComparison;
          
        case 'lastUpdated':
        default:
          const dateA = new Date(a.lastUpdated).getTime();
          const dateB = new Date(b.lastUpdated).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  };

  // Toggle sort direction and field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort direction icon
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp size={14} className="inline ml-1" /> 
      : <ArrowDown size={14} className="inline ml-1" />;
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    toast({
      title: "Patient added",
      description: `${newPatient.name} has been added successfully with MRN: ${newPatient.medicalRecordNumber}`
    });
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
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      Name {getSortIcon('name')}
                    </TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('lastUpdated')}>
                      Last Updated {getSortIcon('lastUpdated')}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map(patient => <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.medicalRecordNumber}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.createdByName || "Unknown"}</TableCell>
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
