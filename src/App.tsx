
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Patients from "@/pages/Patients";
import PatientForm from "@/pages/PatientForm";
import Login from "@/pages/Login";
import SetPassword from "@/pages/SetPassword";
import AuthCallback from "@/pages/AuthCallback";
import Medications from "@/pages/Medications";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import Forms from "@/pages/Forms";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientForm />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
