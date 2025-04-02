
import { useState } from "react";
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

const Forms = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
  
  const { toast } = useToast();

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
            <h1 className="text-3xl font-semibold tracking-tight">Form Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage and customize your form templates
            </p>
          </div>
        </div>

        <Tabs defaultValue="templates">
          <TabsList className="mb-6">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="upload">Upload Template</TabsTrigger>
            <TabsTrigger value="create">Create Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="animate-fade-in-up">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="animate-fade-in-up">
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 bg-muted/30 rounded-md">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        {template.fields.length} fields
                      </p>
                      <div className="flex flex-wrap mt-2 gap-2">
                        {Array.from(new Set(template.fields.map(field => field.section))).map(section => (
                          <div key={section} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {section.charAt(0).toUpperCase() + section.slice(1)} Section
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <FileDown className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button>
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
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
