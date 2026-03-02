import { useFormContext, useFieldArray } from "react-hook-form";
import DynamicListField from "../DynamicListField";
import { defaultMedication } from "../../schemas/patientSchema";

export default function MedicationsStep() {
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "medications" });
  const errs = errors.medications || [];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">Medications</h3>
      <DynamicListField
        items={fields}
        onAdd={() => append({ ...defaultMedication })}
        onRemove={remove}
        label="Medication"
        renderSummary={(item) =>
          item.display_name
            ? `${item.display_name}${item.dosage ? ` — ${item.dosage}` : ""}`
            : ""
        }
        renderForm={(i) => (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Medication Name *</label>
              <input className="form-input" placeholder="e.g. Metformin"
                {...register(`medications.${i}.display_name`, { required: "Required" })} />
              {errs[i]?.display_name && <p className="form-error">{errs[i].display_name.message}</p>}
            </div>

            <div>
              <label className="form-label">RxNorm Code</label>
              <input className="form-input" placeholder="e.g. 860975"
                {...register(`medications.${i}.code`)} />
            </div>

            <div>
              <label className="form-label">Dosage</label>
              <input className="form-input" placeholder="e.g. 500mg twice daily"
                {...register(`medications.${i}.dosage`)} />
            </div>

            <div>
              <label className="form-label">Route</label>
              <input className="form-input" placeholder="e.g. oral, IV, topical"
                {...register(`medications.${i}.route`)} />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...register(`medications.${i}.status`)}>
                <option value="active">Active</option>
                <option value="stopped">Stopped</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input"
                {...register(`medications.${i}.start_date`)} />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input type="date" className="form-input"
                {...register(`medications.${i}.end_date`)} />
            </div>

            <div>
              <label className="form-label">Reason</label>
              <input className="form-input" placeholder="e.g. Type 2 Diabetes management"
                {...register(`medications.${i}.reason`)} />
            </div>
          </div>
        )}
      />
    </div>
  );
}