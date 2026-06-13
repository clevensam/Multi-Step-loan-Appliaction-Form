# LendSwift Multi-Step Loan Application — Agent Implementation Guide

## Project Overview

Build an 8-step loan application form wizard with conditional logic, cross-step validation, auto-save, document upload with compression, e-signature, and financial calculations. Tech stack: **Vite + React + Tailwind CSS + react-hook-form + Zod + Cypress**.

---

## 1. Project Setup

```bash
npm create vite@latest loan-application -- --template react
npm install react-hook-form @hookform/resolvers zod tailwindcss postcss autoprefixer react-dropzone react-signature-canvas cypress
```

Brand colors: primary `#1F4E79`, accent `#27AE60`, error `#E74C3C`, warning `#F39C12`.

ESLint: `eslint-config-airbnb` + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` + `eslint-plugin-import`. Zero errors in prod.

---

## 2. Mandatory Directory Structure

```
src/
├── components/
│   ├── common/         (Input, Select, RadioGroup, Checkbox, CurrencyInput, MaskedInput, FileUpload, ErrorMessage, SignatureCanvas)
│   ├── Step1LoanType.jsx  …  Step8Review.jsx
│   ├── Wizard.jsx
│   ├── ProgressBar.jsx
│   └── StepNavigation.jsx
├── hooks/
│   ├── useAutoSave.js
│   ├── useFormPersistence.js
│   ├── useVerification.js
│   └── usePinCodeLookup.js
├── schemas/
│   ├── step1Schema.js … step8Schema.js
│   └── schemaFactory.js
├── utils/
│   ├── validators.js       (PAN, Aadhaar Verhoeff, GST)
│   ├── emiCalculator.js
│   ├── encryption.js
│   └── pinCodeData.json
├── styles/index.css
├── App.jsx
└── main.jsx
```

---

## 3. Common Components (Compound Pattern)

All in `src/components/common/`, using `React.forwardRef` for RHF compatibility. Must work both controlled (`value`/`onChange`) and uncontrolled (`register`).

| Component | Sub-components | Notes |
|-----------|---------------|-------|
| `Input` | `Input.Label`, `Input.Field`, `Input.Error`, `Input.HelpText` |
| `Select` | Same pattern | Native + custom variants |
| `RadioGroup` | — | Horizontal + vertical layouts |
| `Checkbox` | — | Linked label |
| `CurrencyInput` | — | INR formatting: `10,50,000` |
| `MaskedInput` | — | PAN/Aadhaar, show last 4 only |
| `ErrorMessage` | — | `aria-live="polite"` `role="alert"` |
| `FileUpload` | Render prop for preview | Uses react-dropzone |
| `SignatureCanvas` | — | Uses react-signature-canvas |

---

## 4. Step Definitions

### Step 1 — Loan Type & Basic Information
- **Fields**: Loan Type (radio: Personal/Home/Business), Amount (INR, min 50K), Tenure (months dropdown), Purpose (type-specific dropdown), Referral Code (optional)
- **Ranges**:
  - Personal: Amount max 10L, Tenure 12–60m
  - Home: Amount max 1Cr, Tenure 60–360m
  - Business: Amount max 50L, Tenure 12–120m
- **Schema**: `step1Schema.js` — Zod with conditional ranges

### Step 2 — Personal Information
- **Fields**: Full Name, DOB (age 21–65), Gender, Marital Status, Father/Mother Name, Email (verification), Mobile (10 digits, start 6–9, OTP sim), Alternate Mobile (must differ)
- **Cross-step**: DOB + tenure ≤ 65 years (affects Step 1 max tenure)

### Step 3 — Identity Verification (KYC)
- **Fields**: PAN (masked, `AAAAA9999A`, 4th char=P for individual), Aadhaar (masked, 12 digits, Verhoeff checksum), Aadhaar Consent (checkbox, required), Voter ID (optional: 3 letters+7 digits), Passport (optional: 1 letter+7 digits, shown if Home >50L)
- **Verification simulation**: `useVerification` hook — on blur, if valid format → 1.5s spinner → green "Verified" badge. Invalid → red error immediately.
- **Cross-step**: If PAN verified → PAN copy upload in Step 7 becomes optional

### Step 4 — Address Information
- **Fields**: Current Address (Line 1 required 5–200 chars, Line 2 optional), PIN Code (6 digits → auto-fill city/state/PO via `usePinCodeLookup`), City (editable), State (editable, warns if mismatch), Residence Type (Owned/Rented/Company/Family), Years at Address (0–50)
- **Conditional**: Rented → show rent amount. <1 year → show previous address. "Same as Permanent" checkbox → hide/show permanent fields.
- **PIN data**: `pinCodeData.json` — minimum 100 samples across all states+UTs

### Step 5 — Employment & Income Details
- **Field**: Employment Type (radio: Salaried/Self-Employed/Business Owner)
- **Salaried**: Company Name (autocomplete), Designation, Monthly Net Salary (min 15K), Years of Experience
- **Self-Employed**: Business Name, Business Type, Annual Turnover (min 3L), Years in Business (min 2), Monthly Income
- **Business Owner**: Business Name, Business Type, Annual Turnover (min 3L), Years in Business (min 2), GST Number (15-char format), Office/Business Address
- **Cross-step**: If loan type is Business → must be Business Owner or Self-Employed (not Salaried)
- **Zod**: Use `z.discriminatedUnion()` for discriminated sub-forms

### Step 6 — Co-Applicant & Guarantor (Conditional)
- **Shows when**: Personal > 5L OR Home (always) OR Business > 20L
- **Fields**: Co-Applicant Name, Relationship (Spouse/Parent/Sibling/Business Partner), PAN (verify), Income, Consent + Signature
- **Cross-step**: If Step 2 Marital Status = Married → default relationship to Spouse
- **Toggle logic**: When step goes from hidden→visible, Wizard must insert it in navigation

### Step 7 — Document Upload & E-Signature
- **Documents** (conditional per loan type + employment type):

| Document | Required For | Format | Max Size |
|----------|-------------|--------|----------|
| PAN Card Copy | All (optional if verified in Step 3) | PDF/JPG/PNG | 5MB |
| Aadhaar Front+Back | All | PDF/JPG/PNG | 5MB each |
| Salary Slips (last 3) | Salaried | PDF | 5MB each |
| Bank Statements (6mo) | All | PDF | 10MB |
| ITR (2 years) | Self-Emp/Business | PDF | 5MB each |
| Property Docs | Home only | PDF | 10MB |
| Business Registration | Business only | PDF | 5MB |
| GST Returns (4 qtrs) | Business only | PDF | 5MB each |
| Photograph | All | JPG/PNG | 2MB |
| E-Signature | All | Canvas | N/A |

- **Image compression** (Canvas API): Max 1200px width, quality 0.7, recursive 0.1 steps until <2MB or quality <0.3. JPG/PNG only. Async/non-blocking. Show original vs compressed size.
- **E-Signature**: `react-signature-canvas`, responsive, clear button, export as base64 PNG, non-empty validation, blur overlay to prevent screen capture.

### Step 8 — Review, Consent & Pre-Approval Summary
- **Review**: Section-by-section read-only, each with "Edit" button navigating to that step
- **Pre-Approval Card**: Loan Amount, Tenure, Interest Rate (Personal 10.5%, Home 8.5%, Business 14%), EMI, Total Cost of Borrowing, Processing Fee (1%, min ₹2K, max ₹25K)
- **EMI Formula**: `P × r × (1+r)^n / ((1+r)^n – 1)` where r = monthly rate, n = months
- **Consent checkboxes** (4): (1) Info accurate, (2) Authorise credit check, (3) Terms & Conditions, (4) Receive communications
- **Submit**: Disabled until all 4 consents + all mandatory docs uploaded
- **Success modal**: UUID reference number, application summary, downloadable PDF summary (bonus)
- **EMI ratio check**: EMI ≤ 50% of monthly income (inc. co-applicant). If exceeded → warning + additional consent required

---

## 5. Cross-Step Validation Dependency Map

| Source Step | Source Field | Target Step | Target Behaviour |
|-------------|-------------|-------------|------------------|
| Step 1 | Loan Type | Step 5 | Business → must be Owner/SelfEmp |
| Step 1 | Loan Type | Step 6 | Home → always show step |
| Step 1 | Loan Type | Step 7 | Different docs per type |
| Step 1 | Loan Amount | Step 6 | Personal >5L or Business >20L → trigger |
| Step 1 | Loan Amount | Step 8 | EMI = f(amount, tenure, rate) |
| Step 1 | Loan Tenure | Step 8 | Used in EMI formula |
| Step 2 | Date of Birth | Step 1 | Age + tenure ≤ 65 years |
| Step 2 | Marital Status | Step 6 | Married → Spouse default |
| Step 3 | PAN verified | Step 7 | Verified → PAN copy optional |
| Step 4 | Residence Type | Step 4 | Rented → show rent field |
| Step 5 | Employment Type | Step 5 | Sub-form fields switch |
| Step 5 | Employment Type | Step 7 | Salaried → salary slips; others → ITR |
| Step 5 | Monthly Income | Step 8 | EMI ≤ 50% income |
| Step 6 | Co-App Income | Step 8 | Combined income for ratio |

Implement all 14 via `schemaFactory.js` — accepts full form state, returns appropriate Zod schema for any step.

---

## 6. Hooks

### useAutoSave(formState, interval = 30000)
- Debounced timer via `useRef`
- Serialize → AES-256-GCM encrypt (Web Crypto API) → localStorage key `lendswift_draft_[loanType]`
- Store metadata: `{ version, timestamp, step, loanType }`
- Toast "Draft saved at [time]" (auto-dismiss 2s)

### useFormPersistence()
- On mount, check localStorage for draft < 72h old
- Show modal: "Resume or Start Fresh?"
- Resume → decrypt → validate against schema → restore
- Start Fresh → delete saved state

### useVerification(value, type)
- Returns `{ isVerifying, isVerified, error }`
- On valid format → 1.5s delay (setTimeout) → success
- On invalid → immediate error

### usePinCodeLookup(pin)
- Returns `{ city, state, postOffice, isLoading, error }`
- Lookup from `pinCodeData.json`

---

## 7. Critical Algorithms

### PAN Validation
```
Format: AAAAA9999A
- Positions 1-5: uppercase letters
- Positions 6-9: digits  
- Position 10: uppercase letter
- 4th char = entity type (P=Individual, C=Company, F=Firm)
- Personal/Home loans: only P accepted
- Business loans: P, C, or F accepted
```

### Aadhaar Verhoeff Checksum
Use `d`, `p`, `inv` tables (3 arrays). Compute checksum across 12 digits. Valid if result === 0.
Implementation reference: standard Verhoeff algorithm with the three lookup tables.

### EMI Calculation
```
r = annualRate / 12 / 100
n = tenure in months
EMI = P * r * (1+r)^n / ((1+r)^n - 1)
Total Cost = (EMI * n) - P
Processing Fee = max(2000, min(25000, P * 0.01))
```

Interest rates: Personal=10.5%, Home=8.5%, Business=14% p.a.

### Indian Number Formatting
`10,50,000` not `1,050,000`. Use `Intl.NumberFormat('en-IN')` or manual formatting.

### GST Validation
15 chars: first 2 = state code digits, next 10 = PAN format, 13th = entity number, 14th = 'Z', 15th = checksum digit.

---

## 8. Security & PII

- All PII fields masked in UI (show last 4 only)
- Auto-save encrypted with AES-256-GCM via `window.crypto.subtle`
- E-signature canvas: blur overlay to prevent screen capture
- No `console.log` of PII in production
- Clear form data on component unmount

---

## 9. Accessibility (WCAG 2.1 AA)

- All inputs have `<label>` via `htmlFor`/`id`
- Errors use `aria-live="polite"` + `role="alert"`
- Focus moves to first input on step transition
- Full keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Color contrast: 4.5:1 text, 3:1 large text
- Touch targets ≥ 44×44px on mobile
- Progress indicator: `aria-label` conveying step position
- File upload status: `aria-live` region
- Autocomplete attributes on inputs (`given-name`, `email`, `tel`, `postal-code`, etc.)
- Visible focus rings on all interactive elements

---

## 10. Testing (Cypress E2E — 15+ journeys)

### P0 Tests (mandatory, -30pts each if missing)
1. Personal Loan Happy Path (salaried, full flow, submit)
2. Home Loan Happy Path (co-applicant, property docs)
3. Business Loan Happy Path (GST, ITR, registration)
4. Step 1 Validation Errors (empty submit → all errors)
5. Step 2 Validation Errors (incl. age validation)
6. Step 3 PAN/Aadhaar Validation (invalid format, invalid checksum, missing consent)
7. Step 4 PIN Code Lookup (valid → auto-fill, invalid → error)
8. Step 5 Employment Switching (swap types → fields update correctly)
9. File Upload & Compression (valid image → compressed, invalid type → error)
10. Auto-Save & Resume (fill → reload → resume modal → data restored)
11. Cross-Step Dependency (change loan type after Step 5 → dependent steps update)

### P1 Tests (expected, -15pts each if missing)
12. Step 6 Conditional Visibility (Home→shows, small Personal→hides)
13. E-Signature Capture (draw → appears in review; clear → validation error)
14. Keyboard Navigation (complete entire form without mouse)
15. Rapid Navigation Stress (click Next/Prev rapidly → no corruption)

### Custom Cypress Commands
Create in `support/commands.js`: `fillStep1`, `fillStep2`, `fillStep3`, etc.

---

## 11. Performance Targets

| Metric | Minimum | Target |
|--------|---------|--------|
| LCP | < 3.5s | < 2.5s |
| Performance Score | 70 | 85 |
| Accessibility Score | 85 | 90+ |
| Bundle size | — | < 300KB gzipped |
| Step transition | — | < 200ms |
| Validation feedback | — | < 100ms after blur |
| Memory | — | < 50MB sustained |

---

## 12. Git Workflow

- 40+ commits minimum
- Feature branches: `feature/step-1-loan-type`, `feature/auto-save`, `feature/e2e-tests`, etc.
- Conventional Commits: `feat(step3): add PAN verification simulation`
- No commit > 500 lines changed
- Main branch always deployable

---

## 13. Sprint Schedule

| Sprint | Days | Focus |
|--------|------|-------|
| Sprint 1: Foundation | 1–5 | Setup, common components, Steps 1–4, PIN lookup |
| Sprint 2: Complexity | 6–10 | Steps 5–8, cross-step logic, auto-save, file upload |
| Sprint 3: Quality | 11–15 | E2E tests (15+), accessibility audit, responsive polish, README, deploy |

---

## 14. QA Stress Test Defenses

- **LocalStorage tampering**: Detect corruption via schema validation → offer Start Fresh
- **Stale data leaks**: Clear sub-form data when switching employment type
- **Dynamic step insertion**: When Step 6 becomes visible mid-flow, Wizard must insert it
- **Multi-tab auto-save**: Each tab has own draft or conflict warning
- **Rapid Next clicks**: Debounce/throttle navigation, no state corruption
- **Edge cases**: PAN 4th char validation with specific error message, exact age boundary (21yr 0d accepts, 20yr 364d rejects), exact amount threshold (5,00,000 does NOT trigger Step 6, 5,00,001 does)

---

## 15. Key Files to Create

1. `src/components/Wizard.jsx` — Step registry, currentStep, navigation, visibility guards
2. `src/components/ProgressBar.jsx` — Step names + completion %
3. `src/components/StepNavigation.jsx` — Prev/Next/Save Draft buttons
4. `src/schemas/schemaFactory.js` — Dynamic schema generation from full state
5. `src/hooks/useAutoSave.js` — Encrypted auto-save every 30s
6. `src/hooks/useFormPersistence.js` — Resume/Start Fresh on load
7. `src/hooks/useVerification.js` — Simulated 1.5s verification
8. `src/hooks/usePinCodeLookup.js` — PIN → city/state/PO
9. `src/utils/validators.js` — PAN, Aadhaar Verhoeff, GST
10. `src/utils/emiCalculator.js` — EMI, total cost, processing fee
11. `src/utils/encryption.js` — AES-256-GCM encrypt/decrypt
12. `src/utils/pinCodeData.json` — 100+ sample PINs
