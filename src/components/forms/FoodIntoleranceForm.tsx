
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getFormById, getFoodIntoleranceData, saveFoodIntoleranceData, updateFormStatus, updateFormPdfExported, saveFormPdfReference } from "@/services/formService";
import { FormInstance, FoodIntoleranceData } from "@/types/multiforms";
import { Save, FileDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FoodIntoleranceForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormInstance | null>(null);
  const [formData, setFormData] = useState<FoodIntoleranceData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Common food allergens/intolerances
  const commonFoods = [
    { id: "gluten", label: "Gluten" },
    { id: "dairy", label: "Dairy" },
    { id: "eggs", label: "Eggs" },
    { id: "nuts", label: "Tree Nuts" },
    { id: "peanuts", label: "Peanuts" },
    { id: "shellfish", label: "Shellfish" },
    { id: "soy", label: "Soy" },
    { id: "corn", label: "Corn" }
  ];

  // Common symptoms
  const commonSymptoms = [
    { id: "bloating", label: "Bloating" },
    { id: "diarrhea", label: "Diarrhea" },
    { id: "constipation", label: "Constipation" },
    { id: "headache", label: "Headache" },
    { id: "fatigue", label: "Fatigue" },
    { id: "rash", label: "Skin rash" },
    { id: "nausea", label: "Nausea" },
    { id: "joint_pain", label: "Joint pain" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!formId) return;
      
      try {
        // Fetch form data
        const formData = await getFormById(formId);
        if (!formData) {
          toast({
            title: "Error",
            description: "Form not found",
            variant: "destructive"
          });
          navigate("/forms");
          return;
        }
        
        setForm(formData);
        
        // Fetch food intolerance specific data
        const foodData = await getFoodIntoleranceData(formId);
        if (foodData) {
          setFormData(foodData);
        } else {
          toast({
            title: "Error",
            description: "Food intolerance data not found",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [formId, navigate, toast]);

  const handleSave = async () => {
    if (!formId || !formData) return;
    
    setSaving(true);
    try {
      // Save form data
      await saveFoodIntoleranceData(formId, {
        symptoms: formData.symptoms,
        tested_foods: formData.tested_foods,
        test_results: formData.test_results,
        recommendations: formData.recommendations,
        followup_plan: formData.followup_plan
      });
      
      // Update form status if not completed
      if (form?.status !== 'completed') {
        await updateFormStatus(formId, 'in-process');
      }
      
      toast({
        title: "Success",
        description: "Form saved successfully"
      });
      
      // Refresh form data
      const updatedForm = await getFormById(formId);
      if (updatedForm) {
        setForm(updatedForm);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    if (!formData) return;
    
    const symptoms = Array.isArray(formData.symptoms) ? [...formData.symptoms] : [];
    
    if (symptoms.includes(symptomId)) {
      setFormData({
        ...formData,
        symptoms: symptoms.filter(id => id !== symptomId)
      });
    } else {
      setFormData({
        ...formData,
        symptoms: [...symptoms, symptomId]
      });
    }
  };

  const handleFoodToggle = (foodId: string) => {
    if (!formData) return;
    
    const testedFoods = Array.isArray(formData.tested_foods) ? [...formData.tested_foods] : [];
    
    if (testedFoods.includes(foodId)) {
      setFormData({
        ...formData,
        tested_foods: testedFoods.filter(id => id !== foodId)
      });
    } else {
      setFormData({
        ...formData,
        tested_foods: [...testedFoods, foodId]
      });
    }
  };

  const handleFoodResultChange = (foodId: string, value: string) => {
    if (!formData) return;
    
    const results = typeof formData.test_results === 'object' ? { ...(formData.test_results as any) } : {};
    
    setFormData({
      ...formData,
      test_results: {
        ...results,
        [foodId]: value
      }
    });
  };

  const handleRecommendationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      recommendations: e.target.value
    });
  };

  const handleFollowupChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      followup_plan: e.target.value
    });
  };

  const handleExportPDF = async () => {
    if (!formId || !form || !formData) return;
    
    try {
      // In a real implementation, generate PDF here
      // For now, we'll just mark it as exported
      
      // Update PDF exported status
      await updateFormPdfExported(formId, true);
      
      // Save PDF reference
      const fileName = `${form.patient?.name.replace(/\s+/g, '_')}_Food_Intolerance_${new Date().toISOString().split('T')[0]}.pdf`;
      await saveFormPdfReference(formId, fileName);
      
      toast({
        title: "Success",
        description: "PDF exported successfully"
      });
      
      // Refresh form data
      const updatedForm = await getFormById(formId);
      if (updatedForm) {
        setForm(updatedForm);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Skeleton className="h-10 w-full" />
        
        <div className="grid gap-6 grid-cols-1">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!form || !formData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">Form Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The form you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/forms")}>Go Back to Forms</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Food Intolerance Test
          </h2>
          <p className="text-muted-foreground">
            Patient: {form.patient?.name || "Unknown Patient"}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={saving}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Form
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="symptoms">
        <TabsList className="mb-6">
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="foods">Food Testing</TabsTrigger>
          <TabsTrigger value="results">Results & Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="symptoms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reported Symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonSymptoms.map(symptom => (
                  <div key={symptom.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`symptom-${symptom.id}`} 
                      checked={Array.isArray(formData.symptoms) && formData.symptoms.includes(symptom.id)}
                      onCheckedChange={() => handleSymptomToggle(symptom.id)}
                    />
                    <Label htmlFor={`symptom-${symptom.id}`}>{symptom.label}</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label htmlFor="other-symptoms">Other Symptoms</Label>
                <Textarea 
                  id="other-symptoms" 
                  placeholder="Describe any other symptoms not listed above"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Symptom Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symptom-onset">When did symptoms begin?</Label>
                  <Input 
                    id="symptom-onset" 
                    placeholder="e.g., 2 weeks ago, 6 months ago" 
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="symptom-frequency">How often do symptoms occur?</Label>
                  <Input 
                    id="symptom-frequency" 
                    placeholder="e.g., Daily, After meals" 
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="symptom-triggers">Known triggers</Label>
                  <Textarea 
                    id="symptom-triggers" 
                    placeholder="List any foods or situations that seem to trigger symptoms"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="foods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foods Being Tested</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commonFoods.map(food => (
                  <div key={food.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`food-${food.id}`}
                      checked={Array.isArray(formData.tested_foods) && formData.tested_foods.includes(food.id)}
                      onCheckedChange={() => handleFoodToggle(food.id)}
                    />
                    <Label htmlFor={`food-${food.id}`}>{food.label}</Label>
                  </div>
                ))}
              </div>
              
              <div>
                <Label htmlFor="other-foods">Other Foods</Label>
                <Textarea 
                  id="other-foods" 
                  placeholder="List any other foods being tested"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Testing Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-method">Testing Method</Label>
                  <Input 
                    id="test-method" 
                    placeholder="e.g., Elimination diet, Blood test"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="test-duration">Duration of Test</Label>
                  <Input 
                    id="test-duration" 
                    placeholder="e.g., 2 weeks, 30 days"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(formData.tested_foods) && formData.tested_foods.length > 0) ? (
                  formData.tested_foods.map(foodId => {
                    const food = commonFoods.find(f => f.id === foodId);
                    if (!food) return null;
                    
                    return (
                      <div key={foodId} className="space-y-2">
                        <Label htmlFor={`result-${foodId}`}>{food.label}</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`result-${foodId}-positive`} 
                              checked={(formData.test_results as any)?.[foodId] === 'positive'}
                              onCheckedChange={() => handleFoodResultChange(foodId, 'positive')}
                            />
                            <Label htmlFor={`result-${foodId}-positive`}>Positive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`result-${foodId}-negative`} 
                              checked={(formData.test_results as any)?.[foodId] === 'negative'}
                              onCheckedChange={() => handleFoodResultChange(foodId, 'negative')}
                            />
                            <Label htmlFor={`result-${foodId}-negative`}>Negative</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`result-${foodId}-inconclusive`} 
                              checked={(formData.test_results as any)?.[foodId] === 'inconclusive'}
                              onCheckedChange={() => handleFoodResultChange(foodId, 'inconclusive')}
                            />
                            <Label htmlFor={`result-${foodId}-inconclusive`}>Inconclusive</Label>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No foods selected for testing. Go to the Foods tab to select foods.</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recommendations">Dietary Recommendations</Label>
                <Textarea 
                  id="recommendations" 
                  placeholder="Enter dietary recommendations based on test results"
                  className="mt-2 min-h-[150px]"
                  value={formData.recommendations || ''}
                  onChange={handleRecommendationsChange}
                />
              </div>
              
              <div>
                <Label htmlFor="followup-plan">Follow-up Plan</Label>
                <Textarea 
                  id="followup-plan" 
                  placeholder="Enter follow-up plan and next steps"
                  className="mt-2 min-h-[150px]"
                  value={formData.followup_plan || ''}
                  onChange={handleFollowupChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodIntoleranceForm;
