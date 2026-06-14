import { useMemo, useCallback } from 'react';
import Checkbox from './common/Checkbox';
import { LOAN_TYPES, LOAN_TYPE_LABELS, EMPLOYMENT_TYPES, STEP_6_THRESHOLDS } from '../constants';
import { getPreApprovalSummary } from '../utils/emiCalculator';
import { formatIndian } from '../utils/formatCurrency';
import { getRequiredDocs, DOCUMENT_SPECS } from '../schemas/step7Schema';

function maskPAN(pan) {
  if (!pan || pan.length < 4) return pan || '—';
  return `XXXXX${pan.slice(-5)}`;
}

function maskAadhaar(aadhaar) {
  if (!aadhaar) return '—';
  const cleaned = aadhaar.replace(/\s/g, '');
  if (cleaned.length < 4) return cleaned;
  const last4 = cleaned.slice(-4);
  const masked = '•'.repeat(Math.min(cleaned.length - 4, 8));
  return `${masked} ${last4}`;
}

const STEP_LABELS = [
  { step: 0, label: 'Loan Type & Basic Info', key: 'loan' },
  { step: 1, label: 'Personal Information', key: 'personal' },
  { step: 2, label: 'Identity Verification (KYC)', key: 'kyc' },
  { step: 3, label: 'Address Information', key: 'address' },
  { step: 4, label: 'Employment & Income', key: 'employment' },
  { step: 5, label: 'Co-Applicant & Guarantor', key: 'coApplicant' },
  { step: 6, label: 'Document Upload & E-Signature', key: 'documents' },
];

