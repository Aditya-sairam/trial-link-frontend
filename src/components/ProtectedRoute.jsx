
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";

/**
 * Protects routes based on auth + optional role requirement.
 * - No user → redirect to /login
 * - Wrong role → redirect to /
 * - OK → render children
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const { role: userRole, loading } = useRole();

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <p className="text-gray-400 p-6">Loading...</p>;

  // If a specific role is required, enforce it
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return children;
}