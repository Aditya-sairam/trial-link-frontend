import { useFormContext, useFieldArray } from "react-hook-form";
import DynamicListField from "../DynamicListField";
import { defaultCondition } from "../../schemas/patientSchema";

export default function ConditionsStep() {
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "conditions" });
  const errs = errors.conditions || [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">Conditions</h3>
      <DynamicListField
        items={fields}
        onAdd={() => append({ ...defaultCondition })}
        onRemove={remove}
        label="Condition"
        renderSummary={(item) => item.display_name || ""}
        renderForm={(i) => (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Condition Name *</label>
              <input className="form-input" placeholder="e.g. Type 2 Diabetes"
                {...register(`conditions.${i}.display_name`, { required: "Required" })} />
              {errs[i]?.display_name && <p className="form-error">{errs[i].display_name.message}</p>}
            </div>

            <div>
              <label className="form-label">SNOMED / ICD Code *</label>
              <input className="form-input" placeholder="e.g. 44054006"
                {...register(`conditions.${i}.code`, { required: "Required" })} />
              {errs[i]?.code && <p className="form-error">{errs[i].code.message}</p>}
            </div>

            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...register(`conditions.${i}.status`)}>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="remission">Remission</option>
                <option value="recurrence">Recurrence</option>
              </select>
            </div>

            <div>
              <label className="form-label">Severity</label>
              <select className="form-input" {...register(`conditions.${i}.severity`)}>
                <option value="">-- Select --</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>

            <div>
              <label className="form-label">Onset Date</label>
              <input type="date" className="form-input"
                {...register(`conditions.${i}.onset_date`)} />
            </div>

            <div>
              <label className="form-label">Abatement Date</label>
              <input type="date" className="form-input"
                {...register(`conditions.${i}.abatement_date`)} />
            </div>

            <div className="col-span-2">
              <label className="form-label">Body Site</label>
              <input className="form-input" placeholder="e.g. Left lung"
                {...register(`conditions.${i}.body_site`)} />
            </div>
          </div>
        )}
      />
    </div>
  );
}