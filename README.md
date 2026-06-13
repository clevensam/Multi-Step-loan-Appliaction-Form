# LendSwift — Multi-Step Loan Application

An 8-step loan application form wizard with conditional logic, cross-step validation, auto-save, document upload with compression, e-signature, and financial calculations.

## Tech Stack

- **Vite** + **React** 19
- **Tailwind CSS** 3 (brand: #1F4E79 / #27AE60 / #E74C3C / #F39C12)
- **react-hook-form** + **@hookform/resolvers** + **Zod** (validation)
- **react-dropzone** (file upload), **react-signature-canvas** (e-sign)
- **Cypress** 15 (E2E tests)

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint
```

## Test

```bash
npx cypress run                    # Headless (all 62 tests)
npx cypress run --headed           # Visible browser
npx cypress open                   # Interactive mode
```

## Architecture

```
src/
├── components/
│   ├── common/       9 compound form components (Input, Select, RadioGroup, etc.)
│   ├── Step1-8/      Step-specific components
│   ├── Wizard.jsx    Step registry, navigation, visibility guards
│   ├── ProgressBar   Step progress indicator
│   └── StepNavigation Prev/Next/Submit
├── hooks/            useAutoSave, useFormPersistence, useVerification, usePinCodeLookup
├── schemas/          Zod schemas per step + schemaFactory (cross-step validation)
├── utils/            validators, emiCalculator, encryption, imageCompressor, PIN dataset
└── constants.js      Centralized config
```

## Features

- **8-step wizard** with dynamic step visibility (Co-Applicant conditional on amount/type)
- **Cross-step validation**: 14 dependency rules (e.g., DOB + tenure ≤ 65, Business loan → Self-Employed only)
- **Auto-save**: AES-256-GCM encrypted, debounced 30s, 72h expiry, resume/start-fresh prompt
- **Image compression**: Canvas API, recursive quality reduction (0.7 → 0.1 steps)
- **EMI calculator**: `P × r × (1+r)^n / ((1+r)^n – 1)` with 10.5%/8.5%/14% rates
- **PII masking**: Show last 4 chars; e-sign canvas with blur overlay
- **WCAG 2.1 AA**: aria-labels, focus management, keyboard navigation, color contrast

## E2E Tests (62 tests, 15 specs)

| Priority | Tests |
|----------|-------|
| P0 (11) | Happy paths (Personal/Home/Business), validation (Steps 1-4), PIN lookup, employment switch, file upload, auto-save resume, cross-step dependency |
| P1 (4)  | Conditional visibility, e-signature, keyboard nav, rapid navigation stress |
