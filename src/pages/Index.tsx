
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatients, getCurrentUser, getPDFFilesByPatientId } from "@/services/databaseService";
import { Patient, User } from "@/types";
import { ClipboardList, Users, FileText, Clock, Download } from "lucide-react";
import PatientCard from "@/components/PatientCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, userData] = await Promise.all([getPatients(), getCurrentUser()]);

        // Add PDF files to patients
        const patientsWithPDFs = await Promise.all(patientsData.map(async patient => {
          const pdfFiles = await getPDFFilesByPatientId(patient.id);
          return {
            ...patient,
            pdfFiles
          };
        }));
        setPatients(patientsWithPDFs);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter patients based on status
  const inProcessPatients = patients.filter(p => p.status === "in-process");
  const latePatients = patients.filter(p => p.status === "late");
  const completedPatients = patients.filter(p => p.status === "completed");

  // Updated stats for the cards as requested
  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100"
    },
    {
      title: "In-Process Forms",
      value: inProcessPatients.length,
      icon: ClipboardList,
      color: "text-purple-500",
      bg: "bg-purple-100"
    },
    {
      title: "Completed Forms",
      value: completedPatients.length,
      icon: FileText,
      color: "text-green-500",
      bg: "bg-green-100"
    },
    {
      title: "Late Forms",
      value: latePatients.length,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-100"
    }
  ];

  return <Layout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-left">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {currentUser?.name || "User"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => <Card key={index} className="animate-fade-in-up" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <CardContent className="flex items-center p-6">
                <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mr-4`}>
                  <stat.icon className={`${stat.color}`} size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h4 className="text-2xl font-semibold mt-1">
                    {stat.value}
                  </h4>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Patient Tabs */}
        <Card className="animate-fade-in-up" style={{
        animationDelay: "0.4s"
      }}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-left">Patient Forms</CardTitle>
              <CardDescription>
                Manage and review patient forms based on their current status
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')}>
                Cards
              </Button>
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
                Table
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="action-required">
              <TabsList className="mb-6">
                <TabsTrigger value="action-required">
                  Action Required
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Patients
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="action-required" className="mt-0">
                {viewMode === 'cards' ? <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {inProcessPatients.length > 0 ? inProcessPatients.map(patient => <PatientCard key={patient.id} patient={patient} />) : <p className="text-muted-foreground col-span-full py-8 text-center">
                          No patients require review at this time.
                        </p>}
                  </div> :
              // Table view for action required patients
              <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>MRN</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>PDF Files</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inProcessPatients.length > 0 ? inProcessPatients.map(patient => <TableRow key={patient.id}>
                                <TableCell>{patient.medicalRecordNumber}</TableCell>
                                <TableCell>{patient.name}</TableCell>
                                <TableCell>
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    In Process
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {patient.pdfFiles?.length > 0 ? patient.pdfFiles.map(file => <a key={file.id} href={`data:application/pdf;base64,${file.url}`} download={file.fileName} className="flex items-center text-primary hover:underline mb-1">
                                        <Download size={14} className="mr-1" />
                                        <span className="text-xs">{file.fileName}</span>
                                      </a>) : <span className="text-xs text-muted-foreground">No files</span>}
                                </TableCell>
                                <TableCell>
                                  <Button size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>) : <TableRow>
                              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                No patients require review at this time.
                              </TableCell>
                            </TableRow>}
                      </TableBody>
                    </Table>
                  </div>}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                {viewMode === 'cards' ? <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {completedPatients.length > 0 ? completedPatients.map(patient => <PatientCard key={patient.id} patient={patient} />) : <p className="text-muted-foreground col-span-full py-8 text-center">
                        No completed patient forms yet.
                      </p>}
                  </div> :
              // Table view
              <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>MRN</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>PDF Files</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedPatients.length > 0 ? completedPatients.map(patient => <TableRow key={patient.id}>
                              <TableCell>{patient.medicalRecordNumber}</TableCell>
                              <TableCell>{patient.name}</TableCell>
                              <TableCell>
                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              </TableCell>
                              <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {patient.pdfFiles?.length > 0 ? patient.pdfFiles.map(file => <a key={file.id} href={`data:application/pdf;base64,${file.url}`} download={file.fileName} className="flex items-center text-primary hover:underline mb-1">
                                      <Download size={14} className="mr-1" />
                                      <span className="text-xs">{file.fileName}</span>
                                    </a>) : <span className="text-xs text-muted-foreground">No files</span>}
                              </TableCell>
                              <TableCell>
                                <Button size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>) : <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                              No completed patient forms yet.
                            </TableCell>
                          </TableRow>}
                      </TableBody>
                    </Table>
                  </div>}
              </TabsContent>
              
              <TabsContent value="all" className="mt-0">
                {viewMode === 'cards' ? <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {patients.length > 0 ? patients.map(patient => <PatientCard key={patient.id} patient={patient} />) : <p className="text-muted-foreground col-span-full py-8 text-center">
                        No patients available.
                      </p>}
                  </div> :
              // Table view
              <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>MRN</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>PDF Files</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.length > 0 ? patients.map(patient => <TableRow key={patient.id}>
                              <TableCell>{patient.medicalRecordNumber}</TableCell>
                              <TableCell>{patient.name}</TableCell>
                              <TableCell>
                                {patient.status === 'in-process' && <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    In Process
                                  </span>}
                                {patient.status === 'late' && <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    Late
                                  </span>}
                                {patient.status === 'completed' && <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Completed
                                  </span>}
                              </TableCell>
                              <TableCell>{new Date(patient.lastUpdated).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {patient.pdfFiles?.length > 0 ? patient.pdfFiles.map(file => <a key={file.id} href={`data:application/pdf;base64,${file.url}`} download={file.fileName} className="flex items-center text-primary hover:underline mb-1">
                                      <Download size={14} className="mr-1" />
                                      <span className="text-xs">{file.fileName}</span>
                                    </a>) : <span className="text-xs text-muted-foreground">No files</span>}
                              </TableCell>
                              <TableCell>
                                <Button size="sm" onClick={() => navigate(`/patients/${patient.id}`)}>
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>) : <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                              No patients available.
                            </TableCell>
                          </TableRow>}
                      </TableBody>
                    </Table>
                  </div>}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>;
};
export default Dashboard;
