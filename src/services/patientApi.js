import axios from "axios";
import { getToken } from "./authService";

// Pulls from your .env file — set VITE_API_BASE_URL to your Cloud Run URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Request interceptor: attach Firebase JWT token to every request ---
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    console.log("Auth token:", token ? "present" : "missing");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// --- Response interceptor: normalize errors ---
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(msg));
  }
);

// ----------------------------------------------------------------
// Patient CRUD — maps directly to your FastAPI endpoints
// ----------------------------------------------------------------

/**
 * POST /patients/create
 * Sends full Patient object. API assigns patient_id internally.
 */
export const createPatient = async (patientData) => {
  const { data } = await api.post("/patients/create", patientData);
  return data;
};

/**
 * GET /patients/{patient_id}
 */
export const getPatient = async (patientId) => {
  const { data } = await api.get(`/patients/${patientId}`);
  return data;
};

/**
 * GET /patients
 * Returns full list — consider pagination if this grows large
 */
export const getAllPatients = async () => {
  const { data } = await api.get("/patients");
  return data;
};

/**
 * PUT /patients/{patient_id}
 * Sends full updated Patient object
 */
export const updatePatient = async (patientId, patientData) => {
  const { data } = await api.put(`/patients/${patientId}`, patientData);
  return data;
};

/**
 * DELETE /patients/{patient_id}
 * Returns 204 No Content on success
 */
export const deletePatient = async (patientId) => {
  await api.delete(`/patients/${patientId}`);
};

/**
 * GET /me/trial-suggestions
 * Publishes patient_id to Pub/Sub — triggers RAG pipeline
 */
export const getTrialSuggestions = async () => {
  const { data } = await api.get("/me/trial-suggestions");
  return data; // { status: "processing", patient_id, message_id }
};

/**
 * GET /me/trial-suggestions/results
 * Polls for RAG pipeline results from Firestore
 */
export const getTrialSuggestionsResults = async () => {
  const { data } = await api.get("/me/trial-suggestions/results");
  return data; // { status: "not_started" | "processing" | "completed" | "failed" }
};
export const getMyProfile = async () => {
  const { data } = await api.get("/me");
  return data;
};
export const healthCheck = async () => {
  const { data } = await api.get("/health");
  return data;
};