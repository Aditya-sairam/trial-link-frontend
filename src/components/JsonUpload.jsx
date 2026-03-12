import { useState, useRef } from "react";
import { createPatient } from "../services/patientApi";
import { PatientSchema } from "../schemas/patientSchema";
import { useNavigate } from "react-router-dom";

export default function JsonUpload({ onSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success"|"error"|"validating", message }
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const processFile = async (file) => {
    if (!file || !file.name.endsWith(".json")) {
      setStatus({ type: "error", message: "Please upload a valid .json file." });
      return;
    }

    setLoading(true);
    setStatus({ type: "validating", message: "Validating JSON structure..." });

    try {
      // 1. Read file
      const text = await file.text();
      const raw = JSON.parse(text);

      // 2. Validate against Zod schema
      const result = PatientSchema.safeParse(raw);
      if (!result.success) {
        const fieldErrors = result.error.errors
          .map(e => `${e.path.join(".")}: ${e.message}`)
          .join("\n");
        setStatus({
          type: "error",
          message: `Validation failed:\n${fieldErrors}`
        });
        setLoading(false);
        return;
      }

      setStatus({ type: "validating", message: "Uploading to API..." });

      // 3. Clean empty strings → null
      const clean = JSON.parse(
        JSON.stringify(result.data, (_, v) => (v === "" ? null : v))
      );

      // 4. Send to API
      const created = await createPatient(clean);
      setStatus({
        type: "success",
        message: `✅ Patient profile created successfully!`
      });

      // 5. Navigate to new patient profile after short delay
      setTimeout(() => {
        navigate(`/patients/${created.demographics.patient_id}`);
        onSuccess?.();
      }, 1500);

    } catch (err) {
      if (err instanceof SyntaxError) {
        setStatus({ type: "error", message: "Invalid JSON — could not parse the file." });
      } else {
        setStatus({ type: "error", message: `Upload failed: ${err.message}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <p className="text-3xl mb-2">📂</p>
        <p className="text-sm font-medium text-gray-700">
          Drag & drop a patient JSON file here
        </p>
        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Status Message */}
      {status && (
        <div className={`rounded-lg p-4 text-sm whitespace-pre-wrap ${
          status.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : status.type === "error"
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-blue-50 border border-blue-200 text-blue-700"
        }`}>
          {status.type === "validating" && (
            <span className="inline-block mr-2 animate-spin">⏳</span>
          )}
          {status.message}
        </div>
      )}

      {/* Expected format hint */}
      <div className="text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-500">Expected JSON structure:</p>
        <pre className="bg-gray-50 rounded p-2 overflow-x-auto text-xs">
{`{
  "demographics": { "date_of_birth": "...", "age": 0, "gender": "..." },
  "conditions": [...],
  "medications": [...],
  "observations": [...],
  "procedures": [...],
  "allergies": [...],
  "lifestyle": { ... }
}`}
        </pre>
      </div>
    </div>
  );
}