
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Medication } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface MedicationFormProps {
  type: 'medication' | 'supplement';
  onAddMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
}

export const MedicationForm = ({ type, onAddMedication }: MedicationFormProps) => {
  const { toast } = useToast();
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id'>>({
    name: '',
    dosage: '',
    frequency: '', // Keeping the field in the type but not using it in the UI
    notes: '',
    type: type,
    link: ''
  });

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Missing information",
        description: `Please enter a name and dosage for the ${type}`,
        variant: "destructive"
      });
      return;
    }

    try {
      await onAddMedication(newMedication);
      
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        notes: '',
        type: type,
        link: ''
      });
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New {type === 'medication' ? 'Medication' : 'Supplement'}</CardTitle>
        <CardDescription>
          Fill in the details to add a new {type === 'medication' ? 'medication' : 'supplement'} to the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${type}-name`}>{type === 'medication' ? 'Medication' : 'Supplement'} Name</Label>
              <Input 
                id={`${type}-name`} 
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                placeholder={`Enter ${type} name`}
              />
            </div>
            <div>
              <Label htmlFor={`${type}-dosage`}>Dosage</Label>
              <Input 
                id={`${type}-dosage`} 
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder={`e.g., ${type === 'medication' ? '500mg' : '1000mg'}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${type}-link`}>Information Link (Optional)</Label>
              <Input 
                id={`${type}-link`} 
                value={newMedication.link || ''}
                onChange={(e) => setNewMedication(prev => ({ ...prev, link: e.target.value }))}
                placeholder="URL to more information"
              />
            </div>
            <div>
              <Label htmlFor={`${type}-notes`}>Notes (Optional)</Label>
              <Input 
                id={`${type}-notes`} 
                value={newMedication.notes || ''}
                onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <Button onClick={handleAddMedication} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add {type === 'medication' ? 'Medication' : 'Supplement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
