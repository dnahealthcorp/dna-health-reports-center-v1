
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Medication } from "@/types";
import { Textarea } from "@/components/ui/textarea";

interface MedicationEditModalProps {
  medication: Medication;
  onClose: () => void;
  onUpdate: (medication: Medication) => Promise<void>;
  onChange: (field: keyof Medication, value: string) => void;
}

export const MedicationEditModal = ({ 
  medication, 
  onClose, 
  onUpdate, 
  onChange 
}: MedicationEditModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Edit {medication.type === 'medication' ? 'Medication' : 'Supplement'}</CardTitle>
          <CardDescription>
            Update the details for {medication.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input 
                id="edit-name" 
                value={medication.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-dosage">Dosage</Label>
              <Input 
                id="edit-dosage" 
                value={medication.dosage}
                onChange={(e) => onChange("dosage", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Select 
                value={medication.type}
                onValueChange={(value: 'medication' | 'supplement') => onChange("type", value)}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="supplement">Supplement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea 
                id="edit-notes" 
                value={medication.notes || ''}
                onChange={(e) => onChange("notes", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-link">Information Link</Label>
              <Input 
                id="edit-link" 
                value={medication.link || ''}
                onChange={(e) => onChange("link", e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => onUpdate(medication)}>
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
