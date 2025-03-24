
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import MedicationForm from "@/components/medications/MedicationForm";
import { MedicationList } from "@/components/medications/MedicationList";
import { MedicationEditModal } from "@/components/medications/MedicationEditModal";
import { Medication, User } from "@/types";
import { Plus, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import { 
  getMedications, 
  addMedication, 
  updateMedication, 
  deleteMedication, 
  getCurrentUser 
} from "@/services/databaseService";

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medsData, userData] = await Promise.all([
          getMedications(),
          getCurrentUser()
        ]);
        
        setMedications(medsData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          variant: "destructive",
          title: "Failed to load data",
          description: "Please try refreshing the page",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const handleSaveMedication = async (medication: Medication) => {
    try {
      setMedications((prev) => [...prev, medication]);
      setShowForm(false);
      
      toast({
        title: "Success",
        description: `${medication.name} has been added`,
      });
    } catch (error) {
      console.error("Error saving medication:", error);
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "An error occurred while saving the medication",
      });
    }
  };
  
  const handleUpdateMedication = async (updatedMedication: Medication) => {
    try {
      setIsUpdating(true);
      
      await updateMedication(updatedMedication);
      
      setMedications((prev) => 
        prev.map((med) => med.id === updatedMedication.id ? updatedMedication : med)
      );
      
      setSelectedMedication(null);
      
      toast({
        title: "Success",
        description: `${updatedMedication.name} has been updated`,
      });
    } catch (error) {
      console.error("Error updating medication:", error);
      toast({
        variant: "destructive",
        title: "Failed to update",
        description: "An error occurred while updating the medication",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDuplicateMedication = (medication: Medication) => {
    const duplicate: Omit<Medication, "id"> = {
      name: `Copy of ${medication.name}`,
      dosage: medication.dosage,
      type: medication.type,
      notes: medication.notes,
      link: medication.link
    };
    
    setShowForm(true);
    // Pass the duplicated medication to the form
    const medicationForm = document.getElementById("medication-form");
    if (medicationForm) {
      // This is a hack to pass data to the form
      // @ts-ignore
      medicationForm.dataset.prefillData = JSON.stringify(duplicate);
    }
  };
  
  const handleDeleteMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      
      setMedications((prev) => prev.filter((med) => med.id !== id));
      
      toast({
        title: "Success",
        description: "Medication has been deleted",
      });
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: "An error occurred while deleting the medication",
      });
    }
  };
  
  const handleMedicationEdit = (medication: Medication) => {
    setSelectedMedication({...medication});
  };
  
  const handleEditChange = (field: keyof Medication, value: string) => {
    if (selectedMedication) {
      setSelectedMedication({
        ...selectedMedication,
        [field]: value
      });
    }
  };
  
  const isAdmin = currentUser?.role === "admin";
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Medications & Supplements</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medications & Supplements</h1>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      
      {showForm ? (
        <div className="mb-8" id="medication-form">
          <MedicationForm
            onSave={handleSaveMedication}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <Tabs defaultValue="medications" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="medications">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <MedicationList
                  medications={medications}
                  type="medication"
                  isAdmin={isAdmin}
                  onEdit={handleMedicationEdit}
                  onDuplicate={handleDuplicateMedication}
                  onDelete={handleDeleteMedication}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="supplements">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Supplements</CardTitle>
              </CardHeader>
              <CardContent>
                <MedicationList
                  medications={medications}
                  type="supplement"
                  isAdmin={isAdmin}
                  onEdit={handleMedicationEdit}
                  onDuplicate={handleDuplicateMedication}
                  onDelete={handleDeleteMedication}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {selectedMedication && (
        <MedicationEditModal
          medication={selectedMedication}
          onClose={() => setSelectedMedication(null)}
          onUpdate={handleUpdateMedication}
          onChange={handleEditChange}
        />
      )}
    </div>
  );
};

export default Medications;
