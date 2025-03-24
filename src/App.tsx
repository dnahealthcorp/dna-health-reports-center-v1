
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Patients from "@/pages/Patients";
import PatientForm from "@/pages/PatientForm";
import Medications from "@/pages/Medications";
import Forms from "@/pages/Forms";
import Settings from "@/pages/Settings";

// Create a supplements page
const Supplements = lazy(() => import("@/pages/Supplements"));

// Layouts
import MedicationLayout from "@/components/MedicationLayout";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patient/:id" element={<PatientForm />} />
          
          {/* Use the MedicationLayout for Medications and Supplements pages */}
          <Route path="/medications" element={<MedicationLayout><Medications /></MedicationLayout>} />
          <Route path="/supplements" element={<MedicationLayout><Supplements /></MedicationLayout>} />
          
          <Route path="/forms" element={<Forms />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
