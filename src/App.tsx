
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Patients from "@/pages/Patients";
import PatientForm from "@/pages/PatientForm";
import Medications from "@/pages/Medications";
import Forms from "@/pages/Forms";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/components/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patient/:id" element={<PatientForm />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
