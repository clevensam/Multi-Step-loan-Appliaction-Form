# Architecture

This document describes the key architectural patterns used in LendSwift: the Wizard step registry, the Schema Factory for dynamic validation, the Auto-Save persistence layer, and the Cross-Step Dependency management system.

---

## 1. Wizard Pattern (Step Registry)

### Overview

The Wizard is not a simple multi-page form — it is a **step registry** with dynamic visibility, navigation guards, progress tracking, and focus management, all orchestrated from a single component.

### Core Components

```
App.jsx                    — Root: state owner, validation dispatcher, auto-save hook
├── Wizard.jsx             — Step registry, navigation, visibility, submit
│   ├── ProgressBar.jsx    — Visual progress indicator
│   ├── StepNavigation.jsx — Prev / Next / Submit buttons
│   └── Step*.jsx          — Per-step component (injected via map)
└── hooks/                 — useAutoSave, useFormPersistence, etc.
```

### Step Registry

Steps are defined as data in `src/constants.js` (line 1–10):

```js
const STEPS = [
  { id: 'step1', label: 'Loan Type & Basic Info', component: 'Step1LoanType' },
  // ... 7 more
];
```

Each step is a **data object** (id, label, component name) — not a route. The Wizard iterates over `STEPS`, filters by visibility, and renders the active step's component via a lookup map:

```js
const STEP_COMPONENTS = {
  Step1LoanType, Step2PersonalInfo, /* ... */
};
// ...
const CurrentStepComponent = STEP_COMPONENTS[currentStep.component];
```

### Dynamic Step Visibility

Step 6 (Co-Applicant & Guarantor) is conditionally visible based on loan type and amount:

```
Personal:  show if amount > ₹5,00,000
Home:      always show (threshold = 0)
Business:  show if amount > ₹20,00,000
```

Computed in `Wizard.jsx` (line 27–34):

```js
function computeShowCoApplicant(formData) {
  const threshold = STEP_6_THRESHOLDS[formData.loanType];
  if (threshold === undefined) return false;
  if (threshold === 0) return true;
  return Number(formData.loanAmount) > threshold;
}
```

The `stepsWithVisibility` array is derived with `useMemo` — when visibility toggles (e.g., user changes loan amount), the step count changes dynamically. If the current index exceeds the new step count, it is clamped (line 110–114).

### Navigation Guards

The `nextStep` callback calls `validateStep(currentStep.id)` before advancing. Validation is async (returns a Promise) so it works with both sync Zod schemas and async operations.

```js
const nextStep = useCallback(async () => {
  const isValid = await validateStep(currentStep.id);
  if (isValid && currentStepIdx < steps.length - 1) {
    setCurrentStepIdx((prev) => prev + 1);
  }
}, [currentStep, currentStepIdx, steps.length, validateStep]);
```

### Focus Management

On every step transition, focus is programmatically moved to the first focusable element inside the main content area (line 163–169):

```js
useEffect(() => {
  const timer = setTimeout(() => {
    const el = headerRef.current?.querySelector(
      'input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (el) el.focus();
  }, 50);
  return () => clearTimeout(timer);
}, [currentStepIdx]);
```

### URL Synchronization

The current step index is persisted as a URL query parameter (`?step=3`) using `history.replaceState` (line 171–175), enabling browser navigation and deep-linking during development.

### Cypress Bridge

A `__wizardGoToStep` function is exposed on `window` when running in Cypress (line 127–135), allowing tests to jump directly to any step without clicking through.

---

## 2. Schema Factory

### What it does

The Schema Factory is a **function that accepts the full form state and returns the appropriate Zod schema for any step**:

```js
// src/schemas/schemaFactory.js
export default function getSchema(stepIndex, formState = {}) {
  switch (stepIndex) {
    case 0: return step1Schema(formState);
    case 1: return step2Schema(formState);
    // ...
  }
}
```

### Why it exists

Each step's validation rules depend on fields from **other steps**. For example:

- Step 2 (Personal Info) needs Step 1's tenure to validate DOB + tenure ≤ 65
- Step 3 (KYC) needs loan type to validate PAN's 4th character
- Step 5 (Employment) needs loan type to exclude Salaried for Business loans
- Step 6 (Co-Applicant) needs `showCoApplicant` flag to conditionally require fields
- Step 7 (Documents) needs loan type, employment type, and PAN verification status

Without a factory, each schema would need to be re-instantiated in multiple places with inconsistent state. The factory keeps it centralized.

### How it works: discriminatedUnion example

Step 5 uses Zod's `z.discriminatedUnion` to switch between three sub-schemas:

