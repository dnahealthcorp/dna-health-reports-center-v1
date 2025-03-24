
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Patient } from "@/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PatientCard from "@/components/PatientCard";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPatients } from "@/services/databaseService";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
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
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('patients-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'patients' 
      }, (payload) => {
        console.log('Change received!', payload);
        fetchPatients();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  // Filter patients based on search query
  const filteredPatients = searchQuery && patients
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'nurse-pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Nurse Review</Badge>;
      case 'doctor-pending':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Doctor Review</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Patients</h1>
            <p className="text-muted-foreground mt-1">
              View and manage patient forms
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="view-mode"
                checked={viewMode === 'cards'}
                onCheckedChange={(checked) => setViewMode(checked ? 'cards' : 'table')}
              />
              <label htmlFor="view-mode">Card View</label>
            </div>
            <AddPatientDialog onAddPatient={handleAddPatient} />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search patients by name or medical record number..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
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
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.medicalRecordNumber}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(patient.status)}</TableCell>
                      <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                          View
                        </Button>
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
                <button 
                  className="text-primary"
                  onClick={() => setSearchQuery("")}
                >
                  clear the search
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Patients;
