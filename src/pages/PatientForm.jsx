import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { PatientSchema, defaultPatient } from "../schemas/patientSchema";
import { createPatient, getPatient, updatePatient } from "../services/patientApi";
import DemographicsStep from "../components/form-steps/DemographicsStep";
import ConditionsStep from "../components/form-steps/ConditionsStep";
import MedicationsStep from "../components/form-steps/MedicationsStep";
import ObservationsStep from "../components/form-steps/ObservationsStep";
import { ProceduresStep, AllergiesStep, LifestyleStep } from "../components/form-steps/ProceduresStep";
import JsonUpload from "../components/JsonUpload";

const STEPS = [
  { label: "Demographics", fields: ["demographics"] },
  { label: "Conditions",   fields: ["conditions"] },
  { label: "Medications",  fields: ["medications"] },
  { label: "Observations", fields: ["observations"] },
  { label: "Procedures",   fields: ["procedures"] },
  { label: "Allergies",    fields: ["allergies"] },
  { label: "Lifestyle",    fields: ["lifestyle"] },
];

const STEP_COMPONENTS = [
  DemographicsStep,
  ConditionsStep,
  MedicationsStep,
  ObservationsStep,
  ProceduresStep,
  AllergiesStep,
  LifestyleStep,
];

export default function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(isEditMode);
  const [uploadMode, setUploadMode] = useState(false);

  const methods = useForm({
    resolver: zodResolver(PatientSchema),
    defaultValues: defaultPatient,
    mode: "onTouched",
  });

  const { handleSubmit, trigger, watch, setValue, reset } = methods;

  useEffect(() => {
    if (!isEditMode) return;
    getPatient(id)
      .then((data) => {
        const normalized = JSON.parse(JSON.stringify(data));
        reset(normalized);
      })
      .catch((err) => setSubmitError(`Failed to load patient: ${err.message}`))
      .finally(() => setLoadingPatient(false));
  }, [id]);

  const dob = watch("demographics.date_of_birth");
  if (dob) {
    const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
    if (age >= 0) setValue("demographics.age", age);
  }

  const handleNext = async () => {
    const valid = await trigger(STEPS[currentStep].fields);
    if (valid) setCurrentStep(s => s + 1);
  };

  const handleBack = () => setCurrentStep(s => s - 1);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);

    const clean = JSON.parse(
      JSON.stringify(data, (_, v) => (v === "" ? null : v === undefined ? null : v))
    );

    try {
      if (isEditMode) {
        await updatePatient(id, clean);
        navigate(`/patients/${id}`);
      } else {
        const created = await createPatient(clean);
        navigate(`/patients/${created.demographics.patient_id}`);
      }
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  if (loadingPatient) return <p className="text-gray-500 mt-8">⏳ Loading patient data...</p>;

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEditMode ? "Edit Patient Profile" : "New Patient Profile"}
        </h2>
        {!isEditMode && (
          <button
            type="button"
            onClick={() => { setUploadMode(!uploadMode); setSubmitError(null); }}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {uploadMode ? "✏️ Manual Entry" : "📂 Upload JSON"}
          </button>
        )}
      </div>

      {/* JSON Upload Mode */}
      {!isEditMode && uploadMode && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <JsonUpload />
        </div>
      )}

      {/* Manual Form Mode */}
      {!uploadMode && (
        <>
          {/* Step Progress Bar */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < currentStep
                      ? "bg-blue-600 text-white"
                      : i === currentStep
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  <span className={`mt-1 text-xs font-medium ${
                    i === currentStep ? "text-blue-600" : "text-gray-400"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                    i < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-64">
                <StepComponent />
              </div>

              {submitError && isLast && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ❌ {submitError}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Back
                </button>

                {isLast ? (
                  <button type="submit" disabled={submitting} className="btn-primary px-8">
                    {submitting
                      ? (isEditMode ? "Saving..." : "Submitting...")
                      : (isEditMode ? "✓ Save Changes" : "✓ Create Patient")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleNext(); }}
                    className="btn-primary"
                  >
                    Next →
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </>
      )}
    </div>
  );
}