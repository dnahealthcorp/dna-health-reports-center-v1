
import { Patient } from "@/types";
import PatientCard from "@/components/PatientCard";

interface PatientCardListProps {
  patients: Patient[];
  onDelete: (patientId: string) => void;
  onEdit: (patient: Patient) => void;
}

const PatientCardList = ({ patients, onDelete, onEdit }: PatientCardListProps) => {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {patients.map(patient => (
        <PatientCard 
          key={patient.id} 
          patient={patient} 
          onDelete={onDelete} 
          onEdit={onEdit} 
        />
      ))}
    </div>
  );
};

export default PatientCardList;
