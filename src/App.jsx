import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useRole } from "./hooks/useRole";
import { signOut } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientList from "./pages/PatientList";
import PatientDetail from "./pages/PatientDetail";
import PatientForm from "./pages/PatientForm";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const NavItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
      }`
    }
  >
    {label}
  </NavLink>
);

function Navbar() {
  const { user } = useAuth();
  const { role } = useRole();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-4">
          <img src="/logo.jpeg" alt="Trial Link" className="h-8" />
          <span className="text-lg font-bold text-blue-700">Trial Link</span>
        </div>
        {role === "admin" && (
          <>
            <NavItem to="/patients" label="All Patients" />
            <NavItem to="/patients/new" label="+ New Patient" />
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{user.email}</span>
        {role === "admin" && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        )}
        <button onClick={signOut} className="btn-secondary text-xs px-3 py-1.5">
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function HomeRedirect() {
  const { role, loading } = useRole();
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <p className="text-gray-400 p-6">⏳ Loading...</p>;
  if (role === "admin") return <Navigate to="/patients" replace />;

  return <Navigate to="/me" replace />;
}

function MyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    user.getIdToken().then(token => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.status === 404) {
          console.log("No profile found → /patients/new");
          navigate("/patients/new", { replace: true });
        } else if (res.ok) {
          return res.json().then(patient => {
            console.log("Profile found →", patient.demographics.patient_id);
            navigate(`/patients/${patient.demographics.patient_id}`, { replace: true });
          });
        } else {
          console.error("Unexpected error from /me:", res.status);
          navigate("/patients/new", { replace: true });
        }
      })
      .catch(err => {
        console.error("Network error calling /me:", err);
        navigate("/patients/new", { replace: true });
      });
    });
  }, [user]);

  return <p className="text-gray-400 p-6">⏳ Loading your profile...</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin only */}
            <Route path="/patients" element={<ProtectedRoute role="admin"><PatientList /></ProtectedRoute>} />

            {/* /patients/new — admin OR patient without a profile yet */}
            <Route path="/patients/new" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />

            {/* Admin or patient (ownership enforced on backend) */}
            <Route path="/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
            <Route path="/patients/:id/edit" element={<ProtectedRoute><PatientForm /></ProtectedRoute>} />

            {/* Patient profile resolver */}
            <Route path="/me" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}