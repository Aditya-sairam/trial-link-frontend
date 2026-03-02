import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatient } from "../services/patientApi";

// ── Small reusable components ─────────────────────────────────────────────────

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray:   "bg-gray-100 text-gray-600",
    green:  "bg-green-100 text-green-700",
    red:    "bg-red-100 text-red-700",
    blue:   "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const Section = ({ title, count, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {count !== undefined && (
        <span className="text-xs text-gray-400 font-medium">{count} total</span>
      )}
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
    <p className="text-sm text-gray-800 mt-0.5">{value || "—"}</p>
  </div>
);

// ── Status → badge color mapping ──────────────────────────────────────────────
const conditionColor = { active: "red", resolved: "green", remission: "blue", recurrence: "yellow" };
const medColor = { active: "blue", stopped: "gray", completed: "green" };
const critColor = { high: "red", low: "yellow", "unable-to-assess": "gray" };

// ── Main Component ────────────────────────────────────────────────────────────
export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("conditions");

  useEffect(() => {
    getPatient(id)
      .then(setPatient)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500 mt-8">⏳ Loading patient...</p>;
  if (error)   return <p className="text-red-500 mt-8">❌ {error}</p>;
  if (!patient) return null;

  const d = patient.demographics;

  const TABS = [
    { key: "conditions",   label: "Conditions",   count: patient.conditions?.length },
    { key: "medications",  label: "Medications",  count: patient.medications?.length },
    { key: "observations", label: "Observations", count: patient.observations?.length },
    { key: "procedures",   label: "Procedures",   count: patient.procedures?.length },
    { key: "allergies",    label: "Allergies",    count: patient.allergies?.length },
    { key: "lifestyle",    label: "Lifestyle" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back + Edit buttons */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/patients")}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          ← Back to Patients
        </button>
        <button onClick={() => navigate(`/patients/${id}/edit`)}
          className="btn-primary">
          ✏️ Edit Patient
        </button>
      </div>

      {/* Demographics header card */}
      <Section title="Patient Demographics">
        <div className="grid grid-cols-3 gap-6">
          <Field label="Patient ID" value={<span className="font-mono text-xs">{d.patient_id}</span>} />
          <Field label="Date of Birth" value={d.date_of_birth} />
          <Field label="Age" value={`${d.age} years`} />
          <Field label="Gender" value={<span className="capitalize">{d.gender}</span>} />
          <Field label="Race" value={d.race} />
          <Field label="Marital Status" value={d.marital_status} />
          <Field label="City" value={d.city} />
          <Field label="State" value={d.state} />
          <Field label="Country" value={d.country} />
        </div>
      </Section>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {/* Conditions */}
        {activeTab === "conditions" && (
          <Section title="Conditions" count={patient.conditions?.length}>
            {patient.conditions?.length === 0
              ? <p className="text-sm text-gray-400">No conditions recorded.</p>
              : <div className="space-y-3">
                  {patient.conditions.map((c, i) => (
                    <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800">{c.display_name}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.code}</p>
                        {c.onset_date && <p className="text-xs text-gray-400">Onset: {c.onset_date}</p>}
                      </div>
                      <div className="flex gap-2 items-center">
                        {c.severity && <Badge color="gray">{c.severity}</Badge>}
                        <Badge color={conditionColor[c.status] || "gray"}>{c.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </Section>
        )}

        {/* Medications */}
        {activeTab === "medications" && (
          <Section title="Medications" count={patient.medications?.length}>
            {patient.medications?.length === 0
              ? <p className="text-sm text-gray-400">No medications recorded.</p>
              : <div className="space-y-3">
                  {patient.medications.map((m, i) => (
                    <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800">{m.display_name}</p>
                        {m.dosage && <p className="text-xs text-gray-500">{m.dosage}{m.route ? ` · ${m.route}` : ""}</p>}
                        {m.reason && <p className="text-xs text-gray-400">For: {m.reason}</p>}
                        {m.start_date && <p className="text-xs text-gray-400">Since: {m.start_date}</p>}
                      </div>
                      <Badge color={medColor[m.status] || "gray"}>{m.status}</Badge>
                    </div>
                  ))}
                </div>
            }
          </Section>
        )}

        {/* Observations */}
        {activeTab === "observations" && (
          <Section title="Observations" count={patient.observations?.length}>
            {patient.observations?.length === 0
              ? <p className="text-sm text-gray-400">No observations recorded.</p>
              : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Name", "Value", "Reference Range", "Date", "Status"].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {patient.observations.map((o, i) => {
                        const isAbnormal = o.value != null && o.reference_range_low != null && o.reference_range_high != null
                          ? o.value < o.reference_range_low || o.value > o.reference_range_high
                          : null;
                        return (
                          <tr key={i}>
                            <td className="py-2 pr-4 font-medium">{o.display_name}</td>
                            <td className="py-2 pr-4">
                              {o.value != null ? `${o.value} ${o.unit || ""}` : o.value_string || "—"}
                            </td>
                            <td className="py-2 pr-4 text-gray-400 text-xs">
                              {o.reference_range_low != null && o.reference_range_high != null
                                ? `${o.reference_range_low} – ${o.reference_range_high} ${o.unit || ""}`
                                : "—"}
                            </td>
                            <td className="py-2 pr-4 text-gray-400 text-xs">{o.date}</td>
                            <td className="py-2">
                              {isAbnormal === true && <Badge color="red">Abnormal</Badge>}
                              {isAbnormal === false && <Badge color="green">Normal</Badge>}
                              {isAbnormal === null && <Badge color="gray">—</Badge>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            }
          </Section>
        )}

        {/* Procedures */}
        {activeTab === "procedures" && (
          <Section title="Procedures" count={patient.procedures?.length}>
            {patient.procedures?.length === 0
              ? <p className="text-sm text-gray-400">No procedures recorded.</p>
              : <div className="space-y-3">
                  {patient.procedures.map((p, i) => (
                    <div key={i} className="py-2 border-b border-gray-50 last:border-0 space-y-1">
                      <p className="text-sm font-medium text-gray-800">{p.display_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.code}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        {p.performed_date && <span>Date: {p.performed_date}</span>}
                        {p.body_site && <span>Site: {p.body_site}</span>}
                        {p.outcome && <span>Outcome: {p.outcome}</span>}
                      </div>
                      {p.reason && <p className="text-xs text-gray-400">Reason: {p.reason}</p>}
                    </div>
                  ))}
                </div>
            }
          </Section>
        )}

        {/* Allergies */}
        {activeTab === "allergies" && (
          <Section title="Allergies" count={patient.allergies?.length}>
            {patient.allergies?.length === 0
              ? <p className="text-sm text-gray-400">No allergies recorded.</p>
              : <div className="space-y-3">
                  {patient.allergies.map((a, i) => (
                    <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-800">{a.substance}</p>
                        <p className="text-xs text-gray-400 capitalize">{a.type}</p>
                        {a.reaction?.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {a.reaction.map(r => <Badge key={r} color="yellow">{r}</Badge>)}
                          </div>
                        )}
                        {a.onset_date && <p className="text-xs text-gray-400">Since: {a.onset_date}</p>}
                      </div>
                      {a.criticality && (
                        <Badge color={critColor[a.criticality] || "gray"}>{a.criticality}</Badge>
                      )}
                    </div>
                  ))}
                </div>
            }
          </Section>
        )}

        {/* Lifestyle */}
        {activeTab === "lifestyle" && (
          <Section title="Lifestyle Factors">
            {!patient.lifestyle
              ? <p className="text-sm text-gray-400">No lifestyle data recorded.</p>
              : <div className="grid grid-cols-2 gap-6">
                  <Field label="Smoking Status" value={patient.lifestyle.smoking_status} />
                  <Field label="Alcohol Use" value={patient.lifestyle.alcohol_use} />
                  <Field label="Exercise Frequency" value={patient.lifestyle.exercise_frequency} />
                  <Field label="Occupation" value={patient.lifestyle.occupation} />
                </div>
            }
          </Section>
        )}
      </div>
    </div>
  );
}