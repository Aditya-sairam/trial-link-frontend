import { useState, useEffect } from "react";
import { auth } from "../services/firebase";

/**
 * Returns the current user's role from their Firebase token claims.
 * Returns null while loading, "admin" or "patient" once resolved.
 */
export function useRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // forceRefresh: true ensures we get the latest custom claims
        const tokenResult = await user.getIdTokenResult(true);
        setRole(tokenResult.claims.role || "patient");
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { role, loading };
}