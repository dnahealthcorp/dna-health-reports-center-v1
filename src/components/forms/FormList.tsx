
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFormsByPatientId, deleteForm } from "@/services/formService";
import { FormInstance } from "@/types/multiforms";
import { 
  FilePlus2, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface FormListProps {
  patientId: string;
}

const FormList = ({ patientId }: FormListProps) => {
  const [forms, setForms] = useState<FormInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const formData = await getFormsByPatientId(patientId);
        setForms(formData);
      } catch (error) {
        console.error("Error fetching forms:", error);
        toast({
          title: "Error",
          description: "Could not load patient forms",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [patientId, toast]);

  const handleCreateForm = () => {
    navigate(`/forms/new/${patientId}`);
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await deleteForm(formToDelete);
      
      // Update the forms list
      setForms(forms.filter(form => form.id !== formToDelete));
      
      toast({
        title: "Form deleted",
        description: "The form has been permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Could not delete form",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const confirmDelete = (formId: string) => {
    setFormToDelete(formId);
    setDeleteDialogOpen(true);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="ml-2">Draft</Badge>;
      case 'in-process':
        return <Badge variant="secondary" className="ml-2">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="ml-2 bg-green-100 text-green-800">Completed</Badge>;
      case 'late':
        return <Badge variant="destructive" className="ml-2">Late</Badge>;
      default:
        return null;
    }
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'in-process':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'late':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Group forms by type
  const formsByType = forms.reduce((acc, form) => {
    const formTypeName = form.formType?.title || "Unknown";
    if (!acc[formTypeName]) {
      acc[formTypeName] = [];
    }
    acc[formTypeName].push(form);
    return acc;
  }, {} as Record<string, FormInstance[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Medical Forms</h2>
        <Button onClick={handleCreateForm}>
          <FilePlus2 className="h-4 w-4 mr-2" />
          New Form
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No forms have been created for this patient yet.</p>
            <Button onClick={handleCreateForm}>
              <FilePlus2 className="h-4 w-4 mr-2" />
              Create First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(formsByType).map(([formTypeName, formsList]) => (
            <div key={formTypeName} className="space-y-2">
              <h3 className="font-medium text-lg">{formTypeName} Forms</h3>
              <div className="space-y-2">
                {formsList.map((form) => (
                  <Card key={form.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center">
                            <div className="mr-2">{renderStatusIcon(form.status)}</div>
                            <h3 className="font-medium">
                              Created {formatDistanceToNow(new Date(form.created_at), { addSuffix: true })}
                              {renderStatusBadge(form.status)}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(form.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => confirmDelete(form.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Link to={`/forms/${form.formType?.slug || 'unknown'}/${form.id}`}>
                            <Button size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteForm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormList;
