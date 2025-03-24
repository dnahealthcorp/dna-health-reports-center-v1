
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { getPatients } from "@/lib/mockData";
import { Patient } from "@/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PatientCard from "@/components/PatientCard";
import AddPatientDialog from "@/components/AddPatientDialog";

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
  };

  // Filter patients based on search query
  const filteredPatients = searchQuery 
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

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
          <AddPatientDialog onAddPatient={handleAddPatient} />
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

        {/* Patient Grid */}
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
        ) : filteredPatients.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
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
