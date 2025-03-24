
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { getMedications, addMedication, updateMedication, deleteMedication } from "@/services/databaseService";
import { Medication } from "@/types";
import { MedicationList } from "@/components/medications/MedicationList";
import { MedicationEditModal } from "@/components/medications/MedicationEditModal";
import { useToast } from "@/components/ui/use-toast";

const Medications = () => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setIsLoading(true);
    try {
      const data = await getMedications();
      setMedications(data);
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast({
        title: "Error",
        description: "Failed to load medications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsEditDialogOpen(true);
  };

  const handleDuplicateMedication = (medication: Medication) => {
    const duplicatedMedication: Omit<Medication, "id"> = {
      name: `${medication.name} (Copy)`,
      dosage: medication.dosage,
      type: medication.type,
      notes: medication.notes,
      link: medication.link
    };
    
    handleSaveMedication(duplicatedMedication as Medication);
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
      fetchMedications();
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast({
        title: "Error",
        description: "Failed to delete medication",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedMedication(null);
  };

  const handleSaveMedication = async (medication: Medication) => {
    try {
      if (medication.id) {
        // Update existing medication
        await updateMedication(medication);
        toast({
          title: "Success",
          description: "Medication updated successfully",
        });
      } else {
        // Add new medication
        await addMedication(medication);
        toast({
          title: "Success",
          description: "Medication added successfully",
        });
      }
      fetchMedications();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving medication:", error);
      toast({
        title: "Error",
        description: "Failed to save medication",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMedication = async (updatedMedication: Medication) => {
    try {
      await updateMedication(updatedMedication);
      toast({
        title: "Success",
        description: "Medication updated successfully",
      });
      fetchMedications();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating medication:", error);
      toast({
        title: "Error",
        description: "Failed to update medication",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Medications & Supplements</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
        
        {/* Display Medications Section */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Medications</h2>
        <MedicationList 
          medications={medications} 
          type="medication"
          isAdmin={true}
          onEdit={handleEditMedication}
          onDuplicate={handleDuplicateMedication}
          onDelete={handleDeleteMedication}
        />
        
        {/* Display Supplements Section */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Supplements</h2>
        <MedicationList 
          medications={medications} 
          type="supplement"
          isAdmin={true}
          onEdit={handleEditMedication}
          onDuplicate={handleDuplicateMedication}
          onDelete={handleDeleteMedication}
        />
        
        {/* Create a new Medication Edit Modal component */}
        {(isCreateDialogOpen || isEditDialogOpen) && selectedMedication && (
          <MedicationEditModal 
            medication={selectedMedication}
            onClose={handleCloseDialog}
            onUpdate={handleUpdateMedication}
            onChange={(field, value) => {
              setSelectedMedication(prev => 
                prev ? { ...prev, [field]: value } : null
              );
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Medications;
