import { z } from "zod";

// --- Enums (mirrors Gender and ConditionStatus in data_models.py) ---

export const GenderEnum = z.enum(["male", "female", "other", "unknown"]);

export const ConditionStatusEnum = z.enum([
  "active",
  "resolved",
  "remission",
  "recurrence",
]);

// --- Demographics (mirrors Demographics Pydantic model) ---

export const DemographicsSchema = z.object({
  patient_id: z.string().default("pending"),
  firebase_uid: z.string().default("pending"), // stamped by backend from token
  date_of_birth: z.string().min(1, "Date of birth is required"),
  age: z.number().int().min(0).max(150),
  gender: GenderEnum,
  race: z.string().optional().nullable(),
  marital_status: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

// --- Condition (mirrors Condition Pydantic model) ---

export const ConditionSchema = z.object({
  code: z.string().min(1, "SNOMED/ICD code is required"),
  display_name: z.string().min(1, "Condition name is required"),
  onset_date: z.string().optional().nullable(),
  abatement_date: z.string().optional().nullable(),
  status: ConditionStatusEnum.default("active"),
  severity: z.string().optional().nullable(),
  body_site: z.string().optional().nullable(),
});

// --- Medication (mirrors Medication Pydantic model) ---

export const MedicationSchema = z.object({
  code: z.string().optional().nullable(), // RxNorm, optional in Pydantic
  display_name: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.string().default("active"),
  reason: z.string().optional().nullable(),
});

// --- Observation (mirrors Observation Pydantic model) ---

export const ObservationSchema = z.object({
  code: z.string().min(1, "LOINC code is required"),
  display_name: z.string().min(1, "Observation name is required"),
  value: z.number().optional().nullable(),
  value_string: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  reference_range_low: z.number().optional().nullable(),
  reference_range_high: z.number().optional().nullable(),
  date: z.string().min(1, "Observation date is required"),
  category: z.string().optional().nullable(),
});

// --- Procedure (mirrors Procedure Pydantic model) ---

export const ProcedureSchema = z.object({
  code: z.string().min(1, "SNOMED/CPT code is required"),
  display_name: z.string().min(1, "Procedure name is required"),
  performed_date: z.string().min(1, "Performed date is required"),
  body_site: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
});

// --- Allergy (mirrors Allergy Pydantic model) ---

export const AllergySchema = z.object({
  substance: z.string().min(1, "Substance is required"),
  criticality: z.string().optional().nullable(), // low, high, unable-to-assess
  reaction: z.array(z.string()).nullable().default([]),
  onset_date: z.string().optional().nullable(),
  type: z.string().default("allergy"),
});

// --- LifestyleFactors (mirrors LifestyleFactors Pydantic model) ---

export const LifestyleSchema = z.object({
  smoking_status: z.string().optional().nullable(),
  alcohol_use: z.string().optional().nullable(),
  exercise_frequency: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
});

// --- Patient (mirrors Patient Pydantic model — the root model) ---

export const PatientSchema = z.object({
  demographics: DemographicsSchema,
  conditions: z.array(ConditionSchema).default([]),
  medications: z.array(MedicationSchema).default([]),
  observations: z.array(ObservationSchema).default([]),
  procedures: z.array(ProcedureSchema).default([]),
  allergies: z.array(AllergySchema).default([]),
  lifestyle: LifestyleSchema.optional().nullable(),
});

// --- Default empty values for each section (used to init form state) ---

export const defaultCondition = {
  code: "", display_name: "", onset_date: null, abatement_date: null,
  status: "active", severity: null, body_site: null,
};

export const defaultMedication = {
  code: null, display_name: "", dosage: null, route: null,
  start_date: null, end_date: null, status: "active", reason: null,
};

export const defaultObservation = {
  code: "", display_name: "", value: null, value_string: null,
  unit: null, reference_range_low: null, reference_range_high: null,
  date: new Date().toISOString().split("T")[0], category: null,
};

export const defaultProcedure = {
  code: "", display_name: "",
  performed_date: new Date().toISOString().split("T")[0],
  body_site: null, reason: null, outcome: null,
};

export const defaultAllergy = {
  substance: "", criticality: null, reaction: [],
  onset_date: null, type: "allergy",
};

export const defaultPatient = {
  demographics: {
    patient_id: "pending",
    firebase_uid: "pending", date_of_birth: "", age: 0,
    gender: "unknown", race: null, marital_status: null,
    city: null, state: null, country: null,
  },
  conditions: [],
  medications: [],
  observations: [],
  procedures: [],
  allergies: [],
  lifestyle: {
    smoking_status: null, alcohol_use: null,
    exercise_frequency: null, occupation: null,
  },
};