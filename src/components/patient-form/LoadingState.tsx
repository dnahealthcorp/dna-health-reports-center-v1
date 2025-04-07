
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export const LoadingState = () => {
  return (
    <Card className="flex flex-col items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading patient data...</p>
    </Card>
  );
};
