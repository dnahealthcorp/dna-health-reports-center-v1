
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ExternalLink } from "lucide-react";
import { Medication, PatientFormData } from "@/types";
import { useState, useEffect } from "react";

interface SupplementsTabProps {
  formData: PatientFormData;
  medications: Medication[];
  handleAddSupplement: () => void;
  handleRemoveSupplement: (index: number) => void;
  handleSupplementChange: (index: number, field: string, value: string) => void;
  canEdit: boolean;
}

export const SupplementsTab = ({
  formData,
  medications,
  handleAddSupplement,
  handleRemoveSupplement,
  handleSupplementChange,
  canEdit
}: SupplementsTabProps) => {
  const [supplements, setSupplements] = useState<Medication[]>([]);

  // Filter medications to only include supplements
  useEffect(() => {
    const fetchSupplements = async () => {
      const filteredSupplements = medications.filter(med => med.type === 'supplement');
      setSupplements(filteredSupplements);
    };
    
    fetchSupplements();
  }, [medications]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplements</CardTitle>
        <CardDescription>
          Manage patient's supplements and recommended dosages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formData.supplements && formData.supplements.length > 0 ? (
          <div className="space-y-6">
            {formData.supplements.map((supplement, index) => (
              <div key={supplement.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                <div className="space-y-2">
                  <Label htmlFor={`supplement-${index}-name`}>Supplement</Label>
                  <Select 
                    value={supplement.supplementId}
                    onValueChange={(value) => handleSupplementChange(index, "supplementId", value)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id={`supplement-${index}-name`}>
                      <SelectValue placeholder="Select supplement" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplements.map((supp) => (
                        <SelectItem key={supp.id} value={supp.id}>
                          {supp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`supplement-${index}-dosage`}>Dosage</Label>
                  <Input 
                    id={`supplement-${index}-dosage`}
                    value={supplement.dosage}
                    onChange={(e) => handleSupplementChange(index, "dosage", e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`supplement-${index}-source`}>Source/Brand</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id={`supplement-${index}-source`}
                      value={supplement.source || ""}
                      onChange={(e) => handleSupplementChange(index, "source", e.target.value)}
                      disabled={!canEdit}
                    />
                    {canEdit && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSupplement(index)}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Show supplement information link if available */}
                {supplement.supplementId && (
                  <div className="col-span-full mt-2">
                    {supplements.find(s => s.id === supplement.supplementId)?.link && (
                      <a 
                        href={supplements.find(s => s.id === supplement.supplementId)?.link || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-sm flex items-center gap-1"
                      >
                        <ExternalLink size={14} />
                        View supplement information
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No supplements added
          </div>
        )}
        
        {canEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSupplement}
            className="mt-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Supplement
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
