import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPatients, deletePatient } from "../services/patientApi";

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // tracks which patient is being deleted

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (patientId, e) => {
    e.stopPropagation(); // prevent row click navigating to detail
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    setDeletingId(patientId);
    try {
      await deletePatient(patientId);
      setPatients(prev => prev.filter(p => p.demographics.patient_id !== patientId));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="text-gray-500 mt-8">⏳ Loading patients...</p>;
  if (error)   return <p className="text-red-500 mt-8">❌ {error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Patients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{patients.length} total records</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/patients/new")}>
          + New Patient
        </button>
      </div>

      {/* Empty state */}
      {patients.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🏥</p>
          <p className="font-medium">No patients yet.</p>
          <p className="text-sm mt-1">Click "New Patient" to add one.</p>
        </div>
      )}

      {/* Table */}
      {patients.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Patient ID", "Age", "Gender", "Location", "Active Conditions", "Current Meds", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => {
                const d = p.demographics;
                const activeConditions = p.conditions?.filter(c => c.status === "active").length ?? 0;
                const currentMeds = p.medications?.filter(m => m.status === "active").length ?? 0;
                const isDeleting = deletingId === d.patient_id;

                return (
                  <tr
                    key={d.patient_id}
                    onClick={() => navigate(`/patients/${d.patient_id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {d.patient_id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-medium">{d.age}</td>
                    <td className="px-4 py-3 capitalize">{d.gender}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {[d.city, d.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        activeConditions > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {activeConditions}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        currentMeds > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {currentMeds}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn-danger"
                        disabled={isDeleting}
                        onClick={(e) => handleDelete(d.patient_id, e)}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}