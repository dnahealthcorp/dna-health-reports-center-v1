import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getMedications, addMedication, updateMedication } from "@/services/databaseService";
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
        
        {/* Medication List Component */}
        <MedicationList 
          medications={medications} 
          onEdit={handleEditMedication}
        />
        
        {/* Add/Edit Medication Dialog */}
        <MedicationEditModal 
          isOpen={isCreateDialogOpen || isEditDialogOpen}
          onClose={handleCloseDialog}
          medication={selectedMedication}
          onSave={handleSaveMedication}
        />
      </div>
    </Layout>
  );
};

export default Medications;
