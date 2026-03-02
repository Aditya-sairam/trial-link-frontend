import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import DynamicListField from "../DynamicListField";
import { defaultObservation, ObservationSchema } from "../../schemas/patientSchema";

export default function ObservationsStep() {
  const { register, control, formState: { errors }, getValues, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "observations" });
  const errs = errors.observations || [];

  // --- JSON Import State ---
  const [jsonInput, setJsonInput] = useState("");
  const [importMode, setImportMode] = useState(false);
  const [importResult, setImportResult] = useState(null); // { success, skipped, errors }

  const handleJsonImport = () => {
    setImportResult(null);
    let parsed;

    // 1. Parse JSON
    try {
      parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) parsed = [parsed]; // support single obj too
    } catch {
      setImportResult({ type: "error", message: "Invalid JSON — could not parse." });
      return;
    }

    // 2. Validate each entry against ObservationSchema
    const valid = [];
    const skipped = [];

    parsed.forEach((item, idx) => {
      const result = ObservationSchema.safeParse(item);
      if (result.success) {
        valid.push(result.data);
      } else {
        const fieldErrors = result.error.errors.map(e => e.path.join(".")).join(", ");
        skipped.push({ idx: idx + 1, reason: fieldErrors });
      }
    });

    // 3. Append valid entries
    valid.forEach(obs => append(obs));

    setImportResult({
      type: "summary",
      imported: valid.length,
      skipped,
    });
    setJsonInput("");
    setImportMode(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">
          Observations
          <span className="ml-2 text-xs font-normal text-gray-400">({fields.length} added)</span>
        </h3>
        <button
          type="button"
          onClick={() => { setImportMode(!importMode); setImportResult(null); }}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          {importMode ? "Cancel Import" : "⬆ Import from JSON"}
        </button>
      </div>

      {/* JSON Import Panel */}
      {importMode && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
          <p className="text-xs text-blue-700 font-medium">
            Paste an array of observation objects. Required fields per entry:
            <code className="ml-1 bg-blue-100 px-1 rounded">code</code>,
            <code className="ml-1 bg-blue-100 px-1 rounded">display_name</code>,
            <code className="ml-1 bg-blue-100 px-1 rounded">date</code>.
            Invalid entries will be skipped with a report.
          </p>
          <textarea
            className="w-full font-mono text-xs border border-blue-300 rounded p-2 h-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder='[{"code": "8867-4", "display_name": "Heart rate", "value": 72, "unit": "/min", "date": "2024-01-15"}]'
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
          />
          <button type="button" onClick={handleJsonImport} className="btn-primary">
            Validate & Import
          </button>
        </div>
      )}

      {/* Import Result Summary */}
      {importResult && (
        <div className={`rounded-lg p-3 text-sm ${
          importResult.type === "error"
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-green-50 border border-green-200 text-green-700"
        }`}>
          {importResult.type === "error" ? (
            <p>❌ {importResult.message}</p>
          ) : (
            <>
              <p>✅ {importResult.imported} observation(s) imported successfully.</p>
              {importResult.skipped.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-amber-700">
                    ⚠️ {importResult.skipped.length} entry(s) skipped:
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs text-amber-600">
                    {importResult.skipped.map((s) => (
                      <li key={s.idx}>Entry #{s.idx}: missing or invalid — <code>{s.reason}</code></li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Manual list */}
      <DynamicListField
        items={fields}
        onAdd={() => append({ ...defaultObservation })}
        onRemove={remove}
        label="Observation"
        renderSummary={(item) =>
          item.display_name
            ? `${item.display_name}${item.value != null ? ` — ${item.value} ${item.unit || ""}` : item.value_string ? ` — ${item.value_string}` : ""}`
            : ""
        }
        renderForm={(i) => (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Observation Name *</label>
              <input className="form-input" placeholder="e.g. Heart rate"
                {...register(`observations.${i}.display_name`, { required: "Required" })} />
              {errs[i]?.display_name && <p className="form-error">{errs[i].display_name.message}</p>}
            </div>

            <div>
              <label className="form-label">LOINC Code *</label>
              <input className="form-input" placeholder="e.g. 8867-4"
                {...register(`observations.${i}.code`, { required: "Required" })} />
              {errs[i]?.code && <p className="form-error">{errs[i].code.message}</p>}
            </div>

            <div>
              <label className="form-label">Numeric Value</label>
              <input type="number" step="any" className="form-input"
                {...register(`observations.${i}.value`, { valueAsNumber: true })} />
            </div>

            <div>
              <label className="form-label">Unit</label>
              <input className="form-input" placeholder="e.g. mg/dL, /min, %"
                {...register(`observations.${i}.unit`)} />
            </div>

            <div>
              <label className="form-label">String Value</label>
              <input className="form-input" placeholder="For non-numeric results"
                {...register(`observations.${i}.value_string`)} />
            </div>

            <div>
              <label className="form-label">Category</label>
              <select className="form-input" {...register(`observations.${i}.category`)}>
                <option value="">-- Select --</option>
                <option value="vital-signs">Vital Signs</option>
                <option value="laboratory">Laboratory</option>
                <option value="imaging">Imaging</option>
                <option value="procedure">Procedure</option>
                <option value="survey">Survey</option>
              </select>
            </div>

            <div>
              <label className="form-label">Reference Range Low</label>
              <input type="number" step="any" className="form-input"
                {...register(`observations.${i}.reference_range_low`, { valueAsNumber: true })} />
            </div>

            <div>
              <label className="form-label">Reference Range High</label>
              <input type="number" step="any" className="form-input"
                {...register(`observations.${i}.reference_range_high`, { valueAsNumber: true })} />
            </div>

            <div>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input"
                {...register(`observations.${i}.date`, { required: "Required" })} />
              {errs[i]?.date && <p className="form-error">{errs[i].date.message}</p>}
            </div>
          </div>
        )}
      />
    </div>
  );
}