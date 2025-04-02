
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFormTypes, createFormInstance } from "@/services/formService";
import { FormType } from "@/types/multiforms";
import { FileText, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormTypeSelectorProps {
  patientId: string;
}

const FormTypeSelector = ({ patientId }: FormTypeSelectorProps) => {
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormTypes = async () => {
      try {
        const types = await getFormTypes();
        setFormTypes(types);
      } catch (error) {
        console.error("Error fetching form types:", error);
        toast({
          title: "Error",
          description: "Could not load form types",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormTypes();
  }, [toast]);

  const handleCreateForm = async (formTypeId: string) => {
    setCreating(formTypeId);
    
    try {
      const form = await createFormInstance(patientId, formTypeId);
      
      if (form) {
        // Find the form type to get the slug
        const formType = formTypes.find(type => type.id === formTypeId);
        
        if (formType) {
          toast({
            title: "Form created",
            description: `New ${formType.title} form created successfully`,
          });
          
          // Navigate to the dynamic form page
          navigate(`/forms/${formType.slug}/${form.id}`);
        }
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Could not create form",
        variant: "destructive",
      });
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-6" />
              <Skeleton className="h-10 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {formTypes.map((formType) => (
        <Card key={formType.id} className="overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">{formType.title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{formType.description}</p>
            <Button 
              onClick={() => handleCreateForm(formType.id)}
              disabled={creating === formType.id}
              className="w-full"
            >
              {creating === formType.id ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Form
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormTypeSelector;
