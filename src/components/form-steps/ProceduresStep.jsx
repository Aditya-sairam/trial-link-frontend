// ─── ProceduresStep.jsx ──────────────────────────────────────────────────────
import { useFormContext, useFieldArray } from "react-hook-form";
import DynamicListField from "../DynamicListField";
import { defaultProcedure } from "../../schemas/patientSchema";

export function ProceduresStep() {
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "procedures" });
  const errs = errors.procedures || [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">Procedures</h3>
      <DynamicListField
        items={fields}
        onAdd={() => append({ ...defaultProcedure })}
        onRemove={remove}
        label="Procedure"
        renderSummary={(item) => item.display_name || ""}
        renderForm={(i) => (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Procedure Name *</label>
              <input className="form-input" placeholder="e.g. Coronary angioplasty"
                {...register(`procedures.${i}.display_name`, { required: "Required" })} />
              {errs[i]?.display_name && <p className="form-error">{errs[i].display_name.message}</p>}
            </div>

            <div>
              <label className="form-label">SNOMED / CPT Code *</label>
              <input className="form-input" placeholder="e.g. 41976001"
                {...register(`procedures.${i}.code`, { required: "Required" })} />
              {errs[i]?.code && <p className="form-error">{errs[i].code.message}</p>}
            </div>

            <div>
              <label className="form-label">Performed Date *</label>
              <input type="date" className="form-input"
                {...register(`procedures.${i}.performed_date`, { required: "Required" })} />
              {errs[i]?.performed_date && <p className="form-error">{errs[i].performed_date.message}</p>}
            </div>

            <div>
              <label className="form-label">Body Site</label>
              <input className="form-input" placeholder="e.g. Left femoral artery"
                {...register(`procedures.${i}.body_site`)} />
            </div>

            <div>
              <label className="form-label">Reason</label>
              <input className="form-input" placeholder="Why the procedure was done"
                {...register(`procedures.${i}.reason`)} />
            </div>

            <div>
              <label className="form-label">Outcome</label>
              <input className="form-input" placeholder="e.g. Successful, Complications"
                {...register(`procedures.${i}.outcome`)} />
            </div>
          </div>
        )}
      />
    </div>
  );
}


// ─── AllergiesStep.jsx ───────────────────────────────────────────────────────
import { useState } from "react";
import { defaultAllergy } from "../../schemas/patientSchema";

export function AllergiesStep() {
  const { register, control, formState: { errors }, setValue, getValues } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "allergies" });
  const errs = errors.allergies || [];

  // Reactions are List[str] — we manage as a local tag input per item
  const ReactionTagInput = ({ index }) => {
    const [tag, setTag] = useState("");
    const reactions = getValues(`allergies.${index}.reaction`) || [];

    const addTag = () => {
      const trimmed = tag.trim();
      if (trimmed && !reactions.includes(trimmed)) {
        setValue(`allergies.${index}.reaction`, [...reactions, trimmed]);
        setTag("");
      }
    };

    const removeTag = (t) => {
      setValue(`allergies.${index}.reaction`, reactions.filter(r => r !== t));
    };

    return (
      <div>
        <label className="form-label">Reactions</label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {reactions.map(r => (
            <span key={r} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
              {r}
              <button type="button" onClick={() => removeTag(r)} className="hover:text-red-500 font-bold">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="form-input flex-1"
            placeholder="e.g. Hives, Anaphylaxis"
            value={tag}
            onChange={e => setTag(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
          />
          <button type="button" onClick={addTag} className="btn-secondary text-xs px-3">Add</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">Allergies</h3>
      <DynamicListField
        items={fields}
        onAdd={() => append({ ...defaultAllergy })}
        onRemove={remove}
        label="Allergy"
        renderSummary={(item) =>
          item.substance
            ? `${item.substance}${item.criticality ? ` — ${item.criticality}` : ""}`
            : ""
        }
        renderForm={(i) => (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Substance *</label>
              <input className="form-input" placeholder="e.g. Penicillin, Peanuts"
                {...register(`allergies.${i}.substance`, { required: "Required" })} />
              {errs[i]?.substance && <p className="form-error">{errs[i].substance.message}</p>}
            </div>

            <div>
              <label className="form-label">Type</label>
              <select className="form-input" {...register(`allergies.${i}.type`)}>
                <option value="allergy">Allergy</option>
                <option value="intolerance">Intolerance</option>
              </select>
            </div>

            <div>
              <label className="form-label">Criticality</label>
              <select className="form-input" {...register(`allergies.${i}.criticality`)}>
                <option value="">-- Select --</option>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="unable-to-assess">Unable to Assess</option>
              </select>
            </div>

            <div>
              <label className="form-label">Onset Date</label>
              <input type="date" className="form-input"
                {...register(`allergies.${i}.onset_date`)} />
            </div>

            {/* Full width reaction tag input */}
            <div className="col-span-2">
              <ReactionTagInput index={i} />
            </div>
          </div>
        )}
      />
    </div>
  );
}


// ─── LifestyleStep.jsx ───────────────────────────────────────────────────────
export function LifestyleStep() {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">Lifestyle Factors</h3>
      <p className="text-sm text-gray-500">All fields are optional.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Smoking Status</label>
          <select className="form-input" {...register("lifestyle.smoking_status")}>
            <option value="">-- Select --</option>
            <option value="Never smoker">Never smoker</option>
            <option value="Former smoker">Former smoker</option>
            <option value="Current every day smoker">Current every day smoker</option>
            <option value="Current some day smoker">Current some day smoker</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <div>
          <label className="form-label">Alcohol Use</label>
          <select className="form-input" {...register("lifestyle.alcohol_use")}>
            <option value="">-- Select --</option>
            <option value="None">None</option>
            <option value="Light">Light (1-7 drinks/week)</option>
            <option value="Moderate">Moderate (8-14 drinks/week)</option>
            <option value="Heavy">Heavy (15+ drinks/week)</option>
          </select>
        </div>

        <div>
          <label className="form-label">Exercise Frequency</label>
          <select className="form-input" {...register("lifestyle.exercise_frequency")}>
            <option value="">-- Select --</option>
            <option value="Sedentary">Sedentary</option>
            <option value="Light (1-2 days/week)">Light (1-2 days/week)</option>
            <option value="Moderate (3-4 days/week)">Moderate (3-4 days/week)</option>
            <option value="Active (5+ days/week)">Active (5+ days/week)</option>
          </select>
        </div>

        <div>
          <label className="form-label">Occupation</label>
          <input className="form-input" placeholder="e.g. Software Engineer, Nurse"
            {...register("lifestyle.occupation")} />
        </div>
      </div>
    </div>
  );
}