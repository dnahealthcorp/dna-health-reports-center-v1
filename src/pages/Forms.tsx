
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, FileUp, FileDown, FilePlus2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import FormBuilder from "@/components/FormBuilder";
import { FormTemplate } from "@/types";
import { Patient } from "@/types";
import { getPatients } from "@/services/databaseService";
import { getFormTypes } from "@/services/formService";
import { FormType } from "@/types/multiforms";
import { Link } from "react-router-dom";

const Forms = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [templates, setTemplates] = useState<FormTemplate[]>([
    {
      id: "template-1",
      name: "General Medical Exam",
      description: "Standard template for general medical examinations",
      fields: [
        { id: "f1", type: "text", label: "Chief Complaint", required: true, section: "patient" },
        { id: "f2", type: "textarea", label: "Medical History", required: false, section: "patient" },
        { id: "f3", type: "number", label: "Temperature", required: true, section: "vitals" },
        { id: "f4", type: "medication", label: "Prescribed Medications", required: false, section: "medications" }
      ]
    },
    {
      id: "template-2",
      name: "Specialist Referral",
      description: "Template for specialist referrals and consultations",
      fields: [
        { id: "f5", type: "text", label: "Referral Reason", required: true, section: "doctor" },
        { id: "f6", type: "select", label: "Specialist Type", required: true, section: "doctor", options: ["Cardiology", "Neurology", "Orthopedics"] },
        { id: "f7", type: "textarea", label: "Medical History", required: false, section: "patient" }
      ]
    }
  ]);
  
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingFormTypes, setLoadingFormTypes] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsData = await getPatients();
        setPatients(patientsData);
        setLoadingPatients(false);
        
        // Fetch form types
        const formTypesData = await getFormTypes();
        setFormTypes(formTypesData);
        setLoadingFormTypes(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
        setLoadingPatients(false);
        setLoadingFormTypes(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    // Check if file is a Word document
    const isWordDoc = selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.doc');
    if (!isWordDoc) {
      toast({
        title: "Invalid file type",
        description: "Please upload a Word document (.docx or .doc)",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setSelectedFile(null);
      
      toast({
        title: "Template uploaded",
        description: "Your form template has been uploaded successfully"
      });
    }, 2000);
  };

  const handleSaveTemplate = (newTemplate: FormTemplate) => {
    setTemplates([newTemplate, ...templates]);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Form Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, manage, and complete forms for your patients
            </p>
          </div>
        </div>

        <Tabs defaultValue="patients">
          <TabsList className="mb-6">
            <TabsTrigger value="patients">Patient Forms</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="upload">Upload Template</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patients" className="animate-fade-in-up">
            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                Select a patient to create a new form or view existing forms
              </p>
            </div>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {loadingPatients ? (
                Array(6).fill(0).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-3/4 bg-muted rounded"></div>
                      <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-24 bg-muted rounded"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 w-full bg-muted rounded"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                patients.map((patient) => (
                  <Card key={patient.id} className="animate-fade-in-up">
                    <CardHeader>
                      <CardTitle>{patient.name}</CardTitle>
                      <CardDescription>
                        MRN: {patient.medicalRecordNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">DOB:</span>
                          <span className="text-sm">{patient.dateOfBirth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Gender:</span>
                          <span className="text-sm">{patient.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className="text-sm capitalize">{patient.status}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/forms/new/${patient.id}`} className="w-full">
                        <Button className="w-full">
                          <FilePlus2 className="mr-2 h-4 w-4" />
                          Create Form
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="animate-fade-in-up">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {formTypes.length === 0 && !loadingFormTypes ? (
                <p className="col-span-3 text-center py-12 text-muted-foreground">
                  No form types found. Create a form type to get started.
                </p>
              ) : loadingFormTypes ? (
                Array(3).fill(0).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-3/4 bg-muted rounded"></div>
                      <div className="h-4 w-1/2 bg-muted rounded mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 bg-muted rounded"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 w-full bg-muted rounded"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                formTypes.map((formType) => (
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
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button>
                        Edit Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
            
            {!loadingFormTypes && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Need a new form type? Create a new template or upload an existing one.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button onClick={() => document.getElementById('upload-tab')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Template
                  </Button>
                  <Button onClick={() => document.getElementById('create-tab')?.click()}>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="animate-fade-in-up">
            <Card>
              <CardHeader>
                <CardTitle>Upload Template</CardTitle>
                <CardDescription>
                  Upload a Word document to use as a template for PDF generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted rounded-lg p-10 text-center">
                  <FileUp className="h-10 w-10 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="font-medium text-lg mb-2">Upload Word Template</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Drag and drop a Word document, or click to browse. The system will map form fields to the document structure.
                  </p>
                  <div className="flex flex-col items-center">
                    <Label htmlFor="file-upload" className="w-full max-w-xs">
                      <div className="bg-primary text-primary-foreground rounded-md py-2 px-4 text-center cursor-pointer hover:bg-primary/90 transition-colors">
                        Browse files
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".doc,.docx"
                        onChange={handleFileChange}
                      />
                    </Label>
                    {selectedFile && (
                      <div className="mt-4 text-sm">
                        Selected: <span className="font-medium">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  disabled={!selectedFile || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Template
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="create" className="animate-fade-in-up">
            <FormBuilder onSave={handleSaveTemplate} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Forms;
