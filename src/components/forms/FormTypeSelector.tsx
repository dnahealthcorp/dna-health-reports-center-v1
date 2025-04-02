
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormType } from "@/types/multiforms";
import { getFormTypes, createFormInstance } from "@/services/formService";
import { FileText, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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
          description: "Failed to load form types",
          variant: "destructive"
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
        // Find the form type to get its slug
        const formType = formTypes.find(type => type.id === formTypeId);
        if (formType) {
          toast({
            title: "Success",
            description: `Created new ${formType.title} form`
          });
          navigate(`/forms/${formType.slug}/${form.id}`);
        }
      } else {
        throw new Error("Failed to create form");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive"
      });
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {formTypes.map(formType => (
        <Card key={formType.id} className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>{formType.title}</CardTitle>
            <CardDescription>
              {formType.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleCreateForm(formType.id)}
              disabled={creating !== null}
            >
              {creating === formType.id ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create {formType.title} Form
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FormTypeSelector;
