
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Patient } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Calendar, ClipboardList, FileText, User, PlusCircle } from "lucide-react";
import FormList from "@/components/forms/FormList";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PatientDetailsProps {
  patient: Patient;
}

const PatientDetails = ({ patient }: PatientDetailsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Patient Profile</h1>
        <Link to={`/forms/new/${patient.id}`}>
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Form
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">
            <User className="h-4 w-4 mr-2" />
            Patient Details
          </TabsTrigger>
          <TabsTrigger value="forms">
            <FileText className="h-4 w-4 mr-2" />
            Forms
            {patient.status === 'in-process' && (
              <Badge variant="secondary" className="ml-2">In Progress</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <ClipboardList className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>View and manage patient details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Personal Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd>{patient.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                      <dd>{patient.gender}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                      <dd>{new Date(patient.dateOfBirth).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Medical Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Medical Record #</dt>
                      <dd>{patient.medicalRecordNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd className="capitalize">{patient.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                      <dd className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(patient.lastUpdated), { addSuffix: true })}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Medical Forms</CardTitle>
                  <CardDescription>Manage patient medical forms</CardDescription>
                </div>
                <Link to={`/forms/new/${patient.id}`}>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    New Form
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <FormList patientId={patient.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Medical Reports</CardTitle>
              <CardDescription>View and download medical reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No reports available for this patient.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetails;