```js
// src/schemas/step5Schema.js (simplified)
export default function step5Schema(formState) {
  if (formState.loanType === 'Business') {
    // Override: exclude Salaried, add validation note
    baseSchema = baseSchema.refine(
      (val) => val.employmentType !== 'Salaried',
      { message: 'Business loan requires Self-Employed or Business Owner' }
    );
  }
  return z.discriminatedUnion('employmentType', [
    salariedSchema,
    selfEmployedSchema,
    businessOwnerSchema,
  ]);
}
```

### How it works: superRefine example

Step 2 performs cross-step validation with `superRefine`:

```js
// src/schemas/step2Schema.js (simplified)
export default function step2Schema(formState) {
  return z.object({ ... }).superRefine((data, ctx) => {
    if (data.dateOfBirth && formState.loanTenure) {
      const age = calculateAge(data.dateOfBirth);
      const tenure = Number(formState.loanTenure);
      if (age + tenure / 12 > 65) {
        ctx.addIssue({
          path: ['dateOfBirth'],
          message: `Age (${age}) plus tenure (${tenure}mo) exceeds 65 years`,
        });
      }
    }
  });
}
```

### Validation call flow

```
StepNavigation.onNext()
  → Wizard.nextStep()
    → App.validateStep(stepId)
      → getSchema(absoluteIndex, formDataWithVerified)  // Factory call
      → schema.safeParse(formData)                       // Zod parse
      → If success: clear step errors, return true
      → If failure: flatten issues into { field: message }, set errors, return false
```

---

## 3. Auto-Save Flow

### Architecture

```
┌─────────────────┐    debounce      ┌──────────────┐    AES-GCM     ┌──────────────┐
│  Form State     │ ──────────────►  │  useAutoSave  │ ───────────►  │  localStorage │
│  (App.jsx)      │   30s (3s cyp)   │  (hook)       │               │  lendswift_   │
└─────────────────┘                  └──────────────┘               │  draft_*      │
                                                                     └──────────────┘
                                                                              │
                                                                              │ on mount
                                                                              ▼
                                                                     ┌──────────────┐
                                                                     │ useForm      │
                                                                     │ Persistence  │
                                                                     │ (hook)       │
                                                                     └──────┬───────┘
                                                                            │
                                                                  ┌─────────▼─────────┐
                                                                  │  Resume Modal      │
                                                                  │  [Resume] [Fresh]  │
                                                                  └───────────────────┘
```

### useAutoSave hook (`src/hooks/useAutoSave.js`)

```
Parameters:
  storageKey   — localStorage key (e.g., "lendswift_draft_Personal")
  state        — current form data
  metadata     — { step: currentStepIdx }
  interval     — debounce delay in ms (default 30 000)
  onSaved      — callback with timestamp (shows toast "Draft saved at HH:MM")

Behaviour:
  1. On every state change, schedule a save after `interval` ms
  2. On save: serialize { version, timestamp, metadata, data } → encrypt → localStorage
  3. Prevents concurrent saves (saveInProgress guard)
  4. Returns { saveNow } for manual save triggering
```

#### Encryption (`src/utils/encryption.js`)

```
Algorithm: AES-256-GCM
Key derivation: 32-byte key from passphrase (PKCS7-padded to 32 bytes)
IV: 12 random bytes via crypto.getRandomValues()
Storage format:
  base64( IV (12 bytes) + ciphertext )
  Meta stored separately as JSON: { timestamp, version }
```

### useFormPersistence hook (`src/hooks/useFormPersistence.js`)

```
On mount:
  1. Read localStorage meta to check timestamp
  2. If age > 72h → delete, return null
  3. Read encrypted data → decrypt
  4. Validate decrypted data against Step 0 schema (via schemaFactory)
  5. If valid → set showResume = true, return savedData
  6. If corrupt → delete storage, return null

Returns:
  { savedData, showResume, resume, startFresh }
```

### Resume/Start Fresh UX

In `App.jsx`, when `showResume` is true, a modal overlay is rendered:

- **Resume** → calls `resume()` → merges saved data into form state, restores step index
- **Start Fresh** → calls `startFresh()` → deletes localStorage, resets to defaultFormData

### Security considerations

- All PII is encrypted at rest in localStorage
- Passphrase is hardcoded (acceptable for demo; production would use a server-provided key per session)
- Decryption errors are caught silently → treated as corrupt data → start fresh
- No raw PII logged to console

---

## 4. Cross-Step Dependency Management

### The problem

In a multi-step form, changing a field on one step can affect validation rules, visibility, or required fields on other steps. LendSwift has 14 such dependencies (see table in README.md). Managing these ad-hoc leads to inconsistent state.

### Three-layer solution

The system handles cross-step dependencies at three distinct layers:

#### Layer 1: Schema Layer (validation-time)

Each schema function receives the full `formState` and can adjust rules dynamically:

