# LendSwift — Multi-Step Loan Application

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod)](https://zod.dev)
[![Cypress](https://img.shields.io/badge/Cypress-15-69D3A7?logo=cypress)](https://cypress.io)

An 8-step loan application form wizard with conditional logic, cross-step validation, encrypted auto-save, document upload with compression, e-signature, and financial calculations.

---

## Tech Stack

React 19 · Vite 8 · Tailwind CSS 3 · Zod 4 · react-hook-form 7 · Cypress 15

---

## Setup

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint
```

## Tests

```bash
npm run dev                   # Start dev server (1st terminal)
npx cypress run               # Headless E2E (2nd terminal)
npx cypress open              # Interactive mode
```

---

## Project Structure

```
src/
├── components/        Step components + Wizard + common UI
│   ├── common/        Input, Select, RadioGroup, Checkbox, etc.
│   ├── Step1LoanType.jsx … Step8Review.jsx
│   ├── Wizard.jsx, ProgressBar.jsx, StepNavigation.jsx
├── hooks/             useAutoSave, useFormPersistence, useVerification, etc.
├── schemas/           Zod schemas per step + schemaFactory
├── utils/             validators, emiCalculator, encryption, etc.
├── App.jsx            Root component
├── main.jsx           Entry point
├── constants.js       Step registry, rates, thresholds
└── index.css          Tailwind directives
cypress/
├── e2e/               15 E2E test specs
├── fixtures/          Test data + sample documents
└── support/           Custom commands
```

## 8 Steps

| Step | Name |
|------|------|
| 1 | Loan Type & Basic Information |
| 2 | Personal Information |
| 3 | Identity Verification (KYC) |
| 4 | Address Information |
| 5 | Employment & Income Details |
| 6 | Co-Applicant & Guarantor (conditional) |
| 7 | Document Upload & E-Signature |
| 8 | Review, Consent & Pre-Approval |

---

## License

Internal project — LendSwift
