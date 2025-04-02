
import { useState, useEffect } from "react";
import { FormInstance, FoodIntoleranceData } from "@/types/multiforms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateFormStatus, getFoodIntoleranceData, saveFoodIntoleranceData } from "@/services/formService";
import { Printer, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FoodIntoleranceFormProps {
  form: FormInstance;
}

const FoodIntoleranceForm = ({ form }: FoodIntoleranceFormProps) => {
  const [formData, setFormData] = useState<FoodIntoleranceData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const data = await getFoodIntoleranceData(form.id);
        setFormData(data);
      } catch (error) {
        console.error("Error loading form data:", error);
        toast({
          title: "Error",
          description: "Could not load form data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [form.id, toast]);

  const handleSave = async () => {
    if (!formData) return;
    
    setIsSaving(true);
    
    try {
      // Save the form data
      await saveFoodIntoleranceData(form.id, formData);
      
      // Update status to in-process if it's currently draft
      if (form.status === 'draft') {
        await updateFormStatus(form.id, 'in-process');
      }
      
      toast({
        title: "Form Saved",
        description: "Food intolerance form has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Could not save form",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FoodIntoleranceData, value: any) => {
    if (!formData) return;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p>Loading form data...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="space-y-6">
        <p>No form data found. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Food Intolerance Test</h2>
          <p className="text-muted-foreground">
            Status: <span className="capitalize">{form.status}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input 
                value={form.patient?.name || ""}
                readOnly
              />
            </div>
            <div>
              <Label>Medical Record Number</Label>
              <Input 
                value={form.patient?.medicalRecordNumber || ""}
                readOnly
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="symptoms">Patient Symptoms</Label>
              <Textarea 
                id="symptoms"
                value={formData.symptoms ? JSON.stringify(formData.symptoms) : ""}
                onChange={(e) => handleInputChange("symptoms", JSON.parse(e.target.value || "[]"))}
                placeholder="Enter symptoms as JSON array"
                className="h-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter symptoms as JSON array: ["symptom1", "symptom2"]
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Food Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tested_foods">Tested Foods</Label>
              <Textarea 
                id="tested_foods"
                value={formData.tested_foods ? JSON.stringify(formData.tested_foods) : ""}
                onChange={(e) => handleInputChange("tested_foods", JSON.parse(e.target.value || "[]"))}
                placeholder="Enter tested foods as JSON array"
                className="h-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter tested foods as JSON array: ["food1", "food2"]
              </p>
            </div>

            <div>
              <Label htmlFor="test_results">Test Results</Label>
              <Textarea 
                id="test_results"
                value={formData.test_results ? JSON.stringify(formData.test_results) : ""}
                onChange={(e) => handleInputChange("test_results", JSON.parse(e.target.value || "{}"))}
                placeholder="Enter test results as JSON object"
                className="h-24"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter test results as JSON object: {"{'food1': 'positive', 'food2': 'negative'}"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recommendations">Dietary Recommendations</Label>
              <Textarea 
                id="recommendations"
                value={formData.recommendations || ""}
                onChange={(e) => handleInputChange("recommendations", e.target.value)}
                placeholder="Enter dietary recommendations"
                className="h-24"
              />
            </div>

            <div>
              <Label htmlFor="followup_plan">Follow-up Plan</Label>
              <Textarea 
                id="followup_plan"
                value={formData.followup_plan || ""}
                onChange={(e) => handleInputChange("followup_plan", e.target.value)}
                placeholder="Enter follow-up plan"
                className="h-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodIntoleranceForm;