| Dependency | Schema | Mechanism |
|-----------|--------|-----------|
| DOB + tenure ≤ 65 | `step2Schema` | `superRefine` with `formState.loanTenure` |
| Business → no Salaried | `step5Schema` | `refine` with `formState.loanType` |
| PAN entity type per loan | `step3Schema` | `refine` passes `formState.loanType` to `validatePAN` |
| Co-Applicant required fields | `step6Schema` | Conditional schema: empty object when hidden, full schema when visible |
| PAN verified → doc optional | `step7Schema` | `getRequiredDocs()` returns docs filtered by `panVerified` flag |
| EMI ratio + extra consent | `step8Schema` | Checks `formState` fields to decide if 5th consent is required |

#### Layer 2: State Layer (change-time)

When a field changes, `updateFields` in `App.jsx` performs **smart clearing** of dependent fields:

```
Changing loan type → clears:
  - Employment fields (step 5)
  - Co-Applicant fields (step 6)
  - All documents (step 7)

Changing employment type → clears:
  - Sub-form fields (company/business details)
  - But preserves loan type, personal info, KYC
```

This ensures stale data from a previous loan type (e.g., Business documents when switching to Personal) doesn't persist.

#### Layer 3: UI Layer (render-time)

The Wizard computes visibility and submit-readiness reactively:

```
Step 6 visibility:  computed on every render via computeShowCoApplicant()
                    → filters steps array
                    → if currentStep > visible steps, clamp index

Can submit:         computed via useMemo
                    → checks all 4 consents
                    → checks EMI ratio (needs Step 1 + Step 5 + Step 6)
                    → checks all required docs uploaded (needs Steps 1, 3, 5)
                    → checks signature present
```

### Dependency map with implementation source

| # | From | Field | To | Effect | Layer |
|---|------|-------|----|--------|-------|
| 1 | Step 1 | Loan Type | Step 5 | Exclude Salaried for Business | Schema (step5Schema) |
| 2 | Step 1 | Loan Type | Step 6 | Show co-applicant step | UI (Wizard) |
| 3 | Step 1 | Loan Type | Step 7 | Different doc requirements | Schema (step7Schema) |
| 4 | Step 1 | Loan Amount | Step 6 | Threshold check | UI (Wizard) |
| 5 | Step 1 | Loan Amount | Step 8 | EMI calculation | UI (Wizard) |
| 6 | Step 1 | Loan Tenure | Step 8 | EMI formula input | UI (Wizard) |
| 7 | Step 2 | DOB | Step 1 | Age + tenure ≤ 65 | Schema (step2Schema) |
| 8 | Step 2 | Marital Status | Step 6 | Default Spouse relationship | State (Step6 component) |
| 9 | Step 3 | PAN verified | Step 7 | PAN card optional | Schema (step7Schema) |
| 10 | Step 4 | Residence Type | Step 4 | Show/hide rent + previous address | State (Step4 component) |
| 11 | Step 5 | Employment Type | Step 5 | Switch sub-form fields | Schema (step5Schema) |
| 12 | Step 5 | Employment Type | Step 7 | Salary slips vs ITR | Schema (step7Schema) |
| 13 | Step 5 | Monthly Income | Step 8 | EMI ≤ 50% check | UI (Wizard) |
| 14 | Step 6 | Co-App Income | Step 8 | Combined income for ratio | UI (Wizard) |

### Error clearing on cross-step changes

When `updateFields` is called, errors for the modified fields are automatically cleared from the error state. For example, if the user changes their loan amount, the `loanAmount` error disappears immediately. This prevents stale error messages from a previous validation run.

```js
setErrors((prev) => {
  const next = { ...prev };
  Object.keys(fields).forEach((key) => {
    // Remove exact field errors
    delete next[key];
    // Remove nested field errors (e.g., "documents.panCard")
    Object.keys(next).forEach((k) => {
      if (k.startsWith(key + '.')) delete next[k];
    });
  });
  return next;
});
```

---

## Data Flow Summary

```
User Input
    │
    ▼
updateFields(fields)
    │
    ├──► setFormData(prev => merge + smart clear)
    │
    ├──► setErrors(prev => clear modified fields)
    │
    └──► useAutoSave detects change → schedules debounced save
              │
              ▼ (after 30s)
         encrypt(payload) → localStorage
    │
    ▼
User clicks Next
    │
    ▼
Wizard.nextStep()
    │
    ▼
App.validateStep(stepId)
    │
    ├──► getSchema(absoluteIndex, formData)  ← Schema Factory
    │
    ├──► schema.safeParse(formData)
    │
    ├──► [valid]   → clear errors, advance step
    │
    └──► [invalid] → flatten issues → set errors → stay on step
    │
    ▼
Step transition
    ├──► focus first input
    ├──► update URL (?step=N)
    └──► ProgressBar re-renders
```
