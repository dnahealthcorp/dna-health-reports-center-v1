
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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
  }, []);
  
  if (isAuthenticated === null) {
    // Still loading, show nothing or a loader
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (isAuthenticated === false) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" />;
  }
  
  // Authenticated, render children
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
        <Route path="/medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
