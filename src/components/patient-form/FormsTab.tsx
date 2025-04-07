import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, FormType } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { 
  Plus, FileText, ExternalLink, Eye, Edit, AlertCircle 
} from 'lucide-react';
import { getFormTypes, getPatientForms, createForm } from '@/services/formService';
import { getCurrentUser } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

interface FormsTabProps {
  patientId: string;
}

const FormsTab = ({ patientId }: FormsTabProps) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [selectedFormTypeId, setSelectedFormTypeId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load patient forms
  useEffect(() => {
    const loadForms = async () => {
      setIsLoading(true);
      try {
        const patientForms = await getPatientForms(patientId);
        setForms(patientForms);
        
        const availableFormTypes = await getFormTypes();
        setFormTypes(availableFormTypes);
      } catch (error) {
        console.error("Error loading forms:", error);
        toast({
          variant: "destructive",
          title: "Error loading forms",
          description: "Could not load forms for this patient."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadForms();
  }, [patientId, toast]);
  
  // Handle creating a new form
  const handleCreateForm = async () => {
    if (!selectedFormTypeId) return;
    
    setIsCreatingForm(true);
    try {
      // Get current user
      const user = await getCurrentUser();
      
      // Create the form
      const newForm = await createForm(patientId, selectedFormTypeId, user?.id || null);
      
      if (newForm && newForm.formType) {
        setDialogOpen(false);
        toast({
          title: "Form created",
          description: `New ${newForm.formType.title} form has been created`
        });
        
        // Navigate to the form page
        navigate(`/forms/${newForm.formType.slug}/${newForm.id}`);
      } else {
        throw new Error("Failed to create form");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        variant: "destructive",
        title: "Error creating form",
        description: "Could not create a new form. Please try again."
      });
    } finally {
      setIsCreatingForm(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-process':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Process</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Late</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Process</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Patient Forms</h3>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create New Form</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Form</DialogTitle>
              <DialogDescription>
                Select the type of form you want to create for this patient.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {formTypes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  No form types available. Please add form types first.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formTypes.map((formType) => (
                    <div 
                      key={formType.id}
                      className={`p-4 border rounded-md cursor-pointer transition-all ${
                        selectedFormTypeId === formType.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedFormTypeId(formType.id)}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary/70 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{formType.title}</h4>
                          {formType.description && (
                            <p className="text-sm text-muted-foreground">{formType.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                disabled={!selectedFormTypeId || isCreatingForm}
                onClick={handleCreateForm}
              >
                {isCreatingForm ? 'Creating...' : 'Create Form'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No forms found for this patient</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create first form
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div className="font-medium">{form.formType?.title || 'Unknown Form Type'}</div>
                    {form.pdf_exported && (
                      <div className="text-xs text-muted-foreground mt-1">
                        PDF Exported
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(form.status)}</TableCell>
                  <TableCell>{new Date(form.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(form.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => navigate(`/forms/${form.formType?.slug}/${form.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={() => navigate(`/forms/${form.formType?.slug}/${form.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      {form.pdf_exported && (
                        <Button size="icon" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Export PDF</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FormsTab;
