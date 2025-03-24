import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecentPatients } from '@/services';
import { Patient } from '@/types';
import Layout from '@/components/Layout';
import PatientCard from '@/components/PatientCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, Users, FileText, PillIcon } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPatients = async () => {
      setIsLoading(true);
      try {
        const data = await getRecentPatients();
        setRecentPatients(data);
      } catch (error) {
        console.error('Error fetching recent patients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recent patients',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPatients();
  }, [toast]);

  // Add these handler functions if they don't exist
  const handlePatientUpdated = (updatedPatient: Patient) => {
    // Update the patient in the list
    console.log("Patient updated:", updatedPatient);
    // Actual implementation would update the patient in state/database
  };

  const handlePatientDeleted = (patientId: string) => {
    // Delete the patient from the list
    console.log("Patient deleted:", patientId);
    // Actual implementation would remove the patient from state/database
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forms Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications Tracked</CardTitle>
            <PillIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +7 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>
            Recently added or updated patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-24 rounded-lg"
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
            </div>
          ) : recentPatients.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No recent patients</p>
              <Button variant="outline" asChild>
                <Link to="/patients">Add your first patient</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recentPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  onUpdate={handlePatientUpdated} 
                  onDelete={handlePatientDeleted} 
                />
              ))}
              <Button variant="outline" asChild className="mt-2">
                <Link to="/patients" className="flex items-center justify-center">
                  View all patients
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Index;
