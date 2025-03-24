import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Medication } from "@/types";
import { Save, Loader2 } from "lucide-react";
import { addMedication, updateMedication } from "@/services";

type MedicationFormProps = {
  medication?: Medication;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
};

const MedicationForm = ({ medication, onSave, onCancel }: MedicationFormProps) => {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState<"medication" | "supplement">("medication");
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      setNotes(medication.notes || "");
      setLink(medication.link || "");
      setType(medication.type);
    }
  }, [medication]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Medication name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const medicationData: Medication = {
        id: medication?.id || "",
        name,
        dosage,
        notes: notes || undefined,
        link: link || undefined,
        type,
      };

      // Use database service to save medication
      if (medication?.id) {
        await updateMedication(medicationData);
        toast({
          title: "Success",
          description: "Medication updated successfully",
        });
      } else {
        const newMedication = await addMedication(medicationData);
        medicationData.id = newMedication.id;
        toast({
          title: "Success",
          description: "Medication added successfully",
        });
      }

      onSave(medicationData);
    } catch (error) {
      console.error("Error saving medication:", error);
      toast({
        title: "Error",
        description: "Failed to save medication",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{medication ? "Edit" : "Add"} {type === "medication" ? "Medication" : "Supplement"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as "medication" | "supplement")}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="supplement">Supplement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medication name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Enter dosage information"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Reference Link (Optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter reference link"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save {type === "medication" ? "Medication" : "Supplement"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MedicationForm;
