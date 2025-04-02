
import { useState, useEffect, Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { getFormById, getFormTypeBySlug } from "@/services/formService";
import { FormInstance, FormType } from "@/types/multiforms";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load form components
const HealthScreeningForm = lazy(() => import("@/components/patient-form/PatientForm"));
const FoodIntoleranceForm = lazy(() => import("@/components/forms/FoodIntoleranceForm"));

const DynamicForm = () => {
  const { formType, formId } = useParams<{ formType: string; formId: string }>();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormInstance | null>(null);
  const [formTypeData, setFormTypeData] = useState<FormType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!formType || !formId) return;
      
      try {
        // Fetch form data
        const formData = await getFormById(formId);
        if (!formData) {
          toast({
            title: "Error",
            description: "Form not found",
            variant: "destructive"
          });
          return;
        }
        
        setForm(formData);
        
        // Verify form type
        const typeData = await getFormTypeBySlug(formType);
        if (!typeData) {
          toast({
            title: "Error",
            description: "Form type not found",
            variant: "destructive"
          });
          return;
        }
        
        setFormTypeData(typeData);
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
  }, [formType, formId, toast]);

  const renderForm = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      );
    }
    
    if (!form || !formTypeData) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-2">Form Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The form you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </div>
        </div>
      );
    }
    
    // Render the appropriate form component based on form type
    switch (formTypeData.slug) {
      case "health-screening":
        return (
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <HealthScreeningForm patientId={form.patient_id} />
          </Suspense>
        );
      case "food-intolerance":
        return (
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <FoodIntoleranceForm />
          </Suspense>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">Unknown Form Type</h3>
              <p className="text-muted-foreground mb-6">
                This form type is not supported by the application.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {renderForm()}
      </div>
    </Layout>
  );
};

export default DynamicForm;