function SectionCard({ title, onEdit, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-md font-medium text-gray-800">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-primary hover:text-primary-600 font-medium underline"
          data-cy={`edit-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          Edit
        </button>
      </div>
      <div className="space-y-1.5">
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, value, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight === 'warning' ? 'text-warning' : highlight === 'error' ? 'text-error' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}

export default function Step8Review({ watch, setValue, errors, goToStep }) {
  const fd = watch();

  const showCoApplicant = useMemo(() => {
    if (!fd.loanType || !fd.loanAmount) return false;
    const threshold = STEP_6_THRESHOLDS[fd.loanType];
    return fd.loanType === LOAN_TYPES.HOME || Number(fd.loanAmount) > threshold;
  }, [fd.loanType, fd.loanAmount]);

  const summary = useMemo(() => {
    if (!fd.loanType || !fd.loanAmount || !fd.loanTenure) return null;
    return getPreApprovalSummary(fd.loanType, Number(fd.loanAmount), Number(fd.loanTenure));
  }, [fd.loanType, fd.loanAmount, fd.loanTenure]);

  const totalMonthlyIncome = useMemo(() => {
    let income = 0;
    if (fd.employmentType === EMPLOYMENT_TYPES.SALARIED) {
      income = Number(fd.monthlyNetSalary) || 0;
    } else {
      income = Number(fd.monthlyIncome) || 0;
    }
    if (fd.coApplicantIncome) {
      income += Number(fd.coApplicantIncome) || 0;
    }
    return income;
  }, [fd]);

  const emiRatio = useMemo(() => {
    if (!summary || totalMonthlyIncome === 0) return 0;
    return (summary.emi / totalMonthlyIncome) * 100;
  }, [summary, totalMonthlyIncome]);

  const formStateWithVerified = useMemo(() => ({
    ...fd,
    panVerified: !!(fd.panNumber && fd.panNumber.length === 10),
  }), [fd]);

  const requiredDocs = useMemo(() => getRequiredDocs(formStateWithVerified), [formStateWithVerified]);

  const handleConsentChange = useCallback((field) => (e) => {
    setValue(field, e.target.checked);
  }, [setValue]);

  const err = (f) => errors[f]?.message;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Review & Submit</h2>
        <p className="text-gray-500 mb-6">
          Please review your application details, provide consent, and submit.
        </p>

        <SectionCard title="Loan Type & Basic Info" onEdit={() => goToStep(0)}>
          <FieldRow label="Loan Type" value={LOAN_TYPE_LABELS[fd.loanType]} />
          <FieldRow label="Loan Amount" value={fd.loanAmount ? formatIndian(fd.loanAmount) : null} />
          <FieldRow label="Tenure" value={fd.loanTenure ? `${fd.loanTenure} months` : null} />
          <FieldRow label="Purpose" value={fd.loanPurpose} />
          {fd.referralCode && <FieldRow label="Referral Code" value={fd.referralCode} />}
        </SectionCard>

        <SectionCard title="Personal Information" onEdit={() => goToStep(1)}>
          <FieldRow label="Full Name" value={fd.fullName} />
          <FieldRow label="Date of Birth" value={fd.dateOfBirth} />
          <FieldRow label="Gender" value={fd.gender} />
          <FieldRow label="Marital Status" value={fd.maritalStatus} />
          <FieldRow label="Father&apos;s Name" value={fd.fatherName} />
          <FieldRow label="Mother&apos;s Name" value={fd.motherName} />
          <FieldRow label="Email" value={fd.email} />
          <FieldRow label="Mobile" value={fd.mobile} />
          {fd.alternateMobile && <FieldRow label="Alternate Mobile" value={fd.alternateMobile} />}
        </SectionCard>

        <SectionCard title="Identity Verification (KYC)" onEdit={() => goToStep(2)}>
          <FieldRow label="PAN" value={maskPAN(fd.panNumber)} />
          <FieldRow label="Aadhaar" value={maskAadhaar(fd.aadhaarNumber)} />
          <FieldRow label="Voter ID" value={fd.voterId} />
          {fd.passport && <FieldRow label="Passport" value={fd.passport} />}
        </SectionCard>

        <SectionCard title="Address Information" onEdit={() => goToStep(3)}>
          <FieldRow label="Address" value={fd.currentAddressLine1} />
          {fd.currentAddressLine2 && <FieldRow label="Address Line 2" value={fd.currentAddressLine2} />}
          <FieldRow label="PIN Code" value={fd.pinCode} />
          <FieldRow label="City" value={fd.city} />
          <FieldRow label="State" value={fd.state} />
          <FieldRow label="Residence Type" value={fd.residenceType} />
          <FieldRow label="Years at Address" value={fd.yearsAtAddress ? `${fd.yearsAtAddress} yr(s)` : null} />
        </SectionCard>

        <SectionCard title="Employment & Income" onEdit={() => goToStep(4)}>
          <FieldRow label="Employment Type" value={fd.employmentType} />
          {fd.employmentType === EMPLOYMENT_TYPES.SALARIED && (
            <>
              <FieldRow label="Company" value={fd.companyName} />
              <FieldRow label="Designation" value={fd.designation} />
              <FieldRow label="Monthly Salary" value={fd.monthlyNetSalary ? formatIndian(fd.monthlyNetSalary) : null} />
              <FieldRow label="Experience" value={fd.yearsOfExperience ? `${fd.yearsOfExperience} yr(s)` : null} />
            </>
          )}
          {(fd.employmentType === EMPLOYMENT_TYPES.SELF_EMPLOYED || fd.employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER) && (
            <>
              <FieldRow label="Business Name" value={fd.businessName} />
              <FieldRow label="Business Type" value={fd.businessType} />
              <FieldRow label="Annual Turnover" value={fd.annualTurnover ? formatIndian(fd.annualTurnover) : null} />
              <FieldRow label="Monthly Income" value={fd.monthlyIncome ? formatIndian(fd.monthlyIncome) : null} />
            </>
          )}
          {fd.employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER && (
            <>
              <FieldRow label="GST Number" value={fd.gstNumber} />
              <FieldRow label="Office Address" value={fd.officeAddress} />
            </>
          )}
        </SectionCard>

        {showCoApplicant && (
          <SectionCard title="Co-Applicant & Guarantor" onEdit={() => goToStep(5)}>
            <FieldRow label="Name" value={fd.coApplicantName} />
            <FieldRow label="Relationship" value={fd.coApplicantRelationship} />
            <FieldRow label="PAN" value={fd.coApplicantPan} />
            <FieldRow label="Income" value={fd.coApplicantIncome ? formatIndian(fd.coApplicantIncome) : null} />
          </SectionCard>
        )}

        <SectionCard title="Documents & Signature" onEdit={() => goToStep(6)}>
          {requiredDocs.map((key) => {
            const spec = DOCUMENT_SPECS[key];
            if (!spec) return null;
            const file = fd.documents?.[key];
            const isUploaded = spec.multiple
              ? Array.isArray(file) && file.length > 0
              : file instanceof File;
            return (
              <FieldRow key={key} label={spec.label} value={isUploaded ? '✓ Uploaded' : 'Not uploaded'} />
            );
          })}
          <FieldRow label="E-Signature" value={fd.signature ? '✓ Signed' : 'Not signed'} />
        </SectionCard>
      </div>

      {summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pre-Approval Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <FieldRow label="Loan Amount" value={formatIndian(fd.loanAmount)} />
            <FieldRow label="Tenure" value={`${fd.loanTenure} months`} />
            <FieldRow label="Interest Rate" value={`${summary.annualRate}% p.a.`} />
            <FieldRow label="Monthly EMI" value={formatIndian(summary.emi)} highlight="warning" />
            <FieldRow label="Total Interest Payable" value={formatIndian(summary.totalInterest)} />
            <FieldRow label="Total Cost of Borrowing" value={formatIndian(summary.totalPayable)} />
            <FieldRow label="Processing Fee" value={formatIndian(summary.processingFee)} />
            {totalMonthlyIncome > 0 && (
              <FieldRow
                label="EMI to Income Ratio"
                value={`${Math.round(emiRatio)}%`}
                highlight={emiRatio > 50 ? 'error' : undefined}
              />
            )}
          </div>
          {emiRatio > 50 && (
            <div className="mt-4 p-3 bg-warning bg-opacity-10 border border-warning rounded-lg text-sm text-warning-800" role="alert">
              Your EMI exceeds 50% of your monthly income. Consider reducing the loan amount or increasing the tenure.
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Consent & Declaration</h3>

        <Checkbox
          label="I confirm that all information provided in this application is true and accurate to the best of my knowledge"
          checked={fd.consentAccurate}
          onChange={handleConsentChange('consentAccurate')}
          error={err('consentAccurate')}
          data-cy="step8-consent-accurate"
        />

        <Checkbox
          label="I authorise LendSwift to perform a credit check and verify my financial history"
          checked={fd.consentCreditCheck}
          onChange={handleConsentChange('consentCreditCheck')}
          error={err('consentCreditCheck')}
          data-cy="step8-consent-credit"
        />

        <Checkbox
          label="I accept the Terms & Conditions and Privacy Policy of LendSwift"
          checked={fd.consentTerms}
          onChange={handleConsentChange('consentTerms')}
          error={err('consentTerms')}
          data-cy="step8-consent-terms"
        />

        <Checkbox
          label="I consent to receive communications regarding my application via email, SMS, or phone"
          checked={fd.consentCommunications}
          onChange={handleConsentChange('consentCommunications')}
          error={err('consentCommunications')}
          data-cy="step8-consent-comm"
        />

        {emiRatio > 50 && (
          <Checkbox
            label="I acknowledge and accept that my EMI exceeds 50% of my monthly income and I wish to proceed"
            checked={fd.consentHighEmi}
            onChange={handleConsentChange('consentHighEmi')}
            error={err('consentHighEmi')}
            data-cy="step8-consent-high-emi"
          />
        )}
      </div>
    </div>
  );
}
