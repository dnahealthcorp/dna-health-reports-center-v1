
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Patient } from "@/types";
import { Switch } from "@/components/ui/switch";
import AddPatientDialog from "@/components/AddPatientDialog";
import EditPatientDialog from "@/components/EditPatientDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPatients, deletePatient } from "@/services/databaseService";

// Import the new components
import SearchControls from "@/components/patients/SearchControls";
import PatientTable from "@/components/patients/PatientTable";
import PatientCardList from "@/components/patients/PatientCardList";
import EmptyPatientState from "@/components/patients/EmptyPatientState";

type SortField = 'lastUpdated' | 'status' | 'name';
type SortDirection = 'asc' | 'desc';

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      console.log("Patients: Fetching patients from database");
      const patientsData = await getPatients();
      console.log(`Patients: Retrieved ${patientsData.length} patients`);
      setPatients(sortPatients(patientsData));
    } catch (error) {
      console.error("Patients: Error fetching patients:", error);
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
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data.session?.user?.id || null);
    };
    
    getCurrentUser();
    fetchPatients();

    const channel = supabase.channel('patients-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patients'
      }, payload => {
        console.log('Patients: Realtime change detected!', payload);
        fetchPatients(); // Refetch on any database changes
      })
      .subscribe();
    
    console.log("Patients: Subscribed to realtime changes");
    
    return () => {
      console.log("Patients: Cleanup - removing realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  useEffect(() => {
    setPatients(sortPatients(patients));
  }, [sortField, sortDirection]);

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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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
      console.log(`Patients: Attempting to delete patient with ID: ${patientId}`);
      
      const patientToDelete = patients.find(p => p.id === patientId);
      
      if (patientToDelete && patientToDelete.created_by && patientToDelete.created_by !== currentUserId) {
        toast({
          title: "Permission denied",
          description: "You can only delete patients that you created.",
          variant: "destructive"
        });
        return;
      }
      
      await deletePatient(patientId);
      
      console.log(`Patients: Successfully deleted patient with ID: ${patientId}`);
      
      setPatients(prev => prev.filter(patient => patient.id !== patientId));
      
      toast({
        title: "Patient deleted",
        description: "Patient record has been removed successfully",
      });
      
      fetchPatients();
    } catch (error) {
      console.error("Patients: Error deleting patient:", error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive"
      });
      
      fetchPatients();
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

  const filteredPatients = searchQuery && patients ? patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) : patients;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Layout>
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
              <Switch 
                id="view-mode" 
                checked={viewMode === 'cards'} 
                onCheckedChange={checked => setViewMode(checked ? 'cards' : 'table')}
              />
              <label htmlFor="view-mode">Card View</label>
            </div>
            <AddPatientDialog onAddPatient={handleAddPatient} />
          </div>
        </div>

        <SearchControls 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
        />

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
            <PatientCardList 
              patients={filteredPatients}
              onDelete={handleDeletePatient}
              onEdit={handleEditPatient}
            />
          ) : (
            <PatientTable
              patients={filteredPatients}
              sortField={sortField}
              sortDirection={sortDirection}
              currentUserId={currentUserId}
              onSort={handleSort}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          )
        ) : (
          <EmptyPatientState 
            searchQuery={searchQuery} 
            onClearSearch={handleClearSearch} 
          />
        )}
        
        <EditPatientDialog 
          patient={editingPatient} 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
          onUpdate={handleUpdatePatient} 
        />
      </div>
    </Layout>
  );
};

export default Patients;
