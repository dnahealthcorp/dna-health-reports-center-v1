
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import FormTypeSelector from "@/components/forms/FormTypeSelector";
import { useEffect, useState } from "react";
import { getPatientById } from "@/services/databaseService";
import { Patient } from "@/types";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const FormSelector = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      try {
        const patientData = await getPatientById(patientId);
        setPatient(patientData);
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return (
    <Layout>
      <div className="animate-fade-in">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link to={`/patients/${patientId}`}>
                <Button variant="outline" size="sm" className="mb-4">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Patient
                </Button>
              </Link>
              
              <h1 className="text-3xl font-semibold tracking-tight">Create New Form</h1>
              <p className="text-muted-foreground mt-1">
                {patient ? (
                  `Select a form type to create for ${patient.name}`
                ) : (
                  "Select a form type to create"
                )}
              </p>
            </div>
            
            {patientId && <FormTypeSelector patientId={patientId} />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default FormSelector;
