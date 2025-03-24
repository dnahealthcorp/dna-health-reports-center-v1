import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getPatients } from "@/services";
import { Patient } from "@/types";
import Layout from "@/components/Layout";
import PatientCard from "@/components/PatientCard";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Patients = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredPatients(
        patients.filter(
          (patient) =>
            patient.name.toLowerCase().includes(term) ||
            patient.medicalRecordNumber.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = () => {
    setIsAddDialogOpen(true);
  };

  const handlePatientAdded = (newPatient: Patient) => {
    setPatients((prev) => [...prev, newPatient]);
    setIsAddDialogOpen(false);
    toast({
      title: "Success",
      description: "Patient added successfully",
    });
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handlePatientDeleted = (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    toast({
      title: "Success",
      description: "Patient deleted successfully",
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Patients</h1>
        <Button onClick={handleAddPatient}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by name or medical record number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-muted h-32 rounded-lg"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No patients found</p>
          <Button variant="outline" onClick={handleAddPatient}>
            Add your first patient
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onUpdate={handlePatientUpdated}
              onDelete={handlePatientDeleted}
            />
          ))}
        </div>
      )}

      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPatientAdded={handlePatientAdded}
      />
    </Layout>
  );
};

export default Patients;
