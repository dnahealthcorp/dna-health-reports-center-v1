
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getFormById, getFormTypeBySlug } from "@/services/formService";
import { FormInstance, FormType } from "@/types/multiforms";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import HealthScreeningForm from "@/components/forms/HealthScreeningForm";
import FoodIntoleranceForm from "@/components/forms/FoodIntoleranceForm";

const DynamicForm = () => {
  const { formType: formTypeSlug, formId } = useParams<{ formType: string; formId: string }>();
  const [form, setForm] = useState<FormInstance | null>(null);
  const [formType, setFormType] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formTypeSlug || !formId) return;
      
      try {
        const [typeData, formData] = await Promise.all([
          getFormTypeBySlug(formTypeSlug),
          getFormById(formId)
        ]);
        
        if (!typeData) {
          toast({
            title: "Error",
            description: `Form type "${formTypeSlug}" not found`,
            variant: "destructive",
          });
          navigate("/forms");
          return;
        }
        
        if (!formData) {
          toast({
            title: "Error",
            description: "Form not found",
            variant: "destructive",
          });
          navigate("/forms");
          return;
        }
        
        setFormType(typeData);
        setForm(formData);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Error",
          description: "Could not load form data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formTypeSlug, formId, navigate, toast]);

  // Render the appropriate form component based on form type
  const renderFormComponent = () => {
    if (!form || !formType) return null;
    
    switch (formType.slug) {
      case 'health-screening':
        return <HealthScreeningForm form={form} />;
      case 'food-intolerance':
        return <FoodIntoleranceForm form={form} />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Unknown Form Type</h2>
            <p className="text-muted-foreground">
              The form type "{formType.slug}" does not have an associated component.
            </p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link to={form?.patient ? `/patients/${form.patient_id}` : "/forms"}>
                <Button variant="outline" size="sm" className="mb-4">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {form?.patient ? `Back to ${form.patient.name}` : "Back to Forms"}
                </Button>
              </Link>
              
              <h1 className="text-3xl font-semibold tracking-tight">
                {formType?.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {form?.patient && `Patient: ${form.patient.name}`}
              </p>
            </div>
            
            {renderFormComponent()}
          </>
        )}
      </div>
    </Layout>
  );
};

export default DynamicForm;
