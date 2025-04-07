
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="text-2xl font-semibold mt-4">Loading Patient Data</h2>
      <p className="text-muted-foreground mt-2">Please wait while we fetch the information...</p>
    </div>
  );
};
