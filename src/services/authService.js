import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "./firebase";

// Sign up with email and password
export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Sign in with email and password
export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Sign out
export const signOut = () => firebaseSignOut(auth);

// Get current user's JWT token (auto-refreshed by Firebase)
export const getToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};