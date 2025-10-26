import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Technicians from "./pages/Technicians";
import Marketplace from "./pages/Marketplace";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleAuth();
  }, []);

  const handleAuth = async () => {
    // Check for session_id in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("session_id=")) {
      const sessionId = hash.split("session_id=")[1].split("&")[0];
      
      try {
        const response = await axios.get(`${API}/auth/session`, {
          headers: { "X-Session-ID": sessionId }
        });
        
        // Set session token in cookie
        document.cookie = `session_token=${response.data.session_token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=none`;
        
        // Get user profile
        await loadUserProfile();
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast.success("Welcome back!");
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Authentication failed");
        setLoading(false);
      }
    } else {
      // Check existing session
      await loadUserProfile();
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.log("Not authenticated");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      document.cookie = "session_token=; path=/; max-age=0";
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" data-testid="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const getDashboardRoute = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "technician") return "/technician/dashboard";
    return "/dashboard";
  };

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            user ? <Navigate to={getDashboardRoute()} /> : <Landing />
          } />
          <Route path="/dashboard" element={
            user && user.role === "consumer" ? 
              <Dashboard user={user} onLogout={handleLogout} onUpdateUser={loadUserProfile} /> 
              : <Navigate to="/" />
          } />
          <Route path="/technician/dashboard" element={
            user && user.role === "technician" ? 
              <TechnicianDashboard user={user} onLogout={handleLogout} onUpdateUser={loadUserProfile} /> 
              : <Navigate to="/" />
          } />
          <Route path="/admin/dashboard" element={
            user && user.role === "admin" ? 
              <AdminDashboard user={user} onLogout={handleLogout} /> 
              : <Navigate to="/" />
          } />
          <Route path="/technicians" element={
            user && user.role === "consumer" ? <Technicians user={user} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
          <Route path="/marketplace" element={
            user && user.role === "consumer" ? <Marketplace user={user} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
          <Route path="/payment/success" element={
            user ? <PaymentSuccess user={user} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
          <Route path="/payment/cancel" element={
            user ? <PaymentCancel user={user} onLogout={handleLogout} /> : <Navigate to="/" />
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;