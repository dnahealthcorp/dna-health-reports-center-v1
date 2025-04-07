
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileX } from "lucide-react";

export const NotFoundState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <div className="relative bg-muted h-32 w-32 rounded-full flex items-center justify-center">
        <FileX className="h-16 w-16 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mt-4">Patient Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The patient you're looking for doesn't exist or you don't have permission to access it.
      </p>
      <Button onClick={() => navigate("/patients")} className="mt-4">
        Return to Patients
      </Button>
    </div>
  );
};
