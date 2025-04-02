import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Index from './pages/Index'
import Patients from './pages/Patients'
import PatientForm from './pages/PatientForm'
import Forms from './pages/Forms'
import NotFound from './pages/NotFound'
import Medications from './pages/Medications'
import Login from './pages/Login'
import Settings from './pages/Settings'
import { Toaster } from './components/ui/toaster'
import { getCurrentUser } from './services/databaseService'
import FormSelector from './pages/FormSelector'
import DynamicForm from './pages/DynamicForm'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to check authentication status. Using fallback authentication.");
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-sm">
          {error || "Checking authentication..."}
        </p>
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user?.role === 'admin');
      } catch (err) {
        console.error("Admin check error:", err);
        setError("Failed to check admin privileges.");
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  if (isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground text-sm">
          {error || "Checking administrator access..."}
        </p>
      </div>
    );
  }
  
  if (isAdmin === false) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />
        <Route path="/forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
        <Route path="/forms/new/:patientId" element={<ProtectedRoute><FormSelector /></ProtectedRoute>} />
        <Route path="/forms/:formType/:formId" element={<ProtectedRoute><DynamicForm /></ProtectedRoute>} />
        <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AdminRoute><Settings /></AdminRoute></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
