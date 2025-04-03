
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Patients from "@/pages/Patients";
import PatientForm from "@/pages/PatientForm";
import Login from "@/pages/Login";
import Medications from "@/pages/Medications";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import Forms from "@/pages/Forms";
import NotFound from "@/pages/NotFound";

function App() {
  // You can leave this empty or add global app logic here
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patients/:id" element={<PatientForm />} />
      <Route path="/medications" element={<Medications />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forms" element={<Forms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
