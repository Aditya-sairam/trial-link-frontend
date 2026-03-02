import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext(null);

// Wrap the entire app with this so any component can access the current user
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until Firebase confirms auth state

  useEffect(() => {
    console.log("AuthContext: setting up Firebase listener...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("AuthContext: auth state changed →", firebaseUser ? firebaseUser.email : "null (not logged in)");
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Don't render anything until Firebase has confirmed auth state
          This prevents a flash of the login page on refresh */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component to get the current user
// e.g. const { user } = useAuth();
export const useAuth = () => useContext(AuthContext);