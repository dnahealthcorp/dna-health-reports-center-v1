
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotFoundState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <p className="text-lg text-muted-foreground mb-4">Patient not found</p>
      <Button variant="outline" onClick={() => navigate("/patients")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Patients
      </Button>
    </div>
  );
};
