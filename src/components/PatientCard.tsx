
import { Patient } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PatientCardProps {
  patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  const statusMap = {
    "nurse-pending": {
      label: "Nurse Review",
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    "doctor-pending": {
      label: "Doctor Review",
      color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    "completed": {
      label: "Completed",
      color: "bg-green-100 text-green-700 border-green-200"
    }
  };
  
  const status = statusMap[patient.status];
  const formattedDate = new Date(patient.lastUpdated).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <Link to={`/patients/${patient.id}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] h-full">
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">
                  MRN: {patient.medicalRecordNumber}
                </p>
              </div>
              <Badge className={cn("font-normal", status.color)}>
                {status.label}
              </Badge>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground gap-3">
              <span>{patient.gender}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground inline-block"></span>
              <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-3 px-5 bg-muted/30 border-t text-sm">
            <span className="text-muted-foreground">Updated {formattedDate}</span>
            <span className="text-primary flex items-center gap-1 font-medium">
              View Details
              <ArrowRight size={14} />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PatientCard;
