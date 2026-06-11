import { useMemo } from 'react';
import Checkbox from './common/Checkbox';
import { LOAN_TYPES, LOAN_TYPE_LABELS, EMPLOYMENT_TYPES } from '../constants';
import { getPreApprovalSummary } from '../utils/emiCalculator';
import { formatIndian } from '../utils/formatCurrency';

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

export default function Step8Review({ formData, updateFields, errors, goToStep }) {
  const summary = useMemo(() => {
    if (!formData.loanType || !formData.loanAmount || !formData.loanTenure) return null;
    return getPreApprovalSummary(
      formData.loanType,
      Number(formData.loanAmount),
      Number(formData.loanTenure),
    );
  }, [formData.loanType, formData.loanAmount, formData.loanTenure]);

  const totalMonthlyIncome = useMemo(() => {
    let income = 0;
    if (formData.employmentType === EMPLOYMENT_TYPES.SALARIED) {
      income = Number(formData.monthlyNetSalary) || 0;
    } else {
      income = Number(formData.monthlyIncome) || 0;
    }
    if (formData.coApplicantIncome) {
      income += Number(formData.coApplicantIncome) || 0;
    }
    return income;
  }, [formData]);

  const emiRatio = useMemo(() => {
    if (!summary || totalMonthlyIncome === 0) return null;
    return (summary.emi / totalMonthlyIncome) * 100;
  }, [summary, totalMonthlyIncome]);

  const handleConsentChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateFields({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Review & Submit</h2>
        <p className="text-gray-500 mb-6">
          Please review your application details, provide consent, and submit.
        </p>

        <SectionCard title="Loan Type & Basic Info" onEdit={() => goToStep(0)}>
          <FieldRow label="Loan Type" value={LOAN_TYPE_LABELS[formData.loanType]} />
          <FieldRow label="Loan Amount" value={formData.loanAmount ? formatIndian(formData.loanAmount) : null} />
          <FieldRow label="Tenure" value={formData.loanTenure ? `${formData.loanTenure} months` : null} />
          <FieldRow label="Purpose" value={formData.loanPurpose} />
          {formData.referralCode && <FieldRow label="Referral Code" value={formData.referralCode} />}
        </SectionCard>

        <SectionCard title="Personal Information" onEdit={() => goToStep(1)}>
          <FieldRow label="Full Name" value={formData.fullName} />
          <FieldRow label="Date of Birth" value={formData.dateOfBirth} />
          <FieldRow label="Gender" value={formData.gender} />
          <FieldRow label="Marital Status" value={formData.maritalStatus} />
          <FieldRow label="Father&apos;s Name" value={formData.fatherName} />
          <FieldRow label="Mother&apos;s Name" value={formData.motherName} />
          <FieldRow label="Email" value={formData.email} />
          <FieldRow label="Mobile" value={formData.mobile} />
          {formData.alternateMobile && <FieldRow label="Alternate Mobile" value={formData.alternateMobile} />}
        </SectionCard>

        <SectionCard title="Identity Verification (KYC)" onEdit={() => goToStep(2)}>
          <FieldRow label="PAN" value={formData.panNumber} />
          <FieldRow label="Aadhaar" value={formData.aadhaarNumber} />
          <FieldRow label="Voter ID" value={formData.voterId} />
          {formData.passport && <FieldRow label="Passport" value={formData.passport} />}
        </SectionCard>

        <SectionCard title="Address Information" onEdit={() => goToStep(3)}>
          <FieldRow label="Address" value={formData.currentAddressLine1} />
          {formData.currentAddressLine2 && <FieldRow label="Address Line 2" value={formData.currentAddressLine2} />}
          <FieldRow label="PIN Code" value={formData.pinCode} />
          <FieldRow label="City" value={formData.city} />
          <FieldRow label="State" value={formData.state} />
          <FieldRow label="Residence Type" value={formData.residenceType} />
          <FieldRow label="Years at Address" value={formData.yearsAtAddress ? `${formData.yearsAtAddress} yr(s)` : null} />
        </SectionCard>

        <SectionCard title="Employment & Income" onEdit={() => goToStep(4)}>
          <FieldRow label="Employment Type" value={formData.employmentType} />
          {formData.employmentType === EMPLOYMENT_TYPES.SALARIED && (
            <>
              <FieldRow label="Company" value={formData.companyName} />
              <FieldRow label="Designation" value={formData.designation} />
              <FieldRow label="Monthly Salary" value={formData.monthlyNetSalary ? formatIndian(formData.monthlyNetSalary) : null} />
              <FieldRow label="Experience" value={formData.yearsOfExperience ? `${formData.yearsOfExperience} yr(s)` : null} />
            </>
          )}
          {(formData.employmentType === EMPLOYMENT_TYPES.SELF_EMPLOYED || formData.employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER) && (
            <>
              <FieldRow label="Business Name" value={formData.businessName} />
              <FieldRow label="Business Type" value={formData.businessType} />
              <FieldRow label="Annual Turnover" value={formData.annualTurnover ? formatIndian(formData.annualTurnover) : null} />
              <FieldRow label="Monthly Income" value={formData.monthlyIncome ? formatIndian(formData.monthlyIncome) : null} />
            </>
          )}
          {formData.employmentType === EMPLOYMENT_TYPES.BUSINESS_OWNER && (
            <>
              <FieldRow label="GST Number" value={formData.gstNumber} />
              <FieldRow label="Office Address" value={formData.officeAddress} />
            </>
          )}
        </SectionCard>

        {formData.showCoApplicant && (
          <SectionCard title="Co-Applicant & Guarantor" onEdit={() => goToStep(5)}>
            <FieldRow label="Name" value={formData.coApplicantName} />
            <FieldRow label="Relationship" value={formData.coApplicantRelationship} />
            <FieldRow label="PAN" value={formData.coApplicantPan} />
            <FieldRow label="Income" value={formData.coApplicantIncome ? formatIndian(formData.coApplicantIncome) : null} />
          </SectionCard>
        )}

        <SectionCard title="Documents & Signature" onEdit={() => goToStep(6)}>
          <FieldRow label="PAN Card" value={formData.documents?.panCard ? '✓ Uploaded' : 'Not uploaded'} />
          <FieldRow label="Aadhaar Front" value={formData.documents?.aadhaarFront ? '✓ Uploaded' : 'Not uploaded'} />
          <FieldRow label="Aadhaar Back" value={formData.documents?.aadhaarBack ? '✓ Uploaded' : 'Not uploaded'} />
          <FieldRow label="Photograph" value={formData.documents?.photograph ? '✓ Uploaded' : 'Not uploaded'} />
          <FieldRow label="E-Signature" value={formData.signature ? '✓ Signed' : 'Not signed'} />
        </SectionCard>
      </div>

      {summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pre-Approval Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <FieldRow label="Loan Amount" value={formatIndian(summary.emi * Number(formData.loanTenure))} />
            <FieldRow label="Tenure" value={`${formData.loanTenure} months`} />
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
          checked={formData.consentAccurate}
          onChange={handleConsentChange('consentAccurate')}
          error={errors?.consentAccurate}
          data-cy="step8-consent-accurate"
        />

        <Checkbox
          label="I authorise LendSwift to perform a credit check and verify my financial history"
          checked={formData.consentCreditCheck}
          onChange={handleConsentChange('consentCreditCheck')}
          error={errors?.consentCreditCheck}
          data-cy="step8-consent-credit"
        />

        <Checkbox
          label="I accept the Terms & Conditions and Privacy Policy of LendSwift"
          checked={formData.consentTerms}
          onChange={handleConsentChange('consentTerms')}
          error={errors?.consentTerms}
          data-cy="step8-consent-terms"
        />

        <Checkbox
          label="I consent to receive communications regarding my application via email, SMS, or phone"
          checked={formData.consentCommunications}
          onChange={handleConsentChange('consentCommunications')}
          error={errors?.consentCommunications}
          data-cy="step8-consent-comm"
        />
      </div>
    </div>
  );
}
