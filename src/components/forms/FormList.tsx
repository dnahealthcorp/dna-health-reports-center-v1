
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormInstance } from "@/types/multiforms";
import { FileText, Eye, FilePlus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { getFormsByPatientId, deleteForm } from "@/services/formService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface FormListProps {
  patientId: string;
}

const FormList = ({ patientId }: FormListProps) => {
  const [forms, setForms] = useState<FormInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormInstance | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const patientForms = await getFormsByPatientId(patientId);
        setForms(patientForms);
      } catch (error) {
        console.error("Error fetching forms:", error);
        toast({
          title: "Error",
          description: "Failed to load patient forms",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [patientId, toast]);

  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    setDeleting(true);
    try {
      const success = await deleteForm(formToDelete.id);
      if (success) {
        setForms(forms.filter(form => form.id !== formToDelete.id));
        toast({
          title: "Success",
          description: "Form deleted successfully"
        });
      } else {
        throw new Error("Failed to delete form");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return "secondary";
      case 'in-process':
        return "default";
      case 'completed':
        return "success";
      case 'late':
        return "destructive";
      default:
        return "outline";
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

  if (forms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted/30 rounded-full p-4 inline-flex mb-4">
          <FilePlus className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No forms found</h3>
        <p className="text-muted-foreground mb-6">
          This patient doesn't have any forms yet. Create a new form to get started.
        </p>
        <Link to={`/forms/new/${patientId}`}>
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Create New Form
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Patient Forms</h3>
        <Link to={`/forms/new/${patientId}`}>
          <Button>
            <FilePlus className="mr-2 h-4 w-4" />
            Create New Form
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {forms.map(form => (
          <Card key={form.id} className="animate-fade-in-up">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{form.formType?.title || "Unknown Form Type"}</CardTitle>
                <Badge variant={getStatusBadgeVariant(form.status)}>
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                Created: {format(new Date(form.created_at), "MMM d, yyyy")}
                {form.status_updated_at && (
                  <div>
                    Status Updated: {format(new Date(form.status_updated_at), "MMM d, yyyy")}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 bg-muted/30 rounded-md">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="mt-4">
                {form.pdf_exported && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    PDF Exported
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  setFormToDelete(form);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Link to={`/forms/${form.formType?.slug || 'unknown'}/${form.id}`}>
                <Button>
                  <Eye className="mr-2 h-4 w-4" />
                  View Form
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteForm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormList;
